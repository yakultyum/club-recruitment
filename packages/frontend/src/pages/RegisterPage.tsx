import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

export default function RegisterPage() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState<'student' | 'club_admin'>('student')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await register(email, password, role)
      if (role === 'student') {
        navigate('/profile/setup')
      } else {
        navigate('/')
      }
    } catch {
      setError('注册失败，该邮箱可能已被使用')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>注册账号</h2>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            style={styles.input}
            type="email"
            placeholder="邮箱"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <input
            style={styles.input}
            type="password"
            placeholder="密码（至少 6 位）"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={6}
            required
          />
          <div style={styles.roleGroup}>
            <label style={styles.roleLabel}>
              <input
                type="radio"
                value="student"
                checked={role === 'student'}
                onChange={() => setRole('student')}
              />
              &nbsp;我是新生
            </label>
            <label style={styles.roleLabel}>
              <input
                type="radio"
                value="club_admin"
                checked={role === 'club_admin'}
                onChange={() => setRole('club_admin')}
              />
              &nbsp;我是社团管理员
            </label>
          </div>
          {error && <p style={styles.error}>{error}</p>}
          <button style={styles.btn} type="submit" disabled={loading}>
            {loading ? '注册中...' : '注册'}
          </button>
        </form>
        <p style={styles.link}>
          已有账号？<Link to="/login">立即登录</Link>
        </p>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff' },
  card: { background: '#fff', borderRadius: 12, padding: '40px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', width: 380 },
  title: { textAlign: 'center', marginBottom: 24, color: '#1a1a2e' },
  form: { display: 'flex', flexDirection: 'column', gap: 12 },
  input: { padding: '10px 14px', borderRadius: 8, border: '1px solid #ddd', fontSize: 14, outline: 'none' },
  roleGroup: { display: 'flex', gap: 24, padding: '8px 0' },
  roleLabel: { fontSize: 14, cursor: 'pointer', display: 'flex', alignItems: 'center' },
  btn: { padding: '12px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer', marginTop: 4 },
  error: { color: '#e53e3e', fontSize: 13, margin: 0 },
  link: { textAlign: 'center', marginTop: 16, fontSize: 14, color: '#666' },
}
