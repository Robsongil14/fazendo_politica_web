-- Tabela: programas_emendas
-- Finalidade: armazenar programas/emendas vinculados a um município,
-- incluindo informações de parlamentares (deputado federal/estadual/senador)
-- e órgãos (secretarias estaduais ou ministérios federais)

-- Extensão para gerar UUIDs sem depender do uuid-ossp
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela
CREATE TABLE IF NOT EXISTS public.programas_emendas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL,
  -- esfera do órgão responsável: 'estadual' | 'federal'
  esfera TEXT NOT NULL CHECK (esfera IN ('estadual','federal')),
  -- tipo de parlamentar: 'deputado_federal' | 'deputado_estadual' | 'senador'
  parlamentar_tipo TEXT CHECK (parlamentar_tipo IN ('deputado_federal','deputado_estadual','senador')),
  parlamentar_nome TEXT,
  orgao_sigla TEXT,          -- ex.: 'SESAB', 'MS', etc.
  orgao_nome TEXT,           -- ex.: 'Secretaria da Saúde do Estado da Bahia', 'Ministério da Saúde'
  area TEXT,                 -- área temática associada
  observacoes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Migração idempotente: se a tabela já existir com tipos antigos, ajusta-os
DO $$ BEGIN
  -- Converte municipio_id de uuid para text, se necessário
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='programas_emendas'
      AND column_name='municipio_id' AND data_type='uuid'
  ) THEN
    EXECUTE 'ALTER TABLE public.programas_emendas ALTER COLUMN municipio_id TYPE text USING municipio_id::text';
  END IF;

  -- Garante default de id usando gen_random_uuid()
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='programas_emendas'
      AND column_name='id'
  ) THEN
    EXECUTE 'ALTER TABLE public.programas_emendas ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  END IF;
END $$;

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS idx_programas_emendas_municipio_id
  ON public.programas_emendas (municipio_id);

-- Habilitar RLS
ALTER TABLE public.programas_emendas ENABLE ROW LEVEL SECURITY;

-- Políticas (compatível com Postgres, sem IF NOT EXISTS)
-- Leitura pública (qualquer usuário pode consultar)
DROP POLICY IF EXISTS programas_emendas_select_public ON public.programas_emendas;
CREATE POLICY programas_emendas_select_public
  ON public.programas_emendas
  FOR SELECT
  TO anon, authenticated
  USING (true);

-- Inserir apenas usuários autenticados
DROP POLICY IF EXISTS programas_emendas_insert_authenticated ON public.programas_emendas;
CREATE POLICY programas_emendas_insert_authenticated
  ON public.programas_emendas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Atualizar apenas usuários autenticados
DROP POLICY IF EXISTS programas_emendas_update_authenticated ON public.programas_emendas;
CREATE POLICY programas_emendas_update_authenticated
  ON public.programas_emendas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Excluir apenas usuários autenticados
DROP POLICY IF EXISTS programas_emendas_delete_authenticated ON public.programas_emendas;
CREATE POLICY programas_emendas_delete_authenticated
  ON public.programas_emendas
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_programas_emendas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_programas_emendas_set_updated_at ON public.programas_emendas;
CREATE TRIGGER trg_programas_emendas_set_updated_at
BEFORE UPDATE ON public.programas_emendas
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_programas_emendas();

-- Observação:
-- Se desejar vincular com FK ao cadastro de municípios, ajuste conforme seu schema:
-- ALTER TABLE public.programas_emendas
--   ADD CONSTRAINT fk_programas_emendas_municipio
--   FOREIGN KEY (municipio_id) REFERENCES public.municipios(id) ON DELETE CASCADE;