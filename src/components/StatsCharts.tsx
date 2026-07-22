import { useMemo } from 'react'
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts'
import { getWeekRange, isDateInRange } from '../lib/dates'
import { BODY_PARTS, type CheckIn } from '../types'

interface StatsChartsProps {
  checkIns: CheckIn[]
  year: number
  month: number
}

export function StatsSummary({ checkIns }: { checkIns: CheckIn[] }) {
  const week = getWeekRange()
  const uniqueDays = new Set(checkIns.map((c) => c.date)).size
  const weekCount = checkIns.filter((c) =>
    isDateInRange(c.date, week.start, week.end),
  ).length
  const aerobicCount = checkIns.filter((c) => c.type === 'aerobic').length
  const anaerobicCount = checkIns.filter((c) => c.type === 'anaerobic').length

  return (
    <div className="grid grid-cols-3 gap-2">
      <StatCard label="本月打卡天" value={uniqueDays} unit="天" />
      <StatCard label="本月总次数" value={checkIns.length} unit="次" />
      <StatCard label="本周次数" value={weekCount} unit="次" />
      <StatCard label="有氧" value={aerobicCount} unit="次" accent="emerald" />
      <StatCard label="无氧" value={anaerobicCount} unit="次" accent="blue" />
      <StatCard
        label="有氧占比"
        value={
          checkIns.length > 0
            ? Math.round((aerobicCount / checkIns.length) * 100)
            : 0
        }
        unit="%"
      />
    </div>
  )
}

function StatCard({
  label,
  value,
  unit,
  accent,
}: {
  label: string
  value: number
  unit: string
  accent?: 'emerald' | 'blue'
}) {
  const valueColor =
    accent === 'emerald'
      ? 'text-emerald-600 dark:text-emerald-400'
      : accent === 'blue'
        ? 'text-blue-600 dark:text-blue-400'
        : 'text-slate-900 dark:text-slate-100'

  return (
    <div className="rounded-xl bg-white px-3 py-2 dark:bg-slate-800">
      <p className="text-[11px] text-slate-500">{label}</p>
      <p className={`text-lg font-bold ${valueColor}`}>
        {value}
        <span className="ml-0.5 text-xs font-normal text-slate-400">{unit}</span>
      </p>
    </div>
  )
}

export default function StatsCharts({ checkIns, year, month }: StatsChartsProps) {
  const typeData = useMemo(() => {
    const aerobic = checkIns.filter((c) => c.type === 'aerobic').length
    const anaerobic = checkIns.filter((c) => c.type === 'anaerobic').length
    return [
      { name: '有氧', value: aerobic, color: '#10b981' },
      { name: '无氧', value: anaerobic, color: '#3b82f6' },
    ].filter((d) => d.value > 0)
  }, [checkIns])

  const partsData = useMemo(() => {
    const counts = Object.fromEntries(BODY_PARTS.map((p) => [p, 0])) as Record<string, number>
    for (const record of checkIns) {
      if (record.type === 'anaerobic' && record.parts) {
        for (const part of record.parts) {
          counts[part] += 1
        }
      }
    }
    return BODY_PARTS.map((part) => ({ part, count: counts[part] }))
  }, [checkIns])

  const caloriesTrend = useMemo(() => {
    const lastDay = new Date(year, month, 0).getDate()
    const daily: { day: string; calories: number }[] = []
    for (let d = 1; d <= lastDay; d++) {
      const date = `${year}-${String(month).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      const total = checkIns
        .filter((c) => c.date === date && c.type === 'aerobic')
        .reduce((sum, c) => sum + (c.calories ?? 0), 0)
      if (total > 0) {
        daily.push({ day: `${d}日`, calories: total })
      }
    }
    return daily
  }, [checkIns, year, month])

  const hasData = checkIns.length > 0

  return (
    <div className="space-y-4">
      {!hasData && (
        <p className="rounded-xl bg-slate-50 py-6 text-center text-sm text-slate-400 dark:bg-slate-800/50">
          本月暂无数据，去日历页打卡后再来看统计
        </p>
      )}

      {typeData.length > 0 && (
        <ChartCard title="有氧 vs 无氧">
          <ResponsiveContainer width="100%" height={180}>
            <PieChart>
              <Pie
                data={typeData}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                innerRadius={45}
                outerRadius={70}
                paddingAngle={3}
              >
                {typeData.map((entry) => (
                  <Cell key={entry.name} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
          <div className="flex justify-center gap-4 text-xs text-slate-500">
            {typeData.map((d) => (
              <span key={d.name} className="flex items-center gap-1">
                <span
                  className="inline-block h-2 w-2 rounded-full"
                  style={{ backgroundColor: d.color }}
                />
                {d.name} {d.value}
              </span>
            ))}
          </div>
        </ChartCard>
      )}

      {partsData.some((d) => d.count > 0) && (
        <ChartCard title="无氧部位分布">
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={partsData}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="part" tick={{ fontSize: 12 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12 }} width={28} />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </ChartCard>
      )}

      {caloriesTrend.length > 0 && (
        <ChartCard title="有氧卡路里趋势">
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={caloriesTrend}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} width={36} />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="calories"
                stroke="#10b981"
                strokeWidth={2}
                dot={{ r: 3 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartCard>
      )}
    </div>
  )
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-white p-3 dark:bg-slate-800">
      <h3 className="mb-2 text-sm font-medium text-slate-700 dark:text-slate-200">{title}</h3>
      {children}
    </div>
  )
}
