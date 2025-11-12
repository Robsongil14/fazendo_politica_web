-- Tabela: banda_b (locais)
-- Finalidade: armazenar pessoas/atores locais da "Banda B" vinculados a um município

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Criação da tabela
CREATE TABLE IF NOT EXISTS public.banda_b (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  municipio_id text NOT NULL, -- deve corresponder ao tipo de public.municipios.id
  nome text NOT NULL,
  partido text,
  votos_recebidos integer,
  historico text CHECK (historico IN ('prefeito','candidato_perdeu','vereador','vice','vice_atual')),
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índice para consultas por município
CREATE INDEX IF NOT EXISTS idx_banda_b_municipio_id
  ON public.banda_b (municipio_id);

-- Habilitar RLS
ALTER TABLE public.banda_b ENABLE ROW LEVEL SECURITY;

-- Políticas
DROP POLICY IF EXISTS banda_b_select_public ON public.banda_b;
CREATE POLICY banda_b_select_public
  ON public.banda_b
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS banda_b_insert_authenticated ON public.banda_b;
CREATE POLICY banda_b_insert_authenticated
  ON public.banda_b
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

DROP POLICY IF EXISTS banda_b_update_authenticated ON public.banda_b;
CREATE POLICY banda_b_update_authenticated
  ON public.banda_b
  FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS banda_b_delete_authenticated ON public.banda_b;
CREATE POLICY banda_b_delete_authenticated
  ON public.banda_b
  FOR DELETE
  TO authenticated
  USING (true);

-- Trigger para atualizar updated_at
CREATE OR REPLACE FUNCTION public.set_updated_at_banda_b()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_banda_b_set_updated_at ON public.banda_b;
CREATE TRIGGER trg_banda_b_set_updated_at
BEFORE UPDATE ON public.banda_b
FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at_banda_b();

-- Verificações rápidas (executar manualmente no editor SQL se desejar)
-- SELECT * FROM public.banda_b LIMIT 5;