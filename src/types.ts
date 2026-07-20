export type WorkoutType = 'aerobic' | 'anaerobic'

export type BodyPart = '肩' | '背' | '臀' | '腿' | '腹' | '手臂'

export const BODY_PARTS: BodyPart[] = ['肩', '背', '臀', '腿', '腹', '手臂']

export const PART_COLORS: Record<BodyPart, string> = {
  肩: 'text-violet-600 dark:text-violet-400',
  背: 'text-blue-600 dark:text-blue-400',
  臀: 'text-pink-600 dark:text-pink-400',
  腿: 'text-amber-600 dark:text-amber-400',
  腹: 'text-orange-600 dark:text-orange-400',
  手臂: 'text-cyan-600 dark:text-cyan-400',
}

export interface CheckIn {
  id: string
  date: string
  type: WorkoutType
  calories?: number
  durationMinutes?: number
  parts?: BodyPart[]
  createdAt: number
}

export interface BackupData {
  version: 1
  exportedAt: string
  checkIns: CheckIn[]
}
