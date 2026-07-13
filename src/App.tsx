import { NavLink, Route, Routes } from 'react-router-dom'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'

function NavItem({ to, label, icon }: { to: string; label: string; icon: string }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        [
          'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition',
          isActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
        ].join(' ')
      }
    >
      <span className="text-lg">{icon}</span>
      {label}
    </NavLink>
  )
}

export default function App() {
  return (
    <div className="mx-auto flex min-h-full max-w-[430px] flex-col">
      <main className="flex-1 px-4 pb-24 pt-4">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex px-2 pb-[env(safe-area-inset-bottom)]">
          <NavItem to="/" label="日历" icon="📅" />
          <NavItem to="/settings" label="数据" icon="💾" />
        </div>
      </nav>
    </div>
  )
}
