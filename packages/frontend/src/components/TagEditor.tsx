import { useState, useEffect } from 'react'
import api from '../api'
import { theme } from '../styles/theme'

const PRESET_TAGS = [
  '音乐', '舞蹈', '戏剧', '绘画', '摄影', '书法', '文学',
  '篮球', '足球', '羽毛球', '乒乓球', '游泳', '跑步', '健身',
  '编程', '人工智能', '机器人', '电子竞技', '数学', '物理', '化学',
  '志愿服务', '环保', '支教', '公益', '心理健康', '创业', '辩论',
]

interface Props { onTagsUpdated: () => void }

export default function TagEditor({ onTagsUpdated }: Props) {
  const [currentTags, setCurrentTags] = useState<string[]>([])
  const [input, setInput] = useState('')
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState('')
  const [expanded, setExpanded] = useState(false)

  useEffect(() => {
    api.get('/profile').then((res) => setCurrentTags(res.data.profile?.tags ?? [])).catch(() => {})
  }, [])

  const addTag = (tag: string) => {
    const t = tag.trim()
    if (!t || currentTags.includes(t)) return
    setCurrentTags([...currentTags, t]); setInput('')
  }

  const removeTag = (tag: string) => setCurrentTags(currentTags.filter((t) => t !== tag))

  const handleSave = async () => {
    if (currentTags.length === 0) { setMsg('至少保留 1 个标签'); return }
    setSaving(true); setMsg('')
    try {
      await api.put('/profile/tags', { tags: currentTags })
      setMsg('✓ 已更新，正在刷新推荐...')
      setTimeout(() => { setMsg(''); onTagsUpdated() }, 800)
    } catch { setMsg('保存失败，请重试') }
    finally { setSaving(false) }
  }

  return (
    <div style={s.container}>
      <div style={s.header} onClick={() => setExpanded(!expanded)}>
        <div style={s.headerLeft}>
          <div style={s.headerIcon}>🏷️</div>
          <div>
            <p style={s.headerTitle}>我的兴趣标签</p>
            <p style={s.headerSub}>{currentTags.length} 个标签 · 影响推荐结果</p>
          </div>
        </div>
        <div style={s.headerRight}>
          <div style={s.tagPreview}>
            {currentTags.slice(0, 3).map((t) => (
              <span key={t} style={s.previewTag}>{t}</span>
            ))}
            {currentTags.length > 3 && <span style={s.more}>+{currentTags.length - 3}</span>}
          </div>
          <span style={s.toggle}>{expanded ? '收起 ▲' : '编辑 ▼'}</span>
        </div>
      </div>

      {expanded && (
        <div style={s.body}>
          <div style={s.section}>
            <p style={s.sectionLabel}>当前标签 <span style={s.hint}>（点击删除）</span></p>
            <div style={s.tagRow}>
              {currentTags.length === 0 ? (
                <span style={s.empty}>暂无标签，请从下方添加</span>
              ) : currentTags.map((t) => (
                <span key={t} style={s.activeTag} onClick={() => removeTag(t)}>
                  {t} <span style={{ opacity: 0.7 }}>✕</span>
                </span>
              ))}
            </div>
          </div>

          <div style={s.section}>
            <p style={s.sectionLabel}>自定义添加</p>
            <div style={s.inputRow}>
              <input
                style={s.input}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="输入标签名称，按 Enter 添加..."
                onKeyDown={(e) => e.key === 'Enter' && addTag(input)}
              />
              <button style={s.addBtn} onClick={() => addTag(input)}>+ 添加</button>
            </div>
          </div>

          <div style={s.section}>
            <p style={s.sectionLabel}>快速选择</p>
            <div style={s.tagRow}>
              {PRESET_TAGS.filter((t) => !currentTags.includes(t)).map((t) => (
                <span key={t} style={s.presetTag} onClick={() => addTag(t)}>{t}</span>
              ))}
            </div>
          </div>

          {msg && (
            <p style={{ color: msg.includes('失败') ? theme.colors.danger : theme.colors.success, fontSize: 13, marginBottom: 8 }}>{msg}</p>
          )}

          <button style={s.saveBtn} onClick={handleSave} disabled={saving}>
            {saving ? '保存中...' : '💾 保存并刷新推荐'}
          </button>
        </div>
      )}
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { background: theme.colors.surface, borderRadius: theme.radius.lg, boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}`, marginBottom: 20, overflow: 'hidden' },
  header: { display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', cursor: 'pointer', userSelect: 'none' },
  headerLeft: { display: 'flex', alignItems: 'center', gap: 12 },
  headerIcon: { width: 40, height: 40, borderRadius: theme.radius.md, background: theme.colors.primaryLight, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 },
  headerTitle: { fontSize: 15, fontWeight: 600, color: theme.colors.text },
  headerSub: { fontSize: 12, color: theme.colors.textMuted, marginTop: 2 },
  headerRight: { display: 'flex', alignItems: 'center', gap: 12 },
  tagPreview: { display: 'flex', gap: 6 },
  previewTag: { background: theme.colors.primaryLight, color: theme.colors.primary, borderRadius: theme.radius.full, padding: '2px 10px', fontSize: 12, fontWeight: 500 },
  more: { color: theme.colors.textMuted, fontSize: 12 },
  toggle: { color: theme.colors.primary, fontSize: 13, fontWeight: 500, whiteSpace: 'nowrap' },
  body: { padding: '0 20px 20px', borderTop: `1px solid ${theme.colors.border}` },
  section: { marginTop: 16 },
  sectionLabel: { fontSize: 13, fontWeight: 600, color: theme.colors.text, marginBottom: 10 },
  hint: { fontWeight: 400, color: theme.colors.textMuted },
  tagRow: { display: 'flex', flexWrap: 'wrap', gap: 8 },
  activeTag: { background: theme.colors.primary, color: '#fff', borderRadius: theme.radius.full, padding: '5px 14px', fontSize: 13, cursor: 'pointer', transition: 'opacity 0.15s' },
  presetTag: { background: '#f9fafb', color: theme.colors.textSecondary, borderRadius: theme.radius.full, padding: '5px 14px', fontSize: 13, cursor: 'pointer', border: `1px solid ${theme.colors.border}`, transition: 'all 0.15s' },
  empty: { color: theme.colors.textMuted, fontSize: 13 },
  inputRow: { display: 'flex', gap: 8 },
  input: { flex: 1, padding: '9px 14px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, fontSize: 14, outline: 'none', background: '#f9fafb' },
  addBtn: { padding: '9px 18px', borderRadius: theme.radius.sm, background: theme.colors.primaryLight, border: 'none', color: theme.colors.primary, cursor: 'pointer', fontSize: 13, fontWeight: 600 },
  saveBtn: { marginTop: 16, width: '100%', padding: '11px', borderRadius: theme.radius.md, background: theme.colors.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
