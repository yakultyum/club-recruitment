import { useEffect, useState, useCallback } from 'react'
import api from '../api'
import ClubCard from '../components/ClubCard'
import TagEditor from '../components/TagEditor'
import type { RecommendationItem } from '../types'
import { theme } from '../styles/theme'

export default function RecommendationPage() {
  const [items, setItems] = useState<RecommendationItem[]>([])
  const [total, setTotal] = useState(0)
  const [page, setPage] = useState(1)
  const [loading, setLoading] = useState(true)

  const fetchRecommendations = useCallback(async (p: number) => {
    setLoading(true)
    try {
      const res = await api.get(`/recommendations?page=${p}`)
      setItems(res.data.items)
      setTotal(res.data.total)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchRecommendations(page) }, [page, fetchRecommendations])

  const handleTagsUpdated = () => { setPage(1); fetchRecommendations(1) }
  const totalPages = Math.ceil(total / 10)

  return (
    <div>
      {/* 页头 */}
      <div style={s.pageHeader}>
        <div>
          <h1 style={s.pageTitle}>为你推荐</h1>
          <p style={s.pageSubtitle}>基于你的兴趣标签，智能匹配最适合的社团</p>
        </div>
        {total > 0 && <span style={s.totalBadge}>{total} 个社团</span>}
      </div>

      <TagEditor onTagsUpdated={handleTagsUpdated} />

      {loading ? (
        <div style={s.loadingGrid}>
          {[1,2,3,4,5,6].map((i) => <div key={i} style={s.skeleton} />)}
        </div>
      ) : items.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🔍</div>
          <p style={s.emptyTitle}>暂无推荐</p>
          <p style={s.emptyDesc}>请先完善你的兴趣标签，系统将为你匹配合适的社团</p>
        </div>
      ) : (
        <>
          <div style={s.grid}>
            {items.map(({ club, score }) => (
              <ClubCard key={club.id} club={club} score={score} />
            ))}
          </div>
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button style={{ ...s.pageBtn, ...(page === 1 ? s.pageBtnDisabled : {}) }} disabled={page === 1} onClick={() => setPage(page - 1)}>← 上一页</button>
              <span style={s.pageInfo}>{page} / {totalPages}</span>
              <button style={{ ...s.pageBtn, ...(page === totalPages ? s.pageBtnDisabled : {}) }} disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一页 →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageHeader: { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  totalBadge: { background: theme.colors.primaryLight, color: theme.colors.primary, borderRadius: theme.radius.full, padding: '4px 14px', fontSize: 13, fontWeight: 600 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  loadingGrid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  skeleton: { height: 200, borderRadius: theme.radius.lg, background: 'linear-gradient(90deg, #f0f0f0 25%, #e0e0e0 50%, #f0f0f0 75%)', backgroundSize: '200% 100%', animation: 'shimmer 1.5s infinite' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 16 },
  emptyTitle: { fontSize: 18, fontWeight: 600, color: theme.colors.text, marginBottom: 8 },
  emptyDesc: { fontSize: 14, color: theme.colors.textMuted },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 },
  pageBtn: { padding: '8px 20px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: 'pointer', fontSize: 14, color: theme.colors.text, fontWeight: 500 },
  pageBtnDisabled: { opacity: 0.4, cursor: 'not-allowed' },
  pageInfo: { fontSize: 14, color: theme.colors.textSecondary, minWidth: 60, textAlign: 'center' },
}
