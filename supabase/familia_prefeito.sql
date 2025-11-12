BEGIN;

-- Gera UUIDs com gen_random_uuid()
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela para membros da Família do Prefeito
CREATE TABLE IF NOT EXISTS public.familia_prefeito (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL, -- deve corresponder ao tipo de public.municipios.id
  tipo text NOT NULL CHECK (tipo IN ('primeira_dama','primeiro_cavalheiro','filho','filha')),
  nome text NOT NULL,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS familia_prefeito_municipio_idx
  ON public.familia_prefeito (municipio_id);

-- Habilita RLS e cria políticas seguras
ALTER TABLE public.familia_prefeito ENABLE ROW LEVEL SECURITY;

-- SELECT liberado para leitura pública (anon e authenticated)
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='familia_prefeito' AND policyname='familia_prefeito_select_all'
  ) THEN
    EXECUTE 'DROP POLICY familia_prefeito_select_all ON public.familia_prefeito';
  END IF;
END $$;

CREATE POLICY familia_prefeito_select_all
  ON public.familia_prefeito
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- INSERT permitido para usuários autenticados
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='familia_prefeito' AND policyname='familia_prefeito_insert_auth'
  ) THEN
    EXECUTE 'DROP POLICY familia_prefeito_insert_auth ON public.familia_prefeito';
  END IF;
END $$;

CREATE POLICY familia_prefeito_insert_auth
  ON public.familia_prefeito
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- UPDATE permitido para usuários autenticados
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='familia_prefeito' AND policyname='familia_prefeito_update_auth'
  ) THEN
    EXECUTE 'DROP POLICY familia_prefeito_update_auth ON public.familia_prefeito';
  END IF;
END $$;

CREATE POLICY familia_prefeito_update_auth
  ON public.familia_prefeito
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- DELETE permitido para usuários autenticados
DO $$ BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname='public' AND tablename='familia_prefeito' AND policyname='familia_prefeito_delete_auth'
  ) THEN
    EXECUTE 'DROP POLICY familia_prefeito_delete_auth ON public.familia_prefeito';
  END IF;
END $$;

CREATE POLICY familia_prefeito_delete_auth
  ON public.familia_prefeito
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS set_updated_at_familia_prefeito ON public.familia_prefeito;
CREATE TRIGGER set_updated_at_familia_prefeito
BEFORE UPDATE ON public.familia_prefeito
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at();

COMMIT;

-- Verificações rápidas
-- SELECT * FROM public.familia_prefeito LIMIT 5;
-- SELECT * FROM public.familia_prefeito WHERE municipio_id = '<ID_DO_MUNICIPIO>';