import { useRef, useState } from 'react'
import { DaySheet } from '../components/DaySheet'
import MonthCalendar, { WeekdayHeader } from '../components/MonthCalendar'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatDate, formatMonthLabel, shiftMonth } from '../lib/dates'

const SWIPE_THRESHOLD = 56
const ANIMATION_MS = 300

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<'list' | 'add'>('list')

  const [dragOffset, setDragOffset] = useState(0)
  const [animating, setAnimating] = useState(false)

  const containerRef = useRef<HTMLDivElement>(null)
  const touchStart = useRef<{ x: number; y: number } | null>(null)
  const dragging = useRef(false)
  const pendingDir = useRef<'prev' | 'next' | null>(null)
  const locked = useRef(false)
  const dragOffsetRef = useRef(0)

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const { checkIns: prevCheckIns } = useCheckInsByMonth(prev.year, prev.month)
  const { checkIns } = useCheckInsByMonth(year, month)
  const { checkIns: nextCheckIns } = useCheckInsByMonth(next.year, next.month)

  const today = formatDate(new Date())

  const finishSwitch = (dir: 'prev' | 'next') => {
    const target = shiftMonth(year, month, dir === 'next' ? 1 : -1)
    // 先关掉动画，再同时复位偏移并换月，避免中间闪一帧旧内容
    setAnimating(false)
    setDragOffset(0)
    dragOffsetRef.current = 0
    setYear(target.year)
    setMonth(target.month)
    locked.current = false
    dragging.current = false
    pendingDir.current = null
  }

  const animateTo = (dir: 'prev' | 'next' | 'cancel') => {
    if (locked.current) return
    const width = containerRef.current?.clientWidth ?? 0
    locked.current = true
    setAnimating(true)

    if (dir === 'cancel') {
      pendingDir.current = null
      setDragOffset(0)
      dragOffsetRef.current = 0
      window.setTimeout(() => {
        setAnimating(false)
        locked.current = false
        dragging.current = false
      }, ANIMATION_MS)
      return
    }

    pendingDir.current = dir
    const targetOffset = dir === 'next' ? -width : width
    setDragOffset(targetOffset)
    dragOffsetRef.current = targetOffset

    window.setTimeout(() => {
      if (pendingDir.current) {
        finishSwitch(pendingDir.current)
      }
    }, ANIMATION_MS)
  }

  const goPrevMonth = () => animateTo('prev')
  const goNextMonth = () => animateTo('next')

  const goToday = () => {
    if (locked.current) return
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setDragOffset(0)
    dragOffsetRef.current = 0
  }

  const handleTouchStart = (e: React.TouchEvent) => {
    if (locked.current) return
    const touch = e.touches[0]
    touchStart.current = { x: touch.clientX, y: touch.clientY }
    dragging.current = false
    setAnimating(false)
  }

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!touchStart.current || locked.current) return
    const touch = e.touches[0]
    const dx = touch.clientX - touchStart.current.x
    const dy = touch.clientY - touchStart.current.y

    if (!dragging.current) {
      if (Math.abs(dx) < 10 && Math.abs(dy) < 10) return
      if (Math.abs(dy) >= Math.abs(dx)) {
        touchStart.current = null
        return
      }
      dragging.current = true
    }

    dragOffsetRef.current = dx
    setDragOffset(dx)
  }

  const handleTouchEnd = () => {
    if (!touchStart.current || locked.current) {
      touchStart.current = null
      return
    }
    const offset = dragOffsetRef.current
    touchStart.current = null

    if (!dragging.current || Math.abs(offset) < SWIPE_THRESHOLD) {
      animateTo('cancel')
      return
    }

    animateTo(offset < 0 ? 'next' : 'prev')
  }

  const openDay = (date: string) => {
    setSheetMode('list')
    setSelectedDate(date)
  }

  const openTodayAdd = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    setSheetMode('add')
    setSelectedDate(today)
  }

  const trackTransform = `translate3d(calc(-100% / 3 + ${dragOffset}px), 0, 0)`

  return (
    <div className="relative flex min-h-0 flex-1 flex-col gap-3">
      <div className="flex shrink-0 items-center justify-between">
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

      <div className="flex shrink-0 items-center gap-3 text-sm text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-emerald-500" /> 有氧
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-3 w-3 rounded-[3px] bg-blue-500" /> 无氧
        </span>
        <span className="ml-auto text-xs text-slate-300">左右滑动切换月份</span>
      </div>

      <WeekdayHeader />

      <div
        ref={containerRef}
        className="min-h-0 flex-1 overflow-hidden touch-pan-y"
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
      >
        <div
          className={[
            'flex h-full w-[300%] will-change-transform',
            animating || Math.abs(dragOffset) > 8 ? 'pointer-events-none' : '',
          ].join(' ')}
          style={{
            transform: trackTransform,
            transition: animating
              ? `transform ${ANIMATION_MS}ms cubic-bezier(0.22, 1, 0.36, 1)`
              : 'none',
          }}
        >
          <div className="h-full w-1/3 shrink-0 px-0.5">
            <MonthCalendar
              year={prev.year}
              month={prev.month}
              checkIns={prevCheckIns}
              onSelectDate={openDay}
            />
          </div>
          <div className="h-full w-1/3 shrink-0 px-0.5">
            <MonthCalendar
              year={year}
              month={month}
              checkIns={checkIns}
              onSelectDate={openDay}
            />
          </div>
          <div className="h-full w-1/3 shrink-0 px-0.5">
            <MonthCalendar
              year={next.year}
              month={next.month}
              checkIns={nextCheckIns}
              onSelectDate={openDay}
            />
          </div>
        </div>
      </div>

      <button
        type="button"
        onClick={openTodayAdd}
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
