import { WEEKDAY_LABELS, getCalendarCells } from '../lib/dates'
import { groupByDate } from '../hooks/useCheckIns'
import type { CheckIn } from '../types'
import DayCell from './DayCell'

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
    <div>
      <div className="mb-2 grid grid-cols-7 gap-1">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1 text-center text-xs font-medium text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
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
    </div>
  )
}
