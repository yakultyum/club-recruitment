import pool from '../db'
import type { Club, ClubType } from '../types'

function rowToClub(row: Record<string, unknown>): Club {
  return {
    id: row.id as string,
    adminId: row.admin_id as string,
    name: row.name as string,
    description: row.description as string,
    type: row.type as ClubType,
    tags: row.tags as string[],
    capacity: row.capacity as number,
    currentCount: row.current_count as number,
    photos: row.photos as string[],
    isOpen: row.is_open as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }
}

export async function searchClubs(
  keyword?: string,
  type?: ClubType,
  page = 1,
  pageSize = 10
): Promise<{ clubs: Club[]; total: number; fallback: boolean }> {
  const conditions: string[] = []
  const params: unknown[] = []

  if (keyword && keyword.trim()) {
    params.push(`%${keyword.trim()}%`)
    conditions.push(`(name ILIKE $${params.length} OR description ILIKE $${params.length})`)
  }

  if (type) {
    params.push(type)
    conditions.push(`type = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query(`SELECT COUNT(*) FROM clubs ${where}`, params)
  const total = parseInt(countResult.rows[0].count, 10)

  // 无结果时返回热门社团（按 currentCount 降序）
  if (total === 0) {
    const hotResult = await pool.query(
      'SELECT * FROM clubs ORDER BY current_count DESC LIMIT $1 OFFSET $2',
      [pageSize, (page - 1) * pageSize]
    )
    const hotCount = await pool.query('SELECT COUNT(*) FROM clubs')
    return {
      clubs: hotResult.rows.map(rowToClub),
      total: parseInt(hotCount.rows[0].count, 10),
      fallback: true,
    }
  }

  const offset = (page - 1) * pageSize
  params.push(pageSize, offset)
  const dataResult = await pool.query(
    `SELECT * FROM clubs ${where} ORDER BY current_count DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return { clubs: dataResult.rows.map(rowToClub), total, fallback: false }
}
