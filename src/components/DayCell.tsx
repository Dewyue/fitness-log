import type { BodyPart, CheckIn, WorkoutType } from '../types'
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

/** 按当天最早一条记录决定有氧/无氧方块的左右顺序 */
function getTypeOrder(records: CheckIn[]): WorkoutType[] {
  const sorted = [...records].sort((a, b) => a.createdAt - b.createdAt)
  const order: WorkoutType[] = []
  for (const record of sorted) {
    if (!order.includes(record.type)) {
      order.push(record.type)
    }
  }
  return order
}

const TYPE_STYLE: Record<WorkoutType, string> = {
  aerobic: 'bg-emerald-500',
  anaerobic: 'bg-blue-500',
}

export default function DayCell({
  day,
  inMonth,
  isToday,
  records,
  onClick,
}: DayCellProps) {
  const typeOrder = getTypeOrder(records)
  const parts = getAnaerobicParts(records)

  return (
    <button
      type="button"
      onClick={onClick}
      className={[
        'box-border flex h-full w-full min-h-0 flex-col overflow-hidden rounded-xl p-1.5 text-left transition active:scale-[0.98]',
        inMonth
          ? 'bg-white dark:bg-slate-800'
          : 'bg-slate-100/80 dark:bg-slate-800/50',
        isToday ? 'ring-2 ring-emerald-500 ring-offset-1 dark:ring-offset-slate-900' : '',
      ].join(' ')}
    >
      <div className={inMonth ? '' : 'opacity-40'}>
        <span
          className={[
            'block text-center text-sm font-bold leading-none',
            isToday ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-800 dark:text-slate-100',
          ].join(' ')}
        >
          {day}
        </span>

        {typeOrder.length > 0 && (
          <div className="mt-1.5 flex items-center justify-center gap-1.5">
            {typeOrder.map((type) => (
              <span
                key={type}
                className={`h-3 w-3 rounded-[3px] ${TYPE_STYLE[type]}`}
                title={type === 'aerobic' ? '有氧' : '无氧'}
              />
            ))}
          </div>
        )}

        {parts.length > 0 && (
          <div className="mt-1.5 flex min-h-0 flex-wrap content-start justify-center gap-x-1 gap-y-0.5">
            {parts.map((part) => (
              <span
                key={part}
                className={`text-[11px] font-semibold leading-tight ${PART_COLORS[part]}`}
              >
                {part}
              </span>
            ))}
          </div>
        )}
      </div>
    </button>
  )
}
