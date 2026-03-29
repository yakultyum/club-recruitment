import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import {
  getClubStats,
  getDailyApplicationTrend,
  getApplicantTagDistribution,
} from '../services/statistics.service'

const router = Router()

// GET /api/clubs/:id/stats
router.get('/:id/stats', authenticateToken, async (req: Request, res: Response) => {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以查看统计数据' } })
    return
  }

  try {
    const stats = await getClubStats(req.params.id)
    res.status(200).json({ stats })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// GET /api/clubs/:id/stats/trend?days=30
router.get('/:id/stats/trend', authenticateToken, async (req: Request, res: Response) => {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以查看统计数据' } })
    return
  }

  const days = req.query.days ? parseInt(req.query.days as string, 10) : 30

  try {
    const trend = await getDailyApplicationTrend(req.params.id, days)
    res.status(200).json({ trend })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// GET /api/clubs/:id/stats/tags
router.get('/:id/stats/tags', authenticateToken, async (req: Request, res: Response) => {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以查看统计数据' } })
    return
  }

  try {
    const distribution = await getApplicantTagDistribution(req.params.id)
    res.status(200).json({ distribution })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

export default router
