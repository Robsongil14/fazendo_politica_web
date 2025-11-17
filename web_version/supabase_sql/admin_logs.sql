-- Cria tabela de logs administrativos
create table if not exists admin_logs (
  id bigint generated always as identity primary key,
  actor_id uuid,
  target_id uuid,
  action text not null,
  changes jsonb,
  created_at timestamptz default now()
);

alter table admin_logs enable row level security;

-- Observação: o service role ignora RLS. Se desejar visualizar via cliente,
-- crie políticas específicas para leitura por admins.