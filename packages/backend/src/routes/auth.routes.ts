import { Router } from 'express'
import type { Request, Response } from 'express'
import { register, login } from '../services/auth.service'

const router = Router()

router.post('/register', async (req: Request, res: Response) => {
  const { email, password, role } = req.body

  if (!email || !password || !role) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: '缺少必填字段：email、password、role' } })
    return
  }

  if (role !== 'student' && role !== 'club_admin') {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'role 必须为 student 或 club_admin' } })
    return
  }

  try {
    const user = await register(email, password, role)
    res.status(201).json({ user })
  } catch (err: unknown) {
    const e = err as Error & { code?: string }
    if (e.code === 'EMAIL_DUPLICATE') {
      res.status(409).json({ error: { code: 'EMAIL_DUPLICATE', message: '该邮箱已被注册' } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

router.post('/login', async (req: Request, res: Response) => {
  const { email, password } = req.body

  if (!email || !password) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: '缺少必填字段：email、password' } })
    return
  }

  try {
    const result = await login(email, password)
    res.status(200).json(result)
  } catch (err: unknown) {
    const e = err as Error & { code?: string }
    if (e.code === 'INVALID_CREDENTIALS') {
      res.status(401).json({ error: { code: 'INVALID_CREDENTIALS', message: '邮箱或密码错误' } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

// POST /api/auth/demo — Demo 模式，自动创建并登录预设账号
router.post('/demo', async (req: Request, res: Response) => {
  const role: 'student' | 'club_admin' = req.body.role === 'club_admin' ? 'club_admin' : 'student'
  const email = role === 'student' ? 'demo-student@example.com' : 'demo-admin@example.com'
  const password = 'demo123456'

  try {
    try {
      const result = await login(email, password)
      res.status(200).json(result)
    } catch {
      await register(email, password, role)
      const result = await login(email, password)
      res.status(200).json(result)
    }
  } catch (err) {
    console.error('[demo] error:', err)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

export default router
