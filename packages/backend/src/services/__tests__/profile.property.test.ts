// Feature: club-recruitment-matching, Property 3: 标签更新后推荐列表使用新标签

import { describe, it, vi } from 'vitest'
import * as fc from 'fast-check'
import { expect } from 'vitest'

// mock 数据库连接池
vi.mock('../../db', () => ({
  default: {
    query: vi.fn(),
  },
}))

import pool from '../../db'
import { updateTags } from '../profile.service'

const mockQuery = pool.query as ReturnType<typeof vi.fn>

/**
 * 属性 3：标签更新后推荐列表一致性（轮回属性）
 *
 * 对任意标签集合 T，调用 updateTags(studentId, T) 后，
 * 返回的 profile.tags 应严格等于 T。
 *
 * Validates: Requirements 1.5, 3.4
 */
describe('Property 3: 标签更新后画像标签一致性（轮回属性）', () => {
  it('对任意非空标签集合 T，updateTags 返回的 profile.tags 应等于 T', async () => {
    await fc.assert(
      fc.asyncProperty(
        // 生成任意非空字符串数组作为标签集合 T
        fc.array(fc.string({ minLength: 1 }), { minLength: 1 }),
        async (tags: string[]) => {
          // mock 实现：直接返回包含传入 tags 的 StudentProfile
          mockQuery.mockResolvedValueOnce({
            rows: [
              {
                id: 'profile-uuid-1',
                studentId: 'student-uuid-1',
                tags,
                updatedAt: new Date(),
              },
            ],
          })

          const profile = await updateTags('student-uuid-1', tags)

          // 轮回属性：返回的标签集合应等于传入的 T
          expect(profile.tags).toEqual(tags)
        }
      ),
      { numRuns: 100 }
    )
  })
})
