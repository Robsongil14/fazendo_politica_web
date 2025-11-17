BEGIN;

-- 1) Extensão para UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2) Detecta e renomeia tabela legada, se o schema antigo estiver presente
DO $$
DECLARE
  has_table boolean;
  has_legacy_cols boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1'
  ) INTO has_table;

  IF has_table THEN
    SELECT EXISTS (
      SELECT 1 FROM information_schema.columns
      WHERE table_schema='public'
        AND table_name='dados_editaveis_nivel1'
        AND column_name='entidade_tipo'
    ) INTO has_legacy_cols;

    IF has_legacy_cols THEN
      RAISE NOTICE 'Schema antigo detectado em public.dados_editaveis_nivel1; renomeando para dados_editaveis_nivel1_legacy';
      EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 RENAME TO dados_editaveis_nivel1_legacy';
    END IF;
  END IF;
END $$;

-- 3) Cria a tabela flexível esperada pelo código (se não existir)
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

-- 6) Funções auxiliares de nível de acesso (idempotentes)
CREATE OR REPLACE FUNCTION public.current_access_level()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT access_level
      FROM public.profiles
      WHERE id = auth.uid()
    ),
    1
  );
$$;

CREATE OR REPLACE FUNCTION public.current_is_nivel(min_nivel integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_access_level() >= min_nivel;
$$;

GRANT EXECUTE ON FUNCTION public.current_access_level() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_is_nivel(integer) TO anon, authenticated;

-- 7) Habilita RLS e políticas da tabela privada (apenas dono)
ALTER TABLE public.dados_editaveis_nivel1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dados_editaveis_nivel1_select_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_select_self
  ON public.dados_editaveis_nivel1
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_insert_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_insert_self
  ON public.dados_editaveis_nivel1
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_update_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_update_self
  ON public.dados_editaveis_nivel1
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_delete_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_delete_self
  ON public.dados_editaveis_nivel1
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

COMMIT;

-- Observação:
-- Este script é idempotente e pode ser executado múltiplas vezes.
-- Ele não altera políticas RLS das demais tabelas públicas já configuradas.