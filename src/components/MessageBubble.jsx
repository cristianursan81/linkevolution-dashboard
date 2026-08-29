import { Bot, Headphones, User } from 'lucide-react'
import { clockTime, isAi, isInbound, messageText } from '../lib/format'

function SenderIcon({ ai }) {
  if (ai) return <Bot className="h-3.5 w-3.5" />
  return <Headphones className="h-3.5 w-3.5" />
}

export default function MessageBubble({ message }) {
  const inbound = isInbound(message)
  const ai = isAi(message)
  const timeStr = clockTime(message.created_at || message.timestamp)
  const text = messageText(message)
  const pending = Boolean(message.pending)

  if (inbound) {
    return (
      <div className="flex max-w-[80%] items-end gap-2">
        <div className="mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-700">
          <User className="h-3.5 w-3.5 text-gray-300" />
        </div>
        <div>
          <div className="rounded-2xl rounded-bl-sm border border-gray-700 bg-gray-800 px-4 py-2.5 text-sm whitespace-pre-wrap text-gray-100">
            {text || <span className="text-gray-500 italic">Mensaje vacío</span>}
          </div>
          <div className="mt-1 pl-1 text-xs text-gray-500">{timeStr}</div>
        </div>
      </div>
    )
  }

  return (
    <div className={`ml-auto flex max-w-[80%] flex-row-reverse items-end gap-2 ${pending ? 'opacity-60' : ''}`}>
      <div
        className={`mb-1 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
          ai ? 'bg-teal-700' : 'bg-sky-700'
        }`}
      >
        <SenderIcon ai={ai} />
      </div>
      <div>
        <div
          className={`rounded-2xl rounded-br-sm px-4 py-2.5 text-sm whitespace-pre-wrap text-white ${
            ai ? 'bg-teal-700' : 'bg-sky-700'
          }`}
        >
          {text || <span className="italic opacity-70">Mensaje vacío</span>}
        </div>
        <div className="mt-1 flex items-center justify-end gap-2 pr-1">
          <span
            className={`inline-flex items-center gap-1 rounded-full px-1.5 py-0.5 text-xs font-medium ${
              ai ? 'bg-teal-900/60 text-teal-300' : 'bg-sky-900/60 text-sky-300'
            }`}
          >
            {ai ? <Bot className="h-2.5 w-2.5" /> : <Headphones className="h-2.5 w-2.5" />}
            {ai ? 'IA' : 'Agente'}
          </span>
          <span className="text-xs text-gray-500">{pending ? 'Enviando…' : timeStr}</span>
        </div>
      </div>
    </div>
  )
}
