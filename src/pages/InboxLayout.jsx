import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { Inbox } from 'lucide-react'
import { api, asList, indexById, isAbort } from '../api/client'
import InboxPage from './InboxPage'
import ConversationPage from './ConversationPage'

export default function InboxLayout() {
  const { id } = useParams()
  const [contactsById, setContactsById] = useState({})

  useEffect(() => {
    const ac = new AbortController()
    api
      .getContacts({}, ac.signal)
      .then((data) => setContactsById(indexById(asList(data, ['contacts', 'items', 'data']))))
      .catch((err) => {
        if (!isAbort(err)) setContactsById({})
      })
    return () => ac.abort()
  }, [])

  return (
    <div className="flex h-full min-h-0">
      <div
        className={`${id ? 'hidden md:flex' : 'flex'} w-full shrink-0 flex-col border-r border-gray-800 md:w-80 lg:w-[22rem]`}
      >
        <InboxPage selectedId={id} contactsById={contactsById} />
      </div>
      <div className={`${id ? 'flex' : 'hidden md:flex'} min-w-0 flex-1 flex-col`}>
        {id ? (
          <ConversationPage contactsById={contactsById} />
        ) : (
          <div className="flex flex-1 flex-col items-center justify-center gap-2 px-6 text-center text-gray-500">
            <Inbox className="h-10 w-10 opacity-30" />
            <p className="text-sm font-medium text-gray-400">Selecciona una conversación</p>
            <p className="text-xs">El hilo se abre aquí. En el móvil, sustituye la lista.</p>
          </div>
        )}
      </div>
    </div>
  )
}
