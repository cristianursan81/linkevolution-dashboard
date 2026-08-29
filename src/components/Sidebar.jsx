import { NavLink, useNavigate } from 'react-router-dom'
import { BarChart2, Inbox, LogOut, Users } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.png'

const NAV = [
  { to: '/inbox', icon: Inbox, label: 'Inbox' },
  { to: '/contacts', icon: Users, label: 'Contactos' },
  { to: '/analytics', icon: BarChart2, label: 'Analytics' },
]

export default function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  function handleLogout() {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <aside className="flex w-16 shrink-0 flex-col border-r border-gray-800 bg-gray-900 lg:w-56">
      <div className="flex h-14 items-center gap-2.5 border-b border-gray-800 px-4">
        <img src={logo} alt="Linkevolution" className="h-7 w-7 shrink-0 object-contain" />
        <span className="hidden truncate text-sm font-semibold text-white lg:block">Linkevolution</span>
      </div>

      <nav className="flex-1 space-y-1 px-2 py-4">
        {NAV.map(({ to, icon: Icon, label }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-lg px-2.5 py-2 text-sm font-medium transition-colors ${
                isActive
                  ? 'bg-teal-600/20 text-teal-300'
                  : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
              }`
            }
          >
            <Icon className="h-4 w-4 shrink-0" />
            <span className="hidden lg:block">{label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-gray-800 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-teal-700 text-xs font-bold text-white">
            {(user?.email?.[0] || user?.name?.[0] || 'U').toUpperCase()}
          </div>
          <div className="hidden min-w-0 flex-1 lg:block">
            <p className="truncate text-xs font-medium text-gray-200">{user?.email || user?.name || 'Usuario'}</p>
            {user?.role && <p className="truncate text-[10px] text-gray-500">{user.role}</p>}
          </div>
          <button
            type="button"
            onClick={handleLogout}
            title="Cerrar sesión"
            className="ml-auto text-gray-500 transition-colors hover:text-red-400"
          >
            <LogOut className="h-4 w-4" />
          </button>
        </div>
      </div>
    </aside>
  )
}
