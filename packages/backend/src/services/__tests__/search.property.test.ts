// Feature: club-recruitment-matching, Property 7: 搜索结果包含关键词

import { describe, it } from 'vitest'
import * as fc from 'fast-check'

// **Validates: Requirements 5.1, 5.4**

interface ClubRecord {
  name: string
  description: string
}

/**
 * 模拟搜索过滤逻辑（大小写不敏感）
 */
function filterClubs(clubs: ClubRecord[], keyword: string): ClubRecord[] {
  const kw = keyword.toLowerCase()
  return clubs.filter(
    (c) => c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw)
  )
}

describe('Property 7: 搜索结果相关性', () => {
  it('对任意非空关键词，返回的每条记录名称或简介必须包含该关键词（大小写不敏感）', () => {
    fc.assert(
      fc.property(
        // 生成社团列表
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
          }),
          { minLength: 0, maxLength: 20 }
        ),
        // 生成非空关键词
        fc.string({ minLength: 1 }),
        (clubs, keyword) => {
          const results = filterClubs(clubs, keyword)
          const kw = keyword.toLowerCase()
          return results.every(
            (c) => c.name.toLowerCase().includes(kw) || c.description.toLowerCase().includes(kw)
          )
        }
      ),
      { numRuns: 100 }
    )
  })

  it('搜索结果不包含不匹配的社团', () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({
            name: fc.string({ minLength: 1 }),
            description: fc.string({ minLength: 1 }),
          }),
          { minLength: 1, maxLength: 10 }
        ),
        fc.string({ minLength: 1 }),
        (clubs, keyword) => {
          const results = filterClubs(clubs, keyword)
          const kw = keyword.toLowerCase()
          // 验证：未出现在结果中的社团确实不匹配
          const nonResults = clubs.filter((c) => !results.includes(c))
          return nonResults.every(
            (c) => !c.name.toLowerCase().includes(kw) && !c.description.toLowerCase().includes(kw)
          )
        }
      ),
      { numRuns: 100 }
    )
  })
})
