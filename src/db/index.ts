import Dexie, { liveQuery, type Table } from 'dexie'
import type { CheckIn } from '../types'
import { createId } from '../lib/id'

const LS_KEY = 'fitness-log-checkins'

export type StorageBackend = 'indexeddb' | 'localstorage'

export class FitnessDB extends Dexie {
  checkIns!: Table<CheckIn, string>

  constructor() {
    super('fitness-log')
    this.version(1).stores({
      checkIns: 'id, date, type, createdAt',
    })
  }
}

export const db = new FitnessDB()

let backend: StorageBackend = 'indexeddb'
let storageReady = false
let storageError: string | null = null

function readLocalStorage(): CheckIn[] {
  try {
    const raw = localStorage.getItem(LS_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as CheckIn[]
    return Array.isArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

function writeLocalStorage(records: CheckIn[]) {
  localStorage.setItem(LS_KEY, JSON.stringify(records))
}

function sortByDateAndCreated(records: CheckIn[]) {
  return [...records].sort((a, b) => {
    if (a.date !== b.date) return a.date.localeCompare(b.date)
    return a.createdAt - b.createdAt
  })
}

export function getStorageBackend() {
  return backend
}

export function getStorageError() {
  return storageError
}

export async function initStorage(): Promise<StorageBackend> {
  if (storageReady) return backend

  try {
    await db.open()
    backend = 'indexeddb'
    storageError = null
    storageReady = true
    return backend
  } catch (err) {
    const message = err instanceof Error ? err.message : 'IndexedDB 不可用'
    console.warn('IndexedDB failed, falling back to localStorage:', message)

    try {
      localStorage.setItem('__fitness_log_test__', '1')
      localStorage.removeItem('__fitness_log_test__')
      backend = 'localstorage'
      storageError = `IndexedDB 不可用，已切换为 localStorage（${message}）`
      storageReady = true
      return backend
    } catch {
      storageError = '浏览器存储不可用，请退出无痕模式或换用系统浏览器打开'
      storageReady = true
      throw new Error(storageError)
    }
  }
}

async function withLocalStorage<T>(fn: (records: CheckIn[]) => { records: CheckIn[]; result: T }) {
  const records = readLocalStorage()
  const { records: next, result } = fn(records)
  writeLocalStorage(next)
  return result
}

export async function getCheckInsByMonth(year: number, month: number) {
  await initStorage()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const lastDay = new Date(year, month, 0).getDate()
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  if (backend === 'indexeddb') {
    return db.checkIns.where('date').between(start, end, true, true).toArray()
  }

  return readLocalStorage().filter((r) => r.date >= start && r.date <= end)
}

export async function getCheckInsByDate(date: string) {
  await initStorage()

  if (backend === 'indexeddb') {
    return db.checkIns.where('date').equals(date).sortBy('createdAt')
  }

  return readLocalStorage()
    .filter((r) => r.date === date)
    .sort((a, b) => a.createdAt - b.createdAt)
}

export async function getAllCheckIns() {
  await initStorage()

  if (backend === 'indexeddb') {
    return db.checkIns.orderBy('date').toArray()
  }

  return sortByDateAndCreated(readLocalStorage())
}

export async function addCheckIn(
  data: Omit<CheckIn, 'id' | 'createdAt'>,
): Promise<CheckIn> {
  await initStorage()

  const record: CheckIn = {
    ...data,
    id: createId(),
    createdAt: Date.now(),
  }

  if (backend === 'indexeddb') {
    await db.checkIns.add(record)
    return record
  }

  await withLocalStorage((records) => ({
    records: [...records, record],
    result: record,
  }))
  return record
}

export async function updateCheckIn(id: string, data: Partial<CheckIn>) {
  await initStorage()

  if (backend === 'indexeddb') {
    await db.checkIns.update(id, data)
    return
  }

  await withLocalStorage((records) => ({
    records: records.map((r) => (r.id === id ? { ...r, ...data } : r)),
    result: undefined,
  }))
}

export async function deleteCheckIn(id: string) {
  await initStorage()

  if (backend === 'indexeddb') {
    await db.checkIns.delete(id)
    return
  }

  await withLocalStorage((records) => ({
    records: records.filter((r) => r.id !== id),
    result: undefined,
  }))
}

export async function clearAllCheckIns() {
  await initStorage()

  if (backend === 'indexeddb') {
    await db.checkIns.clear()
    return
  }

  writeLocalStorage([])
}

export async function bulkUpsertCheckIns(records: CheckIn[]) {
  await initStorage()

  if (backend === 'indexeddb') {
    await db.checkIns.bulkPut(records)
    return
  }

  const map = new Map(readLocalStorage().map((r) => [r.id, r]))
  for (const record of records) {
    map.set(record.id, record)
  }
  writeLocalStorage(sortByDateAndCreated([...map.values()]))
}

export async function subscribeCheckIns(
  onChange: (records: CheckIn[]) => void,
  filter?: { start: string; end: string } | { date: string },
) {
  await initStorage()

  if (backend === 'indexeddb') {
    const query =
      filter && 'date' in filter
        ? () => db.checkIns.where('date').equals(filter.date).sortBy('createdAt')
        : filter && 'start' in filter
          ? () =>
              db.checkIns
                .where('date')
                .between(filter.start, filter.end, true, true)
                .toArray()
          : () => db.checkIns.toArray()

    return liveQuery(query).subscribe({
      next: onChange,
      error: (err) => console.error('liveQuery error:', err),
    })
  }

  const notify = () => {
    const all = readLocalStorage()
    if (!filter) {
      onChange(all)
      return
    }
    if ('date' in filter) {
      onChange(all.filter((r) => r.date === filter.date).sort((a, b) => a.createdAt - b.createdAt))
      return
    }
    onChange(all.filter((r) => r.date >= filter.start && r.date <= filter.end))
  }

  notify()
  const onStorage = (e: StorageEvent) => {
    if (e.key === LS_KEY) notify()
  }
  const onCustom = () => notify()
  window.addEventListener('storage', onStorage)
  window.addEventListener('fitness-log-changed', onCustom)

  return {
    unsubscribe: () => {
      window.removeEventListener('storage', onStorage)
      window.removeEventListener('fitness-log-changed', onCustom)
    },
  }
}

export function notifyLocalStorageChange() {
  if (backend === 'localstorage') {
    window.dispatchEvent(new CustomEvent('fitness-log-changed'))
  }
}
