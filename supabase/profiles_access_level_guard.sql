BEGIN;

-- Função: impede elevação de nível por não-admin
CREATE OR REPLACE FUNCTION public.enforce_profiles_access_level_guard()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  -- Admin (nível >= 4) pode alterar tudo
  IF public.current_is_nivel(4) THEN
    RETURN NEW;
  END IF;

  -- Para INSERT: normaliza access_level para 1 se não-admin
  IF TG_OP = 'INSERT' THEN
    NEW.access_level := 1;
    RETURN NEW;
  END IF;

  -- Para UPDATE: bloquear alteração de access_level por não-admin
  IF TG_OP = 'UPDATE' THEN
    IF NEW.access_level IS DISTINCT FROM OLD.access_level THEN
      RAISE EXCEPTION 'Apenas administradores podem alterar access_level';
    END IF;
    RETURN NEW;
  END IF;

  RETURN NEW;
END;
$$;

-- Triggers: antes de INSERT e UPDATE em profiles
DROP TRIGGER IF EXISTS profiles_access_level_guard_ins ON public.profiles;
CREATE TRIGGER profiles_access_level_guard_ins
BEFORE INSERT ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profiles_access_level_guard();

DROP TRIGGER IF EXISTS profiles_access_level_guard_upd ON public.profiles;
CREATE TRIGGER profiles_access_level_guard_upd
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION public.enforce_profiles_access_level_guard();

COMMIT;