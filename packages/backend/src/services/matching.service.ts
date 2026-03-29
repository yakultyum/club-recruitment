import pool from '../db'
import redis from '../db/redis'
import type { Club } from '../types'

/**
 * Jaccard 相似度匹配分数
 * score = |A ∩ B| / |A ∪ B| × 100
 */
export function computeScore(studentTags: string[], clubTags: string[]): number {
  if (studentTags.length === 0 && clubTags.length === 0) return 0

  const a = new Set(studentTags.map((t) => t.toLowerCase()))
  const b = new Set(clubTags.map((t) => t.toLowerCase()))

  let intersection = 0
  for (const tag of a) {
    if (b.has(tag)) intersection++
  }

  const union = a.size + b.size - intersection
  if (union === 0) return 0

  return Math.round((intersection / union) * 100)
}

function rowToClub(row: Record<string, unknown>): Club {
  return {
    id: row.id as string,
    adminId: row.admin_id as string,
    name: row.name as string,
    description: row.description as string,
    type: row.type as Club['type'],
    tags: row.tags as string[],
    capacity: row.capacity as number,
    currentCount: row.current_count as number,
    photos: row.photos as string[],
    isOpen: row.is_open as boolean,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }
}

export async function generateRecommendations(
  studentId: string,
  page = 1
): Promise<{ items: Array<{ club: Club; score: number }>; total: number }> {
  const cacheKey = `recommendations:${studentId}`
  const cached = await redis.get(cacheKey)

  let allItems: Array<{ club: Club; score: number }>

  if (cached) {
    allItems = JSON.parse(cached)
  } else {
    // 获取学生标签
    const profileResult = await pool.query(
      'SELECT tags FROM student_profiles WHERE student_id = $1',
      [studentId]
    )
    const studentTags: string[] = profileResult.rows[0]?.tags ?? []

    // 获取所有开放社团
    const clubsResult = await pool.query('SELECT * FROM clubs WHERE is_open = true')
    const clubs: Club[] = clubsResult.rows.map(rowToClub)

    // 计算分数
    allItems = clubs.map((club) => ({
      club,
      score: computeScore(studentTags, club.tags),
    }))

    // 排序：分数降序，若全为 0 则按热度（currentCount）降序
    const allZero = allItems.every((item) => item.score === 0)
    if (allZero) {
      allItems.sort((a, b) => b.club.currentCount - a.club.currentCount)
    } else {
      allItems.sort((a, b) => b.score - a.score)
    }

    // 缓存 5 分钟
    await redis.set(cacheKey, JSON.stringify(allItems), 'EX', 300)
  }

  const pageSize = 10
  const offset = (page - 1) * pageSize
  const items = allItems.slice(offset, offset + pageSize)

  return { items, total: allItems.length }
}

export async function invalidateCache(studentId: string): Promise<void> {
  await redis.del(`recommendations:${studentId}`)
}
