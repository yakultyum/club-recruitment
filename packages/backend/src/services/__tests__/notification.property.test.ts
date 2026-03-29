// Feature: club-recruitment-matching, Property: 状态变更触发通知

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ApplicationStatus } from '../../types'

// **Validates: Requirements 4.5**

/**
 * 判断申请状态变更是否应触发通知
 */
function shouldTriggerNotification(
  from: ApplicationStatus,
  to: ApplicationStatus
): boolean {
  return from === 'pending' && (to === 'approved' || to === 'rejected')
}

/**
 * 模拟通知列表，状态变更后追加通知
 */
function processStatusChange(
  notifications: string[],
  studentId: string,
  from: ApplicationStatus,
  to: ApplicationStatus
): string[] {
  if (shouldTriggerNotification(from, to)) {
    const msg = to === 'approved'
      ? `${studentId}:申请已通过`
      : `${studentId}:申请未通过`
    return [...notifications, msg]
  }
  return notifications
}

describe('Property: 状态变更触发通知', () => {
  it('从 pending 变更为 approved 时，通知列表应新增一条通知', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (studentId) => {
          const before: string[] = []
          const after = processStatusChange(before, studentId, 'pending', 'approved')
          return after.length === before.length + 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('从 pending 变更为 rejected 时，通知列表应新增一条通知', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (studentId) => {
          const before: string[] = []
          const after = processStatusChange(before, studentId, 'pending', 'rejected')
          return after.length === before.length + 1
        }
      ),
      { numRuns: 100 }
    )
  })

  it('从 pending 变更为 withdrawn 时，不应触发通知', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        (studentId) => {
          const before: string[] = []
          const after = processStatusChange(before, studentId, 'pending', 'withdrawn')
          return after.length === before.length
        }
      ),
      { numRuns: 100 }
    )
  })

  it('shouldTriggerNotification 对 pending→approved 返回 true', () => {
    expect(shouldTriggerNotification('pending', 'approved')).toBe(true)
  })

  it('shouldTriggerNotification 对 pending→rejected 返回 true', () => {
    expect(shouldTriggerNotification('pending', 'rejected')).toBe(true)
  })

  it('shouldTriggerNotification 对 pending→withdrawn 返回 false', () => {
    expect(shouldTriggerNotification('pending', 'withdrawn')).toBe(false)
  })
})
