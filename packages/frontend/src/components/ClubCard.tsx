import { useNavigate } from 'react-router-dom'
import type { Club } from '../types'
import { theme } from '../styles/theme'

const TYPE_LABELS: Record<string, { label: string; color: string; bg: string }> = {
  arts:     { label: '文艺', color: '#7c3aed', bg: '#ede9fe' },
  sports:   { label: '体育', color: '#059669', bg: '#d1fae5' },
  academic: { label: '学术', color: '#2563eb', bg: '#dbeafe' },
  charity:  { label: '公益', color: '#d97706', bg: '#fef3c7' },
  tech:     { label: '科技', color: '#0891b2', bg: '#cffafe' },
}

interface Props {
  club: Club
  score?: number
}

export default function ClubCard({ club, score }: Props) {
  const navigate = useNavigate()
  const typeInfo = TYPE_LABELS[club.type] ?? { label: club.type, color: theme.colors.primary, bg: theme.colors.primaryLight }
  const fillPct = club.capacity > 0 ? Math.min(100, Math.round((club.currentCount / club.capacity) * 100)) : 0

  return (
    <div
      style={s.card}
      onClick={() => navigate(`/clubs/${club.id}`)}
      onMouseEnter={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)'; (e.currentTarget as HTMLDivElement).style.boxShadow = theme.shadow.lg }}
      onMouseLeave={(e) => { (e.currentTarget as HTMLDivElement).style.transform = 'none'; (e.currentTarget as HTMLDivElement).style.boxShadow = theme.shadow.sm }}
    >
      {/* 顶部色条 */}
      <div style={{ ...s.topBar, background: typeInfo.color }} />

      <div style={s.body}>
        <div style={s.headerRow}>
          <span style={{ ...s.typeChip, color: typeInfo.color, background: typeInfo.bg }}>{typeInfo.label}</span>
          <div style={s.badges}>
            {!club.isOpen && <span style={s.fullBadge}>名额已满</span>}
            {score !== undefined && score > 0 && (
              <span style={s.scoreBadge}>{score}% 匹配</span>
            )}
          </div>
        </div>

        <h3 style={s.name}>{club.name}</h3>
        <p style={s.desc}>{club.description.slice(0, 72)}{club.description.length > 72 ? '…' : ''}</p>

        <div style={s.tags}>
          {club.tags.slice(0, 3).map((t) => (
            <span key={t} style={s.tag}>{t}</span>
          ))}
        </div>

        {/* 名额进度条 */}
        <div style={s.progressSection}>
          <div style={s.progressLabel}>
            <span style={{ fontSize: 12, color: theme.colors.textMuted }}>招新进度</span>
            <span style={{ fontSize: 12, color: theme.colors.textSecondary }}>{club.currentCount}/{club.capacity}</span>
          </div>
          <div style={s.progressBg}>
            <div style={{ ...s.progressFill, width: `${fillPct}%`, background: typeInfo.color }} />
          </div>
        </div>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  card: {
    background: theme.colors.surface,
    borderRadius: theme.radius.lg,
    boxShadow: theme.shadow.sm,
    cursor: 'pointer',
    transition: 'transform 0.2s, box-shadow 0.2s',
    overflow: 'hidden',
    border: `1px solid ${theme.colors.border}`,
  },
  topBar: { height: 4 },
  body: { padding: '16px 20px 20px' },
  headerRow: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  typeChip: { borderRadius: theme.radius.full, padding: '3px 10px', fontSize: 12, fontWeight: 600 },
  badges: { display: 'flex', gap: 6 },
  fullBadge: { background: theme.colors.dangerLight, color: theme.colors.danger, borderRadius: theme.radius.full, padding: '2px 8px', fontSize: 11, fontWeight: 600 },
  scoreBadge: { background: theme.colors.successLight, color: theme.colors.success, borderRadius: theme.radius.full, padding: '2px 8px', fontSize: 11, fontWeight: 600 },
  name: { fontSize: 16, fontWeight: 700, color: theme.colors.text, marginBottom: 6, lineHeight: 1.3 },
  desc: { fontSize: 13, color: theme.colors.textSecondary, lineHeight: 1.6, marginBottom: 12 },
  tags: { display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 14 },
  tag: { background: '#f3f4f6', color: theme.colors.textSecondary, borderRadius: theme.radius.sm, padding: '2px 8px', fontSize: 12 },
  progressSection: {},
  progressLabel: { display: 'flex', justifyContent: 'space-between', marginBottom: 4 },
  progressBg: { height: 4, background: '#f3f4f6', borderRadius: 2, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 2, transition: 'width 0.3s' },
}
