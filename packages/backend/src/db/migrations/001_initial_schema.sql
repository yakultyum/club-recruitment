-- 001_initial_schema.sql
-- 初始数据库 Schema

-- 枚举类型
CREATE TYPE user_role AS ENUM ('student', 'club_admin');
CREATE TYPE club_type AS ENUM ('arts', 'sports', 'academic', 'charity', 'tech');
CREATE TYPE application_status AS ENUM ('pending', 'approved', 'rejected', 'withdrawn');
CREATE TYPE notification_type AS ENUM ('application_status', 'system');

-- users 表
CREATE TABLE IF NOT EXISTS users (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role          user_role    NOT NULL,
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_email ON users (email);

-- student_profiles 表
CREATE TABLE IF NOT EXISTS student_profiles (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID        NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  tags       TEXT[]      NOT NULL DEFAULT '{}',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_student_profiles_student_id ON student_profiles (student_id);

-- clubs 表
CREATE TABLE IF NOT EXISTS clubs (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id      UUID        NOT NULL REFERENCES users (id) ON DELETE RESTRICT,
  name          VARCHAR(50) NOT NULL,
  description   TEXT        NOT NULL DEFAULT '',
  type          club_type   NOT NULL,
  tags          TEXT[]      NOT NULL DEFAULT '{}',
  capacity      INT         NOT NULL CHECK (capacity > 0),
  current_count INT         NOT NULL DEFAULT 0 CHECK (current_count >= 0),
  photos        TEXT[]      NOT NULL DEFAULT '{}',
  is_open       BOOLEAN     NOT NULL DEFAULT TRUE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT clubs_name_length CHECK (char_length(name) >= 2 AND char_length(name) <= 50)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_clubs_name ON clubs (name);
CREATE INDEX IF NOT EXISTS idx_clubs_type ON clubs (type);
CREATE INDEX IF NOT EXISTS idx_clubs_is_open ON clubs (is_open);

-- applications 表
CREATE TABLE IF NOT EXISTS applications (
  id         UUID               PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID               NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  club_id    UUID               NOT NULL REFERENCES clubs (id) ON DELETE CASCADE,
  form_data  JSONB              NOT NULL DEFAULT '{}',
  status     application_status NOT NULL DEFAULT 'pending',
  created_at TIMESTAMPTZ        NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ        NOT NULL DEFAULT NOW()
);

-- 联合唯一索引：同一学生对同一社团只能有一条非撤回状态的申请（通过部分唯一索引实现）
CREATE UNIQUE INDEX IF NOT EXISTS idx_applications_student_club_active
  ON applications (student_id, club_id)
  WHERE status != 'withdrawn';

CREATE INDEX IF NOT EXISTS idx_applications_student_id ON applications (student_id);
CREATE INDEX IF NOT EXISTS idx_applications_club_id ON applications (club_id);
CREATE INDEX IF NOT EXISTS idx_applications_status ON applications (status);

-- notifications 表
CREATE TABLE IF NOT EXISTS notifications (
  id         UUID              PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID              NOT NULL REFERENCES users (id) ON DELETE CASCADE,
  message    TEXT              NOT NULL,
  type       notification_type NOT NULL,
  is_read    BOOLEAN           NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ       NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (user_id) WHERE is_read = FALSE;
