import { useState } from 'react'
import { useNavigate, NavLink } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { theme } from '../styles/theme'

export default function Navbar() {
  const { user, switchDemo } = useAuth()
  const navigate = useNavigate()
  const [switching, setSwitching] = useState(false)

  const isStudent = user?.role === 'student'
  const isAdmin = user?.role === 'club_admin'

  const handleSwitch = async (role: 'student' | 'club_admin') => {
    if (switching || user?.role === role) return
    setSwitching(true)
    await switchDemo(role)
    setSwitching(false)
    navigate(role === 'student' ? '/' : '/admin/clubs')
  }

  return (
    <>
      {/* Demo 切换条 */}
      <div style={s.demoBar}>
        <span style={s.demoLabel}>🎭 Demo 演示模式</span>
        <div style={s.switchGroup}>
          <button
            style={{ ...s.switchBtn, ...(isStudent ? s.switchActive : {}) }}
            onClick={() => handleSwitch('student')}
            disabled={switching}
          >
            👤 学生端
          </button>
          <button
            style={{ ...s.switchBtn, ...(isAdmin ? s.switchActive : {}) }}
            onClick={() => handleSwitch('club_admin')}
            disabled={switching}
          >
            🏫 管理员端
          </button>
        </div>
        {switching && <span style={{ color: '#a5b4fc', fontSize: 12 }}>切换中...</span>}
      </div>

      {/* 主导航 */}
      <nav style={s.nav}>
        <div style={s.navInner}>
          <div style={s.brand} onClick={() => navigate('/')}>
            <div style={s.brandIcon}>🎓</div>
            <span style={s.brandText}>社团招新平台</span>
          </div>

          <div style={s.links}>
            {isStudent && (
              <>
                <NavLink to="/" end style={navLinkStyle}>推荐</NavLink>
                <NavLink to="/search" style={navLinkStyle}>探索</NavLink>
                <NavLink to="/applications" style={navLinkStyle}>我的申请</NavLink>
                <NavLink to="/notifications" style={navLinkStyle}>通知</NavLink>
              </>
            )}
            {isAdmin && (
              <NavLink to="/admin/clubs" style={navLinkStyle}>我的社团</NavLink>
            )}
          </div>

          <div style={s.userArea}>
            <div style={s.roleChip}>
              {isStudent ? '学生' : '管理员'}
            </div>
            <span style={s.email}>{user?.email}</span>
          </div>
        </div>
      </nav>
    </>
  )
}

const navLinkStyle = ({ isActive }: { isActive: boolean }): React.CSSProperties => ({
  color: isActive ? theme.colors.primary : theme.colors.textSecondary,
  textDecoration: 'none',
  fontSize: 14,
  fontWeight: isActive ? 600 : 400,
  padding: '6px 12px',
  borderRadius: theme.radius.sm,
  background: isActive ? theme.colors.primaryLight : 'transparent',
  transition: 'all 0.15s',
})

const s: Record<string, React.CSSProperties> = {
  demoBar: {
    display: 'flex', alignItems: 'center', gap: 16,
    padding: '8px 32px',
    background: '#1e1b4b',
    color: '#fff', fontSize: 13,
  },
  demoLabel: { color: '#a5b4fc', fontWeight: 600, fontSize: 12, letterSpacing: '0.05em' },
  switchGroup: { display: 'flex', gap: 4, background: 'rgba(255,255,255,0.1)', borderRadius: 8, padding: 3 },
  switchBtn: {
    padding: '4px 14px', borderRadius: 6, border: 'none',
    background: 'transparent', color: '#c7d2fe', cursor: 'pointer', fontSize: 13,
    transition: 'all 0.15s',
  },
  switchActive: { background: theme.colors.primary, color: '#fff' },
  nav: {
    background: theme.colors.surface,
    borderBottom: `1px solid ${theme.colors.border}`,
    position: 'sticky', top: 0, zIndex: 100,
    boxShadow: theme.shadow.sm,
  },
  navInner: {
    maxWidth: 1200, margin: '0 auto',
    display: 'flex', alignItems: 'center',
    padding: '0 32px', height: 60, gap: 32,
  },
  brand: { display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', flexShrink: 0 },
  brandIcon: {
    width: 36, height: 36, borderRadius: 10,
    background: `linear-gradient(135deg, ${theme.colors.primary}, ${theme.colors.primaryDark})`,
    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18,
  },
  brandText: { fontSize: 16, fontWeight: 700, color: theme.colors.text },
  links: { display: 'flex', gap: 4, flex: 1 },
  userArea: { display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 },
  roleChip: {
    background: theme.colors.primaryLight, color: theme.colors.primary,
    borderRadius: theme.radius.full, padding: '3px 12px', fontSize: 12, fontWeight: 600,
  },
  email: { fontSize: 13, color: theme.colors.textMuted, maxWidth: 160, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' },
}
