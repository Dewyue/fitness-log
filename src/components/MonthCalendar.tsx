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
  const weeks = Math.ceil(cells.length / 7)

  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="mb-2 grid grid-cols-7 gap-1.5">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="py-1.5 text-center text-sm font-semibold text-slate-500 dark:text-slate-400"
          >
            {label}
          </div>
        ))}
      </div>

      <div
        className="grid min-h-0 flex-1 grid-cols-7 gap-1.5"
        style={{ gridTemplateRows: `repeat(${weeks}, minmax(0, 1fr))` }}
      >
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
