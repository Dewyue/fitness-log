import type { BodyPart, CheckIn } from '../types'
import { PART_COLORS } from '../types'

interface DayCellProps {
  day: number
  inMonth: boolean
  isToday: boolean
  records: CheckIn[]
  onClick: () => void
}

function getAnaerobicParts(records: CheckIn[]): BodyPart[] {
  const seen = new Set<BodyPart>()
  const parts: BodyPart[] = []

  for (const record of records) {
    if (record.type !== 'anaerobic' || !record.parts) continue
    for (const part of record.parts) {
      if (!seen.has(part)) {
        seen.add(part)
        parts.push(part)
      }
    }
  }

  return parts
}

export default function DayCell({
  day,
  inMonth,
  isToday,
  records,
  onClick,
}: DayCellProps) {
  const hasAerobic = records.some((r) => r.type === 'aerobic')
  const hasAnaerobic = records.some((r) => r.type === 'anaerobic')
  const parts = getAnaerobicParts(records)

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex h-full min-h-[92px] flex-col rounded-xl p-2 text-left transition active:scale-[0.98]',
        inMonth
          ? 'bg-white dark:bg-slate-800'
          : 'bg-transparent opacity-40',
        isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : '',
      ].join(' ')}
    >
      <div className="mb-1.5 flex items-center justify-between">
        <span
          className={[
            'text-base font-bold leading-none',
            isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100',
          ].join(' ')}
        >
          {day}
        </span>
        {records.length > 0 && (
          <div className="flex shrink-0 gap-1">
            {hasAerobic && <span className="h-2.5 w-2.5 rounded-full bg-emerald-500" />}
            {hasAnaerobic && <span className="h-2.5 w-2.5 rounded-full bg-blue-500" />}
          </div>
        )}
      </div>

      {parts.length > 0 && (
        <div className="flex flex-1 flex-wrap content-start gap-x-1.5 gap-y-1">
          {parts.map((part) => (
            <span
              key={part}
              className={`text-xs font-semibold leading-tight ${PART_COLORS[part]}`}
            >
              {part}
            </span>
          ))}
        </div>
      )}
    </button>
  )
}
