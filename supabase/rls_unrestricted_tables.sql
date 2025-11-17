BEGIN;

-- Unificar políticas RLS para tabelas marcadas como Unrestricted
-- Regras gerais:
--  - SELECT: aberto para anon e authenticated
--  - INSERT/UPDATE: requer nível >= 2
--  - DELETE: requer nível >= 3
--  - Datasets externos (eleições/transferências): somente admin (nível >= 4) pode escrever

-- MUNICIPIOS
ALTER TABLE public.municipios ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS municipios_select_public ON public.municipios;
CREATE POLICY municipios_select_public
  ON public.municipios
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS municipios_insert_nivel2 ON public.municipios;
CREATE POLICY municipios_insert_nivel2
  ON public.municipios
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS municipios_update_nivel2 ON public.municipios;
CREATE POLICY municipios_update_nivel2
  ON public.municipios
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS municipios_delete_nivel3 ON public.municipios;
CREATE POLICY municipios_delete_nivel3
  ON public.municipios
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- VEREADORES
ALTER TABLE public.vereadores ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS vereadores_select_public ON public.vereadores;
CREATE POLICY vereadores_select_public
  ON public.vereadores
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS vereadores_insert_nivel2 ON public.vereadores;
CREATE POLICY vereadores_insert_nivel2
  ON public.vereadores
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS vereadores_update_nivel2 ON public.vereadores;
CREATE POLICY vereadores_update_nivel2
  ON public.vereadores
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS vereadores_delete_nivel3 ON public.vereadores;
CREATE POLICY vereadores_delete_nivel3
  ON public.vereadores
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- MIDIAS_LOCAIS
ALTER TABLE public.midias_locais ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS midias_locais_select_public ON public.midias_locais;
CREATE POLICY midias_locais_select_public
  ON public.midias_locais
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS midias_locais_insert_nivel2 ON public.midias_locais;
CREATE POLICY midias_locais_insert_nivel2
  ON public.midias_locais
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS midias_locais_update_nivel2 ON public.midias_locais;
CREATE POLICY midias_locais_update_nivel2
  ON public.midias_locais
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS midias_locais_delete_nivel3 ON public.midias_locais;
CREATE POLICY midias_locais_delete_nivel3
  ON public.midias_locais
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- DEPUTADOS FEDERAIS MAIS VOTADOS (dataset: leitura pública; escrita só admin)
ALTER TABLE public.deputados_federais_mais_votados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dep_fed_mais_votados_select_public ON public.deputados_federais_mais_votados;
CREATE POLICY dep_fed_mais_votados_select_public
  ON public.deputados_federais_mais_votados
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS dep_fed_mais_votados_write_admin ON public.deputados_federais_mais_votados;
CREATE POLICY dep_fed_mais_votados_write_admin
  ON public.deputados_federais_mais_votados
  FOR ALL
  TO authenticated
  USING (public.current_is_nivel(4))
  WITH CHECK (public.current_is_nivel(4));

-- DEPUTADOS ESTADUAIS MAIS VOTADOS (dataset)
ALTER TABLE public.deputados_estaduais_mais_votados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dep_est_mais_votados_select_public ON public.deputados_estaduais_mais_votados;
CREATE POLICY dep_est_mais_votados_select_public
  ON public.deputados_estaduais_mais_votados
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS dep_est_mais_votados_write_admin ON public.deputados_estaduais_mais_votados;
CREATE POLICY dep_est_mais_votados_write_admin
  ON public.deputados_estaduais_mais_votados
  FOR ALL
  TO authenticated
  USING (public.current_is_nivel(4))
  WITH CHECK (public.current_is_nivel(4));

-- CANDIDATOS PREFEITO BA 2024 (dataset)
ALTER TABLE public.candidatos_prefeito_ba_2024 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidatos_prefeito_ba_2024_select_public ON public.candidatos_prefeito_ba_2024;
CREATE POLICY candidatos_prefeito_ba_2024_select_public
  ON public.candidatos_prefeito_ba_2024
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS candidatos_prefeito_ba_2024_write_admin ON public.candidatos_prefeito_ba_2024;
CREATE POLICY candidatos_prefeito_ba_2024_write_admin
  ON public.candidatos_prefeito_ba_2024
  FOR ALL
  TO authenticated
  USING (public.current_is_nivel(4))
  WITH CHECK (public.current_is_nivel(4));

-- TRANSFERENCIAS GOVERNAMENTAIS (dataset)
ALTER TABLE public.transferencias_governamentais_test ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS transferencias_select_public ON public.transferencias_governamentais_test;
CREATE POLICY transferencias_select_public
  ON public.transferencias_governamentais_test
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS transferencias_write_admin ON public.transferencias_governamentais_test;
CREATE POLICY transferencias_write_admin
  ON public.transferencias_governamentais_test
  FOR ALL
  TO authenticated
  USING (public.current_is_nivel(4))
  WITH CHECK (public.current_is_nivel(4));

COMMIT;