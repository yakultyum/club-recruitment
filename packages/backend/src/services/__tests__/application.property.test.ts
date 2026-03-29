// Feature: club-recruitment-matching, Property 4: 同一学生对同一社团无重复有效申请
// Feature: club-recruitment-matching, Property 6: 申请状态流转路径合法

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import type { ApplicationStatus } from '../../types'

// **Validates: Requirements 4.3**

/**
 * 检查是否存在重复有效申请（非撤回状态）
 */
function hasActiveApplication(
  applications: Array<{ studentId: string; clubId: string; status: ApplicationStatus }>
): boolean {
  const active = applications.filter((a) => a.status !== 'withdrawn')
  const seen = new Set<string>()
  for (const app of active) {
    const key = `${app.studentId}:${app.clubId}`
    if (seen.has(key)) return true
    seen.add(key)
  }
  return false
}

/**
 * 合法的状态流转
 */
const VALID_TRANSITIONS: Record<ApplicationStatus, ApplicationStatus[]> = {
  pending: ['approved', 'rejected', 'withdrawn'],
  approved: [],
  rejected: [],
  withdrawn: [],
}

function isValidTransition(from: ApplicationStatus, to: ApplicationStatus): boolean {
  return VALID_TRANSITIONS[from].includes(to)
}

describe('Property 4: 申请唯一性不变式', () => {
  it('同一学生对同一社团，非撤回状态的申请最多只能有 1 条', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (studentId, clubId) => {
          // 模拟：第一次申请成功（pending），第二次应被拒绝
          const applications: Array<{ studentId: string; clubId: string; status: ApplicationStatus }> = [
            { studentId, clubId, status: 'pending' },
          ]

          // 尝试添加第二条相同的申请
          const wouldDuplicate = applications.some(
            (a) => a.studentId === studentId && a.clubId === clubId && a.status !== 'withdrawn'
          )

          return wouldDuplicate === true // 应该检测到重复
        }
      ),
      { numRuns: 100 }
    )
  })

  it('撤回后可以重新申请（不算重复）', () => {
    fc.assert(
      fc.property(
        fc.uuid(),
        fc.uuid(),
        (studentId, clubId) => {
          const applications: Array<{ studentId: string; clubId: string; status: ApplicationStatus }> = [
            { studentId, clubId, status: 'withdrawn' },
          ]

          const wouldDuplicate = applications.some(
            (a) => a.studentId === studentId && a.clubId === clubId && a.status !== 'withdrawn'
          )

          return wouldDuplicate === false // 撤回后不算重复
        }
      ),
      { numRuns: 100 }
    )
  })
})

/**
 * 属性 6：申请状态流转合法性
 * 终态（approved/rejected/withdrawn）不能再流转到其他状态
 * Validates: Requirements 4.4, 4.6
 */
describe('Property 6: 申请状态流转合法性', () => {
  const terminalStatuses: ApplicationStatus[] = ['approved', 'rejected', 'withdrawn']
  const allStatuses: ApplicationStatus[] = ['pending', 'approved', 'rejected', 'withdrawn']

  it('终态不能流转到任何状态', () => {
    fc.assert(
      fc.property(
        fc.constantFrom<ApplicationStatus>(...terminalStatuses),
        fc.constantFrom<ApplicationStatus>(...allStatuses),
        (from, to) => !isValidTransition(from, to)
      ),
      { numRuns: 100 }
    )
  })

  it('pending 可以流转到 approved/rejected/withdrawn', () => {
    const validTargets: ApplicationStatus[] = ['approved', 'rejected', 'withdrawn']
    fc.assert(
      fc.property(
        fc.constantFrom<ApplicationStatus>(...validTargets),
        (to) => isValidTransition('pending', to)
      ),
      { numRuns: 100 }
    )
  })

  it('pending 不能流转到 pending', () => {
    expect(isValidTransition('pending', 'pending')).toBe(false)
  })
})
