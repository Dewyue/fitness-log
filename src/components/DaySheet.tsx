import { useState } from 'react'
import { addCheckIn, deleteCheckIn, notifyLocalStorageChange, updateCheckIn } from '../db'
import { formatDisplayDate } from '../lib/dates'
import { useCheckInsByDate } from '../hooks/useCheckIns'
import { BODY_PARTS, type BodyPart, type CheckIn, type WorkoutType } from '../types'

interface CheckInFormProps {
  date: string
  initial?: CheckIn
  onDone: () => void
  onCancel: () => void
}

export default function CheckInForm({ date, initial, onDone, onCancel }: CheckInFormProps) {
  const [type, setType] = useState<WorkoutType>(initial?.type ?? 'aerobic')
  const [calories, setCalories] = useState(String(initial?.calories ?? ''))
  const [duration, setDuration] = useState(String(initial?.durationMinutes ?? ''))
  const [parts, setParts] = useState<BodyPart[]>(initial?.parts ?? [])
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)

  const togglePart = (part: BodyPart) => {
    setParts((prev) =>
      prev.includes(part) ? prev.filter((p) => p !== part) : [...prev, part],
    )
  }

  const handleSubmit = async () => {
    setError('')

    if (type === 'aerobic') {
      const caloriesNum = Number(calories)
      const durationNum = Number(duration)
      if (!caloriesNum || caloriesNum <= 0) {
        setError('请输入有效的卡路里数')
        return
      }
      if (!durationNum || durationNum <= 0) {
        setError('请输入有效的时长（分钟）')
        return
      }

      setSaving(true)
      try {
        if (initial) {
          await updateCheckIn(initial.id, {
            type: 'aerobic',
            calories: caloriesNum,
            durationMinutes: durationNum,
            parts: undefined,
          })
        } else {
          await addCheckIn({
            date,
            type: 'aerobic',
            calories: caloriesNum,
            durationMinutes: durationNum,
          })
        }
        notifyLocalStorageChange()
        onDone()
      } catch (err) {
        setError(err instanceof Error ? err.message : '保存失败，请重试')
      } finally {
        setSaving(false)
      }
      return
    }

    if (parts.length === 0) {
      setError('请至少选择一个训练部位')
      return
    }

    setSaving(true)
    try {
      if (initial) {
        await updateCheckIn(initial.id, {
          type: 'anaerobic',
          parts,
          calories: undefined,
          durationMinutes: undefined,
        })
      } else {
        await addCheckIn({
          date,
          type: 'anaerobic',
          parts,
        })
      }
      notifyLocalStorageChange()
      onDone()
    } catch (err) {
      setError(err instanceof Error ? err.message : '保存失败，请重试')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex rounded-xl bg-slate-100 p-1 dark:bg-slate-700">
        <button
          type="button"
          onClick={() => setType('aerobic')}
          className={[
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            type === 'aerobic'
              ? 'bg-emerald-500 text-white shadow'
              : 'text-slate-600 dark:text-slate-300',
          ].join(' ')}
        >
          有氧
        </button>
        <button
          type="button"
          onClick={() => setType('anaerobic')}
          className={[
            'flex-1 rounded-lg py-2 text-sm font-medium transition',
            type === 'anaerobic'
              ? 'bg-blue-500 text-white shadow'
              : 'text-slate-600 dark:text-slate-300',
          ].join(' ')}
        >
          无氧
        </button>
      </div>

      {type === 'aerobic' ? (
        <div className="space-y-3">
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
              消耗卡路里（kcal）
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={calories}
              onChange={(e) => setCalories(e.target.value)}
              placeholder="例如 320"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
          <label className="block">
            <span className="mb-1 block text-sm text-slate-600 dark:text-slate-300">
              时长（分钟）
            </span>
            <input
              type="number"
              inputMode="numeric"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              placeholder="例如 45"
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-base outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-800"
            />
          </label>
        </div>
      ) : (
        <div>
          <span className="mb-2 block text-sm text-slate-600 dark:text-slate-300">
            训练部位（可多选）
          </span>
          <div className="flex flex-wrap gap-2">
            {BODY_PARTS.map((part) => {
              const selected = parts.includes(part)
              return (
                <button
                  key={part}
                  type="button"
                  onClick={() => togglePart(part)}
                  className={[
                    'rounded-full px-4 py-2 text-sm font-medium transition',
                    selected
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300',
                  ].join(' ')}
                >
                  {part}
                </button>
              )
            })}
          </div>
        </div>
      )}

      {error && <p className="text-sm text-red-500">{error}</p>}

      <div className="flex gap-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600"
        >
          取消
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 rounded-xl bg-slate-900 py-3 text-sm font-medium text-white disabled:opacity-50 dark:bg-emerald-600"
        >
          {saving ? '保存中…' : initial ? '更新' : '保存'}
        </button>
      </div>
    </div>
  )
}

