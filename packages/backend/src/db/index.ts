import { Pool } from 'pg'

const pool = new Pool({
  host:     'localhost',
  port:     5432,
  database: 'club_recruitment',
  user:     'postgres',
  password: 'postgres',
  ssl:      false,
  max: 10,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
})

export default pool
