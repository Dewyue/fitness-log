import { useRef, useState } from 'react'
import { DaySheet } from '../components/DaySheet'
import MonthCalendar from '../components/MonthCalendar'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatDate, formatMonthLabel } from '../lib/dates'

const SWIPE_THRESHOLD = 50

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)

  const touchStart = useRef<{ x: number; y: number } | null>(null)

  const { checkIns } = useCheckInsByMonth(year, month)
  const today = formatDate(new Date())

  const goPrevMonth = () => {
    if (month === 1) {
      setYear((y) => y - 1)
      setMonth(12)
    } else {
      setMonth((m) => m - 1)
    }
  }

  const goNextMonth = () => {
    if (month === 12) {
      setYear((y) => y + 1)
      setMonth(1)
    } else {
      setMonth((m) => m + 1)
    }
  }

  const goToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
  }

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStart.current) return
    const touch = e.changedTouches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y
    touchStart.current = null

    if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) < Math.abs(dy)) return

    if (dx < 0) {
      goNextMonth()
    } else {
      goPrevMonth()
    }
  }

  return (
    <div className="relative space-y-4">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ‹
        </button>
        <div className="text-center">
          <h1 className="text-lg font-bold">{formatMonthLabel(year, month)}</h1>
          <button
            type="button"
            onClick={goToday}
            className="text-xs text-emerald-600 dark:text-emerald-400"
          >
            回到今天
          </button>
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          className="rounded-lg px-3 py-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> 有氧
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> 无氧
        </span>
        <span className="ml-auto text-[11px] text-slate-300">左右滑动切换月份</span>
      </div>

      <div
        className="touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <MonthCalendar
          year={year}
          month={month}
          checkIns={checkIns}
          onSelectDate={setSelectedDate}
        />
      </div>

      <button
        type="button"
        onClick={() => setSelectedDate(today)}
        aria-label="新增今日打卡"
        className="fixed bottom-24 right-[max(1rem,calc(50%-215px+1rem))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl font-light text-white shadow-lg shadow-emerald-500/40 transition active:scale-95"
      >
        +
      </button>

      {selectedDate && (
        <DaySheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  )
}
