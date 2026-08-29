import { useCallback, useEffect, useRef, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Bot, CheckCheck, Headphones, RefreshCw, Send } from 'lucide-react'
import { api, asList, isAbort } from '../api/client'
import MessageBubble from '../components/MessageBubble'
import ChannelBadge from '../components/ChannelBadge'
import StatusBadge from '../components/StatusBadge'
import SlaTimer from '../components/SlaTimer'
import { conversationTitle, isAi, isInbound } from '../lib/format'

export default function ConversationPage({ contactsById = {} }) {
  const { id } = useParams()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [conv, setConv] = useState(null)
  const [contact, setContact] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [resolving, setResolving] = useState(false)
  const [sendError, setSendError] = useState('')

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)
  const stickToBottom = useRef(true)

  const load = useCallback(async (silent = false, signal) => {
    if (!silent) {
      setLoading(true)
      setError('')
    }
    try {
      const [c, m] = await Promise.all([
        api.getConversation(id, signal).catch((err) => {
          if (isAbort(err)) throw err
          return null
        }),
        api.getMessages(id, signal),
      ])
      setConv(c)
      setMessages(asList(m, ['messages', 'items', 'data']))
      if (c?.contact) {
        setContact(c.contact)
      } else if (c?.contact_id) {
        try {
          const ct = await api.getContact(c.contact_id, signal)
          setContact(ct)
        } catch (err) {
          if (isAbort(err)) throw err
        }
      }
    } catch (e) {
      if (isAbort(e)) return
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [id])

  useEffect(() => {
    const ac = new AbortController()
    setText('')
    setSendError('')
    setMessages([])
    setConv(null)
    setContact(null)
    load(false, ac.signal)
    return () => ac.abort()
  }, [load])

  useEffect(() => {
    const ac = new AbortController()
    const t = setInterval(() => load(true, ac.signal), 10_000)
    return () => {
      ac.abort()
      clearInterval(t)
    }
  }, [load])

  useEffect(() => {
    if (stickToBottom.current) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }
  }, [messages])

  async function handleSend() {
    const body = text.trim()
    if (!body || sending) return
    setSending(true)
    setSendError('')
    const optimistic = {
      id: `tmp-${Date.now()}`,
      body,
      direction: 'outbound',
      sender_type: 'agent',
      created_at: new Date().toISOString(),
      pending: true,
    }
    setMessages((prev) => [...prev, optimistic])
    setText('')
    try {
      const msg = await api.sendMessage(id, body)
      if (msg && (msg.id || msg.body || msg.content)) {
        setMessages((prev) => prev.map((m) => (m.id === optimistic.id ? { ...msg, pending: false } : m)))
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
        await load(true)
      }
    } catch (e) {
      setMessages((prev) => prev.filter((m) => m.id !== optimistic.id))
      setText(body)
      setSendError(e.message)
    } finally {
      setSending(false)
      textareaRef.current?.focus()
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  async function handleResolve() {
    if (resolving) return
    setResolving(true)
    setSendError('')
    try {
      const updated = await api.resolveConversation(id)
      setConv((prev) => ({ ...(prev || {}), ...(updated || {}), status: updated?.status || 'resolved' }))
    } catch (e) {
      setSendError(e.message)
    } finally {
      setResolving(false)
    }
  }

  const title = conversationTitle(
    { ...(conv || {}), contact: contact || conv?.contact },
    contactsById,
  )
  const closed = conv?.status === 'resolved' || conv?.status === 'closed'
  const aiCount = messages.filter(isAi).length
  const agentCount = messages.filter((m) => !isInbound(m) && !isAi(m)).length

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="flex h-14 shrink-0 items-center gap-3 border-b border-gray-800 px-4">
        <button
          type="button"
          onClick={() => navigate('/inbox')}
          className="text-gray-400 transition-colors hover:text-gray-200"
          title="Volver al inbox"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="truncate text-sm font-medium text-gray-100">{title}</span>
            {conv && <ChannelBadge channel={conv.channel} />}
            {conv && <StatusBadge status={conv.status} />}
          </div>
          {conv && (
            <div className="mt-0.5 flex flex-wrap items-center gap-3">
              <SlaTimer
                slaBreached={conv.sla_breached}
                slaDeadline={conv.sla_deadline || conv.sla_due_at}
                status={conv.status}
              />
              <span className="inline-flex items-center gap-1 text-xs text-teal-400">
                <Bot className="h-3 w-3" /> {aiCount} IA
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-sky-400">
                <Headphones className="h-3 w-3" /> {agentCount} agente
              </span>
              {conv.ai_active && (
                <span className="text-[10px] font-medium uppercase tracking-wide text-teal-400">IA activa</span>
              )}
            </div>
          )}
        </div>

        {!closed && (
          <button
            type="button"
            onClick={handleResolve}
            disabled={resolving}
            className="hidden items-center gap-1 rounded-lg border border-teal-700/60 px-2.5 py-1 text-xs font-medium text-teal-300 transition-colors hover:bg-teal-950 sm:inline-flex disabled:opacity-50"
          >
            <CheckCheck className="h-3.5 w-3.5" />
            {resolving ? 'Resolviendo…' : 'Resolver'}
          </button>
        )}
        <button
          type="button"
          onClick={() => load()}
          className="text-gray-400 transition-colors hover:text-gray-200"
          title="Actualizar"
        >
          <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div
        className="min-h-0 flex-1 space-y-3 overflow-y-auto px-4 py-4"
        onScroll={(e) => {
          const el = e.currentTarget
          stickToBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < 80
        }}
      >
        {loading && messages.length === 0 && (
          <div className="flex items-center justify-center py-16 text-sm text-gray-400">
            <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> Cargando mensajes...
          </div>
        )}
        {!loading && error && (
          <div className="py-8 text-center text-sm text-red-400">
            <p>{error}</p>
            <button type="button" onClick={() => load()} className="mt-2 text-teal-400 hover:underline">
              Reintentar
            </button>
          </div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="py-16 text-center text-sm text-gray-500">Sin mensajes aún</div>
        )}
        {messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      <div className="shrink-0 border-t border-gray-800 px-4 py-3">
        {sendError && <p className="mb-2 text-xs text-red-400">{sendError}</p>}
        {closed ? (
          <p className="py-2 text-center text-sm text-gray-500">Esta conversación está resuelta.</p>
        ) : (
          <>
            <div className="flex items-end gap-2">
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Escribe una respuesta… (Enter envía, Shift+Enter nueva línea)"
                rows={2}
                className="flex-1 resize-none rounded-xl border border-gray-700 bg-gray-800 px-3.5 py-2.5 text-sm text-gray-100 placeholder-gray-500 focus:border-teal-500 focus:outline-none"
              />
              <button
                type="button"
                onClick={handleSend}
                disabled={!text.trim() || sending}
                className="shrink-0 rounded-xl bg-teal-600 p-2.5 text-white transition-colors hover:bg-teal-500 disabled:opacity-50"
                title="Enviar (Enter)"
              >
                {sending ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </button>
            </div>
            <div className="mt-1.5 flex items-center justify-between">
              <p className="text-xs text-gray-600">Los mensajes se envían como agente humano.</p>
              <button
                type="button"
                onClick={handleResolve}
                disabled={resolving}
                className="inline-flex items-center gap-1 text-xs text-teal-400 hover:underline sm:hidden disabled:opacity-50"
              >
                <CheckCheck className="h-3 w-3" /> Resolver
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
