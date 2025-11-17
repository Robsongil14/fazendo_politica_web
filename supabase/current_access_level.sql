BEGIN;

-- Função: current_access_level()
-- Retorna o nível de acesso do usuário atual (1 se anônimo ou sem perfil)
CREATE OR REPLACE FUNCTION public.current_access_level()
RETURNS integer
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_nivel integer;
BEGIN
  -- Busca nível e respeita bloqueio: bloqueado => nível 0
  SELECT CASE
           WHEN p.blocked IS TRUE THEN 0
           ELSE COALESCE(p.access_level, 1)
         END
    INTO v_nivel
  FROM public.profiles p
  WHERE p.id = auth.uid();

  RETURN COALESCE(v_nivel, 1);
END;
$$;

-- Facilita uso em políticas: verifica se o usuário é pelo menos do nível informado
CREATE OR REPLACE FUNCTION public.current_is_nivel(min_nivel integer)
RETURNS boolean
LANGUAGE sql
STABLE
AS $$
  SELECT public.current_access_level() >= min_nivel;
$$;

-- Permissões para execução (RPC) se necessário
GRANT EXECUTE ON FUNCTION public.current_access_level() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_is_nivel(integer) TO anon, authenticated;

COMMIT;