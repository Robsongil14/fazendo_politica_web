-- Verificação de colunas, políticas RLS e trigger da tabela public.dados_editaveis_nivel1

-- 1) Colunas e tipos
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'dados_editaveis_nivel1'
ORDER BY ordinal_position;

-- 2) Índices
SELECT indexname, indexdef
FROM pg_indexes
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1';

-- 3) Políticas RLS
SELECT polname AS policy_name,
       cmd AS command,
       qual AS using_expr,
       with_check
FROM pg_policies
WHERE schemaname = 'public' AND tablename = 'dados_editaveis_nivel1'
ORDER BY policy_name;

-- 4) Trigger updated_at
SELECT tgname AS trigger_name,
       pg_get_triggerdef(t.oid) AS trigger_def
FROM pg_trigger t
JOIN pg_class c ON c.oid = t.tgrelid
JOIN pg_namespace n ON n.oid = c.relnamespace
WHERE n.nspname = 'public' AND c.relname = 'dados_editaveis_nivel1';

-- 5) Checagem de tabela legada
SELECT EXISTS (
  SELECT 1 FROM information_schema.tables
  WHERE table_schema='public' AND table_name='dados_editaveis_nivel1_legacy'
) AS legacy_exists;