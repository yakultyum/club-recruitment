import pool from '../db'

export interface ClubStats {
  total: number
  approved: number
  rejected: number
  pending: number
  withdrawn: number
}

export interface DailyTrend {
  date: string
  count: number
}

export interface TagDistribution {
  tag: string
  count: number
}

export async function getClubStats(clubId: string): Promise<ClubStats> {
  const result = await pool.query(
    `SELECT
       COUNT(*) AS total,
       COUNT(*) FILTER (WHERE status = 'approved') AS approved,
       COUNT(*) FILTER (WHERE status = 'rejected') AS rejected,
       COUNT(*) FILTER (WHERE status = 'pending') AS pending,
       COUNT(*) FILTER (WHERE status = 'withdrawn') AS withdrawn
     FROM applications
     WHERE club_id = $1`,
    [clubId]
  )
  const row = result.rows[0]
  return {
    total: parseInt(row.total, 10),
    approved: parseInt(row.approved, 10),
    rejected: parseInt(row.rejected, 10),
    pending: parseInt(row.pending, 10),
    withdrawn: parseInt(row.withdrawn, 10),
  }
}

export async function getDailyApplicationTrend(
  clubId: string,
  days = 30
): Promise<DailyTrend[]> {
  const result = await pool.query(
    `SELECT
       DATE(created_at) AS date,
       COUNT(*) AS count
     FROM applications
     WHERE club_id = $1
       AND created_at >= NOW() - INTERVAL '${days} days'
     GROUP BY DATE(created_at)
     ORDER BY date ASC`,
    [clubId]
  )
  return result.rows.map((row) => ({
    date: row.date.toISOString().split('T')[0],
    count: parseInt(row.count, 10),
  }))
}

export async function getApplicantTagDistribution(clubId: string): Promise<TagDistribution[]> {
  const result = await pool.query(
    `SELECT unnest(sp.tags) AS tag, COUNT(*) AS count
     FROM applications a
     JOIN student_profiles sp ON sp.student_id = a.student_id
     WHERE a.club_id = $1
     GROUP BY tag
     ORDER BY count DESC`,
    [clubId]
  )
  return result.rows.map((row) => ({
    tag: row.tag as string,
    count: parseInt(row.count, 10),
  }))
}
