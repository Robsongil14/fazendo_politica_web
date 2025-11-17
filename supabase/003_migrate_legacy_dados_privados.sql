-- Migração de dados da tabela legada para o novo schema flexível
-- Este script presume que a tabela antiga foi renomeada para public.dados_editaveis_nivel1_legacy
-- e que você deseja migrar seu conteúdo para public.dados_editaveis_nivel1 (privado por usuário).
-- IMPORTANTE:
--   - Defina v_target_user se a tabela legada não possuir coluna user_id.
--   - Revise os filtros por categoria conforme necessário.

DO $$
DECLARE
  legacy_exists boolean;
  legacy_has_user_id boolean;
  v_target_user uuid := NULL;  -- Opcional: defina manualmente, ex.: '00000000-0000-0000-0000-000000000000'::uuid
BEGIN
  SELECT EXISTS (
    SELECT 1 FROM information_schema.tables
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1_legacy'
  ) INTO legacy_exists;

  IF NOT legacy_exists THEN
    RAISE NOTICE 'Tabela public.dados_editaveis_nivel1_legacy não existe; nada a migrar.';
    RETURN;
  END IF;

  SELECT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='dados_editaveis_nivel1_legacy' AND column_name='user_id'
  ) INTO legacy_has_user_id;

  IF NOT legacy_has_user_id AND v_target_user IS NULL THEN
    RAISE EXCEPTION 'A tabela legada não possui coluna user_id e v_target_user não foi definido. Defina v_target_user para prosseguir.';
  END IF;

  -- Migração genérica: joga todas as colunas da linha para conteudo (jsonb) e tenta preencher categoria/titulo
  -- Ajuste conforme seu schema legado. Campos removidos do payload via operador '-' se existirem.
  RAISE NOTICE 'Iniciando migração genérica de registros da tabela legada...';

  INSERT INTO public.dados_editaveis_nivel1 (user_id, municipio_id, categoria, titulo, conteudo, observacoes, created_at, updated_at)
  SELECT
    COALESCE(l.user_id, v_target_user) AS user_id,
    NULLIF(COALESCE(l.municipio_id::text, l.municipio::text), '') AS municipio_id,
    COALESCE(l.categoria, l.entidade_tipo, 'desconhecido') AS categoria,
    COALESCE(l.titulo, l.nome, l.descricao, l.entidade_tipo || COALESCE(' ' || l.entidade_id::text, '')) AS titulo,
    to_jsonb(l)
      - 'id' - 'user_id' - 'municipio_id' - 'municipio' - 'categoria' - 'titulo'
      - 'created_at' - 'updated_at' - 'observacoes' AS conteudo,
    l.observacoes,
    COALESCE(l.created_at, now()) AS created_at,
    COALESCE(l.updated_at, now()) AS updated_at
  FROM public.dados_editaveis_nivel1_legacy l;

  RAISE NOTICE 'Migração concluída. Registros migrados: %', (SELECT count(*) FROM public.dados_editaveis_nivel1);
END $$;

-- Dicas:
-- 1) Se quiser migrar apenas categorias específicas, adicione WHERE l.categoria IN (...)
-- 2) Se quiser construir conteudo com chaves mapeadas, use jsonb_build_object(...) no SELECT.
-- 3) Após migrar, você pode dropar a tabela legada quando tiver certeza: DROP TABLE public.dados_editaveis_nivel1_legacy;