import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { generateRecommendations } from '../services/matching.service'

const router = Router()

router.use(authenticateToken)

// GET /api/recommendations
router.get('/', async (req: Request, res: Response) => {
  if (req.user?.role !== 'student') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅学生可以获取推荐列表' } })
    return
  }

  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1

  try {
    const result = await generateRecommendations(req.user.userId, page)
    res.status(200).json(result)
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

export default router
