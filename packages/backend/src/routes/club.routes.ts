import { Router } from 'express'
import type { Request, Response } from 'express'
import { authenticateToken } from '../middleware/auth.middleware'
import { createClub, updateClub, getClub, listClubs } from '../services/club.service'
import { searchClubs } from '../services/search.service'
import type { ClubType } from '../types'

const router = Router()

function requireClubAdmin(req: Request, res: Response): boolean {
  if (req.user?.role !== 'club_admin') {
    res.status(403).json({ error: { code: 'FORBIDDEN', message: '仅社团管理员可以执行此操作' } })
    return false
  }
  return true
}

// POST /api/clubs — 创建社团
router.post('/', authenticateToken, async (req: Request, res: Response) => {
  if (!requireClubAdmin(req, res)) return

  const { name, description, type, tags, capacity, photos } = req.body

  if (!name || !description || !type || !tags || capacity === undefined) {
    res.status(400).json({ error: { code: 'BAD_REQUEST', message: '缺少必填字段' } })
    return
  }

  try {
    const club = await createClub(req.user!.userId, { name, description, type, tags, capacity, photos })
    res.status(201).json({ club })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'CLUB_NAME_INVALID') {
      res.status(400).json({ error: { code: 'CLUB_NAME_INVALID', message: '社团名称长度必须在 2 到 50 个字符之间' } })
    } else if (e.code === 'CLUB_NAME_DUPLICATE') {
      res.status(409).json({ error: { code: 'CLUB_NAME_DUPLICATE', message: '该社团名称已存在' } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

// GET /api/clubs — 列表/搜索（公开）
router.get('/', async (req: Request, res: Response) => {
  const { keyword, type, page, pageSize } = req.query

  try {
    // 有 keyword 或 type 时走搜索逻辑
    if (keyword || type) {
      const result = await searchClubs(
        keyword as string | undefined,
        type as ClubType | undefined,
        page ? parseInt(page as string, 10) : 1,
        pageSize ? parseInt(pageSize as string, 10) : 10
      )
      res.status(200).json(result)
    } else {
      const result = await listClubs({
        type: type as ClubType | undefined,
        page: page ? parseInt(page as string, 10) : undefined,
        pageSize: pageSize ? parseInt(pageSize as string, 10) : undefined,
      })
      res.status(200).json(result)
    }
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// GET /api/clubs/:id — 获取单个社团（公开）
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const club = await getClub(req.params.id)
    if (!club) {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '社团不存在' } })
      return
    }
    res.status(200).json({ club })
  } catch {
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
  }
})

// PUT /api/clubs/:id — 更新社团
router.put('/:id', authenticateToken, async (req: Request, res: Response) => {
  if (!requireClubAdmin(req, res)) return

  const { name, description, type, tags, capacity, photos } = req.body

  try {
    const club = await updateClub(req.params.id, req.user!.userId, {
      name,
      description,
      type,
      tags,
      capacity,
      photos,
    })
    res.status(200).json({ club })
  } catch (err: unknown) {
    const e = err as { code?: string }
    if (e.code === 'NOT_FOUND') {
      res.status(404).json({ error: { code: 'NOT_FOUND', message: '社团不存在' } })
    } else if (e.code === 'FORBIDDEN') {
      res.status(403).json({ error: { code: 'FORBIDDEN', message: '无权限修改此社团' } })
    } else if (e.code === 'CLUB_NAME_INVALID') {
      res.status(400).json({ error: { code: 'CLUB_NAME_INVALID', message: '社团名称长度必须在 2 到 50 个字符之间' } })
    } else if (e.code === 'CLUB_NAME_DUPLICATE') {
      res.status(409).json({ error: { code: 'CLUB_NAME_DUPLICATE', message: '该社团名称已存在' } })
    } else {
      res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '服务器内部错误' } })
    }
  }
})

export default router
