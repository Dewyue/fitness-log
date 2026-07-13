export type WorkoutType = 'aerobic' | 'anaerobic'

export type BodyPart = '肩' | '背' | '臀' | '腿' | '腹' | '手臂'

export const BODY_PARTS: BodyPart[] = ['肩', '背', '臀', '腿', '腹', '手臂']

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
