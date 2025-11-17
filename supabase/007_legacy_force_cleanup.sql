-- =============================================================
-- Limpeza rápida de colunas legadas em public.dados_editaveis_nivel1
-- Objetivo: remover NOT NULL de colunas antigas (ex.: entidade_tipo)
--           que causam erro de inserção no schema flexível atual.
-- Uso: execute no SQL Editor do Supabase.
--      Depois, recarregue o cache: SELECT pg_notify('pgrst', 'reload schema');
-- =============================================================

BEGIN;

DO $$
DECLARE
  has_entidade_tipo boolean;
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='entidade_tipo'
  ) INTO has_entidade_tipo;

  IF has_entidade_tipo THEN
    RAISE NOTICE 'Coluna legada encontrada: entidade_tipo. Removendo NOT NULL...';
    EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN entidade_tipo DROP NOT NULL';
  ELSE
    RAISE NOTICE 'Coluna entidade_tipo não presente; nada a ajustar.';
  END IF;

  -- Se outras colunas legadas existirem e estiverem NOT NULL, relaxa também
  PERFORM 1 FROM information_schema.columns
   WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='entidade_id';
  IF FOUND THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN entidade_id DROP NOT NULL';
    EXCEPTION WHEN undefined_column THEN
      -- ignora
    END;
  END IF;

  PERFORM 1 FROM information_schema.columns
   WHERE table_schema='public' AND table_name='dados_editaveis_nivel1' AND column_name='entidade_nome';
  IF FOUND THEN
    BEGIN
      EXECUTE 'ALTER TABLE public.dados_editaveis_nivel1 ALTER COLUMN entidade_nome DROP NOT NULL';
    EXCEPTION WHEN undefined_column THEN
      -- ignora
    END;
  END IF;
END $$;

COMMIT;

-- Após executar:
-- SELECT pg_notify('pgrst', 'reload schema');