import { useState } from 'react'
import StatsCharts, { StatsSummary } from '../components/StatsCharts'
import { useCheckInsByMonth } from '../hooks/useCheckIns'
import { formatMonthLabel } from '../lib/dates'

export default function StatsPage() {
  const now = new Date()
  const [year, setYear] = useState(now.getFullYear())
  const [month, setMonth] = useState(now.getMonth() + 1)

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
          <h1 className="text-lg font-bold">{formatMonthLabel(year, month)} 统计</h1>
          <button
            type="button"
            onClick={goToday}
            className="text-xs text-emerald-600 dark:text-emerald-400"
          >
            回到本月
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

      <StatsCharts checkIns={checkIns} year={year} month={month} />
    </div>
  )
}
