-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  Elephant V1.0 — Supabase SQL Migrations                                  ║
-- ║  ⚠️  DO NOT RUN AUTOMATICALLY — provide to user to run manually            ║
-- ║  All tables live in the "elephant" schema, NOT public.                     ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- ─── Create Schema ───────────────────────────────────────────────────────────

CREATE SCHEMA IF NOT EXISTS elephant;

-- Grant access to Supabase roles (no anon — all access is server-side via service_role)
GRANT USAGE ON SCHEMA elephant TO service_role, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA elephant TO service_role, authenticated;
ALTER DEFAULT PRIVILEGES IN SCHEMA elephant GRANT ALL ON TABLES TO service_role, authenticated;

-- ─── Table: projects ─────────────────────────────────────────────────────────

CREATE TABLE elephant.projects (
  project_id     UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_name   TEXT NOT NULL,
  priority       INTEGER NOT NULL CHECK (priority BETWEEN 1 AND 5),
  created_date   TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_date       TIMESTAMPTZ,
  status         TEXT NOT NULL DEFAULT 'active'
                 CHECK (status IN ('active', 'inactive', 'completed'))
);

-- ─── Table: project_items ────────────────────────────────────────────────────

CREATE TABLE elephant.project_items (
  item_id      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  project_id   UUID NOT NULL REFERENCES elephant.projects(project_id) ON DELETE CASCADE,
  item_name    TEXT NOT NULL,
  is_active    BOOLEAN NOT NULL DEFAULT false,
  order_index  INTEGER NOT NULL DEFAULT 0
);

-- ─── Table: master_list ──────────────────────────────────────────────────────

CREATE TABLE elephant.master_list (
  mlp_index      INTEGER PRIMARY KEY,
  item_id        UUID NOT NULL,
  item_name      TEXT NOT NULL,
  is_errand      BOOLEAN NOT NULL DEFAULT false,
  project_id     UUID REFERENCES elephant.projects(project_id) ON DELETE SET NULL,
  is_placeholder BOOLEAN NOT NULL DEFAULT false
);

-- ─── Table: completed_list ───────────────────────────────────────────────────

CREATE TABLE elephant.completed_list (
  item_id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item_name            TEXT NOT NULL,
  project_id           UUID REFERENCES elephant.projects(project_id) ON DELETE SET NULL,
  date_time_completed  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ─── Helper Function: Shift project items down after a "Take a Bite" ────────

CREATE OR REPLACE FUNCTION elephant.shift_project_items_down(
  p_project_id UUID,
  p_after_index INTEGER
)
RETURNS void AS $$
BEGIN
  UPDATE elephant.project_items
  SET order_index = order_index + 1
  WHERE project_id = p_project_id
    AND order_index > p_after_index;
END;
$$ LANGUAGE plpgsql;

-- ─── Helper Function: Re-index master list sequentially ─────────────────────

CREATE OR REPLACE FUNCTION elephant.reindex_master_list()
RETURNS void AS $$
BEGIN
  WITH ranked AS (
    SELECT item_id, ROW_NUMBER() OVER (ORDER BY mlp_index) AS new_index
    FROM elephant.master_list
  )
  UPDATE elephant.master_list ml
  SET mlp_index = r.new_index
  FROM ranked r
  WHERE ml.item_id = r.item_id;
END;
$$ LANGUAGE plpgsql;
