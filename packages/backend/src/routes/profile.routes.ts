import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { createProfile, updateTags, getProfile } from '../services/profile.service'

const router = Router()

router.use(authenticateToken)

function requireStudent(req: Request, res: Response): boolean {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅学生可以操作兴趣画像' } })
    return false
  }
  return true
}

function validateTags(tags: unknown, res: Response): tags is string[] {
  if (!Array.isArray(tags) || tags.length === 0) {
    res.status(400).json({ error: { code: 'TAGS_REQUIRED', message: '至少选择 1 个兴趣标签' } })
    return false
  }
  return true
}

// POST /api/profile/tags — 创建画像
router.post('/tags', async (req: Request, res: Response) => {
  if (!requireStudent(req, res)) return

  const { tags } = req.body
  if (!validateTags(tags, res)) return

  try {
    const profile = await createProfile(req.user!.userId, tags)
    res.status(201).json({ profile })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// PUT /api/profile/tags — 更新标签（upsert）
router.put('/tags', async (req: Request, res: Response) => {
  if (!requireStudent(req, res)) return

  const { tags } = req.body
  if (!validateTags(tags, res)) return

  try {
    const profile = await updateTags(req.user!.userId, tags)
    res.status(200).json({ profile })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// GET /api/profile — 获取当前学生画像
router.get('/', async (req: Request, res: Response) => {
  if (!requireStudent(req, res)) return

  try {
    const profile = await getProfile(req.user!.userId)
    if (!profile) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '画像不存在' } })
      return
    }
    res.status(200).json({ profile })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

export default router
