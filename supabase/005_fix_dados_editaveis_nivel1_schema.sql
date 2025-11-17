-- =============================================================
-- Correção idempotente do schema: public.dados_editaveis_nivel1
-- Objetivo: garantir colunas esperadas (inclui 'categoria'), índices,
--           trigger de updated_at e políticas RLS.
-- Uso: execute no SQL Editor do Supabase.
--      Pode rodar múltiplas vezes sem erro.
-- =============================================================

BEGIN;

-- 1) Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Cria a tabela se não existir (definição completa esperada pelo app)
CREATE TABLE IF NOT EXISTS public.dados_editaveis_nivel1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  municipio_id text,
  categoria text,
  titulo text,
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- 3) Ajusta colunas que possam estar faltando ou com tipo incorreto
DO $$
DECLARE
  v_exists boolean;
  v_type text;
  v_default text;
  v_nullable text;
BEGIN
  -- categoria
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='categoria'
  ) INTO v_exists;
  IF NOT v_exists THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN categoria text';
  END IF;

  -- titulo
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='titulo'
  ) INTO v_exists;
  IF NOT v_exists THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN titulo text';
  END IF;

  -- observacoes
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='observacoes'
  ) INTO v_exists;
  IF NOT v_exists THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN observacoes text';
  END IF;

  -- municipio_id
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='municipio_id'
  ) INTO v_exists;
  IF NOT v_exists THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN municipio_id text';
  END IF;

  -- user_id como uuid NOT NULL
  SELECT data_type
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='user_id'
  INTO v_type;
  IF v_type IS NULL THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN user_id uuid NOT NULL';
  ELSIF v_type <> 'uuid' THEN
    -- Tenta converter para uuid se atualmente for text/char
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN user_id TYPE uuid USING user_id::uuid';
  END IF;
  -- Assegura NOT NULL
  SELECT is_nullable
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='user_id'
  INTO v_nullable;
  IF v_nullable = 'YES' THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN user_id SET NOT NULL';
  END IF;

  -- conteudo jsonb NOT NULL DEFAULT '{}'
  SELECT data_type, column_default, is_nullable
  FROM information_schema.columns
  WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='conteudo'
  INTO v_type, v_default, v_nullable;

  IF v_type IS NULL THEN
    EXECUTE '' ||
      'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN conteudo jsonb NOT NULL DEFAULT ''{}''::jsonb';
  ELSIF v_type <> 'jsonb' THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN conteudo TYPE jsonb USING conteudo::jsonb';
  END IF;

  IF v_default IS NULL OR v_default NOT LIKE '%jsonb%' THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN conteudo SET DEFAULT ''{}''::jsonb';
  END IF;
  IF v_nullable = 'YES' THEN
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN conteudo SET NOT NULL';
  END IF;

  -- created_at e updated_at
  FOR v_type, v_default, v_nullable IN
    SELECT data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='created_at'
  LOOP
    IF v_type IS NULL THEN
      EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN created_at timestamptz NOT NULL DEFAULT now()';
    END IF;
  END LOOP;

  FOR v_type, v_default, v_nullable IN
    SELECT data_type, column_default, is_nullable
    FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='updated_at'
  LOOP
    IF v_type IS NULL THEN
      EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ADD COLUMN updated_at timestamptz NOT NULL DEFAULT now()';
    END IF;
  END LOOP;
END $$;

-- 4) Índices
CREATE INDEX IF NOT EXISTS idx_dados_editaveis_nivel1_user
  ON public.dados_editaveis_nivel1 (user_id);

CREATE INDEX IF NOT EXISTS idx_dados_editaveis_nivel1_municipio
  ON public.dados_editaveis_nivel1 (municipio_id);

-- 5) Trigger updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_dados_editaveis_nivel1()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_updated_at_dados_editaveis_nivel1 ON public.dados_editaveis_nivel1;
CREATE TRIGGER trg_set_updated_at_dados_editaveis_nivel1
BEFORE UPDATE ON public.dados_editaveis_nivel1
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_dados_editaveis_nivel1();

-- 6) Políticas RLS (dono)
ALTER TABLE public.dados_editaveis_nivel1 ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dados_editaveis_nivel1' AND policyname='dados_editaveis_nivel1_select_self'
  ) THEN EXECUTE 'DROP POLICY dados_editaveis_nivel1_select_self ON public.dados_editaveis_nivel1'; END IF;
END $$;
CREATE POLICY dados_editaveis_nivel1_select_self
  ON public.dados_editaveis_nivel1
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dados_editaveis_nivel1' AND policyname='dados_editaveis_nivel1_insert_self'
  ) THEN EXECUTE 'DROP POLICY dados_editaveis_nivel1_insert_self ON public.dados_editaveis_nivel1'; END IF;
END $$;
CREATE POLICY dados_editaveis_nivel1_insert_self
  ON public.dados_editaveis_nivel1
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dados_editaveis_nivel1' AND policyname='dados_editaveis_nivel1_update_self'
  ) THEN EXECUTE 'DROP POLICY dados_editaveis_nivel1_update_self ON public.dados_editaveis_nivel1'; END IF;
END $$;
CREATE POLICY dados_editaveis_nivel1_update_self
  ON public.dados_editaveis_nivel1
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='dados_editaveis_nivel1' AND policyname='dados_editaveis_nivel1_delete_self'
  ) THEN EXECUTE 'DROP POLICY dados_editaveis_nivel1_delete_self ON public.dados_editaveis_nivel1'; END IF;
END $$;
CREATE POLICY dados_editaveis_nivel1_delete_self
  ON public.dados_editaveis_nivel1
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMIT;

-- 7) Opcional: força recarregar o cache do PostgREST (schema)
--    Execute esta linha separadamente após alterações de schema:
-- SELECT pg_notify('pgrst', 'reload schema');