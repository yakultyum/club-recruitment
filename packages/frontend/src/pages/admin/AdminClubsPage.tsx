import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../api'
import type { Club } from '../../types'
import { theme } from '../../styles/theme'

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  arts:     { label: '文艺', color: '#7c3aed', bg: '#ede9fe' },
  sports:   { label: '体育', color: '#059669', bg: '#d1fae5' },
  academic: { label: '学术', color: '#2563eb', bg: '#dbeafe' },
  charity:  { label: '公益', color: '#d97706', bg: '#fef3c7' },
  tech:     { label: '科技', color: '#0891b2', bg: '#cffafe' },
}

export default function AdminClubsPage() {
  const navigate = useNavigate()
  const [clubs, setClubs] = useState<Club[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/clubs').then((res) => setClubs(res.data.clubs)).finally(() => setLoading(false))
  }, [])

  return (
    <div>
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>我管理的社团</h1>
          <p style={s.pageSubtitle}>管理社团信息、审核申请、查看数据统计</p>
        </div>
        <button style={s.createBtn} onClick={() => navigate('/admin/clubs/new')}>
          + 创建社团
        </button>
      </div>

      {loading ? (
        <p style={s.hint}>加载中...</p>
      ) : clubs.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🏫</div>
          <p style={s.emptyTitle}>还没有社团</p>
          <button style={s.createBtn} onClick={() => navigate('/admin/clubs/new')}>立即创建</button>
        </div>
      ) : (
        <div style={s.grid}>
          {clubs.map((club) => {
            const typeInfo = TYPE_LABELS[club.type] ?? { label: club.type, color: theme.colors.primary, bg: theme.colors.primaryLight }
            const fillPct = club.capacity > 0 ? Math.min(100, Math.round((club.currentCount / club.capacity) * 100)) : 0
            return (
              <div key={club.id} style={s.card}>
                <div style={{ ...s.cardTop, background: typeInfo.color }} />
                <div style={s.cardBody}>
                  <div style={s.cardHeader}>
                    <span style={{ ...s.typeChip, color: typeInfo.color, background: typeInfo.bg }}>{typeInfo.label}</span>
                    {!club.isOpen && <span style={s.fullBadge}>名额已满</span>}
                  </div>
                  <h3 style={s.clubName}>{club.name}</h3>
                  <p style={s.clubDesc}>{club.description.slice(0, 60)}...</p>

                  <div style={s.progressSection}>
                    <div style={s.progressLabel}>
                      <span style={{ fontSize: 12, color: theme.colors.textMuted }}>招新进度</span>
                      <span style={{ fontSize: 12, fontWeight: 600, color: typeInfo.color }}>{club.currentCount}/{club.capacity}</span>
                    </div>
                    <div style={s.progressBg}>
                      <div style={{ ...s.progressFill, width: `${fillPct}%`, background: typeInfo.color }} />
                    </div>
                  </div>

                  <div style={s.actions}>
                    <button style={s.actionBtn} onClick={() => navigate(`/admin/clubs/${club.id}/edit`)}>✏️ 编辑</button>
                    <button style={s.actionBtn} onClick={() => navigate(`/admin/clubs/${club.id}/applications`)}>📋 审核</button>
                    <button style={s.actionBtn} onClick={() => navigate(`/admin/clubs/${club.id}/stats`)}>📊 统计</button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageHeader: { display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  createBtn: { padding: '10px 20px', borderRadius: theme.radius.md, background: theme.colors.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600, flexShrink: 0 },
  hint: { textAlign: 'center', padding: '40px 0', color: theme.colors.textMuted },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted, marginBottom: 16 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  card: { background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' },
  cardTop: { height: 4 },
  cardBody: { padding: '18px 20px' },
  cardHeader: { display: 'flex', gap: 8, marginBottom: 10 },
  typeChip: { borderRadius: theme.radius.full, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  fullBadge: { background: theme.colors.dangerLight, color: theme.colors.danger, borderRadius: theme.radius.full, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  clubName: { fontSize: 16, fontWeight: 700, color: theme.colors.text, marginBottom: 6 },
  clubDesc: { fontSize: 13, color: theme.colors.textSecondary, marginBottom: 14, lineHeight: 1.5 },
  progressSection: { marginBottom: 16 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  progressBg: { height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2 },
  actions: { display: 'flex', gap: 8 },
  actionBtn: { flex: 1, padding: '7px 0', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, background: '#f9fafb', cursor: 'pointer', fontSize: 12, color: theme.colors.textSecondary, fontWeight: 500 },
}
