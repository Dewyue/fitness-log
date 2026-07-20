import { useEffect, useState } from 'react'
import { subscribeCheckIns } from '../db'
import type { CheckIn } from '../types'

const monthCache = new Map<string, CheckIn[]>()

function monthKey(year: number, month: number) {
  return `${year}-${String(month).padStart(2, '0')}`
}

export function useCheckInsByMonth(year: number, month: number) {
  const key = monthKey(year, month)
  const [checkIns, setCheckIns] = useState<CheckIn[]>(() => monthCache.get(key) ?? [])
  const [loading, setLoading] = useState(!monthCache.has(key))

  useEffect(() => {
    const cached = monthCache.get(key)
    if (cached) {
      setCheckIns(cached)
      setLoading(false)
    }

    let subscription: { unsubscribe: () => void } | undefined
    let cancelled = false

    const lastDay = new Date(year, month, 0).getDate()
    const start = `${key}-01`
    const end = `${key}-${String(lastDay).padStart(2, '0')}`

    subscribeCheckIns(
      (data) => {
        if (cancelled) return
        monthCache.set(key, data)
        setCheckIns(data)
        setLoading(false)
      },
      { start, end },
    ).then((sub) => {
      if (cancelled) {
        sub.unsubscribe()
        return
      }
      subscription = sub
    })

    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  }, [key, year, month])

  return { checkIns, loading }
}

export function useCheckInsByDate(date: string | null) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])

  useEffect(() => {
    if (!date) {
      setCheckIns([])
      return
    }

    let subscription: { unsubscribe: () => void } | undefined
    let cancelled = false

    subscribeCheckIns((data) => {
      if (!cancelled) setCheckIns(data)
    }, { date }).then((sub) => {
      if (cancelled) {
        sub.unsubscribe()
        return
      }
      subscription = sub
    })

    return () => {
      cancelled = true
      subscription?.unsubscribe()
    }
  }, [date])

  return checkIns
}

export function groupByDate(checkIns: CheckIn[]): Map<string, CheckIn[]> {
  const map = new Map<string, CheckIn[]>()
  for (const item of checkIns) {
    const list = map.get(item.date) ?? []
    list.push(item)
    map.set(item.date, list)
  }
  return map
}
