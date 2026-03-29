import pool from '../db'
import type { Notification } from '../types'

function rowToNotification(row: Record<string, unknown>): Notification {
  return {
    id: row.id as string,
    userId: row.user_id as string,
    message: row.message as string,
    type: row.type as Notification['type'],
    isRead: row.is_read as boolean,
    createdAt: row.created_at as Date,
  }
}

export async function sendNotification(
  userId: string,
  message: string,
  type: Notification['type']
): Promise<Notification> {
  const result = await pool.query(
    `INSERT INTO notifications (user_id, message, type) VALUES ($1, $2, $3) RETURNING *`,
    [userId, message, type]
  )
  return rowToNotification(result.rows[0])
}

export async function getNotifications(userId: string): Promise<Notification[]> {
  const result = await pool.query(
    'SELECT * FROM notifications WHERE user_id = $1 ORDER BY created_at DESC',
    [userId]
  )
  return result.rows.map(rowToNotification)
}

export async function markAsRead(notificationId: string, userId: string): Promise<void> {
  const result = await pool.query(
    'UPDATE notifications SET is_read = true WHERE id = $1 AND user_id = $2',
    [notificationId, userId]
  )
  if (!result.rowCount || result.rowCount === 0) {
    throw { code: 'NOT_FOUND', message: '通知不存在' }
  }
}
