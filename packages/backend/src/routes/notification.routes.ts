import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { getNotifications, markAsRead } from '../services/notification.service'

const router = Router()

router.use(authenticateToken)

// GET /api/notifications
router.get('/', async (req: Request, res: Response) => {
  try {
    const notifications = await getNotifications(req.user!.userId)
    res.status(200).json({ notifications })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// PUT /api/notifications/:id/read
router.put('/:id/read', async (req: Request, res: Response) => {
  try {
    await markAsRead(req.params.id, req.user!.userId)
    res.status(204).send()
  } catch (err: unknown) {
    const e = err as { code?: string; message?: string }
    if (e.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: e.message } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

export default router
