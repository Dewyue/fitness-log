import { useEffect, useState } from 'react'
import { subscribeCheckIns } from '../db'
import type { CheckIn } from '../types'

export function useCheckInsByMonth(year: number, month: number) {
  const [checkIns, setCheckIns] = useState<CheckIn[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const lastDay = new Date(year, month, 0).getDate()
    const start = `${year}-${String(month).padStart(2, '0')}-01`
    const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

    let subscription: { unsubscribe: () => void } | undefined

    subscribeCheckIns(
      (data) => {
        setCheckIns(data)
        setLoading(false)
      },
      { start, end },
    ).then((sub) => {
      subscription = sub
    })

    return () => subscription?.unsubscribe()
  }, [year, month])

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

    subscribeCheckIns(setCheckIns, { date }).then((sub) => {
      subscription = sub
    })

    return () => subscription?.unsubscribe()
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
