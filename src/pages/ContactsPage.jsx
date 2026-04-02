import { useEffect, useState } from 'react'
import { api } from '../api/client'
import { Users, Search, RefreshCw, Phone, Mail, MessageSquare } from 'lucide-react'
import ChannelBadge from '../components/ChannelBadge'

function ContactRow({ contact }) {
  const name = contact.name || contact.phone || contact.email || `#${contact.id?.slice(0, 6)}`
  const initials = name.slice(0, 2).toUpperCase()

  return (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-800 hover:bg-gray-800/40 transition-colors">
      <div className="w-9 h-9 rounded-full bg-violet-900/60 flex items-center justify-center text-violet-300 text-xs font-bold shrink-0">
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-gray-100 text-sm font-medium truncate">{name}</span>
          {contact.channel && <ChannelBadge channel={contact.channel} />}
        </div>
        <div className="flex items-center gap-3 mt-0.5">
          {contact.phone && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Phone className="w-2.5 h-2.5" />{contact.phone}
            </span>
          )}
          {contact.email && (
            <span className="text-gray-500 text-xs flex items-center gap-1">
              <Mail className="w-2.5 h-2.5" />{contact.email}
            </span>
          )}
        </div>
      </div>
      {contact.conversation_count != null && (
        <span className="text-gray-500 text-xs flex items-center gap-1 shrink-0">
          <MessageSquare className="w-3 h-3" />{contact.conversation_count}
        </span>
      )}
    </div>
  )
}

export default function ContactsPage() {
  const [contacts, setContacts] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [search, setSearch] = useState('')

  async function load() {
    setLoading(true)
    setError('')
    try {
      const data = await api.getContacts()
      const list = Array.isArray(data) ? data : (data?.contacts || data?.data || [])
      setContacts(list)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { load() }, [])

  const filtered = contacts.filter(c => {
    if (!search) return true
    const q = search.toLowerCase()
    return (
      (c.name || '').toLowerCase().includes(q) ||
      (c.phone || '').toLowerCase().includes(q) ||
      (c.email || '').toLowerCase().includes(q)
    )
  })

  return (
    <div className="flex flex-col h-full">
      <div className="h-14 flex items-center justify-between px-4 border-b border-gray-800 shrink-0">
        <div className="flex items-center gap-2">
          <Users className="w-4 h-4 text-gray-400" />
          <h1 className="text-gray-100 font-semibold text-sm">Contactos</h1>
          {contacts.length > 0 && (
            <span className="bg-gray-700 text-gray-300 text-xs font-medium px-1.5 py-0.5 rounded-full">
              {contacts.length}
            </span>
          )}
        </div>
        <button onClick={load} className="text-gray-400 hover:text-gray-200 transition-colors">
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className="px-3 py-2.5 border-b border-gray-800 shrink-0">
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Buscar por nombre, teléfono o email..."
            className="w-full bg-gray-800 border border-gray-700 text-gray-100 rounded-lg pl-8 pr-3 py-1.5 text-sm placeholder-gray-500 focus:outline-none focus:border-violet-500"
          />
        </div>
      </div>

      <div className="flex-1 overflow-y-auto">
        {loading && (
          <div className="flex items-center justify-center py-16 text-gray-400 text-sm">
            <RefreshCw className="w-4 h-4 animate-spin mr-2" /> Cargando contactos...
          </div>
        )}
        {!loading && error && (
          <div className="text-center text-red-400 text-sm py-8">{error}</div>
        )}
        {!loading && !error && filtered.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-gray-500">
            <Users className="w-8 h-8 mb-2 opacity-40" />
            <p className="text-sm">No hay contactos</p>
          </div>
        )}
        {!loading && filtered.map((c, i) => <ContactRow key={c.id || i} contact={c} />)}
      </div>
    </div>
  )
}
