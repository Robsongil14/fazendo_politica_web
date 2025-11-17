BEGIN;

-- Ajusta políticas das tabelas que já tinham RLS, exigindo nível mínimo
-- Regras: SELECT público; INSERT/UPDATE requer nível >= 2; DELETE requer nível >= 3

-- BANDA_B
ALTER TABLE public.banda_b ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS banda_b_select_public ON public.banda_b;
CREATE POLICY banda_b_select_public
  ON public.banda_b
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS banda_b_insert_authenticated ON public.banda_b;
DROP POLICY IF EXISTS banda_b_update_authenticated ON public.banda_b;
DROP POLICY IF EXISTS banda_b_delete_authenticated ON public.banda_b;

CREATE POLICY banda_b_insert_nivel2
  ON public.banda_b
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY banda_b_update_nivel2
  ON public.banda_b
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY banda_b_delete_nivel3
  ON public.banda_b
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- BANDA_B_POLITICOS
ALTER TABLE public.banda_b_politicos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS banda_b_politicos_select_public ON public.banda_b_politicos;
CREATE POLICY banda_b_politicos_select_public
  ON public.banda_b_politicos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS banda_b_politicos_insert_authenticated ON public.banda_b_politicos;
DROP POLICY IF EXISTS banda_b_politicos_update_authenticated ON public.banda_b_politicos;
DROP POLICY IF EXISTS banda_b_politicos_delete_authenticated ON public.banda_b_politicos;

CREATE POLICY banda_b_politicos_insert_nivel2
  ON public.banda_b_politicos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY banda_b_politicos_update_nivel2
  ON public.banda_b_politicos
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY banda_b_politicos_delete_nivel3
  ON public.banda_b_politicos
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- LIDERANCAS
ALTER TABLE public.liderancas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS liderancas_select_public ON public.liderancas;
CREATE POLICY liderancas_select_public
  ON public.liderancas
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS liderancas_insert_authenticated ON public.liderancas;
DROP POLICY IF EXISTS liderancas_update_authenticated ON public.liderancas;
DROP POLICY IF EXISTS liderancas_delete_authenticated ON public.liderancas;

CREATE POLICY liderancas_insert_nivel2
  ON public.liderancas
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY liderancas_update_nivel2
  ON public.liderancas
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY liderancas_delete_nivel3
  ON public.liderancas
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- PROGRAMAS_EMENDAS
ALTER TABLE public.programas_emendas ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS programas_emendas_select_public ON public.programas_emendas;
CREATE POLICY programas_emendas_select_public
  ON public.programas_emendas
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS programas_emendas_insert_authenticated ON public.programas_emendas;
DROP POLICY IF EXISTS programas_emendas_update_authenticated ON public.programas_emendas;
DROP POLICY IF EXISTS programas_emendas_delete_authenticated ON public.programas_emendas;

CREATE POLICY programas_emendas_insert_nivel2
  ON public.programas_emendas
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY programas_emendas_update_nivel2
  ON public.programas_emendas
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY programas_emendas_delete_nivel3
  ON public.programas_emendas
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- FAMILIA_PREFEITO
ALTER TABLE public.familia_prefeito ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS familia_prefeito_select_all ON public.familia_prefeito;
CREATE POLICY familia_prefeito_select_all
  ON public.familia_prefeito
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS familia_prefeito_insert_auth ON public.familia_prefeito;
DROP POLICY IF EXISTS familia_prefeito_update_auth ON public.familia_prefeito;
DROP POLICY IF EXISTS familia_prefeito_delete_auth ON public.familia_prefeito;

CREATE POLICY familia_prefeito_insert_nivel2
  ON public.familia_prefeito
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY familia_prefeito_update_nivel2
  ON public.familia_prefeito
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY familia_prefeito_delete_nivel3
  ON public.familia_prefeito
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- VICE_PREFEITOS
ALTER TABLE public.vice_prefeitos ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vice_prefeitos_select_public ON public.vice_prefeitos;
CREATE POLICY vice_prefeitos_select_public
  ON public.vice_prefeitos
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS vice_prefeitos_insert_authenticated ON public.vice_prefeitos;
DROP POLICY IF EXISTS vice_prefeitos_update_authenticated ON public.vice_prefeitos;

CREATE POLICY vice_prefeitos_insert_nivel2
  ON public.vice_prefeitos
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

CREATE POLICY vice_prefeitos_update_nivel2
  ON public.vice_prefeitos
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

COMMIT;