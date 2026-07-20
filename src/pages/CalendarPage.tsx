import { useEffect, useRef, useState } from 'react'
import { DaySheet } from '../components/DaySheet'
import MonthCalendar, { WeekdayHeader } from '../components/MonthCalendar'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatDate, formatMonthLabel, shiftMonth } from '../lib/dates'

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<'list' | 'add'>('list')

  const scrollerRef = useRef<HTMLDivElement>(null)
  const settling = useRef(false)
  const scrollTimer = useRef<number>(0)
  const yearRef = useRef(year)
  const monthRef = useRef(month)
  yearRef.current = year
  monthRef.current = month

  const prev = shiftMonth(year, month, -1)
  const next = shiftMonth(year, month, 1)

  const { checkIns: prevCheckIns } = useCheckInsByMonth(prev.year, prev.month)
  const { checkIns } = useCheckInsByMonth(year, month)
  const { checkIns: nextCheckIns } = useCheckInsByMonth(next.year, next.month)

  const today = formatDate(new Date())

  const scrollToCenter = (behavior: ScrollBehavior = 'auto') => {
    const el = scrollerRef.current
    if (!el) return
    el.scrollTo({ top: el.clientHeight, behavior })
  }

  useEffect(() => {
    scrollToCenter('auto')
  }, [])

  const applyMonth = (dir: -1 | 1) => {
    const target = shiftMonth(yearRef.current, monthRef.current, dir)
    setYear(target.year)
    setMonth(target.month)
    requestAnimationFrame(() => scrollToCenter('auto'))
  }

  const goPrevMonth = () => {
    if (settling.current) return
    settling.current = true
    applyMonth(-1)
    window.setTimeout(() => {
      settling.current = false
    }, 80)
  }

  const goNextMonth = () => {
    if (settling.current) return
    settling.current = true
    applyMonth(1)
    window.setTimeout(() => {
      settling.current = false
    }, 80)
  }

  const goToday = () => {
    const d = new Date()
    setYear(d.getFullYear())
    setMonth(d.getMonth() + 1)
    requestAnimationFrame(() => scrollToCenter('auto'))
  }

  const handleScroll = () => {
    if (settling.current) return
    const el = scrollerRef.current
    if (!el) return

    window.clearTimeout(scrollTimer.current)
    scrollTimer.current = window.setTimeout(() => {
      const page = el.clientHeight || 1
      const index = Math.round(el.scrollTop / page)

      if (index <= 0) {
        settling.current = true
        applyMonth(-1)
        window.setTimeout(() => {
          settling.current = false
        }, 80)
      } else if (index >= 2) {
        settling.current = true
        applyMonth(1)
        window.setTimeout(() => {
          settling.current = false
        }, 80)
      } else if (Math.abs(el.scrollTop - page) > 2) {
        scrollToCenter('smooth')
      }
    }, 70)
  }

  const openDay = (date: string) => {
    setSheetMode('list')
    setSelectedDate(date)
  }

  return (
    <div className="space-y-3">
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
        <span className="ml-auto text-xs text-slate-300">上下滑动切换月份</span>
      </div>

      <WeekdayHeader />

      <div
        ref={scrollerRef}
        onScroll={handleScroll}
        className="h-[calc(100dvh-12.5rem)] snap-y snap-mandatory overflow-y-auto overscroll-y-contain rounded-xl"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        <section className="box-border h-full snap-start snap-always overflow-hidden py-1">
          <p className="mb-2 text-center text-xs text-slate-400">
            {formatMonthLabel(prev.year, prev.month)}
          </p>
          <MonthCalendar
            year={prev.year}
            month={prev.month}
            checkIns={prevCheckIns}
            onSelectDate={openDay}
            dimmed
          />
        </section>

        <section className="box-border h-full snap-start snap-always overflow-hidden py-1">
          <p className="mb-2 text-center text-xs font-medium text-emerald-600 dark:text-emerald-400">
            {formatMonthLabel(year, month)}
          </p>
          <MonthCalendar
            year={year}
            month={month}
            checkIns={checkIns}
            onSelectDate={openDay}
          />
        </section>

        <section className="box-border h-full snap-start snap-always overflow-hidden py-1">
          <p className="mb-2 text-center text-xs text-slate-400">
            {formatMonthLabel(next.year, next.month)}
          </p>
          <MonthCalendar
            year={next.year}
            month={next.month}
            checkIns={nextCheckIns}
            onSelectDate={openDay}
            dimmed
          />
        </section>
      </div>

      <button
        type="button"
        onClick={() => {
          const d = new Date()
          setYear(d.getFullYear())
          setMonth(d.getMonth() + 1)
          setSheetMode('add')
          setSelectedDate(today)
          requestAnimationFrame(() => scrollToCenter('auto'))
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
