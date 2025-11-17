-- =============================================================
-- Diagnóstico: Categorias privadas em public.dados_editaveis_nivel1
-- Objetivo: validar colunas/índices/trigger/RLS e listar itens por
--           categoria usadas pelo Nível 1 no app.
-- Uso: cole no SQL Editor do Supabase e execute.
--      Substitua MUNICIPIO_ID_AQUI quando necessário.
-- =============================================================

-- 0) Usuário atual
SELECT auth.uid() AS current_user_id;

-- 1) Colunas e tipos da tabela privada
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dados_editaveis_nivel1'
ORDER BY ordinal_position;

-- 2) Índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1'
ORDER BY indexname;

-- 3) RLS habilitado e políticas
SELECT c.relname AS table_name, c.relrowsecurity AS rls_enabled
FROM pg_class c
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dados_editaveis_nivel1';

SELECT polname AS policy_name,
       cmd AS command,
       qual AS using_expr,
       with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1'
ORDER BY policy_name;

-- 4) Trigger de updated_at
SELECT tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dados_editaveis_nivel1';

-- 5) Distribuição por categorias (registros do usuário atual)
SELECT categoria, COUNT(*)
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid()
GROUP BY categoria
ORDER BY categoria;

-- 6) Listagens por categoria (últimos 25 itens do usuário atual)
-- midia
SELECT id, municipio_id, titulo, conteudo, created_at
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid() AND categoria = 'midia'
ORDER BY created_at DESC
LIMIT 25;

-- liderancas
SELECT id, municipio_id, titulo, conteudo, created_at
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid() AND categoria = 'liderancas'
ORDER BY created_at DESC
LIMIT 25;

-- banda_b_local
SELECT id, municipio_id, titulo, conteudo, created_at
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid() AND categoria = 'banda_b_local'
ORDER BY created_at DESC
LIMIT 25;

-- banda_b_politicos
SELECT id, municipio_id, titulo, conteudo, created_at
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid() AND categoria = 'banda_b_politicos'
ORDER BY created_at DESC
LIMIT 25;

-- programas_emendas
SELECT id, municipio_id, titulo, conteudo, created_at
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid() AND categoria = 'programas_emendas'
ORDER BY created_at DESC
LIMIT 25;

-- 7) Filtro por município (opcional)
-- Substitua 'MUNICIPIO_ID_AQUI' pelo ID do município (text)
SELECT categoria, COUNT(*)
FROM public.dados_editaveis_nivel1
WHERE user_id = auth.uid()
  AND municipio_id = 'MUNICIPIO_ID_AQUI'
GROUP BY categoria
ORDER BY categoria;

-- 8) Opcional: recarregar cache do PostgREST após mudanças de schema
-- Execute esta linha separadamente caso tenha acabado de alterar colunas
-- SELECT pg_notify('pgrst', 'reload schema');