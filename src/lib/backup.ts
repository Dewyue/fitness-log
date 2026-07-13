import { bulkUpsertCheckIns, clearAllCheckIns, getAllCheckIns, notifyLocalStorageChange } from '../db'
import type { BackupData, CheckIn } from '../types'

export async function exportBackup(): Promise<BackupData> {
  const checkIns = await getAllCheckIns()
  return {
    version: 1,
    exportedAt: new Date().toISOString(),
    checkIns,
  }
}

export function downloadBackup(data: BackupData) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const anchor = document.createElement('a')
  const date = new Date().toISOString().slice(0, 10)
  anchor.href = url
  anchor.download = `fitness-log-backup-${date}.json`
  anchor.click()
  URL.revokeObjectURL(url)
}

function isValidCheckIn(item: unknown): item is CheckIn {
  if (!item || typeof item !== 'object') return false
  const record = item as Record<string, unknown>
  if (typeof record.id !== 'string' || typeof record.date !== 'string') return false
  if (record.type !== 'aerobic' && record.type !== 'anaerobic') return false
  if (typeof record.createdAt !== 'number') return false
  return true
}

function parseBackupRecords(parsed: BackupData | CheckIn[]): CheckIn[] {
  let records: CheckIn[]
  if (Array.isArray(parsed)) {
    records = parsed
  } else if (parsed && Array.isArray(parsed.checkIns)) {
    records = parsed.checkIns
  } else {
    throw new Error('无效的备份格式')
  }

  const valid = records.filter(isValidCheckIn)
  if (valid.length === 0) {
    throw new Error('备份中没有有效记录')
  }
  return valid
}

export async function importBackupFromText(text: string, mode: 'merge' | 'replace' = 'merge') {
  const parsed = JSON.parse(text) as BackupData | CheckIn[]
  const valid = parseBackupRecords(parsed)

  if (mode === 'replace') {
    await clearAllCheckIns()
  }

  await bulkUpsertCheckIns(valid)
  notifyLocalStorageChange()
  return valid.length
}

export async function importBackup(file: File, mode: 'merge' | 'replace' = 'merge') {
  const text = await file.text()
  return importBackupFromText(text, mode)
}

export async function copyBackupToClipboard(): Promise<number> {
  const data = await exportBackup()
  const text = JSON.stringify(data)
  await navigator.clipboard.writeText(text)
  return data.checkIns.length
}
