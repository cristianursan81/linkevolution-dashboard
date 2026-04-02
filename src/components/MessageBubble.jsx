import { Bot, User, Headphones } from 'lucide-react'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

function SenderIcon({ sender, isAi }) {
  if (sender === 'contact') return <User className="w-3.5 h-3.5" />
  if (isAi) return <Bot className="w-3.5 h-3.5" />
  return <Headphones className="w-3.5 h-3.5" />
}

function AiLabel({ isAi, sender }) {
  if (sender === 'contact') return null
  return (
    <span className={`inline-flex items-center gap-1 text-xs px-1.5 py-0.5 rounded-full font-medium ${
      isAi
        ? 'bg-violet-900/60 text-violet-300'
        : 'bg-sky-900/60 text-sky-300'
    }`}>
      {isAi ? <Bot className="w-2.5 h-2.5" /> : <Headphones className="w-2.5 h-2.5" />}
      {isAi ? 'IA' : 'Agente'}
    </span>
  )
}

export default function MessageBubble({ message }) {
  const isContact = message.sender_type === 'contact' || message.direction === 'inbound'
  const isAi = message.ai_generated === true || message.sender_type === 'ai' || message.generated_by === 'ai'
  const isAgent = !isContact && !isAi

  const ts = message.created_at || message.timestamp
  const timeStr = ts
    ? format(new Date(ts), 'HH:mm', { locale: es })
    : ''

  if (isContact) {
    return (
      <div className="flex items-end gap-2 max-w-[80%]">
        <div className="w-7 h-7 rounded-full bg-gray-700 flex items-center justify-center shrink-0 mb-1">
          <User className="w-3.5 h-3.5 text-gray-300" />
        </div>
        <div>
          <div className="bg-gray-800 border border-gray-700 text-gray-100 rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm">
            {message.content}
          </div>
          <div className="text-gray-500 text-xs mt-1 pl-1">{timeStr}</div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-end gap-2 max-w-[80%] ml-auto flex-row-reverse">
      <div className={`w-7 h-7 rounded-full flex items-center justify-center shrink-0 mb-1 ${
        isAi ? 'bg-violet-700' : 'bg-sky-700'
      }`}>
        <SenderIcon sender="agent" isAi={isAi} />
      </div>
      <div>
        <div className={`text-white rounded-2xl rounded-br-sm px-4 py-2.5 text-sm ${
          isAi ? 'bg-violet-700' : 'bg-sky-700'
        }`}>
          {message.content}
        </div>
        <div className="flex items-center gap-2 mt-1 pr-1 justify-end">
          <AiLabel isAi={isAi} sender="agent" />
          <span className="text-gray-500 text-xs">{timeStr}</span>
        </div>
      </div>
    </div>
  )
}
