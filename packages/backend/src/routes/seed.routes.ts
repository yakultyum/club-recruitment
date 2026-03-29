import { Router } from 'express'
import type { Request, Response } from 'express'
import pool from '../db'
import bcrypt from 'bcrypt'
import { v4 as uuidv4 } from 'uuid'

const router = Router()

const DEMO_CLUBS = [
  {
    name: '光影摄影社',
    description: '用镜头记录校园生活的每一个精彩瞬间。我们定期举办摄影展、外拍活动和后期修图工作坊，欢迎所有热爱摄影的同学加入，无论你是新手还是老手。',
    type: 'arts',
    tags: ['摄影', '绘画', '创作', '展览'],
    capacity: 40,
    currentCount: 28,
  },
  {
    name: '代码工坊',
    description: '专注于编程技术交流与项目实战的技术社团。涵盖 Web 开发、人工智能、算法竞赛等方向，每周举办技术分享和 Hackathon 活动。',
    type: 'tech',
    tags: ['编程', '人工智能', '算法', '开源'],
    capacity: 60,
    currentCount: 45,
  },
  {
    name: '街舞联盟',
    description: '汇聚热爱街舞文化的同学，涵盖 Breaking、Popping、Locking 等多种风格。每年参加全国高校街舞大赛，多次获得优异成绩。',
    type: 'arts',
    tags: ['舞蹈', '音乐', '表演', '街舞'],
    capacity: 35,
    currentCount: 35,
  },
  {
    name: '篮球协会',
    description: '校内最具活力的体育社团之一，拥有专业训练场地和教练指导。定期举办校内联赛，并代表学校参加市级高校篮球联赛。',
    type: 'sports',
    tags: ['篮球', '健身', '团队合作', '竞技'],
    capacity: 50,
    currentCount: 38,
  },
  {
    name: '绿色地球环保社',
    description: '致力于校园环保宣传和可持续发展实践。组织垃圾分类推广、植树造林、环保创意大赛等活动，让每位同学都成为地球的守护者。',
    type: 'charity',
    tags: ['环保', '公益', '志愿服务', '可持续'],
    capacity: 45,
    currentCount: 22,
  },
  {
    name: '数学建模协会',
    description: '面向对数学和建模感兴趣的同学，每年组织参加全国大学生数学建模竞赛（CUMCM）。提供系统的培训课程和丰富的竞赛经验。',
    type: 'academic',
    tags: ['数学', '建模', '竞赛', '数据分析'],
    capacity: 30,
    currentCount: 18,
  },
  {
    name: '辩论社',
    description: '培养批判性思维和公众演讲能力的精英社团。定期举办校内辩论赛，并代表学校参加华语辩论赛等高水平赛事，欢迎思维敏锐的你。',
    type: 'academic',
    tags: ['辩论', '演讲', '逻辑思维', '写作'],
    capacity: 25,
    currentCount: 20,
  },
  {
    name: '机器人实验室',
    description: '探索机器人技术与人工智能前沿的创新社团。拥有完善的硬件设备，参与 RoboMaster 等国际机器人竞赛，培养未来的工程师。',
    type: 'tech',
    tags: ['机器人', '人工智能', '电子', '创新'],
    capacity: 30,
    currentCount: 27,
  },
  {
    name: '支教志愿团',
    description: '每年暑假组织前往偏远山区开展支教活动，用知识改变孩子们的命运。同时在校内开展学业辅导志愿服务，传递爱与温暖。',
    type: 'charity',
    tags: ['支教', '志愿服务', '公益', '教育'],
    capacity: 40,
    currentCount: 15,
  },
  {
    name: '羽毛球俱乐部',
    description: '轻松愉快的羽毛球爱好者聚集地。提供专业场地和球拍，定期举办友谊赛和技术培训，适合各水平段的同学参与，强身健体，结交朋友。',
    type: 'sports',
    tags: ['羽毛球', '健身', '运动', '休闲'],
    capacity: 60,
    currentCount: 42,
  },
]

// POST /api/seed — 一键生成 demo 数据
router.post('/', async (_req: Request, res: Response) => {
  try {
    // 创建或获取 demo 管理员账号
    const adminEmail = 'demo-admin@example.com'
    let adminId: string

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [adminEmail])
    if (existing.rows.length > 0) {
      adminId = existing.rows[0].id
    } else {
      adminId = uuidv4()
      const hash = await bcrypt.hash('demo123456', 10)
      await pool.query(
        'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4)',
        [adminId, adminEmail, hash, 'club_admin']
      )
    }

    // 插入社团（跳过已存在的）
    let created = 0
    for (const club of DEMO_CLUBS) {
      const dup = await pool.query('SELECT id FROM clubs WHERE name = $1', [club.name])
      if (dup.rows.length > 0) continue

      const isOpen = club.currentCount < club.capacity
      await pool.query(
        `INSERT INTO clubs (id, admin_id, name, description, type, tags, capacity, current_count, photos, is_open)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)`,
        [uuidv4(), adminId, club.name, club.description, club.type, club.tags, club.capacity, club.currentCount, [], isOpen]
      )
      created++
    }

    res.json({ message: `成功创建 ${created} 个示例社团`, total: DEMO_CLUBS.length })
  } catch (err) {
    console.error('[seed] error:', err)
    res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: '种子数据生成失败' } })
  }
})

export default router
