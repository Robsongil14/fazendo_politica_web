-- =============================================================
-- Diagnóstico: Dados Privados (Nível 1) e Família do Prefeito
-- Objetivo: verificar colunas, índices, RLS e trigger das tabelas
--           usadas pelo fluxo privado (dados_editaveis_nivel1)
--           e pela tabela pública familia_prefeito.
-- Uso: cole no SQL Editor do Supabase e execute.
--      As consultas são somente leitura.
-- =============================================================

-- 0) Usuário atual (deve estar autenticado ao executar)
SELECT auth.uid() AS current_user_id;

-- 1) Extensões obrigatórias
SELECT extname AS extension
FROM pg_extension
WHERE extname IN ('pgcrypto');

-- 2) Tabela privada: colunas e tipos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dados_editaveis_nivel1'
ORDER BY ordinal_position;

-- 3) Índices da tabela privada
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1'
ORDER BY indexname;

-- 4) RLS habilitado?
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dados_editaveis_nivel1';

-- 5) Políticas RLS da tabela privada
SELECT polname AS policy_name,
       cmd AS command,
       qual AS using_expr,
       with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1'
ORDER BY policy_name;

-- 6) Trigger de updated_at da tabela privada
SELECT tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dados_editaveis_nivel1';

-- 7) Distribuição por categorias (registros do usuário atual)
SELECT categoria, COUNT(*)
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid()
GROUP BY categoria
ORDER BY categoria;

-- 8) Tabela pública família_prefeito: colunas e tipos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'familia_prefeito'
ORDER BY ordinal_position;

-- 9) Índices da família_prefeito
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'familia_prefeito'
ORDER BY indexname;

-- 10) RLS e políticas da família_prefeito
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'familia_prefeito';

SELECT polname AS policy_name,
       cmd AS command,
       qual AS using_expr,
       with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'familia_prefeito'
ORDER BY policy_name;

-- 11) Consulta de itens privados de Família do Prefeito (troque pelo ID desejado)
-- Substitua 'MUNICIPIO_ID_AQUI' pelo ID do município (tipo text)
SELECT id, municipio_id, categoria, conteudo
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid()
  AND categoria = 'familia_prefeito'
  AND municipio_id = 'MUNICIPIO_ID_AQUI'
ORDER BY id DESC;

-- 12) Consulta de itens públicos de Família do Prefeito (tabela pública)
-- Substitua 'MUNICIPIO_ID_AQUI' pelo ID do município (tipo text)
SELECT *
FROM public.familia_prefeito
WHERE municipio_id = 'MUNICIPIO_ID_AQUI'
ORDER BY created_at DESC;

-- Observações:
-- - Se as consultas de colunas/políticas retornarem vazio para dados_editaveis_nivel1,
--   rode os scripts: 001_unified_dados_privados_setup.sql e rls_all_in_one.sql.
-- - Se o usuário não estiver logado no Supabase Studio, auth.uid() será NULL,
--   e as consultas filtradas por user_id não retornarão linhas.
-- - Categorias usadas no app para Nível 1: 'midia', 'familia_prefeito',
--   'liderancas', 'banda_b_local', 'banda_b_politicos', 'programas_emendas'.