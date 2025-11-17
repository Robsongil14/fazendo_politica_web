BEGIN;

-- Habilita RLS na tabela de perfis
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- SELECT: usuário só enxerga seu próprio perfil; admin (nível >= 4) enxerga tudo
DROP POLICY IF EXISTS profiles_select_self_or_admin ON public.profiles;
CREATE POLICY profiles_select_self_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.current_is_nivel(4));

-- INSERT: usuário pode criar seu próprio perfil; admin pode criar qualquer perfil
DROP POLICY IF EXISTS profiles_insert_self_or_admin ON public.profiles;
CREATE POLICY profiles_insert_self_or_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR public.current_is_nivel(4));

-- UPDATE: usuário pode editar seu próprio perfil; admin pode editar qualquer perfil
DROP POLICY IF EXISTS profiles_update_self_or_admin ON public.profiles;
CREATE POLICY profiles_update_self_or_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.current_is_nivel(4))
  WITH CHECK (id = auth.uid() OR public.current_is_nivel(4));

COMMIT;