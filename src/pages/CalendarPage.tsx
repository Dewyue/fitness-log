import { useEffect, useMemo, useRef, useState } from 'react'
import DayCell from '../components/DayCell'
import { DaySheet } from '../components/DaySheet'
import { WeekdayHeader } from '../components/MonthCalendar'
import { groupByDate, useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatDate, formatMonthLabel, shiftMonth } from '../lib/dates'
import type { CheckIn } from '../types'

const RANGE = 8

function monthKey(year: number, month: number) {
  return `${year}-${month}`
}

type DayItem = {
  date: string
  day: number
  year: number
  month: number
  spacer: boolean
}

function buildContinuousDays(start: { year: number; month: number }, count: number) {
  const days: Omit<DayItem, 'spacer'>[] = []
  for (let i = 0; i < count; i++) {
    const { year, month } = shiftMonth(start.year, start.month, i)
    const last = new Date(year, month, 0).getDate()
    for (let day = 1; day <= last; day++) {
      days.push({
        date: `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`,
        day,
        year,
        month,
      })
    }
  }
  return days
}

function padToWeeks(days: Omit<DayItem, 'spacer'>[]): DayItem[] {
  if (days.length === 0) return []

  const first = new Date(days[0].date + 'T12:00:00')
  const lead = (first.getDay() + 6) % 7
  const leading: DayItem[] = Array.from({ length: lead }, (_, i) => {
    const d = new Date(first)
    d.setDate(first.getDate() - lead + i)
    return {
      date: formatDate(d),
      day: d.getDate(),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      spacer: true,
    }
  })

  const last = new Date(days[days.length - 1].date + 'T12:00:00')
  const trailCount = (7 - ((lead + days.length) % 7)) % 7
  const trailing: DayItem[] = Array.from({ length: trailCount }, (_, i) => {
    const d = new Date(last)
    d.setDate(last.getDate() + i + 1)
    return {
      date: formatDate(d),
      day: d.getDate(),
      year: d.getFullYear(),
      month: d.getMonth() + 1,
      spacer: true,
    }
  })

  return [
    ...leading,
    ...days.map((d) => ({ ...d, spacer: false })),
    ...trailing,
  ]
}

function MonthData({
  year,
  month,
  onData,
}: {
  year: number
  month: number
  onData: (key: string, records: CheckIn[]) => void
}) {
  const { checkIns } = useCheckInsByMonth(year, month)
  useEffect(() => {
    onData(monthKey(year, month), checkIns)
  }, [checkIns, year, month, onData])
  return null
}

