-- Tabela: banda_b_politicos
-- Finalidade: armazenar deputados da "Banda B" vinculados a um município

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela
CREATE TABLE IF NOT EXISTS public.banda_b_politicos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL,
  nome text NOT NULL,
  esfera text NOT NULL CHECK (esfera IN ('federal','estadual')),
  partido text,
  votos_recebidos integer,
  historico text CHECK (historico IN ('prefeito','candidato_perdeu','vereador','vice','vice_atual')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS idx_banda_b_politicos_municipio_id
  ON public.banda_b_politicos (municipio_id);

-- Habilitar RLS
ALTER TABLE public.banda_b_politicos ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS banda_b_politicos_select_public ON public.banda_b_politicos;
CREATE POLICY banda_b_politicos_select_public
  ON public.banda_b_politicos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS banda_b_politicos_insert_authenticated ON public.banda_b_politicos;
CREATE POLICY banda_b_politicos_insert_authenticated
  ON public.banda_b_politicos
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS banda_b_politicos_update_authenticated ON public.banda_b_politicos;
CREATE POLICY banda_b_politicos_update_authenticated
  ON public.banda_b_politicos
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS banda_b_politicos_delete_authenticated ON public.banda_b_politicos;
CREATE POLICY banda_b_politicos_delete_authenticated
  ON public.banda_b_politicos
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_banda_b_politicos()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_banda_b_politicos_set_updated_at ON public.banda_b_politicos;
CREATE TRIGGER trg_banda_b_politicos_set_updated_at
BEFORE UPDATE ON public.banda_b_politicos
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_banda_b_politicos();