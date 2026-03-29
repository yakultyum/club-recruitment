// Feature: club-recruitment-matching, Property 8: 统计数据各项之和等于总数

import { describe, it } from 'vitest'
import * as fc from 'fast-check'

// **Validates: Requirements 6.1**

type ApplicationStatus = 'pending' | 'approved' | 'rejected' | 'withdrawn'

interface ClubStats {
  total: number
  approved: number
  rejected: number
  pending: number
  withdrawn: number
}

/**
 * 根据申请状态列表计算统计数据
 */
function computeStats(statuses: ApplicationStatus[]): ClubStats {
  const stats: ClubStats = { total: 0, approved: 0, rejected: 0, pending: 0, withdrawn: 0 }
  for (const status of statuses) {
    stats[status]++
  }
  stats.total = statuses.length
  return stats
}

describe('Property 8: 统计数据一致性', () => {
  it('申请总数 = 通过数 + 拒绝数 + 待审核数 + 撤回数', () => {
    const statusArb = fc.array(
      fc.constantFrom<ApplicationStatus>('pending', 'approved', 'rejected', 'withdrawn')
    )

    fc.assert(
      fc.property(statusArb, (statuses) => {
        const stats = computeStats(statuses)
        return stats.total === stats.approved + stats.rejected + stats.pending + stats.withdrawn
      }),
      { numRuns: 100 }
    )
  })
})
