import { useState, useEffect, useRef } from 'react'
import api from '../api'
import ClubCard from '../components/ClubCard'
import type { Club, ClubType } from '../types'
import { theme } from '../styles/theme'

const TYPE_OPTIONS: { value: ClubType | ''; label: string; emoji: string }[] = [
  { value: '', label: '全部', emoji: '🌐' },
  { value: 'arts', label: '文艺', emoji: '🎨' },
  { value: 'sports', label: '体育', emoji: '⚽' },
  { value: 'academic', label: '学术', emoji: '📚' },
  { value: 'charity', label: '公益', emoji: '💚' },
  { value: 'tech', label: '科技', emoji: '💻' },
]

export default function SearchPage() {
  const [keyword, setKeyword] = useState('')
  const [type, setType] = useState<ClubType | ''>('')
  const [clubs, setClubs] = useState<Club[]>([])
  const [total, setTotal] = useState(0)
  const [fallback, setFallback] = useState(false)
  const [loading, setLoading] = useState(false)
  const [page, setPage] = useState(1)
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const search = async (kw: string, t: ClubType | '', p: number) => {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (kw) params.set('keyword', kw)
      if (t) params.set('type', t)
      params.set('page', String(p))
      const res = await api.get(`/clubs?${params.toString()}`)
      setClubs(res.data.clubs)
      setTotal(res.data.total)
      setFallback(res.data.fallback ?? false)
    } catch {
      // ignore
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    debounceRef.current = setTimeout(() => { setPage(1); search(keyword, type, 1) }, 400)
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [keyword, type])

  useEffect(() => { search(keyword, type, page) }, [page])

  const totalPages = Math.ceil(total / 10)

  return (
    <div>
      <div style={s.pageHeader}>
        <h1 style={s.pageTitle}>探索社团</h1>
        <p style={s.pageSubtitle}>发现校园里的精彩社团，找到属于你的圈子</p>
      </div>

      {/* 搜索栏 */}
      <div style={s.searchCard}>
        <div style={s.searchInputWrap}>
          <span style={s.searchIcon}>🔍</span>
          <input
            style={s.searchInput}
            placeholder="搜索社团名称或简介..."
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
          />
          {keyword && (
            <button style={s.clearBtn} onClick={() => setKeyword('')}>✕</button>
          )}
        </div>

        <div style={s.typeFilters}>
          {TYPE_OPTIONS.map((o) => (
            <button
              key={o.value}
              style={{ ...s.typeBtn, ...(type === o.value ? s.typeBtnActive : {}) }}
              onClick={() => setType(o.value)}
            >
              {o.emoji} {o.label}
            </button>
          ))}
        </div>
      </div>

      {fallback && keyword && (
        <div style={s.fallbackTip}>
          💡 未找到「{keyword}」相关社团，为你展示热门社团
        </div>
      )}

      {loading ? (
        <div style={s.grid}>
          {[1,2,3,4,5,6].map((i) => <div key={i} style={s.skeleton} />)}
        </div>
      ) : clubs.length === 0 ? (
        <div style={s.empty}>
          <div style={s.emptyIcon}>🏫</div>
          <p style={s.emptyTitle}>暂无社团数据</p>
        </div>
      ) : (
        <>
          <div style={s.resultInfo}>共 {total} 个社团</div>
          <div style={s.grid}>
            {clubs.map((club) => <ClubCard key={club.id} club={club} />)}
          </div>
          {totalPages > 1 && (
            <div style={s.pagination}>
              <button style={{ ...s.pageBtn, ...(page === 1 ? s.disabled : {}) }} disabled={page === 1} onClick={() => setPage(page - 1)}>← 上一页</button>
              <span style={s.pageInfo}>{page} / {totalPages}</span>
              <button style={{ ...s.pageBtn, ...(page === totalPages ? s.disabled : {}) }} disabled={page === totalPages} onClick={() => setPage(page + 1)}>下一页 →</button>
            </div>
          )}
        </>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  pageHeader: { marginBottom: 20 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text },
  pageSubtitle: { fontSize: 14, color: theme.colors.textMuted, marginTop: 4 },
  searchCard: { background: theme.colors.surface, borderRadius: theme.radius.lg, padding: '20px 24px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginBottom: 20 },
  searchInputWrap: { display: 'flex', alignItems: 'center', gap: 10, background: '#f9fafb', borderRadius: theme.radius.md, padding: '10px 16px', marginBottom: 16, border: `1px solid ${theme.colors.border}` },
  searchIcon: { fontSize: 16, flexShrink: 0 },
  searchInput: { flex: 1, border: 'none', background: 'transparent', fontSize: 15, outline: 'none', color: theme.colors.text },
  clearBtn: { background: 'none', border: 'none', cursor: 'pointer', color: theme.colors.textMuted, fontSize: 14, padding: '0 4px' },
  typeFilters: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  typeBtn: { padding: '6px 16px', borderRadius: theme.radius.full, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: 'pointer', fontSize: 13, color: theme.colors.textSecondary, transition: 'all 0.15s' },
  typeBtnActive: { background: theme.colors.primary, color: '#fff', borderColor: theme.colors.primary },
  fallbackTip: { background: theme.colors.warningLight, color: theme.colors.warning, borderRadius: theme.radius.md, padding: '10px 16px', marginBottom: 16, fontSize: 14 },
  resultInfo: { fontSize: 13, color: theme.colors.textMuted, marginBottom: 12 },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 },
  skeleton: { height: 200, borderRadius: theme.radius.lg, background: '#f0f0f0' },
  empty: { textAlign: 'center', padding: '80px 0' },
  emptyIcon: { fontSize: 48, marginBottom: 12 },
  emptyTitle: { fontSize: 16, color: theme.colors.textMuted },
  pagination: { display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 16, marginTop: 32 },
  pageBtn: { padding: '8px 20px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: 'pointer', fontSize: 14, color: theme.colors.text },
  disabled: { opacity: 0.4, cursor: 'not-allowed' },
  pageInfo: { fontSize: 14, color: theme.colors.textSecondary },
}