export default function CalendarPage() {
  const now = new Date()
  const rangeStart = useMemo(
    () => shiftMonth(now.getFullYear(), now.getMonth() + 1, -RANGE),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  )

  const months = useMemo(() => {
    const list: { year: number; month: number; key: string }[] = []
    for (let i = 0; i <= RANGE * 2; i++) {
      const m = shiftMonth(rangeStart.year, rangeStart.month, i)
      list.push({ year: m.year, month: m.month, key: monthKey(m.year, m.month) })
    }
    return list
  }, [rangeStart])

  const continuousDays = useMemo(
    () => padToWeeks(buildContinuousDays(rangeStart, RANGE * 2 + 1)),
    [rangeStart],
  )

  const weeks = useMemo(() => {
    const rows: (typeof continuousDays)[] = []
    for (let i = 0; i < continuousDays.length; i += 7) {
      rows.push(continuousDays.slice(i, i + 7))
    }
    return rows
  }, [continuousDays])

  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [sheetMode, setSheetMode] = useState<'list' | 'add'>('list')
  const [byMonth, setByMonth] = useState<Record<string, CheckIn[]>>({})

  const scrollerRef = useRef<HTMLDivElement>(null)
  const weekRefs = useRef(new Map<string, HTMLElement>())
  const skipping = useRef(false)
  const today = formatDate(new Date())

  const handleMonthData = useMemo(
    () => (key: string, records: CheckIn[]) => {
      setByMonth((prev) => {
        if (prev[key] === records) return prev
        return { ...prev, [key]: records }
      })
    },
    [],
  )

  const allByDate = useMemo(() => {
    const all: CheckIn[] = []
    for (const m of months) {
      const records = byMonth[m.key]
      if (records) all.push(...records)
    }
    return groupByDate(all)
  }, [byMonth, months])

  const scrollToMonth = (y: number, m: number, behavior: ScrollBehavior = 'smooth') => {
    const root = scrollerRef.current
    const el = weekRefs.current.get(monthKey(y, m))
    if (!root || !el) return
    skipping.current = true
    // 只滚日历容器，避免 scrollIntoView 把顶部标题顶出屏幕
    const nextTop = root.scrollTop + (el.getBoundingClientRect().top - root.getBoundingClientRect().top)
    root.scrollTo({ top: Math.max(0, nextTop), behavior })
    window.setTimeout(() => {
      skipping.current = false
    }, behavior === 'smooth' ? 360 : 50)
  }

  useEffect(() => {
    window.scrollTo(0, 0)
    // 等周节点挂上 ref 后再定位到当前月
    const id = window.requestAnimationFrame(() => {
      window.requestAnimationFrame(() => scrollToMonth(year, month, 'auto'))
    })
    return () => window.cancelAnimationFrame(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    const root = scrollerRef.current
    if (!root) return

    const onScroll = () => {
      if (skipping.current) return
      const rootTop = root.getBoundingClientRect().top
      let best: { y: number; m: number; dist: number } | null = null

      for (const [key, el] of weekRefs.current) {
        const rect = el.getBoundingClientRect()
        const dist = Math.abs(rect.top - rootTop)
        const [y, m] = key.split('-').map(Number)
        if (!best || dist < best.dist) best = { y, m, dist }
      }

      if (best && (best.y !== year || best.m !== month)) {
        setYear(best.y)
        setMonth(best.m)
      }
    }

    root.addEventListener('scroll', onScroll, { passive: true })
    return () => root.removeEventListener('scroll', onScroll)
  }, [year, month])

  const goPrevMonth = () => {
    const target = shiftMonth(year, month, -1)
    setYear(target.year)
    setMonth(target.month)
    scrollToMonth(target.year, target.month, 'smooth')
  }

  const goNextMonth = () => {
    const target = shiftMonth(year, month, 1)
    setYear(target.year)
    setMonth(target.month)
    scrollToMonth(target.year, target.month, 'smooth')
  }

  const goToday = () => {
    const d = new Date()
    const y = d.getFullYear()
    const m = d.getMonth() + 1
    setYear(y)
    setMonth(m)
    scrollToMonth(y, m, 'smooth')
  }

  const openDay = (date: string) => {
    setSheetMode('list')
    setSelectedDate(date)
  }

  return (
    <div className="space-y-3">
      {months.map((m) => (
        <MonthData
          key={m.key}
          year={m.year}
          month={m.month}
          onData={handleMonthData}
        />
      ))}

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
        <span className="ml-auto text-xs text-slate-300">上下滑动浏览</span>
      </div>

      <WeekdayHeader />

      <div
        ref={scrollerRef}
        className="h-[calc(100dvh-11.5rem)] space-y-1.5 overflow-y-auto overscroll-y-contain"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {weeks.map((week, weekIndex) => {
          const monthStarts = week.filter((c) => !c.spacer && c.day === 1)

          return (
            <div
              key={weekIndex}
              ref={(el) => {
                for (const start of monthStarts) {
                  const key = monthKey(start.year, start.month)
                  if (el) weekRefs.current.set(key, el)
                  else weekRefs.current.delete(key)
                }
              }}
              className="grid grid-cols-7 gap-1.5"
            >
              {week.map((cell) => {
                if (cell.spacer) {
                  return <div key={`s-${cell.date}`} className="min-h-[76px]" aria-hidden />
                }
                const active = cell.year === year && cell.month === month
                return (
                  <DayCell
                    key={cell.date}
                    day={cell.day}
                    inMonth
                    isToday={cell.date === today}
                    records={allByDate.get(cell.date) ?? []}
                    dimmed={!active}
                    onClick={() => openDay(cell.date)}
                  />
                )
              })}
            </div>
          )
        })}
      </div>

      <button
        type="button"
        onClick={() => {
          const d = new Date()
          const y = d.getFullYear()
          const m = d.getMonth() + 1
          setYear(y)
          setMonth(m)
          setSheetMode('add')
          setSelectedDate(today)
          requestAnimationFrame(() => scrollToMonth(y, m, 'auto'))
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
