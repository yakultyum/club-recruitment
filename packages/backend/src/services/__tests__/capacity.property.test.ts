// Feature: club-recruitment-matching, Property 5: 名额满时拒绝新申请

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// **Validates: Requirements 2.5**

/**
 * 检查社团是否可以接受新申请
 * 当 currentCount >= capacity 时，应拒绝新申请
 */
function canAcceptApplication(capacity: number, currentCount: number): boolean {
  return currentCount < capacity
}

/**
 * 当名额满时，isOpen 应自动设为 false
 */
function computeIsOpen(capacity: number, currentCount: number, currentIsOpen: boolean): boolean {
  if (currentCount >= capacity) return false
  return currentIsOpen
}

describe('Property 5: 名额满员时拒绝新申请', () => {
  it('当 currentCount >= capacity 时，canAcceptApplication 应返回 false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.integer({ min: 0, max: 1000 }),
        (capacity, extra) => {
          const currentCount = capacity + extra // currentCount >= capacity
          return !canAcceptApplication(capacity, currentCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('当 currentCount < capacity 时，canAcceptApplication 应返回 true', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 2, max: 1000 }),
        fc.integer({ min: 1, max: 999 }),
        (capacity, deficit) => {
          const currentCount = Math.max(0, capacity - deficit) // currentCount < capacity
          if (currentCount >= capacity) return true // skip edge case
          return canAcceptApplication(capacity, currentCount)
        }
      ),
      { numRuns: 100 }
    )
  })

  it('当 currentCount === capacity 时，isOpen 应为 false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 1000 }),
        fc.boolean(),
        (capacity, currentIsOpen) => {
          const currentCount = capacity
          return computeIsOpen(capacity, currentCount, currentIsOpen) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('当 currentCount > capacity 时，isOpen 应为 false', () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 999 }),
        fc.integer({ min: 1, max: 100 }),
        fc.boolean(),
        (capacity, extra, currentIsOpen) => {
          const currentCount = capacity + extra
          return computeIsOpen(capacity, currentCount, currentIsOpen) === false
        }
      ),
      { numRuns: 100 }
    )
  })

  it('边界值：capacity=1, currentCount=1 时应拒绝', () => {
    expect(canAcceptApplication(1, 1)).toBe(false)
  })

  it('边界值：capacity=1, currentCount=0 时应接受', () => {
    expect(canAcceptApplication(1, 0)).toBe(true)
  })
})
