import { useEffect, useState } from 'react'
import api from '../api'
import type { Notification } from '../types'
import { theme } from '../styles/theme'

export default function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/notifications').then((res) => setNotifications(res.data.notifications)).finally(() => setLoading(false))
  }, [])

  const markRead = async (id: string) => {
    try {
      await api.put(`/notifications/${id}/read`)
      setNotifications((prev) => prev.map((n) => n.id === id ? { ...n, isRead: true } : n))
    } catch { /* ignore */ }
  }

  const unread = notifications.filter((n) => !n.isRead).length

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>通知中心</h1>
          <p style={s.pageSubtitle}>查看申请状态变更和系统消息</p>
        </div>
        {unread > 0 && <span style={s.unreadBadge}>{unread} 条未读</span>}
      </div>

      {loading ? (
        <p style={s.hint}>加载中...</p>
      ) : notifications.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔔</div>
          <p style={s.emptyTitle}>暂无通知</p>
        </div>
      ) : (
        <div style={s.list}>
          {notifications.map((n) => (
            <div
              key={n.id}
              style={{ ...s.item, ...(n.isRead ? s.itemRead : s.itemUnread) }}
              onClick={() => !n.isRead && markRead(n.id)}
            >
              <div style={s.iconWrap}>
                <span style={s.icon}>{n.type === 'application_status' ? '📋' : '🔔'}</span>
                {!n.isRead && <div style={s.dot} />}
              </div>
              <div style={s.content}>
                <p style={s.message}>{n.message}</p>
                <p style={s.time}>{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.isRead && <span style={s.readHint}>点击标为已读</span>}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  unreadBadge: { background: theme.colors.danger, color: '#fff', borderRadius: theme.radius.full, padding: '4px 14px', fontSize: 13, fontWeight: 600 },
  hint: { textAlign: 'center', padding: '40px 0', color: theme.colors.textMuted },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: { borderRadius: theme.radius.md, padding: '16px 20px', display: 'flex', gap: 14, alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s', border: `1px solid ${theme.colors.border}` },
  itemUnread: { background: '#eff6ff', borderColor: '#bfdbfe' },
  itemRead: { background: theme.colors.surface },
  iconWrap: { position: 'relative', flexShrink: 0 },
  icon: { fontSize: 22 },
  dot: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: '50%', background: theme.colors.primary },
  content: { flex: 1 },
  message: { fontSize: 14, color: theme.colors.text, marginBottom: 4 },
  time: { fontSize: 12, color: theme.colors.textMuted },
  readHint: { fontSize: 12, color: theme.colors.primary, flexShrink: 0 },
}
