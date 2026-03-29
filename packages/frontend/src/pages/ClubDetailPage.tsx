import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import api from '../api'
import { useAuth } from '../context/AuthContext'
import type { Club } from '../types'
import { theme } from '../styles/theme'

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  arts:     { label: '文艺', color: '#7c3aed', bg: '#ede9fe' },
  sports:   { label: '体育', color: '#059669', bg: '#d1fae5' },
  academic: { label: '学术', color: '#2563eb', bg: '#dbeafe' },
  charity:  { label: '公益', color: '#d97706', bg: '#fef3c7' },
  tech:     { label: '科技', color: '#0891b2', bg: '#cffafe' },
}

export default function ClubDetailPage() {
  const { id } = useParams<{ id: string }>()
  const { user } = useAuth()
  const navigate = useNavigate()
  const [club, setClub] = useState<Club | null>(null)
  const [loading, setLoading] = useState(true)
  const [applying, setApplying] = useState(false)
  const [applied, setApplied] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    api.get(`/clubs/${id}`).then((res) => { setClub(res.data.club); setLoading(false) })
  }, [id])

  const handleApply = async () => {
    if (!user) { navigate('/'); return }
    setApplying(true); setMsg('')
    try {
      await api.post('/applications', { clubId: id, formData: {} })
      setApplied(true); setMsg('报名成功！请等待社团审核。')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { code?: string } } } }
      const code = e.response?.data?.error?.code
      if (code === 'APPLICATION_DUPLICATE') setMsg('您已提交过申请，请勿重复报名')
      else if (code === 'CLUB_CAPACITY_FULL') setMsg('该社团名额已满')
      else setMsg('报名失败，请稍后重试')
    } finally { setApplying(false) }
  }

  if (loading) return <div style={s.loading}>加载中...</div>
  if (!club) return <div style={s.loading}>社团不存在</div>

  const typeInfo = TYPE_LABELS[club.type] ?? { label: club.type, color: theme.colors.primary, bg: theme.colors.primaryLight }
  const fillPct = club.capacity > 0 ? Math.min(100, Math.round((club.currentCount / club.capacity) * 100)) : 0

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate(-1)}>← 返回</button>

      <div style={s.layout}>
        {/* 主内容 */}
        <div style={s.main}>
          <div style={s.card}>
            <div style={{ ...s.cardTopBar, background: typeInfo.color }} />
            <div style={s.cardBody}>
              <div style={s.headerRow}>
                <span style={{ ...s.typeChip, color: typeInfo.color, background: typeInfo.bg }}>{typeInfo.label}</span>
                {!club.isOpen && <span style={s.fullBadge}>名额已满</span>}
              </div>
              <h1 style={s.name}>{club.name}</h1>
              <p style={s.desc}>{club.description}</p>

              <div style={s.section}>
                <h4 style={s.sectionTitle}>社团标签</h4>
                <div style={s.tags}>
                  {club.tags.map((t) => (
                    <span key={t} style={s.tag}>{t}</span>
                  ))}
                </div>
              </div>

              {club.photos.length > 0 && (
                <div style={s.section}>
                  <h4 style={s.sectionTitle}>活动照片</h4>
                  <div style={s.photos}>
                    {club.photos.map((url, i) => (
                      <img key={i} src={url} alt={`活动照片${i + 1}`} style={s.photo} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* 侧边栏 */}
        <div style={s.sidebar}>
          <div style={s.infoCard}>
            <h4 style={s.infoTitle}>招新信息</h4>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>招新状态</span>
              <span style={{ color: club.isOpen ? theme.colors.success : theme.colors.danger, fontWeight: 600, fontSize: 14 }}>
                {club.isOpen ? '🟢 招新中' : '🔴 已截止'}
              </span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>招新名额</span>
              <span style={s.infoValue}>{club.capacity} 人</span>
            </div>
            <div style={s.infoRow}>
              <span style={s.infoLabel}>已录取</span>
              <span style={s.infoValue}>{club.currentCount} 人</span>
            </div>

            <div style={s.progressSection}>
              <div style={s.progressLabel}>
                <span style={{ fontSize: 12, color: theme.colors.textMuted }}>名额使用率</span>
                <span style={{ fontSize: 12, fontWeight: 600, color: typeInfo.color }}>{fillPct}%</span>
              </div>
              <div style={s.progressBg}>
                <div style={{ ...s.progressFill, width: `${fillPct}%`, background: typeInfo.color }} />
              </div>
            </div>

            {msg && (
              <div style={{ ...s.msgBox, background: applied ? theme.colors.successLight : theme.colors.dangerLight, color: applied ? theme.colors.success : theme.colors.danger }}>
                {msg}
              </div>
            )}

            {user?.role === 'student' && club.isOpen && !applied && (
              <button style={s.applyBtn} onClick={handleApply} disabled={applying}>
                {applying ? '提交中...' : '立即报名'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 960, margin: '0 auto' },
  loading: { textAlign: 'center', padding: '80px 0', color: theme.colors.textMuted },
  back: { background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', fontSize: 14, marginBottom: 20, padding: 0, fontWeight: 500 },
  layout: { display: 'grid', gridTemplateColumns: '1fr 280px', gap: 20, alignItems: 'start' },
  main: {},
  card: { background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, overflow: 'hidden' },
  cardTopBar: { height: 6 },
  cardBody: { padding: '28px 32px' },
  headerRow: { display: 'flex', gap: 8, marginBottom: 14 },
  typeChip: { borderRadius: theme.radius.full, padding: '4px 14px', fontSize: 13, fontWeight: 600 },
  fullBadge: { background: theme.colors.dangerLight, color: theme.colors.danger, borderRadius: theme.radius.full, padding: '4px 12px', fontSize: 13, fontWeight: 600 },
  name: { fontSize: 26, fontWeight: 700, color: theme.colors.text, marginBottom: 12 },
  desc: { fontSize: 15, color: theme.colors.textSecondary, lineHeight: 1.8, marginBottom: 24 },
  section: { marginBottom: 24 },
  sectionTitle: { fontSize: 14, fontWeight: 600, color: theme.colors.text, marginBottom: 10 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  tag: { background: '#f3f4f6', color: theme.colors.textSecondary, borderRadius: theme.radius.sm, padding: '4px 12px', fontSize: 13 },
  photos: { display: 'flex', gap: 10, flexWrap: 'wrap' },
  photo: { width: 160, height: 110, objectFit: 'cover', borderRadius: theme.radius.md },
  sidebar: {},
  infoCard: { background: theme.colors.surface, borderRadius: theme.radius.lg, padding: '24px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` },
  infoTitle: { fontSize: 15, fontWeight: 700, color: theme.colors.text, marginBottom: 16 },
  infoRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: `1px solid ${theme.colors.border}` },
  infoLabel: { fontSize: 13, color: theme.colors.textMuted },
  infoValue: { fontSize: 14, fontWeight: 600, color: theme.colors.text },
  progressSection: { marginTop: 16, marginBottom: 16 },
  progressLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 6 },
  progressBg: { height: 6, background: '#f3f4f6', borderRadius: 3, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 3, transition: 'width 0.3s' },
  msgBox: { borderRadius: theme.radius.sm, padding: '10px 14px', fontSize: 13, marginBottom: 12 },
  applyBtn: { width: '100%', padding: '12px', borderRadius: theme.radius.md, background: theme.colors.primary, color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer', fontWeight: 600 },
}
