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
}

export default function MonthCalendar({
  year,
  month,
  checkIns,
  onSelectDate,
}: MonthCalendarProps) {
  const cells = getCalendarCells(year, month)
  const byDate = groupByDate(checkIns)

  return (
    <div className="grid grid-cols-7 gap-1.5">
      {cells.map((cell) => (
        <DayCell
          key={cell.date}
          day={cell.day}
          inMonth={cell.inMonth}
          isToday={cell.isToday}
          records={byDate.get(cell.date) ?? []}
          onClick={() => onSelectDate(cell.date)}
        />
      ))}
    </div>
  )
}
