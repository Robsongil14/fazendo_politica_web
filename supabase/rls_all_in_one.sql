-- Script único consolidado: funções + políticas RLS
-- Ordem: 1) Funções nível de acesso  2) Perfis  3) Tabelas públicas
--        4) Ajustes de tabelas com RLS  5) Dados privados por usuário

BEGIN;

/* ==========================================================
   1) Funções de nível de acesso
   ========================================================== */

-- Retorna o nível de acesso do usuário atual (1 para anônimo/sem perfil)
CREATE OR REPLACE FUNCTION public.current_access_level()
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (
      SELECT access_level
      FROM public.profiles
      WHERE id = auth.uid()
    ),
    1
  );
$$;

-- Helper: verifica se o nível atual é >= ao mínimo especificado
CREATE OR REPLACE FUNCTION public.current_is_nivel(min_nivel integer)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT public.current_access_level() >= min_nivel;
$$;

GRANT EXECUTE ON FUNCTION public.current_access_level() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.current_is_nivel(integer) TO anon, authenticated;

/* ==========================================================
   2) Políticas para perfis (cada usuário vê/edita o próprio; admin vê/edita tudo)
   ========================================================== */

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS profiles_select_self_or_admin ON public.profiles;
CREATE POLICY profiles_select_self_or_admin
  ON public.profiles
  FOR SELECT
  TO authenticated
  USING (id = auth.uid() OR public.current_is_nivel(4));

DROP POLICY IF EXISTS profiles_insert_self_or_admin ON public.profiles;
CREATE POLICY profiles_insert_self_or_admin
  ON public.profiles
  FOR INSERT
  TO authenticated
  WITH CHECK (id = auth.uid() OR public.current_is_nivel(4));

DROP POLICY IF EXISTS profiles_update_self_or_admin ON public.profiles;
CREATE POLICY profiles_update_self_or_admin
  ON public.profiles
  FOR UPDATE
  TO authenticated
  USING (id = auth.uid() OR public.current_is_nivel(4))
  WITH CHECK (id = auth.uid() OR public.current_is_nivel(4));

/* ==========================================================
   3) Tabelas públicas (SELECT aberto; escrita por nível)
   ========================================================== */

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

-- DEPUTADOS FEDERAIS MAIS VOTADOS
ALTER TABLE public.deputados_federais_mais_votados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS dfmv_select_public ON public.deputados_federais_mais_votados;
CREATE POLICY dfmv_select_public
  ON public.deputados_federais_mais_votados
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS dfmv_insert_nivel2 ON public.deputados_federais_mais_votados;
CREATE POLICY dfmv_insert_nivel2
  ON public.deputados_federais_mais_votados
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS dfmv_update_nivel2 ON public.deputados_federais_mais_votados;
CREATE POLICY dfmv_update_nivel2
  ON public.deputados_federais_mais_votados
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS dfmv_delete_nivel3 ON public.deputados_federais_mais_votados;
CREATE POLICY dfmv_delete_nivel3
  ON public.deputados_federais_mais_votados
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- DEPUTADOS ESTADUAIS MAIS VOTADOS
ALTER TABLE public.deputados_estaduais_mais_votados ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS demv_select_public ON public.deputados_estaduais_mais_votados;
CREATE POLICY demv_select_public
  ON public.deputados_estaduais_mais_votados
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS demv_insert_nivel2 ON public.deputados_estaduais_mais_votados;
CREATE POLICY demv_insert_nivel2
  ON public.deputados_estaduais_mais_votados
  FOR INSERT
  TO authenticated
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS demv_update_nivel2 ON public.deputados_estaduais_mais_votados;
CREATE POLICY demv_update_nivel2
  ON public.deputados_estaduais_mais_votados
  FOR UPDATE
  TO authenticated
  USING (public.current_is_nivel(2))
  WITH CHECK (public.current_is_nivel(2));

