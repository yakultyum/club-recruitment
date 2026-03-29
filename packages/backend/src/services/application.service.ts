import pool from '../db'
import type { Application, ApplicationStatus } from '../types'

function rowToApplication(row: Record<string, unknown>): Application {
  return {
    id: row.id as string,
    studentId: row.student_id as string,
    clubId: row.club_id as string,
    formData: row.form_data as Record<string, string>,
    status: row.status as ApplicationStatus,
    createdAt: row.created_at as Date,
    updatedAt: row.updated_at as Date,
  }
}

export async function submitApplication(
  studentId: string,
  clubId: string,
  formData: Record<string, string>
): Promise<Application> {
  // 检查社团是否存在且开放
  const clubResult = await pool.query(
    'SELECT id, is_open, capacity, current_count FROM clubs WHERE id = $1',
    [clubId]
  )
  if (!clubResult.rowCount || clubResult.rowCount === 0) {
    throw { code: 'NOT_FOUND', message: '社团不存在' }
  }
  const club = clubResult.rows[0]
  if (!club.is_open || club.current_count >= club.capacity) {
    throw { code: 'CLUB_CAPACITY_FULL', message: '该社团名额已满，无法报名' }
  }

  // 检查重复申请（非撤回状态）
  const dupResult = await pool.query(
    `SELECT id FROM applications WHERE student_id = $1 AND club_id = $2 AND status != 'withdrawn'`,
    [studentId, clubId]
  )
  if (dupResult.rowCount && dupResult.rowCount > 0) {
    throw { code: 'APPLICATION_DUPLICATE', message: '您已对该社团提交过申请' }
  }

  const result = await pool.query(
    `INSERT INTO applications (student_id, club_id, form_data)
     VALUES ($1, $2, $3)
     RETURNING *`,
    [studentId, clubId, JSON.stringify(formData)]
  )

  return rowToApplication(result.rows[0])
}

export async function withdrawApplication(
  applicationId: string,
  studentId: string
): Promise<void> {
  const result = await pool.query(
    'SELECT id, student_id, status FROM applications WHERE id = $1',
    [applicationId]
  )
  if (!result.rowCount || result.rowCount === 0) {
    throw { code: 'NOT_FOUND', message: '申请不存在' }
  }
  const app = result.rows[0]
  if (app.student_id !== studentId) {
    throw { code: 'FORBIDDEN', message: '无权限撤回此申请' }
  }
  if (app.status !== 'pending') {
    throw { code: 'INVALID_STATUS_TRANSITION', message: '只有待审核状态的申请可以撤回' }
  }

  await pool.query(
    `UPDATE applications SET status = 'withdrawn', updated_at = NOW() WHERE id = $1`,
    [applicationId]
  )
}

export async function getApplicationsByStudent(studentId: string): Promise<Application[]> {
  const result = await pool.query(
    'SELECT * FROM applications WHERE student_id = $1 ORDER BY created_at DESC',
    [studentId]
  )
  return result.rows.map(rowToApplication)
}

export async function getApplicationsByClub(clubId: string): Promise<Application[]> {
  const result = await pool.query(
    'SELECT * FROM applications WHERE club_id = $1 ORDER BY created_at DESC',
    [clubId]
  )
  return result.rows.map(rowToApplication)
}
