import { useEffect, useRef, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { api } from '../api/client'
import MessageBubble from '../components/MessageBubble'
import ChannelBadge from '../components/ChannelBadge'
import StatusBadge from '../components/StatusBadge'
import SlaTimer from '../components/SlaTimer'
import { ArrowLeft, Send, RefreshCw, Bot, Headphones } from 'lucide-react'

export default function ConversationPage() {
  const { id } = useParams()
  const navigate = useNavigate()

  const [messages, setMessages] = useState([])
  const [conv, setConv] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [sendError, setSendError] = useState('')

  const bottomRef = useRef(null)
  const textareaRef = useRef(null)

  async function loadMessages() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getMessages(id)
      const list = Array.isArray(data) ? data : (data?.messages || data?.data || [])
      setMessages(list)
      if (data?.conversation) setConv(data.conversation)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { loadMessages() }, [id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Poll every 10s for new messages
  useEffect(() => {
    const id2 = setInterval(async () => {
      try {
        const data = await api.getMessages(id)
        const list = Array.isArray(data) ? data : (data?.messages || data?.data || [])
        setMessages(list)
      } catch {}
    }, 10_000)
    return () => clearInterval(id2)
  }, [id])

  async function handleSend() {
    const content = text.trim()
    if (!content || sending) return
    setSending(true)
    setSendError('')
    try {
      const msg = await api.sendMessage(id, content)
      setText('')
      // Optimistic: add to list immediately
      if (msg) {
        setMessages(prev => [...prev, msg])
      } else {
        await loadMessages()
      }
    } catch (e) {
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

  // Count AI vs agent messages
  const aiCount = messages.filter(m =>
    m.ai_generated || m.sender_type === 'ai' || m.generated_by === 'ai'
  ).length
  const agentCount = messages.filter(m => {
    const isContact = m.sender_type === 'contact' || m.direction === 'inbound'
    const isAi = m.ai_generated || m.sender_type === 'ai' || m.generated_by === 'ai'
    return !isContact && !isAi
  }).length

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="h-14 flex items-center gap-3 px-4 border-b border-gray-800 shrink-0">
        <button
          onClick={() => navigate('/inbox')}
          className="text-gray-400 hover:text-gray-200 transition-colors lg:hidden"
        >
          <ArrowLeft className="w-4 h-4" />
        </button>
        <button
          onClick={() => navigate('/inbox')}
          className="hidden lg:flex text-gray-400 hover:text-gray-200 transition-colors items-center gap-1 text-sm"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
        </button>

        {conv ? (
          <div className="flex-1 flex items-center gap-3 min-w-0">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-gray-100 font-medium text-sm truncate">
                  {conv.contact?.name || conv.contact?.phone || `Conv. ${id?.slice(0, 8)}`}
                </span>
                <ChannelBadge channel={conv.channel} />
                <StatusBadge status={conv.status} />
              </div>
              <div className="flex items-center gap-3 mt-0.5">
                <SlaTimer slaDeadline={conv.sla_deadline || conv.sla_due_at} status={conv.status} />
                {/* AI/Agent indicator */}
                <span className="inline-flex items-center gap-1 text-xs text-violet-400">
                  <Bot className="w-3 h-3" /> {aiCount} IA
                </span>
                <span className="inline-flex items-center gap-1 text-xs text-sky-400">
                  <Headphones className="w-3 h-3" /> {agentCount} agente
                </span>
              </div>
            </div>
          </div>
        ) : (
          <span className="text-gray-300 text-sm font-medium">Conversación</span>
        )}

        <button
          onClick={loadMessages}
          className="text-gray-400 hover:text-gray-200 transition-colors ml-auto"
          title="Actualizar"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Cargando mensajes...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-400 text-sm py-8">{error}</div>
        )}
        {!loading && !error && messages.length === 0 && (
          <div className="text-center text-gray-500 text-sm py-16">Sin mensajes aún</div>
        )}
        {!loading && messages.map((msg, i) => (
          <MessageBubble key={msg.id || i} message={msg} />
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Reply box */}
      <div className="border-t border-gray-800 px-4 py-3 shrink-0">
        {sendError && (
          <p className="text-red-400 text-xs mb-2">{sendError}</p>
        )}
        <div className="flex items-end gap-2">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={e => setText(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Escribe una respuesta... (Enter para enviar, Shift+Enter nueva línea)"
            rows={2}
            className="flex-1 bg-gray-800 border border-gray-700 text-gray-100 rounded-xl px-3.5 py-2.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500 resize-none"
          />
          <button
            onClick={handleSend}
            disabled={!text.trim() || sending}
            className="bg-violet-600 hover:bg-violet-500 disabled:opacity-50 text-white rounded-xl p-2.5 transition-colors shrink-0"
            title="Enviar (Enter)"
          >
            {sending
              ? <RefreshCw className="w-4 h-4 animate-spin" />
              : <Send className="w-4 h-4" />
            }
          </button>
        </div>
        <p className="text-gray-600 text-xs mt-1.5">
          Los mensajes enviados desde aquí se envían como agente humano.
        </p>
      </div>
    </div>
  )
}
