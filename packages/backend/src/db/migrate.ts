import { readFileSync } from 'fs'
import { join } from 'path'
import pool from './index'

/**
 * 执行指定迁移文件
 */
export async function runMigration(filename: string): Promise<void> {
  const filePath = join(__dirname, 'migrations', filename)
  const sql = readFileSync(filePath, 'utf-8')
  const client = await pool.connect()
  try {
    await client.query('BEGIN')
    await client.query(sql)
    await client.query('COMMIT')
    console.log(`Migration applied: ${filename}`)
  } catch (err) {
    await client.query('ROLLBACK')
    throw err
  } finally {
    client.release()
  }
}

/**
 * 按文件名顺序执行 migrations 目录下所有 .sql 文件
 */
export async function runAllMigrations(): Promise<void> {
  const { readdirSync } = await import('fs')
  const migrationsDir = join(__dirname, 'migrations')
  const files = readdirSync(migrationsDir)
    .filter((f) => f.endsWith('.sql'))
    .sort()

  for (const file of files) {
    await runMigration(file)
  }
}

// 直接运行时执行所有迁移
if (require.main === module) {
  runAllMigrations()
    .then(() => {
      console.log('All migrations completed.')
      process.exit(0)
    })
    .catch((err) => {
      console.error('Migration failed:', err)
      process.exit(1)
    })
}
