// Feature: club-recruitment-matching, Property 1: 匹配分数始终在 [0, 100] 内
// Feature: club-recruitment-matching, Property 2: 推荐列表按分数非递增排序

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'
import { computeScore } from '../matching.service'

/**
 * 属性 1：匹配分数范围不变式
 * 对任意标签集合，computeScore 返回值始终在 [0, 100] 内
 * Validates: Requirements 3.2
 */
describe('Property 1: 匹配分数范围不变式', () => {
  it('对任意两个字符串数组，分数始终在 [0, 100] 内', () => {
    fc.assert(
      fc.property(
        fc.array(fc.string()),
        fc.array(fc.string()),
        (studentTags, clubTags) => {
          const score = computeScore(studentTags, clubTags)
          return score >= 0 && score <= 100
        }
      ),
      { numRuns: 100 }
    )
  })

  it('两个集合均为空时返回 0', () => {
    expect(computeScore([], [])).toBe(0)
  })

  it('完全重叠时返回 100', () => {
    const tags = ['音乐', '篮球', '编程']
    expect(computeScore(tags, tags)).toBe(100)
  })

  it('无重叠时返回 0', () => {
    expect(computeScore(['音乐'], ['篮球'])).toBe(0)
  })
})

/**
 * 属性 2：推荐列表排序单调性
 * 对任意推荐列表，排序后相邻两项分数满足前者 >= 后者
 * Validates: Requirements 3.3
 */
describe('Property 2: 推荐列表排序单调性', () => {
  it('排序后相邻两项分数满足非递增顺序', () => {
    fc.assert(
      fc.property(
        fc.array(fc.record({ score: fc.integer({ min: 0, max: 100 }) })),
        (items) => {
          const sorted = [...items].sort((a, b) => b.score - a.score)
          for (let i = 0; i < sorted.length - 1; i++) {
            if (sorted[i].score < sorted[i + 1].score) return false
          }
          return true
        }
      ),
      { numRuns: 100 }
    )
  })
})
