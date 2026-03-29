import type { Request, Response, NextFunction } from 'express'
import { verifyToken } from '../services/auth.service'
import type { AuthPayload } from '../types/index'

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload
    }
  }
}

export function authenticateToken(req: Request, res: Response, next: NextFunction): void {
  const authHeader = req.headers['authorization']
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null

  if (!token) {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: '缺少认证 token' } })
    return
  }

  try {
    req.user = verifyToken(token)
    next()
  } catch {
    res.status(401).json({ error: { code: 'UNAUTHORIZED', message: 'token 无效或已过期' } })
  }
}
