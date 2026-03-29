import { describe, it, expect } from 'vitest'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { verifyToken } from '../auth.service'
import type { AuthPayload } from '../../types/index'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'

describe('verifyToken', () => {
  it('应正确验证有效 token 并返回 payload', () => {
    const payload: AuthPayload = {
      userId: 'user-123',
      email: 'test@example.com',
      role: 'student',
    }
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '1h' })

    const result = verifyToken(token)

    expect(result.userId).toBe(payload.userId)
    expect(result.email).toBe(payload.email)
    expect(result.role).toBe(payload.role)
  })

  it('应对过期 token 抛出错误', () => {
    const payload: AuthPayload = {
      userId: 'user-456',
      email: 'expired@example.com',
      role: 'club_admin',
    }
    // expiresIn: 0 会立即过期
    const token = jwt.sign(payload, JWT_SECRET, { expiresIn: 0 })

    expect(() => verifyToken(token)).toThrow()
  })

  it('应对无效 token 抛出错误', () => {
    expect(() => verifyToken('invalid.token.string')).toThrow()
  })

  it('应对使用错误密钥签名的 token 抛出错误', () => {
    const payload: AuthPayload = {
      userId: 'user-789',
      email: 'wrong@example.com',
      role: 'student',
    }
    const token = jwt.sign(payload, 'wrong-secret', { expiresIn: '1h' })

    expect(() => verifyToken(token)).toThrow()
  })
})

describe('密码哈希与验证', () => {
  it('bcrypt 哈希后，正确密码 compare 应返回 true', async () => {
    const password = 'MySecurePassword123!'
    const hash = await bcrypt.hash(password, 10)

    const result = await bcrypt.compare(password, hash)

    expect(result).toBe(true)
  })

  it('bcrypt 哈希后，错误密码 compare 应返回 false', async () => {
    const password = 'MySecurePassword123!'
    const hash = await bcrypt.hash(password, 10)

    const result = await bcrypt.compare('WrongPassword!', hash)

    expect(result).toBe(false)
  })
})
