BEGIN;

-- Extensão para gerar UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Tabela: dados_editaveis_nivel1
-- Finalidade: armazenar dados privados inseridos por usuários Nível 1
-- Observação: políticas RLS estão definidas em supabase/rls_all_in_one.sql
CREATE TABLE IF NOT EXISTS public.dados_editaveis_nivel1 (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,              -- dono do registro (auth.uid())
  municipio_id text,                  -- opcional, quando vinculado a município
  categoria text,                     -- livre (ex.: 'emenda_programa', 'midia', etc.)
  titulo text,                        -- breve título/identificação
  conteudo jsonb NOT NULL DEFAULT '{}'::jsonb, -- payload flexível com campos específicos
  observacoes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Índices para desempenho
CREATE INDEX IF NOT EXISTS idx_dados_editaveis_nivel1_user
  ON public.dados_editaveis_nivel1 (user_id);

CREATE INDEX IF NOT EXISTS idx_dados_editaveis_nivel1_municipio
  ON public.dados_editaveis_nivel1 (municipio_id);

-- Habilitar RLS (políticas aplicadas pelo script consolidado)
ALTER TABLE public.dados_editaveis_nivel1 ENABLE ROW LEVEL SECURITY;

-- Trigger para manter updated_at
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

COMMIT;

-- Exemplo de inserção (apenas para referência; execute no editor SQL):
-- INSERT INTO public.dados_editaveis_nivel1 (user_id, municipio_id, categoria, titulo, conteudo, observacoes)
-- VALUES (
--   auth.uid(),
--   '123456',
--   'emenda_programa',
--   'Emenda de Saúde',
--   '{"esfera":"estadual","parlamentar_tipo":"deputado_estadual","orgao_sigla":"SESAB","orgao_nome":"Secretaria da Saúde","area":"Saúde"}'::jsonb,
--   'Criada pelo usuário'
-- );