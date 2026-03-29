import path from 'path'
import dotenv from 'dotenv'
// 最先加载 .env，确保所有模块都能读到环境变量
dotenv.config({ path: path.resolve(__dirname, '../.env') })
console.log('[env] DB_HOST:', process.env.DB_HOST, 'DB_USER:', process.env.DB_USER)

import express from 'express'
import cors from 'cors'
import authRouter from './routes/auth.routes'
import profileRouter from './routes/profile.routes'
import clubRouter from './routes/club.routes'
import recommendationRouter from './routes/recommendation.routes'
import applicationRouter from './routes/application.routes'
import notificationRouter from './routes/notification.routes'
import statisticsRouter from './routes/statistics.routes'
import seedRouter from './routes/seed.routes'

const app = express()
const PORT = process.env.PORT || 3000

// --- CORS 核心修改 ---
app.use(cors({
  origin: [
    'https://club-recruitment-frontend-4s57djq8q-yakultyums-projects.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}))

app.use(express.json())

app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// 基础路由配置
app.use('/api/auth', authRouter)
app.use('/api/profile', profileRouter)
app.use('/api/clubs', clubRouter)
app.use('/api/recommendations', recommendationRouter)
app.use('/api/applications', applicationRouter)
app.use('/api/notifications', notificationRouter)
app.use('/api/statistics', statisticsRouter) 
app.use('/api/seed', seedRouter)

app.listen(PORT, () => {
  console.log(`Backend server running on port ${PORT}`)
})

export default app