function RecordItem({
  record,
  onEdit,
  onDelete,
}: {
  record: CheckIn
  onEdit: () => void
  onDelete: () => void
}) {
  return (
    <div className="flex items-start justify-between rounded-xl border border-slate-200 p-3 dark:border-slate-700">
      <div>
        <span
          className={[
            'inline-block rounded-full px-2 py-0.5 text-xs font-medium',
            record.type === 'aerobic'
              ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300'
              : 'bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300',
          ].join(' ')}
        >
          {record.type === 'aerobic' ? '有氧' : '无氧'}
        </span>
        <p className="mt-2 text-sm text-slate-700 dark:text-slate-200">
          {record.type === 'aerobic'
            ? `${record.calories} kcal · ${record.durationMinutes} 分钟`
            : record.parts?.join('、')}
        </p>
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onEdit}
          className="text-xs text-slate-500 hover:text-slate-800 dark:hover:text-slate-200"
        >
          编辑
        </button>
        <button
          type="button"
          onClick={onDelete}
          className="text-xs text-red-500 hover:text-red-600"
        >
          删除
        </button>
      </div>
    </div>
  )
}

interface DaySheetProps {
  date: string
  onClose: () => void
  /** 打开时直接进入新增表单，保存/取消后关闭弹层 */
  initialMode?: 'list' | 'add'
}

export function DaySheet({ date, onClose, initialMode = 'list' }: DaySheetProps) {
  const records = useCheckInsByDate(date)
  const [mode, setMode] = useState<'list' | 'add' | 'edit'>(initialMode)
  const [editing, setEditing] = useState<CheckIn | null>(null)
  const quickAdd = initialMode === 'add'

  const handleDelete = async (id: string) => {
    if (!confirm('确定删除这条记录？')) return
    try {
      await deleteCheckIn(id)
      notifyLocalStorageChange()
    } catch {
      alert('删除失败，请重试')
    }
  }

  const finishForm = () => {
    if (quickAdd) {
      onClose()
      return
    }
    setMode('list')
    setEditing(null)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <button
        type="button"
        aria-label="关闭"
        className="absolute inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-md rounded-2xl bg-white p-5 shadow-xl dark:bg-slate-900">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">
              {quickAdd && mode === 'add' ? '新增今日打卡' : formatDisplayDate(date)}
            </h2>
            {!quickAdd && (
              <p className="text-sm text-slate-500">{records.length} 条打卡记录</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-2 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
          >
            ✕
          </button>
        </div>

        {mode === 'list' && (
          <div className="space-y-3">
            {records.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-400">暂无记录，点击下方新增打卡</p>
            ) : (
              records.map((record) => (
                <RecordItem
                  key={record.id}
                  record={record}
                  onEdit={() => {
                    setEditing(record)
                    setMode('edit')
                  }}
                  onDelete={() => handleDelete(record.id)}
                />
              ))
            )}
            <button
              type="button"
              onClick={() => setMode('add')}
              className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white"
            >
              + 新增打卡
            </button>
          </div>
        )}

        {(mode === 'add' || mode === 'edit') && (
          <CheckInForm
            date={date}
            initial={mode === 'edit' ? editing ?? undefined : undefined}
            onDone={finishForm}
            onCancel={finishForm}
          />
        )}
      </div>
    </div>
  )
}
