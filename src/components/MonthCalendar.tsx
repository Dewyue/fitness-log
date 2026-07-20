import { WEEKDAY_LABELS, getCalendarCells } from '../lib/dates'
import { groupByDate } from '../hooks/useCheckIns'
import type { CheckIn } from '../types'
import DayCell from './DayCell'

export function WeekdayHeader() {
  return (
    <div className="grid grid-cols-7 gap-1.5">
      {WEEKDAY_LABELS.map((label) => (
        <div
          key={label}
          className="py-1.5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"
        >
          {label}
        </div>
      ))}
    </div>
  )
}

interface MonthCalendarProps {
  year: number
  month: number
  checkIns: CheckIn[]
  onSelectDate: (date: string) => void
  dimmed?: boolean
}

export default function MonthCalendar({
  year,
  month,
  checkIns,
  onSelectDate,
  dimmed = false,
}: MonthCalendarProps) {
  const cells = getCalendarCells(year, month)
  const byDate = groupByDate(checkIns)
  // 只渲染本月日期，首日用 gridColumn 对齐星期，避免与相邻月重复/留白
  const inMonthCells = cells.filter((cell) => cell.inMonth)
  const firstWeekday = inMonthCells[0]
    ? new Date(inMonthCells[0].date + 'T12:00:00').getDay()
    : 1
  // 周一为一列起点：一=1 … 日=7
  const startCol = ((firstWeekday + 6) % 7) + 1

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {inMonthCells.map((cell, index) => (
        <div
          key={cell.date}
          style={index === 0 ? { gridColumnStart: startCol } : undefined}
        >
          <DayCell
            day={cell.day}
            inMonth
            isToday={cell.isToday}
            records={byDate.get(cell.date) ?? []}
            dimmed={dimmed}
            onClick={() => onSelectDate(cell.date)}
          />
        </div>
      ))}
    </div>
  )
}
