import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { v4 as uuidv4 } from 'uuid'
import pool from '../db/index'
import type { User, AuthPayload } from '../types/index'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-key'
const SALT_ROUNDS = 10

export async function register(
  email: string,
  password: string,
  role: 'student' | 'club_admin'
): Promise<Omit<User, 'passwordHash'>> {
  // 检查邮箱唯一性
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email])
  if (existing.rows.length > 0) {
    const err = new Error('Email already exists') as Error & { code: string }
    err.code = 'EMAIL_DUPLICATE'
    throw err
  }

  const passwordHash = await bcrypt.hash(password, SALT_ROUNDS)
  const id = uuidv4()

  const result = await pool.query(
    'INSERT INTO users (id, email, password_hash, role) VALUES ($1, $2, $3, $4) RETURNING id, email, role, created_at',
    [id, email, passwordHash, role]
  )

  const row = result.rows[0]
  return {
    id: row.id,
    email: row.email,
    role: row.role,
    createdAt: row.created_at,
  }
}

export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: Omit<User, 'passwordHash'> }> {
  const result = await pool.query(
    'SELECT id, email, password_hash, role, created_at FROM users WHERE email = $1',
    [email]
  )

  if (result.rows.length === 0) {
    const err = new Error('Invalid credentials') as Error & { code: string }
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  const row = result.rows[0]
  const valid = await bcrypt.compare(password, row.password_hash)
  if (!valid) {
    const err = new Error('Invalid credentials') as Error & { code: string }
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  const payload: AuthPayload = {
    userId: row.id,
    email: row.email,
    role: row.role,
  }

  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' })

  return {
    token,
    user: {
      id: row.id,
      email: row.email,
      role: row.role,
      createdAt: row.created_at,
    },
  }
}

export function verifyToken(token: string): AuthPayload {
  const decoded = jwt.verify(token, JWT_SECRET) as AuthPayload
  return {
    userId: decoded.userId,
    email: decoded.email,
    role: decoded.role,
  }
}
