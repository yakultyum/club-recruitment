import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import {
  submitApplication,
  withdrawApplication,
  getApplicationsByStudent,
  getApplicationsByClub,
} from '../services/application.service'
import { reviewApplication } from '../services/review.service'

const router = Router()

router.use(authenticateToken)

// POST /api/applications — 提交申请
router.post('/', async (req: Request, res: Response) => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅学生可以提交申请' } })
    return
  }

  const { clubId, formData } = req.body
  if (!clubId) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: '缺少 clubId' } })
    return
  }

  try {
    const application = await submitApplication(req.user.userId, clubId, formData ?? {})
    res.status(201).json({ application })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'CLUB_CAPACITY_FULL') {
      res.status(422).json({ error: { code: 'CLUB_CAPACITY_FULL', message: e.message } })
    } else if (e.code === 'APPLICATION_DUPLICATE') {
      res.status(409).json({ error: { code: 'APPLICATION_DUPLICATE', message: e.message } })
    } else if (e.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: e.message } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

// DELETE /api/applications/:id — 撤回申请
router.delete('/:id', async (req: Request, res: Response) => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅学生可以撤回申请' } })
    return
  }

  try {
    await withdrawApplication(req.params.id, req.user.userId)
    res.status(204).send()
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: e.message } })
    } else if (e.code === 'FORBIDDEN') {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: e.message } })
    } else if (e.code === 'INVALID_STATUS_TRANSITION') {
      res.status(422).json({ error: { code: 'INVALID_STATUS_TRANSITION', message: e.message } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

// GET /api/applications/my — 获取当前学生的申请列表
router.get('/my', async (req: Request, res: Response) => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅学生可以查看自己的申请' } })
    return
  }

  try {
    const applications = await getApplicationsByStudent(req.user.userId)
    res.status(200).json({ applications })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

export default router

// GET /api/applications/club/:clubId — 获取社团的申请列表（管理员）
router.get('/club/:clubId', async (req: Request, res: Response) => {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以查看申请列表' } })
    return
  }

  try {
    const applications = await getApplicationsByClub(req.params.clubId)
    res.status(200).json({ applications })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// PUT /api/applications/:id/review — 审核申请
router.put('/:id/review', async (req: Request, res: Response) => {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以审核申请' } })
    return
  }

  const { status } = req.body
  if (!['approved', 'rejected', 'pending'].includes(status)) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: 'status 必须为 approved、rejected 或 pending' } })
    return
  }

  try {
    const application = await reviewApplication(req.params.id, req.user.userId, status)
    res.status(200).json({ application })
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: e.message } })
    } else if (e.code === 'FORBIDDEN') {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: e.message } })
    } else if (e.code === 'INVALID_STATUS_TRANSITION') {
      res.status(422).json({ error: { code: 'INVALID_STATUS_TRANSITION', message: e.message } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

export default router
