// Feature: club-recruitment-matching, Property: 社团名称长度验证

import { describe, it, expect } from 'vitest'
import * as fc from 'fast-check'

// **Validates: Requirements 2.2**

/**
 * 社团名称验证纯函数
 * 名称长度必须在 2 到 50 个字符之间
 */
function validateClubName(name: string): boolean {
  return name.length >= 2 && name.length <= 50
}

describe('Property: 社团名称长度验证', () => {
  it('长度 < 2 的名称应验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ maxLength: 1 }),
        (name) => !validateClubName(name)
      ),
      { numRuns: 100 }
    )
  })

  it('长度 > 50 的名称应验证失败', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 51 }),
        (name) => !validateClubName(name)
      ),
      { numRuns: 100 }
    )
  })

  it('长度在 2-50 之间的名称应验证通过', () => {
    fc.assert(
      fc.property(
        fc.string({ minLength: 2, maxLength: 50 }),
        (name) => validateClubName(name)
      ),
      { numRuns: 100 }
    )
  })

  it('边界值：长度恰好为 2 的名称应验证通过', () => {
    expect(validateClubName('ab')).toBe(true)
  })

  it('边界值：长度恰好为 50 的名称应验证通过', () => {
    expect(validateClubName('a'.repeat(50))).toBe(true)
  })

  it('边界值：长度为 1 的名称应验证失败', () => {
    expect(validateClubName('a')).toBe(false)
  })

  it('边界值：长度为 51 的名称应验证失败', () => {
    expect(validateClubName('a'.repeat(51))).toBe(false)
  })
})
