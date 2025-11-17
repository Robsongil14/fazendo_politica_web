BEGIN;

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela: municipios_dados_privados
-- Finalidade: armazenar dados privados vinculados a um município
-- Observação: atualmente as políticas RLS em rls_all_in_one.sql bloqueiam totalmente o acesso
-- até definirmos regras específicas de owner (user_id) conforme necessidade.
CREATE TABLE IF NOT EXISTS public.municipios_dados_privados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid,                         -- opcional por enquanto; poderá ser exigido futuramente
  municipio_id text NOT NULL,           -- município ao qual o dado privado pertence
  categoria text,                       -- livre (ex.: 'planejamento', 'anotacao', etc.)
  titulo text,
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb,
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_municipios_dados_privados_municipio
  ON public.municipios_dados_privados (municipio_id);

CREATE INDEX IF NOT EXISTS idx_municipios_dados_privados_user
  ON public.municipios_dados_privados (user_id);

-- Habilitar RLS (políticas aplicadas pelo script consolidado)
ALTER TABLE public.municipios_dados_privados ENABLE ROW LEVEL SECURITY;

-- Trigger para manter updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_municipios_dados_privados()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END $$;

DROP TRIGGER IF EXISTS trg_set_updated_at_municipios_dados_privados ON public.municipios_dados_privados;
CREATE TRIGGER trg_set_updated_at_municipios_dados_privados
BEFORE UPDATE ON public.municipios_dados_privados
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_municipios_dados_privados();

COMMIT;