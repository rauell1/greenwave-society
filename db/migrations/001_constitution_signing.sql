-- Migration 001: Executive Constitution Signing
-- Run once: bun run db:push  OR  apply via sqlite3 or the seed script

CREATE TABLE IF NOT EXISTS executive_leaders (
  id        TEXT PRIMARY KEY,
  name      TEXT NOT NULL,
  role      TEXT NOT NULL,
  email     TEXT NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS constitution_signatures (
  id              TEXT PRIMARY KEY,
  leaderId        TEXT NOT NULL UNIQUE,
  version         TEXT NOT NULL DEFAULT '1.0',
  status          TEXT NOT NULL DEFAULT 'pending',
  token           TEXT NOT NULL UNIQUE,
  signedAt        DATETIME,
  rejectionReason TEXT,
  ipAddress       TEXT,
  emailSentAt     DATETIME,
  createdAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt       DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (leaderId) REFERENCES executive_leaders(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_signatures_token  ON constitution_signatures(token);
CREATE INDEX IF NOT EXISTS idx_signatures_status ON constitution_signatures(status);

CREATE TABLE IF NOT EXISTS admin_sessions (
  id        TEXT PRIMARY KEY,
  token     TEXT NOT NULL UNIQUE,
  createdAt DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  expiresAt DATETIME NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_sessions_token     ON admin_sessions(token);
CREATE INDEX IF NOT EXISTS idx_admin_sessions_expiresAt ON admin_sessions(expiresAt);
