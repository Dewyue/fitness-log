import { useRef, useState } from 'react'
import { clearAllCheckIns, notifyLocalStorageChange } from '../db'
import { clearAppCacheAndReload } from '../lib/cache'
import {
  copyBackupToClipboard,
  downloadBackup,
  exportBackup,
  importBackup,
  importBackupFromText,
} from '../lib/backup'

export default function SettingsPage() {
  const fileRef = useRef<HTMLInputElement>(null)
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const [pasteText, setPasteText] = useState('')

  const showMessage = (text: string) => {
    setMessage(text)
    setTimeout(() => setMessage(''), 3000)
  }

  const handleExport = async () => {
    setBusy(true)
    try {
      const data = await exportBackup()
      downloadBackup(data)
      showMessage(`已导出 ${data.checkIns.length} 条记录`)
    } finally {
      setBusy(false)
    }
  }

  const handleCopy = async () => {
    setBusy(true)
    try {
      const count = await copyBackupToClipboard()
      showMessage(`已复制 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '复制失败')
    } finally {
      setBusy(false)
    }
  }

  const handlePasteImport = async () => {
    if (!pasteText.trim()) {
      showMessage('请先粘贴备份数据')
      return
    }
    setBusy(true)
    try {
      const count = await importBackupFromText(pasteText, 'merge')
      setPasteText('')
      showMessage(`已导入 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '导入失败')
    } finally {
      setBusy(false)
    }
  }

  const handleImport = async (file: File | undefined) => {
    if (!file) return
    setBusy(true)
    try {
      const count = await importBackup(file, 'merge')
      showMessage(`已导入 ${count} 条记录`)
    } catch (err) {
      showMessage(err instanceof Error ? err.message : '导入失败')
    } finally {
      setBusy(false)
      if (fileRef.current) fileRef.current.value = ''
    }
  }

  const handleClear = async () => {
    if (!confirm('确定清空所有打卡数据？此操作不可恢复。')) return
    await clearAllCheckIns()
    notifyLocalStorageChange()
    showMessage('已清空所有数据')
  }

  return (
    <div className="space-y-5">
      <h1 className="text-lg font-bold">数据管理</h1>

      {message && (
        <div className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300">
          {message}
        </div>
      )}

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <h2 className="font-medium">备份与同步</h2>
        <button
          type="button"
          onClick={handleExport}
          disabled={busy}
          className="w-full rounded-xl bg-emerald-500 py-3 text-sm font-medium text-white disabled:opacity-50"
        >
          导出 JSON 文件
        </button>
        <button
          type="button"
          onClick={handleCopy}
          disabled={busy}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600 disabled:opacity-50"
        >
          复制全部数据
        </button>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => handleImport(e.target.files?.[0])}
        />
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={busy}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600 disabled:opacity-50"
        >
          导入 JSON 文件
        </button>

        <textarea
          value={pasteText}
          onChange={(e) => setPasteText(e.target.value)}
          placeholder="粘贴备份数据后点下方导入…"
          rows={3}
          className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs outline-none focus:border-emerald-500 dark:border-slate-600 dark:bg-slate-900"
        />
        <button
          type="button"
          onClick={handlePasteImport}
          disabled={busy || !pasteText.trim()}
          className="w-full rounded-xl border border-emerald-300 py-3 text-sm font-medium text-emerald-700 disabled:opacity-50 dark:border-emerald-800 dark:text-emerald-300"
        >
          从文本导入
        </button>
      </section>

      <section className="space-y-3 rounded-xl border border-slate-200 bg-white p-4 dark:border-slate-700 dark:bg-slate-800">
        <button
          type="button"
          onClick={() => clearAppCacheAndReload()}
          className="w-full rounded-xl border border-slate-200 py-3 text-sm font-medium dark:border-slate-600"
        >
          清除缓存并刷新
        </button>
        <button
          type="button"
          onClick={handleClear}
          className="w-full rounded-xl border border-red-300 py-3 text-sm font-medium text-red-600 dark:border-red-800"
        >
          清空所有数据
        </button>
      </section>
    </div>
  )
}
