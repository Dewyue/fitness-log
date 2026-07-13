import { useState } from 'react'
import { DaySheet } from '../components/DaySheet'
import MonthCalendar from '../components/MonthCalendar'
import StatsCharts, { StatsSummary } from '../components/StatsCharts'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatMonthLabel } from '../lib/dates'

export default function CalendarPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [statsExpanded, setStatsExpanded] = useState(false)

  const { checkIns } = useCheckInsByMonth(year, month)

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
    const today = new Date()
    setYear(today.getFullYear())
    setMonth(today.getMonth() + 1)
  }

  return (
    <div className="space-y-4">
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

      <StatsSummary checkIns={checkIns} />

      <button
        type="button"
        onClick={() => setStatsExpanded((v) => !v)}
        className="w-full rounded-xl border border-slate-200 py-2 text-sm text-slate-600 dark:border-slate-700 dark:text-slate-300"
      >
        {statsExpanded ? '收起统计图表 ▲' : '展开统计图表 ▼'}
      </button>

      <StatsCharts
        checkIns={checkIns}
        year={year}
        month={month}
        expanded={statsExpanded}
      />

      <div className="flex items-center gap-3 text-xs text-slate-400">
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-emerald-500" /> 有氧
        </span>
        <span className="flex items-center gap-1">
          <span className="h-2 w-2 rounded-full bg-blue-500" /> 无氧
        </span>
      </div>

      <MonthCalendar
        year={year}
        month={month}
        checkIns={checkIns}
        onSelectDate={setSelectedDate}
      />

      {selectedDate && (
        <DaySheet date={selectedDate} onClose={() => setSelectedDate(null)} />
      )}
    </div>
  )
}
