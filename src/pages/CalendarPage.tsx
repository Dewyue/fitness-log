import { useRef, useState } from 'react'
import { DaySheet } from '../components/DaySheet'
import MonthCalendar, { WeekdayHeader } from '../components/MonthCalendar'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatDate, formatMonthLabel, shiftMonth } from '../lib/dates'

const SWIPE_THRESHOLD = 60
const ANIMATION_MS = 280

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<'list' | 'add'>('list')
  const [offset, setOffset] = useState(0)
  const [withTransition, setWithTransition] = useState(false)

  const startX = useRef(0)
  const startY = useRef(0)
  const tracking = useRef(false)
  const locking = useRef(false)
  const offsetRef = useRef(0)
  const yearRef = useRef(year)
  const monthRef = useRef(month)
  yearRef.current = year
  monthRef.current = month

  const { checkIns } = useCheckInsByMonth(year, month)
  const today = formatDate(new Date())

  const goPrevMonth = () => {
    if (locking.current) return
    locking.current = true
    setWithTransition(true)
    setOffset(40)
    offsetRef.current = 40

    window.setTimeout(() => {
      const target = shiftMonth(yearRef.current, monthRef.current, -1)
      setWithTransition(false)
      setOffset(0)
      offsetRef.current = 0
      setYear(target.year)
      setMonth(target.month)
      locking.current = false
    }, ANIMATION_MS)
  }

  const goNextMonth = () => {
    if (locking.current) return
    locking.current = true
    setWithTransition(true)
    setOffset(-40)
    offsetRef.current = -40

    window.setTimeout(() => {
      const target = shiftMonth(yearRef.current, monthRef.current, 1)
      setWithTransition(false)
      setOffset(0)
      offsetRef.current = 0
      setYear(target.year)
      setMonth(target.month)
      locking.current = false
    }, ANIMATION_MS)
  }

  const goToday = () => {
    if (locking.current) return
    const d = new Date()
    setWithTransition(false)
    setOffset(0)
    offsetRef.current = 0
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
  }

  const onTouchStart = (e: React.TouchEvent) => {
    if (locking.current) return
    const t = e.touches[0]
    startX.current = t.clientX
    startY.current = t.clientY
    tracking.current = false
    setWithTransition(false)
  }

  const onTouchMove = (e: React.TouchEvent) => {
    if (locking.current) return
    const t = e.touches[0]
    const dx = t.clientX - startX.current
    const dy = t.clientY - startY.current

    if (!tracking.current) {
      if (Math.abs(dx) < 12 && Math.abs(dy) < 12) return
      if (Math.abs(dy) >= Math.abs(dx)) return
      tracking.current = true
    }

    const clamped = Math.max(-80, Math.min(80, dx))
    offsetRef.current = clamped
    setOffset(clamped)
  }

  const onTouchEnd = () => {
    if (locking.current) return
    const dx = offsetRef.current

    if (!tracking.current || Math.abs(dx) < SWIPE_THRESHOLD) {
      setWithTransition(true)
      setOffset(0)
      offsetRef.current = 0
      window.setTimeout(() => setWithTransition(false), ANIMATION_MS)
      tracking.current = false
      return
    }

    if (dx < 0) goNextMonth()
    else goPrevMonth()
    tracking.current = false
  }

  return (
    <div className="relative space-y-3 pb-8">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={goPrevMonth}
          className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ‹
        </button>
        <div className="text-center">
          <h1 className="text-xl font-bold tracking-wide">{formatMonthLabel(year, month)}</h1>
          <button
            type="button"
            onClick={goToday}
            className="text-sm text-emerald-600 dark:text-emerald-400"
          >
            回到今天
          </button>
        </div>
        <button
          type="button"
          onClick={goNextMonth}
          className="rounded-lg px-3 py-2 text-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          ›
        </button>
      </div>

      <div className="flex items-center gap-3 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-emerald-500" /> 有氧
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-blue-500" /> 无氧
        </span>
      </div>

      <WeekdayHeader />

      <div
        className="overflow-hidden"
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onTouchCancel={onTouchEnd}
      >
        <div
          style={{
            transform: `translate3d(${offset}px, 0, 0)`,
            opacity: Math.max(0.7, 1 - Math.abs(offset) / 200),
            transition: withTransition
              ? `transform ${ANIMATION_MS}ms ease-out, opacity ${ANIMATION_MS}ms ease-out`
              : 'none',
          }}
        >
          <MonthCalendar
            year={year}
            month={month}
            checkIns={checkIns}
            onSelectDate={(date) => {
              setSheetMode('list')
              setSelectedDate(date)
            }}
          />
        </div>
      </div>

      <button
        type="button"
        onClick={() => {
          const d = new Date()
          setYear(d.getFullYear())
          setMonth(d.getMonth() + 1)
          setSheetMode('add')
          setSelectedDate(today)
        }}
        aria-label="新增今日打卡"
        className="fixed bottom-24 right-[max(1rem,calc(50%-215px+1rem))] z-50 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500 text-3xl font-light text-white shadow-lg shadow-emerald-500/40 transition active:scale-95"
      >
        +
      </button>

      {selectedDate && (
        <DaySheet
          key={`${selectedDate}-${sheetMode}`}
          date={selectedDate}
          initialMode={sheetMode}
          onClose={() => {
            setSelectedDate(null)
            setSheetMode('list')
          }}
        />
      )}
    </div>
  )
}
