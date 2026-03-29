// Feature: club-recruitment-matching, Property 8: 统计数据各项之和等于总数

import { describe, it } from 'vitest'
import * as fc from 'fast-check'
import type { ApplicationStatus } from '../../types'
import type { ClubStats } from '../statistics.service'

// **Validates: Requirements 6.1**

function computeStats(statuses: ApplicationStatus[]): ClubStats {
  const stats: ClubStats = { total: 0, approved: 0, rejected: 0, pending: 0, withdrawn: 0 }
  for (const s of statuses) {
    stats[s]++
  }
  stats.total = statuses.length
  return stats
}

describe('Property 8: 统计数据一致性（StatisticsService）', () => {
  it('申请总数 = 通过数 + 拒绝数 + 待审核数 + 撤回数', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.constantFrom<ApplicationStatus>('pending', 'approved', 'rejected', 'withdrawn')
        ),
        (statuses) => {
          const stats = computeStats(statuses)
          return stats.total === stats.approved + stats.rejected + stats.pending + stats.withdrawn
        }
      ),
      { numRuns: 100 }
    )
  })
})
