import type { CheckIn } from '../types'

interface DayCellProps {
  day: number
  inMonth: boolean
  isToday: boolean
  records: CheckIn[]
  onClick: () => void
}

function summarizeRecords(records: CheckIn[]): { lines: string[]; extra: number } {
  const anaerobicLines = records
    .filter((record) => record.type === 'anaerobic')
    .map((record) => record.parts?.join('·') ?? '')
    .filter(Boolean)

  return {
    lines: anaerobicLines.slice(0, 2),
    extra: Math.max(0, anaerobicLines.length - 2),
  }
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
  const { lines: summary, extra } = summarizeRecords(records)

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'flex min-h-[72px] flex-col rounded-lg border p-1.5 text-left transition active:scale-[0.98]',
        inMonth
          ? 'border-slate-200 bg-white dark:border-slate-700 dark:bg-slate-800'
          : 'border-transparent bg-slate-50/60 opacity-40 dark:bg-slate-900/40',
        isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : '',
        records.length > 0 ? 'shadow-sm' : '',
      ].join(' ')}
    >
      <div className="mb-1 flex items-center justify-between">
        <span
          className={[
            'text-xs font-semibold',
            isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-700 dark:text-slate-200',
          ].join(' ')}
        >
          {day}
        </span>
        {records.length > 0 && (
          <div className="flex gap-0.5">
            {hasAerobic && <span className="h-2 w-2 rounded-full bg-emerald-500" />}
            {hasAnaerobic && <span className="h-2 w-2 rounded-full bg-blue-500" />}
          </div>
        )}
      </div>

      <div className="flex flex-1 flex-col gap-0.5 overflow-hidden">
        {summary.map((line, index) => (
          <span
            key={index}
            className="truncate text-[10px] leading-tight text-slate-500 dark:text-slate-400"
          >
            {line}
          </span>
        ))}
        {extra > 0 && (
          <span className="text-[10px] text-slate-400">+{extra}</span>
        )}
      </div>
    </button>
  )
}
