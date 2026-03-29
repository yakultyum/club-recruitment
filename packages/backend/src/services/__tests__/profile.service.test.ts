import { describe, it, expect, vi, beforeEach } from 'vitest'

// mock 数据库连接池
vi.mock('../../db', () => ({
  default: {
    query: vi.fn(),
  },
}))

import pool from '../../db'
import { createProfile, updateTags, getProfile } from '../profile.service'

const mockQuery = pool.query as ReturnType<typeof vi.fn>

const mockProfile = {
  id: 'profile-uuid-1',
  studentId: 'student-uuid-1',
  tags: ['音乐', '篮球', '编程'],
  updatedAt: new Date('2024-01-01T00:00:00Z'),
}

beforeEach(() => {
  vi.clearAllMocks()
})

describe('createProfile', () => {
  it('应插入画像并返回 StudentProfile', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfile] })

    const result = await createProfile('student-uuid-1', ['音乐', '篮球', '编程'])

    expect(result).toEqual(mockProfile)
    expect(mockQuery).toHaveBeenCalledOnce()
    const [sql, params] = mockQuery.mock.calls[0]
    expect(sql).toContain('INSERT INTO student_profiles')
    expect(params).toEqual(['student-uuid-1', ['音乐', '篮球', '编程']])
  })

  it('应将 studentId 和 tags 正确传入查询', async () => {
    const tags = ['科技', '公益']
    mockQuery.mockResolvedValueOnce({ rows: [{ ...mockProfile, tags }] })

    const result = await createProfile('student-uuid-2', tags)

    expect(result.tags).toEqual(tags)
  })
})

describe('updateTags', () => {
  it('应使用 upsert 更新标签并返回 StudentProfile', async () => {
    const updatedProfile = { ...mockProfile, tags: ['舞蹈', '足球'] }
    mockQuery.mockResolvedValueOnce({ rows: [updatedProfile] })

    const result = await updateTags('student-uuid-1', ['舞蹈', '足球'])

    expect(result.tags).toEqual(['舞蹈', '足球'])
    const [sql] = mockQuery.mock.calls[0]
    expect(sql).toContain('ON CONFLICT')
    expect(sql).toContain('DO UPDATE')
  })

  it('应在 SQL 中包含 student_id 参数', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfile] })

    await updateTags('student-uuid-1', ['音乐'])

    const [, params] = mockQuery.mock.calls[0]
    expect(params[0]).toBe('student-uuid-1')
  })
})

describe('getProfile', () => {
  it('存在时应返回 StudentProfile', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [mockProfile] })

    const result = await getProfile('student-uuid-1')

    expect(result).toEqual(mockProfile)
  })

  it('不存在时应返回 null', async () => {
    mockQuery.mockResolvedValueOnce({ rows: [] })

    const result = await getProfile('nonexistent-id')

    expect(result).toBeNull()
  })
})