DROP POLICY IF EXISTS demv_delete_nivel3 ON public.deputados_estaduais_mais_votados;
CREATE POLICY demv_delete_nivel3
  ON public.deputados_estaduais_mais_votados
  FOR DELETE
  TO authenticated
  USING (public.current_is_nivel(3));

-- CANDIDATOS PREFEITO (dataset externo)
ALTER TABLE public.candidatos_prefeito_ba_2024 ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS candidatos_prefeito_select_public ON public.candidatos_prefeito_ba_2024;
CREATE POLICY candidatos_prefeito_select_public
  ON public.candidatos_prefeito_ba_2024
  FOR SELECT
  TO anon, authenticated
  USING (true);

DROP POLICY IF EXISTS candidatos_prefeito_write_admin ON public.candidatos_prefeito_ba_2024;
CREATE POLICY candidatos_prefeito_write_admin
  ON public.candidatos_prefeito_ba_2024
  FOR ALL
  TO authenticated
  USING (public.current_is_nivel(4))
  WITH CHECK (public.current_is_nivel(4));

-- TRANSFERENCIAS GOVERNAMENTAIS (dataset externo)
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

/* ==========================================================
   4) Ajuste de tabelas que já tinham RLS (escrita por nível)
   ========================================================== */

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

/* ==========================================================
   5) Dados privados por usuário (apenas dono; níveis 2/3/4 bloqueados)
   Observação: este bloco assume coluna owner `user_id uuid`.
   Se seu esquema usar outro nome (ex.: `usuario_id`), ajuste abaixo.
   ========================================================== */

ALTER TABLE public.dados_editaveis_nivel1 ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS dados_editaveis_nivel1_select_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_select_self
  ON public.dados_editaveis_nivel1
  FOR SELECT
  TO authenticated
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_insert_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_insert_self
  ON public.dados_editaveis_nivel1
  FOR INSERT
  TO authenticated
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_update_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_update_self
  ON public.dados_editaveis_nivel1
  FOR UPDATE
  TO authenticated
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

DROP POLICY IF EXISTS dados_editaveis_nivel1_delete_self ON public.dados_editaveis_nivel1;
CREATE POLICY dados_editaveis_nivel1_delete_self
  ON public.dados_editaveis_nivel1
  FOR DELETE
  TO authenticated
  USING (user_id = auth.uid());

/* ==========================================================
   6) Dados privados de municípios (bloqueado para níveis 2/3/4; ajustar para owner quando houver coluna `user_id`)
   ========================================================== */

ALTER TABLE public.municipios_dados_privados ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS municipios_dados_privados_select_nivel2_plus ON public.municipios_dados_privados;
DROP POLICY IF EXISTS municipios_dados_privados_select_none ON public.municipios_dados_privados;
CREATE POLICY municipios_dados_privados_select_none
  ON public.municipios_dados_privados
  FOR SELECT
  TO authenticated
  USING (false);

DROP POLICY IF EXISTS municipios_dados_privados_insert_nivel3 ON public.municipios_dados_privados;
DROP POLICY IF EXISTS municipios_dados_privados_insert_none ON public.municipios_dados_privados;
CREATE POLICY municipios_dados_privados_insert_none
  ON public.municipios_dados_privados
  FOR INSERT
  TO authenticated
  WITH CHECK (false);

DROP POLICY IF EXISTS municipios_dados_privados_update_nivel3 ON public.municipios_dados_privados;
DROP POLICY IF EXISTS municipios_dados_privados_update_none ON public.municipios_dados_privados;
CREATE POLICY municipios_dados_privados_update_none
  ON public.municipios_dados_privados
  FOR UPDATE
  TO authenticated
  USING (false)
  WITH CHECK (false);

DROP POLICY IF EXISTS municipios_dados_privados_delete_nivel4 ON public.municipios_dados_privados;
DROP POLICY IF EXISTS municipios_dados_privados_delete_none ON public.municipios_dados_privados;
CREATE POLICY municipios_dados_privados_delete_none
  ON public.municipios_dados_privados
  FOR DELETE
  TO authenticated
  USING (false);

COMMIT;