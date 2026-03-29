import pool from '../db'
import type { StudentProfile } from '../types'

export async function createProfile(studentId: string, tags: string[]): Promise<StudentProfile> {
  const result = await pool.query<StudentProfile>(
    `INSERT INTO student_profiles (student_id, tags)
     VALUES ($1, $2)
     RETURNING id, student_id AS "studentId", tags, updated_at AS "updatedAt"`,
    [studentId, tags]
  )
  return result.rows[0]
}

export async function updateTags(studentId: string, tags: string[]): Promise<StudentProfile> {
  const result = await pool.query<StudentProfile>(
    `INSERT INTO student_profiles (student_id, tags)
     VALUES ($1, $2)
     ON CONFLICT (student_id) DO UPDATE SET tags = EXCLUDED.tags, updated_at = NOW()
     RETURNING id, student_id AS "studentId", tags, updated_at AS "updatedAt"`,
    [studentId, tags]
  )
  return result.rows[0]
}

export async function getProfile(studentId: string): Promise<StudentProfile | null> {
  const result = await pool.query<StudentProfile>(
    `SELECT id, student_id AS "studentId", tags, updated_at AS "updatedAt"
     FROM student_profiles
     WHERE student_id = $1`,
    [studentId]
  )
  return result.rows[0] ?? null
}
