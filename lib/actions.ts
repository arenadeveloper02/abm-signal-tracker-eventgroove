'use server'

import { prisma } from '@/lib/prisma'

export async function recordActivityEvent(
  email: string,
  eventType: string,
  detail?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await prisma.activityEvent.create({
      data: {
        email: email || 'unknown',
        eventType,
        detail: detail ?? null,
      },
    })
    return { success: true }
  } catch {
    return { success: false, error: 'Failed to record activity event' }
  }
}
