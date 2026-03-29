import pool from '../db'
import type { Application, ApplicationStatus } from '../types'
import { sendNotification } from './notification.service'

type ReviewStatus = 'approved' | 'rejected' | 'pending'

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

export async function reviewApplication(
  applicationId: string,
  adminId: string,
  status: ReviewStatus
): Promise<Application> {
  // 获取申请信息
  const appResult = await pool.query('SELECT * FROM applications WHERE id = $1', [applicationId])
  if (!appResult.rowCount || appResult.rowCount === 0) {
    throw { code: 'NOT_FOUND', message: '申请不存在' }
  }
  const app = appResult.rows[0]

  // 验证申请当前状态必须为 pending
  if (app.status !== 'pending') {
    throw { code: 'INVALID_STATUS_TRANSITION', message: '只有待审核状态的申请可以被审核' }
  }

  // 验证管理员权限（必须是该社团的管理员）
  const clubResult = await pool.query('SELECT admin_id FROM clubs WHERE id = $1', [app.club_id])
  if (!clubResult.rowCount || clubResult.rowCount === 0) {
    throw { code: 'NOT_FOUND', message: '社团不存在' }
  }
  if (clubResult.rows[0].admin_id !== adminId) {
    throw { code: 'FORBIDDEN', message: '无权限审核此申请' }
  }

  // 更新申请状态
  const result = await pool.query(
    `UPDATE applications SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
    [status, applicationId]
  )

  // 审核通过时，更新社团 currentCount
  if (status === 'approved') {
    await pool.query(
      `UPDATE clubs SET current_count = current_count + 1,
       is_open = CASE WHEN current_count + 1 >= capacity THEN false ELSE is_open END,
       updated_at = NOW()
       WHERE id = $1`,
      [app.club_id]
    )
  }

  // 发送站内通知
  if (status === 'approved' || status === 'rejected') {
    const msg = status === 'approved'
      ? `您对社团的申请已通过审核`
      : `您对社团的申请未通过审核`
    await sendNotification(app.student_id, msg, 'application_status')
  }

  return rowToApplication(result.rows[0])
}
