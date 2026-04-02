import { NavLink } from 'react-router-dom'
import { MessageSquare, Inbox, Users, BarChart2, LogOut } from 'lucide-react'
import { useAuth } from '../context/AuthContext'

const NAV = [
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/contacts', icon: Users, label: 'Contactos' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()

  return (
    <aside className="w-16 lg:w-56 bg-gray-900 border-r border-gray-800 flex flex-col shrink-0">
      {/* Logo */}
      <div className="h-14 flex items-center px-4 border-b border-gray-800 gap-2.5">
        <div className="w-7 h-7 bg-violet-600 rounded-md flex items-center justify-center shrink-0">
          <MessageSquare className="w-4 h-4 text-white" />
        </div>
        <span className="hidden lg:block text-white font-semibold text-sm truncate">
          Linkevolution
        </span>
      </div>

      {/* Nav */}
      <nav className="flex-1 py-4 px-2 space-y-1">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 px-2.5 py-2 rounded-lg text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-violet-600/20 text-violet-300'
                  : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      {/* User + logout */}
      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-2.5">
          <div className="w-7 h-7 rounded-full bg-violet-700 flex items-center justify-center text-white text-xs font-bold shrink-0">
            {(user?.email?.[0] || user?.name?.[0] || 'U').toUpperCase()}
          </div>
          <div className="hidden lg:block flex-1 min-w-0">
            <p className="text-gray-200 text-xs font-medium truncate">
              {user?.name || user?.email || 'Usuario'}
            </p>
          </div>
          <button
            onClick={logout}
            title="Cerrar sesión"
            className="ml-auto text-gray-500 hover:text-red-400 transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
