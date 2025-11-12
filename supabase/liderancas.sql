-- Tabela: liderancas
-- Finalidade: armazenar lideranças locais vinculadas a um município

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela
CREATE TABLE IF NOT EXISTS public.liderancas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL,
  nome text NOT NULL,
  partido text,
  votos_recebidos integer,
  historico text CHECK (historico IN ('prefeito','candidato_perdeu','vereador','vice','vice_atual')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS idx_liderancas_municipio_id
  ON public.liderancas (municipio_id);

-- Habilitar RLS
ALTER TABLE public.liderancas ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS liderancas_select_public ON public.liderancas;
CREATE POLICY liderancas_select_public
  ON public.liderancas
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS liderancas_insert_authenticated ON public.liderancas;
CREATE POLICY liderancas_insert_authenticated
  ON public.liderancas
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS liderancas_update_authenticated ON public.liderancas;
CREATE POLICY liderancas_update_authenticated
  ON public.liderancas
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS liderancas_delete_authenticated ON public.liderancas;
CREATE POLICY liderancas_delete_authenticated
  ON public.liderancas
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_liderancas()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_liderancas_set_updated_at ON public.liderancas;
CREATE TRIGGER trg_liderancas_set_updated_at
BEFORE UPDATE ON public.liderancas
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_liderancas();