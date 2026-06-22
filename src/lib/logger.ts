import { prisma } from './prisma'

export interface LogData {
  userId: string
  action: string
  module: string
  targetId?: string | null
  targetName?: string | null
  detail?: any
  ipAddress?: string | null
  userAgent?: string | null
}

export async function logActivity(data: LogData) {
  try {
    await prisma.activityLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        module: data.module,
        targetId: data.targetId,
        targetName: data.targetName,
        detail: data.detail ? JSON.stringify(data.detail) : undefined, // ← ubah null → undefined
        ipAddress: data.ipAddress,
        userAgent: data.userAgent,
      },
    })
  } catch (error) {
    console.error('Failed to log activity:', error)
  }
}