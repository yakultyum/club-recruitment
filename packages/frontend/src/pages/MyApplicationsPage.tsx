import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'
import type { Application } from '../types'
import { theme } from '../styles/theme'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string; dot: string }> = {
  pending:   { label: '待审核', color: '#d97706', bg: '#fffbeb', dot: '#f59e0b' },
  approved:  { label: '已通过', color: '#059669', bg: '#d1fae5', dot: '#10b981' },
  rejected:  { label: '未通过', color: '#dc2626', bg: '#fee2e2', dot: '#ef4444' },
  withdrawn: { label: '已撤回', color: '#6b7280', bg: '#f3f4f6', dot: '#9ca3af' },
}

export default function MyApplicationsPage() {
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)

  const fetchApplications = async () => {
    try {
      const res = await api.get('/applications/my')
      setApplications(res.data.applications)
    } catch {
      // ignore
    } finally { setLoading(false) }
  }

  useEffect(() => { fetchApplications() }, [])

  const handleWithdraw = async (id: string) => {
    if (!confirm('确认撤回申请？')) return
    try { await api.delete(`/applications/${id}`); fetchApplications() }
    catch { alert('撤回失败') }
  }

  const stats = {
    total: applications.length,
    pending: applications.filter((a) => a.status === 'pending').length,
    approved: applications.filter((a) => a.status === 'approved').length,
  }

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>我的申请</h1>
        <p style={s.pageSubtitle}>管理你提交的所有社团申请</p>
      </div>

      {/* 统计卡片 */}
      <div style={s.statsRow}>
        {[
          { label: '全部申请', value: stats.total, color: theme.colors.primary, bg: theme.colors.primaryLight },
          { label: '待审核', value: stats.pending, color: '#d97706', bg: '#fffbeb' },
          { label: '已通过', value: stats.approved, color: theme.colors.success, bg: theme.colors.successLight },
        ].map((c) => (
          <div key={c.label} style={{ ...s.statCard, borderTop: `3px solid ${c.color}` }}>
            <p style={{ ...s.statValue, color: c.color }}>{c.value}</p>
            <p style={s.statLabel}>{c.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <p style={s.hint}>加载中...</p>
      ) : applications.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>📋</div>
          <p style={s.emptyTitle}>还没有申请记录</p>
          <button style={s.exploreBtn} onClick={() => navigate('/search')}>去探索社团</button>
        </div>
      ) : (
        <div style={s.list}>
          {applications.map((app) => {
            const cfg = STATUS_CONFIG[app.status]
            return (
              <div key={app.id} style={s.item}>
                <div style={{ ...s.statusDot, background: cfg.dot }} />
                <div style={s.itemContent}>
                  <div style={s.itemTop}>
                    <span style={{ ...s.statusBadge, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                    <span style={s.clubId}>社团 ID: {app.clubId.slice(0, 8)}...</span>
                  </div>
                  <p style={s.itemDate}>{new Date(app.createdAt).toLocaleString()}</p>
                </div>
                {app.status === 'pending' && (
                  <button style={s.withdrawBtn} onClick={() => handleWithdraw(app.id)}>撤回</button>
                )}
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 },
  statCard: { background: theme.colors.surface, borderRadius: theme.radius.lg, padding: '20px 24px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` },
  statValue: { fontSize: 32, fontWeight: 700, marginBottom: 4 },
  statLabel: { fontSize: 13, color: theme.colors.textMuted },
  hint: { textAlign: 'center', padding: '40px 0', color: theme.colors.textMuted },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 16 },
  exploreBtn: { padding: '10px 24px', borderRadius: theme.radius.md, background: theme.colors.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
  list: { display: 'flex', flexDirection: 'column', gap: 10 },
  item: { background: theme.colors.surface, borderRadius: theme.radius.md, padding: '16px 20px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, display: 'flex', alignItems: 'center', gap: 14 },
  statusDot: { width: 10, height: 10, borderRadius: '50%', flexShrink: 0 },
  itemContent: { flex: 1 },
  itemTop: { display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4 },
  statusBadge: { borderRadius: theme.radius.full, padding: '2px 10px', fontSize: 12, fontWeight: 600 },
  clubId: { fontSize: 13, color: theme.colors.textMuted },
  itemDate: { fontSize: 12, color: theme.colors.textMuted },
  withdrawBtn: { padding: '6px 16px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, color: theme.colors.danger, cursor: 'pointer', fontSize: 13, fontWeight: 500, flexShrink: 0 },
}
