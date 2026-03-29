import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Application } from '../../types'
import { theme } from '../../styles/theme'

const STATUS_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  pending:   { label: '待审核', color: '#d97706', bg: '#fffbeb' },
  approved:  { label: '已通过', color: '#059669', bg: '#d1fae5' },
  rejected:  { label: '未通过', color: '#dc2626', bg: '#fee2e2' },
  withdrawn: { label: '已撤回', color: '#6b7280', bg: '#f3f4f6' },
}

export default function ApplicationReviewPage() {
  const { clubId } = useParams<{ clubId: string }>()
  const navigate = useNavigate()
  const [applications, setApplications] = useState<Application[]>([])
  const [loading, setLoading] = useState(true)
  const [reviewing, setReviewing] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | 'pending'>('pending')

  const fetchApplications = async () => {
    try {
      const res = await api.get(`/applications/club/${clubId}`)
      setApplications(res.data.applications)
    } catch { /* ignore */ }
    finally { setLoading(false) }
  }

  useEffect(() => { fetchApplications() }, [clubId])

  const review = async (appId: string, status: 'approved' | 'rejected') => {
    setReviewing(appId)
    try { await api.put(`/applications/${appId}/review`, { status }); fetchApplications() }
    catch { alert('操作失败') }
    finally { setReviewing(null) }
  }

  const filtered = filter === 'pending' ? applications.filter((a) => a.status === 'pending') : applications
  const pendingCount = applications.filter((a) => a.status === 'pending').length

  return (
    <div>
      <button style={s.back} onClick={() => navigate(-1)}>← 返回</button>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>申请审核</h1>
          <p style={s.pageSubtitle}>共 {applications.length} 条申请，{pendingCount} 条待审核</p>
        </div>
      </div>

      {/* 统计 */}
      <div style={s.statsRow}>
        {[
          { label: '全部', value: applications.length, color: theme.colors.primary },
          { label: '待审核', value: pendingCount, color: '#d97706' },
          { label: '已通过', value: applications.filter((a) => a.status === 'approved').length, color: theme.colors.success },
          { label: '未通过', value: applications.filter((a) => a.status === 'rejected').length, color: theme.colors.danger },
        ].map((c) => (
          <div key={c.label} style={{ ...s.statCard, borderTop: `3px solid ${c.color}` }}>
            <p style={{ ...s.statValue, color: c.color }}>{c.value}</p>
            <p style={s.statLabel}>{c.label}</p>
          </div>
        ))}
      </div>

      {/* 筛选 */}
      <div style={s.filterRow}>
        <button style={{ ...s.filterBtn, ...(filter === 'pending' ? s.filterActive : {}) }} onClick={() => setFilter('pending')}>待审核</button>
        <button style={{ ...s.filterBtn, ...(filter === 'all' ? s.filterActive : {}) }} onClick={() => setFilter('all')}>全部</button>
      </div>

      {loading ? (
        <p style={s.hint}>加载中...</p>
      ) : filtered.length === 0 ? (
        <div style={s.empty}><p style={s.emptyTitle}>暂无申请</p></div>
      ) : (
        <div style={s.list}>
          {filtered.map((app) => {
            const cfg = STATUS_CONFIG[app.status]
            return (
              <div key={app.id} style={s.item}>
                <div style={s.itemLeft}>
                  <span style={{ ...s.statusBadge, color: cfg.color, background: cfg.bg }}>{cfg.label}</span>
                  <div>
                    <p style={s.studentId}>申请人 ID: {app.studentId.slice(0, 12)}...</p>
                    <p style={s.date}>{new Date(app.createdAt).toLocaleString()}</p>
                  </div>
                </div>
                {app.status === 'pending' && (
                  <div style={s.btnGroup}>
                    <button style={s.approveBtn} disabled={reviewing === app.id} onClick={() => review(app.id, 'approved')}>✓ 通过</button>
                    <button style={s.rejectBtn} disabled={reviewing === app.id} onClick={() => review(app.id, 'rejected')}>✕ 拒绝</button>
                  </div>
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
  back: { background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0, fontWeight: 500 },
  pageHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  statsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12, marginBottom: 20 },
  statCard: { background: theme.colors.surface, borderRadius: theme.radius.md, padding: '16px 20px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` },
  statValue: { fontSize: 28, fontWeight: 700, marginBottom: 2 },
  statLabel: { fontSize: 12, color: theme.colors.textMuted },
  filterRow: { display: 'flex', gap: 8, marginBottom: 16 },
  filterBtn: { padding: '6px 18px', borderRadius: theme.radius.full, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: 'pointer', fontSize: 13, color: theme.colors.textSecondary },
  filterActive: { background: theme.colors.primary, color: '#fff', borderColor: theme.colors.primary },
  hint: { textAlign: 'center', padding: '40px 0', color: theme.colors.textMuted },
  empty: { textAlign: 'center', padding: '60px 0' },
  emptyTitle: { fontSize: 15, color: theme.colors.textMuted },
  list: { display: 'flex', flexDirection: 'column', gap: 8 },
  item: { background: theme.colors.surface, borderRadius: theme.radius.md, padding: '16px 20px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' },
  itemLeft: { display: 'flex', alignItems: 'center', gap: 14 },
  statusBadge: { borderRadius: theme.radius.full, padding: '3px 12px', fontSize: 12, fontWeight: 600, flexShrink: 0 },
  studentId: { fontSize: 14, color: theme.colors.text, marginBottom: 2 },
  date: { fontSize: 12, color: theme.colors.textMuted },
  btnGroup: { display: 'flex', gap: 8 },
  approveBtn: { padding: '7px 18px', borderRadius: theme.radius.sm, background: theme.colors.success, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  rejectBtn: { padding: '7px 18px', borderRadius: theme.radius.sm, background: theme.colors.surface, color: theme.colors.danger, border: `1px solid ${theme.colors.border}`, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
}
