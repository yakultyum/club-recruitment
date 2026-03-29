import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../api'

const ALL_TAGS = [
  '音乐', '舞蹈', '戏剧', '绘画', '摄影', '书法', '文学',
  '篮球', '足球', '羽毛球', '乒乓球', '游泳', '跑步', '健身',
  '编程', '人工智能', '机器人', '电子竞技', '数学', '物理', '化学',
  '志愿服务', '环保', '支教', '公益', '心理健康', '创业', '辩论',
]

export default function ProfileSetupPage() {
  const navigate = useNavigate()
  const [selected, setSelected] = useState<string[]>([])
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const toggle = (tag: string) => {
    setSelected((prev) =>
      prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
    )
  }

  const handleSubmit = async () => {
    if (selected.length === 0) {
      setError('请至少选择 1 个兴趣标签')
      return
    }
    setError('')
    setLoading(true)
    try {
      await api.post('/profile/tags', { tags: selected })
      navigate('/')
    } catch {
      setError('保存失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h2 style={styles.title}>选择你的兴趣标签</h2>
        <p style={styles.subtitle}>选择感兴趣的方向，系统将为你推荐最匹配的社团</p>
        <div style={styles.tagGrid}>
          {ALL_TAGS.map((tag) => (
            <button
              key={tag}
              style={{
                ...styles.tag,
                ...(selected.includes(tag) ? styles.tagSelected : {}),
              }}
              onClick={() => toggle(tag)}
              type="button"
            >
              {tag}
            </button>
          ))}
        </div>
        <p style={styles.count}>已选 {selected.length} 个</p>
        {error && <p style={styles.error}>{error}</p>}
        <button style={styles.btn} onClick={handleSubmit} disabled={loading}>
          {loading ? '保存中...' : '完成，开始探索社团'}
        </button>
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f0f4ff', padding: 24 },
  card: { background: '#fff', borderRadius: 12, padding: '40px 48px', boxShadow: '0 4px 24px rgba(0,0,0,0.08)', maxWidth: 600, width: '100%' },
  title: { textAlign: 'center', marginBottom: 8, color: '#1a1a2e' },
  subtitle: { textAlign: 'center', color: '#666', marginBottom: 24, fontSize: 14 },
  tagGrid: { display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  tag: { padding: '8px 16px', borderRadius: 20, border: '1.5px solid #ddd', background: '#f9f9f9', cursor: 'pointer', fontSize: 14, transition: 'all 0.15s' },
  tagSelected: { background: '#4f46e5', color: '#fff', borderColor: '#4f46e5' },
  count: { color: '#888', fontSize: 13, marginBottom: 8 },
  btn: { width: '100%', padding: '12px', borderRadius: 8, background: '#4f46e5', color: '#fff', border: 'none', fontSize: 15, cursor: 'pointer', marginTop: 8 },
  error: { color: '#e53e3e', fontSize: 13 },
}
