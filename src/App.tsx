import { NavLink, Route, Routes } from 'react-router-dom'
import UpdatePrompt from './components/UpdatePrompt'
import CalendarPage from './pages/CalendarPage'
import SettingsPage from './pages/SettingsPage'
import StatsPage from './pages/StatsPage'

function IconCalendar({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <rect x="3.5" y="5" width="17" height="15" rx="2" stroke="currentColor" strokeWidth="1.75" />
      <path d="M3.5 9.5h17" stroke="currentColor" strokeWidth="1.75" />
      <path d="M8 3.5v3M16 3.5v3" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  )
}

function IconStats({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <path
        d="M5 19V11M12 19V5M19 19v-7"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
      />
    </svg>
  )
}

function IconData({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden>
      <ellipse cx="12" cy="6.5" rx="7" ry="2.75" stroke="currentColor" strokeWidth="1.75" />
      <path
        d="M5 6.5v11c0 1.5 3.1 2.75 7 2.75s7-1.25 7-2.75v-11"
        stroke="currentColor"
        strokeWidth="1.75"
      />
      <path
        d="M5 12c0 1.5 3.1 2.75 7 2.75s7-1.25 7-2.75"
        stroke="currentColor"
        strokeWidth="1.75"
      />
    </svg>
  )
}

function NavItem({
  to,
  label,
  icon,
}: {
  to: string
  label: string
  icon: React.ReactNode
}) {
  return (
    <NavLink
      to={to}
      end={to === '/'}
      className={({ isActive }) =>
        [
          'flex flex-1 flex-col items-center gap-1 py-2 text-xs transition',
          isActive
            ? 'text-emerald-600 dark:text-emerald-400'
            : 'text-slate-400 hover:text-slate-600 dark:hover:text-slate-300',
        ].join(' ')
      }
    >
      {icon}
      {label}
    </NavLink>
  )
}

const iconClass = 'h-5 w-5'

export default function App() {
  return (
    <div className="mx-auto min-h-dvh max-w-[430px]">
      <UpdatePrompt />
      <main className="w-full px-3 pb-28 pt-[max(0.75rem,env(safe-area-inset-top))]">
        <Routes>
          <Route path="/" element={<CalendarPage />} />
          <Route path="/stats" element={<StatsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
        </Routes>
      </main>

      <nav className="fixed bottom-0 left-1/2 z-40 w-full max-w-[430px] -translate-x-1/2 border-t border-slate-200 bg-white/95 backdrop-blur dark:border-slate-700 dark:bg-slate-900/95">
        <div className="flex px-2 pb-[env(safe-area-inset-bottom)]">
          <NavItem to="/" label="日历" icon={<IconCalendar className={iconClass} />} />
          <NavItem to="/stats" label="统计" icon={<IconStats className={iconClass} />} />
          <NavItem to="/settings" label="数据" icon={<IconData className={iconClass} />} />
        </div>
      </nav>
    </div>
  )
}
