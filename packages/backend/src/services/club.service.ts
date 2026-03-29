import pool from '../db'
import type { Club, ClubCreateInput, ClubType } from '../types'

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

export async function createClub(adminId: string, data: ClubCreateInput): Promise<Club> {
  const { name, description, type, tags, capacity, photos = [] } = data

  if (name.length < 2 || name.length > 50) {
    throw { code: 'CLUB_NAME_INVALID' }
  }

  const existing = await pool.query('SELECT id FROM clubs WHERE name = $1', [name])
  if (existing.rowCount && existing.rowCount > 0) {
    throw { code: 'CLUB_NAME_DUPLICATE' }
  }

  const result = await pool.query(
    `INSERT INTO clubs (admin_id, name, description, type, tags, capacity, photos)
     VALUES ($1, $2, $3, $4, $5, $6, $7)
     RETURNING *`,
    [adminId, name, description, type, tags, capacity, photos]
  )

  return rowToClub(result.rows[0])
}

export async function updateClub(
  clubId: string,
  adminId: string,
  data: Partial<ClubCreateInput>
): Promise<Club> {
  const existing = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId])
  if (!existing.rowCount || existing.rowCount === 0) {
    throw { code: 'NOT_FOUND' }
  }

  const club = existing.rows[0]
  if (club.admin_id !== adminId) {
    throw { code: 'FORBIDDEN' }
  }

  if (data.name !== undefined) {
    if (data.name.length < 2 || data.name.length > 50) {
      throw { code: 'CLUB_NAME_INVALID' }
    }
    const dup = await pool.query('SELECT id FROM clubs WHERE name = $1 AND id != $2', [data.name, clubId])
    if (dup.rowCount && dup.rowCount > 0) {
      throw { code: 'CLUB_NAME_DUPLICATE' }
    }
  }

  const newCapacity = data.capacity ?? club.capacity
  const currentCount = club.current_count as number
  const isOpen = currentCount >= newCapacity ? false : club.is_open

  const result = await pool.query(
    `UPDATE clubs SET
       name          = COALESCE($1, name),
       description   = COALESCE($2, description),
       type          = COALESCE($3, type),
       tags          = COALESCE($4, tags),
       capacity      = COALESCE($5, capacity),
       photos        = COALESCE($6, photos),
       is_open       = $7,
       updated_at    = NOW()
     WHERE id = $8
     RETURNING *`,
    [
      data.name ?? null,
      data.description ?? null,
      data.type ?? null,
      data.tags ?? null,
      data.capacity ?? null,
      data.photos ?? null,
      isOpen,
      clubId,
    ]
  )

  return rowToClub(result.rows[0])
}

export async function getClub(clubId: string): Promise<Club | null> {
  const result = await pool.query('SELECT * FROM clubs WHERE id = $1', [clubId])
  if (!result.rowCount || result.rowCount === 0) return null
  return rowToClub(result.rows[0])
}

export async function listClubs(filter: {
  type?: ClubType
  page?: number
  pageSize?: number
}): Promise<{ clubs: Club[]; total: number }> {
  const page = filter.page ?? 1
  const pageSize = filter.pageSize ?? 10
  const offset = (page - 1) * pageSize

  const conditions: string[] = []
  const params: unknown[] = []

  if (filter.type) {
    params.push(filter.type)
    conditions.push(`type = $${params.length}`)
  }

  const where = conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : ''

  const countResult = await pool.query(`SELECT COUNT(*) FROM clubs ${where}`, params)
  const total = parseInt(countResult.rows[0].count, 10)

  params.push(pageSize, offset)
  const dataResult = await pool.query(
    `SELECT * FROM clubs ${where} ORDER BY created_at DESC LIMIT $${params.length - 1} OFFSET $${params.length}`,
    params
  )

  return { clubs: dataResult.rows.map(rowToClub), total }
}
