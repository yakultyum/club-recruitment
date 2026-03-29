import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'
import api from '../../api'
import type { ClubStats, DailyTrend, TagDistribution } from '../../types'

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']

export default function StatsDashboardPage() {
  const { clubId } = useParams<{ clubId: string }>()
  const navigate = useNavigate()
  const [stats, setStats] = useState<ClubStats | null>(null)
  const [trend, setTrend] = useState<DailyTrend[]>([])
  const [tagDist, setTagDist] = useState<TagDistribution[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([
      api.get(`/clubs/${clubId}/stats`),
      api.get(`/clubs/${clubId}/stats/trend?days=30`),
      api.get(`/clubs/${clubId}/stats/tags`),
    ]).then(([s, t, d]) => {
      setStats(s.data.stats)
      setTrend(t.data.trend)
      setTagDist(d.data.distribution.slice(0, 10))
    }).finally(() => setLoading(false))
  }, [clubId])

  if (loading) return <div style={styles.loading}>加载中...</div>
  if (!stats) return <div style={styles.loading}>暂无数据</div>

  const statCards = [
    { label: '申请总数', value: stats.total, color: '#4f46e5' },
    { label: '待审核', value: stats.pending, color: '#d97706' },
    { label: '已通过', value: stats.approved, color: '#059669' },
    { label: '未通过', value: stats.rejected, color: '#dc2626' },
  ]

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <button style={styles.back} onClick={() => navigate(-1)}>← 返回</button>
        <h2 style={styles.title}>招新数据统计</h2>
      </div>

      <div style={styles.cards}>
        {statCards.map((c) => (
          <div key={c.label} style={{ ...styles.card, borderTop: `4px solid ${c.color}` }}>
            <p style={styles.cardLabel}>{c.label}</p>
            <p style={{ ...styles.cardValue, color: c.color }}>{c.value}</p>
          </div>
        ))}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>过去 30 天申请趋势</h3>
        {trend.length === 0 ? (
          <p style={styles.hint}>暂无数据</p>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={trend}>
              <XAxis dataKey="date" tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
              <Tooltip />
              <Bar dataKey="count" fill="#4f46e5" radius={[4, 4, 0, 0]} name="申请数" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>

      <div style={styles.section}>
        <h3 style={styles.sectionTitle}>申请者兴趣标签分布（Top 10）</h3>
        {tagDist.length === 0 ? (
          <p style={styles.hint}>暂无数据</p>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={tagDist} dataKey="count" nameKey="tag" cx="50%" cy="50%" outerRadius={90} label>
                {tagDist.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  )
}

const styles: Record<string, React.CSSProperties> = {
  container: { padding: '24px 0' },
  loading: { textAlign: 'center', padding: '80px 0', color: '#999' },
  header: { display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24 },
  back: { background: 'none', border: 'none', color: '#4f46e5', cursor: 'pointer', fontSize: 14, padding: 0 },
  title: { fontSize: 22, color: '#1a1a2e', margin: 0 },
  cards: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 32 },
  card: { background: '#fff', borderRadius: 10, padding: '20px 24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)' },
  cardLabel: { color: '#666', fontSize: 13, margin: '0 0 8px' },
  cardValue: { fontSize: 32, fontWeight: 700, margin: 0 },
  section: { background: '#fff', borderRadius: 12, padding: '24px', boxShadow: '0 2px 10px rgba(0,0,0,0.06)', marginBottom: 20 },
  sectionTitle: { fontSize: 16, color: '#1a1a2e', marginBottom: 16 },
  hint: { color: '#999', textAlign: 'center', padding: '20px 0' },
}
