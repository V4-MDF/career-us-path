-- Armazenamento genérico chave/valor por "tabela" lógica (leads, site_content, blog_posts...).
-- Espelha a tabela public.kv_records que existia no Lovable Cloud (Postgres).
CREATE TABLE IF NOT EXISTS kv_records (
  table_name TEXT NOT NULL,
  record_id  TEXT NOT NULL,
  data       TEXT NOT NULL, -- JSON
  created_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  updated_at TEXT NOT NULL DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')),
  PRIMARY KEY (table_name, record_id)
);
