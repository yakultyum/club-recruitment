import { useState, useEffect } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import api from '../../api'
import type { ClubType } from '../../types'
import { theme } from '../../styles/theme'

const TYPE_OPTIONS: { value: ClubType; label: string; emoji: string }[] = [
  { value: 'arts', label: '文艺', emoji: '🎨' },
  { value: 'sports', label: '体育', emoji: '⚽' },
  { value: 'academic', label: '学术', emoji: '📚' },
  { value: 'charity', label: '公益', emoji: '💚' },
  { value: 'tech', label: '科技', emoji: '💻' },
]

export default function ClubFormPage() {
  const { id } = useParams<{ id?: string }>()
  const navigate = useNavigate()
  const isEdit = Boolean(id)

  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [type, setType] = useState<ClubType>('arts')
  const [tags, setTags] = useState('')
  const [capacity, setCapacity] = useState(30)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (isEdit) {
      api.get(`/clubs/${id}`).then((res) => {
        const c = res.data.club
        setName(c.name); setDescription(c.description)
        setType(c.type); setTags(c.tags.join('，')); setCapacity(c.capacity)
      })
    }
  }, [id, isEdit])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('')
    if (name.length < 2 || name.length > 50) { setError('社团名称长度必须在 2 到 50 个字符之间'); return }
    setLoading(true)
    const data = { name, description, type, tags: tags.split(/[，,、\s]+/).filter(Boolean), capacity }
    try {
      if (isEdit) await api.put(`/clubs/${id}`, data)
      else await api.post('/clubs', data)
      navigate('/admin/clubs')
    } catch (err: unknown) {
      const e = err as { response?: { data?: { error?: { code?: string; message?: string } } } }
      const code = e.response?.data?.error?.code
      const msg = e.response?.data?.error?.message
      if (code === 'CLUB_NAME_DUPLICATE') setError('该社团名称已存在')
      else if (code === 'CLUB_NAME_INVALID') setError('社团名称长度必须在 2 到 50 个字符之间')
      else if (code === 'FORBIDDEN') setError('权限不足：请切换到管理员端后再试')
      else setError(`保存失败：${msg || '请重试'}`)
    } finally { setLoading(false) }
  }

  return (
    <div style={s.container}>
      <button style={s.back} onClick={() => navigate(-1)}>← 返回</button>
      <h1 style={s.pageTitle}>{isEdit ? '编辑社团' : '创建社团'}</h1>

      <div style={s.card}>
        <form onSubmit={handleSubmit} style={s.form}>
          <div style={s.field}>
            <label style={s.label}>社团名称 <span style={s.required}>*</span></label>
            <input style={s.input} value={name} onChange={(e) => setName(e.target.value)} placeholder="2-50 个字符" required />
          </div>

          <div style={s.field}>
            <label style={s.label}>社团简介 <span style={s.required}>*</span></label>
            <textarea style={s.textarea} value={description} onChange={(e) => setDescription(e.target.value)} rows={4} required />
          </div>

          <div style={s.field}>
            <label style={s.label}>社团类型 <span style={s.required}>*</span></label>
            <div style={s.typeGrid}>
              {TYPE_OPTIONS.map((o) => (
                <button
                  key={o.value}
                  type="button"
                  style={{ ...s.typeBtn, ...(type === o.value ? s.typeBtnActive : {}) }}
                  onClick={() => setType(o.value)}
                >
                  {o.emoji} {o.label}
                </button>
              ))}
            </div>
          </div>

          <div style={s.field}>
            <label style={s.label}>特征标签 <span style={s.hint}>（用逗号分隔）</span></label>
            <input style={s.input} value={tags} onChange={(e) => setTags(e.target.value)} placeholder="例：音乐，表演，创作" />
          </div>

          <div style={s.field}>
            <label style={s.label}>招新名额 <span style={s.required}>*</span></label>
            <input style={{ ...s.input, maxWidth: 160 }} type="number" min={1} value={capacity} onChange={(e) => setCapacity(Number(e.target.value))} required />
          </div>

          {error && <div style={s.errorBox}>{error}</div>}

          <div style={s.actions}>
            <button type="button" style={s.cancelBtn} onClick={() => navigate(-1)}>取消</button>
            <button type="submit" style={s.submitBtn} disabled={loading}>
              {loading ? '保存中...' : (isEdit ? '保存修改' : '创建社团')}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

const s: Record<string, React.CSSProperties> = {
  container: { maxWidth: 640, margin: '0 auto' },
  back: { background: 'none', border: 'none', color: theme.colors.primary, cursor: 'pointer', fontSize: 14, marginBottom: 16, padding: 0, fontWeight: 500 },
  pageTitle: { fontSize: 24, fontWeight: 700, color: theme.colors.text, marginBottom: 20 },
  card: { background: theme.colors.surface, borderRadius: theme.radius.lg, padding: '32px', boxShadow: theme.shadow.sm, border: `1px solid ${theme.colors.border}` },
  form: { display: 'flex', flexDirection: 'column', gap: 20 },
  field: { display: 'flex', flexDirection: 'column', gap: 8 },
  label: { fontSize: 14, fontWeight: 600, color: theme.colors.text },
  required: { color: theme.colors.danger },
  hint: { fontWeight: 400, color: theme.colors.textMuted, fontSize: 13 },
  input: { padding: '10px 14px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, fontSize: 14, outline: 'none', background: '#f9fafb', width: '100%' },
  textarea: { padding: '10px 14px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, fontSize: 14, outline: 'none', resize: 'vertical', background: '#f9fafb' },
  typeGrid: { display: 'flex', gap: 8, flexWrap: 'wrap' },
  typeBtn: { padding: '8px 18px', borderRadius: theme.radius.sm, border: `1px solid ${theme.colors.border}`, background: '#f9fafb', cursor: 'pointer', fontSize: 14, color: theme.colors.textSecondary, transition: 'all 0.15s' },
  typeBtnActive: { background: theme.colors.primary, color: '#fff', borderColor: theme.colors.primary },
  errorBox: { background: theme.colors.dangerLight, color: theme.colors.danger, borderRadius: theme.radius.sm, padding: '10px 14px', fontSize: 13 },
  actions: { display: 'flex', gap: 12, justifyContent: 'flex-end', paddingTop: 8 },
  cancelBtn: { padding: '10px 24px', borderRadius: theme.radius.md, border: `1px solid ${theme.colors.border}`, background: theme.colors.surface, cursor: 'pointer', fontSize: 14, color: theme.colors.text },
  submitBtn: { padding: '10px 28px', borderRadius: theme.radius.md, background: theme.colors.primary, color: '#fff', border: 'none', cursor: 'pointer', fontSize: 14, fontWeight: 600 },
}
