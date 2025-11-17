BEGIN;

-- Garante colunas úteis no perfil
ALTER TABLE IF EXISTS public.profiles
  ADD COLUMN IF NOT EXISTS email text,
  ADD COLUMN IF NOT EXISTS blocked boolean DEFAULT false;

-- Cria automaticamente uma linha em public.profiles para novos usuários em auth.users
-- Funciona para usuários criados pelo app (signup) e pelo Supabase Studio (Add user)

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Insere perfil básico se ainda não existir
  INSERT INTO public.profiles (id, full_name, email, role, access_level, permissions, blocked, created_at, updated_at)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.email,
    'viewer',
    1,
    jsonb_build_object(
      'can_edit', false,
      'can_view', true,
      'is_admin', false,
      'can_manage_users', false
    ),
    false,
    now(),
    now()
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

-- Trigger: quando um usuário é criado em auth.users, cria o perfil correspondente
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Backfill: cria perfis para usuários já existentes que ainda não têm perfil
INSERT INTO public.profiles (id, full_name, email, role, access_level, permissions, blocked, created_at, updated_at)
SELECT
  u.id,
  COALESCE(u.raw_user_meta_data->>'name', u.email),
  u.email,
  'viewer',
  1,
  jsonb_build_object(
    'can_edit', false,
    'can_view', true,
    'is_admin', false,
    'can_manage_users', false
  ),
  false,
  now(),
  now()
FROM auth.users u
LEFT JOIN public.profiles p ON p.id = u.id
WHERE p.id IS NULL;

-- Backfill de email para perfis existentes sem email
UPDATE public.profiles p
SET email = u.email
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.email = '');

COMMIT;