-- Tabela: vice_prefeitos
-- Finalidade: armazenar dados de Vice-Prefeito vinculados a um município

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela
CREATE TABLE IF NOT EXISTS public.vice_prefeitos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL, -- deve corresponder ao tipo de public.municipios.id
  nome text NOT NULL,
  partido text,
  telefone text,
  historico text CHECK (historico IN ('prefeito','candidato_perdeu','vereador','vice','vice_atual','lideranca','outros')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS idx_vice_prefeitos_municipio_id
  ON public.vice_prefeitos (municipio_id);

-- Habilitar RLS
ALTER TABLE public.vice_prefeitos ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS vice_prefeitos_select_public ON public.vice_prefeitos;
CREATE POLICY vice_prefeitos_select_public
  ON public.vice_prefeitos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS vice_prefeitos_insert_authenticated ON public.vice_prefeitos;
CREATE POLICY vice_prefeitos_insert_authenticated
  ON public.vice_prefeitos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS vice_prefeitos_update_authenticated ON public.vice_prefeitos;
CREATE POLICY vice_prefeitos_update_authenticated
  ON public.vice_prefeitos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);