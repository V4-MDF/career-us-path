-- Login próprio do painel admin (e-mail + senha).
CREATE TABLE IF NOT EXISTS admin_users (
  id            TEXT PRIMARY KEY,
  email         TEXT NOT NULL UNIQUE COLLATE NOCASE,
  password_hash TEXT NOT NULL, -- pbkdf2-sha256$<iterações>$<salt b64>$<hash b64>
  created_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at    TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now'))
);

-- Sessões: guardamos só o SHA-256 do token do cookie.
CREATE TABLE IF NOT EXISTS admin_sessions (
  token_hash TEXT PRIMARY KEY,
  user_id    TEXT NOT NULL REFERENCES admin_users (id) ON DELETE CASCADE,
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  expires_at TEXT NOT NULL
);
CREATE INDEX IF NOT EXISTS admin_sessions_user ON admin_sessions (user_id);

-- Limite de tentativas de login (chave = "ip:<ip>" ou "email:<email>").
CREATE TABLE IF NOT EXISTS admin_login_attempts (
  key          TEXT PRIMARY KEY,
  failures     INTEGER NOT NULL DEFAULT 0,
  window_start INTEGER NOT NULL, -- epoch ms
  locked_until INTEGER NOT NULL DEFAULT 0
);
