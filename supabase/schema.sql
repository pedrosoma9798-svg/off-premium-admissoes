-- ═══════════════════════════════════════════════════════════════
-- OFF Premium — Controle de Admissões
-- Schema completo: tabelas, seed, triggers, funções e RLS.
--
-- Como usar: Supabase → SQL Editor → New query → cole tudo → Run.
-- O script é idempotente nas funções/políticas, mas as tabelas
-- usam "create table if not exists": rode em um projeto novo.
-- ═══════════════════════════════════════════════════════════════


-- ───────────────────────────────────────────────────────────────
-- 1. TABELAS
-- ───────────────────────────────────────────────────────────────

-- Lojas: editáveis pelo admin no app.
-- O nome é a chave primária porque é o que admissoes.loja e
-- profiles.lojas guardam (mantém o modelo text/text[] da especificação).
create table if not exists public.lojas (
  nome        text primary key check (length(trim(nome)) > 0),
  ativa       boolean not null default true,
  created_at  timestamptz not null default now()
);

create table if not exists public.profiles (
  id     uuid primary key references auth.users (id) on delete cascade,
  email  text not null,
  nome   text not null,
  role   text not null check (role in ('admin', 'gerente', 'supervisor')),
  lojas  text[] not null default '{}'
);

create table if not exists public.admissoes (
  id              uuid primary key default gen_random_uuid(),
  nome            text not null check (length(trim(nome)) > 0),
  cargo           text not null check (cargo in (
                    'Vendedor', 'Vendedor Extra Natal', 'ADM',
                    'ADM Extra Natal', 'ASL', 'Gerente'
                  )),
  -- ON UPDATE CASCADE: renomear a loja atualiza as admissões.
  -- ON DELETE RESTRICT: não deixa excluir loja que tem admissões.
  loja            text not null references public.lojas (nome)
                    on update cascade on delete restrict,
  data_aprovacao  date not null,
  data_inicio     date,
  status          text not null check (status in (
                    'Pendente', 'Data confirmada', 'Desistente', 'Iniciado'
                  )),
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

-- Índices para as consultas mais comuns (filtro por loja e status).
create index if not exists admissoes_loja_idx   on public.admissoes (loja);
create index if not exists admissoes_status_idx on public.admissoes (status);
create index if not exists admissoes_aprov_idx  on public.admissoes (data_aprovacao desc);


-- ───────────────────────────────────────────────────────────────
-- 2. SEED DAS LOJAS
-- ───────────────────────────────────────────────────────────────

insert into public.lojas (nome) values
  ('OFF PREMIUM - PALLADIUM OUTLET'),
  ('OFF PREMIUM - DOWNTOWN'),
  ('OFF PREMIUM - CATARINA OUTLET'),
  ('OFF PREMIUM - BH OUTLET'),
  ('OFF PREMIUM - CONTAGEM'),
  ('OFF PREMIUM - RIBEIRÃO PRETO'),
  ('OFF PREMIUM - OUTLET GUARULHOS'),
  ('OFF PREMIUM - LEBLON'),
  ('OFF PREMIUM - PRAIA'),
  ('OFF PREMIUM - SALVADOR OUTLET'),
  ('OFF PREMIUM - BRASILIA OUTLET'),
  ('OFF PREMIUM - NOVO HAMBURGO OUTLET'),
  ('OFF PREMIUM - TIJUCAS'),
  ('OFF PREMIUM - OUTLET IFASHION SC'),
  ('OFF PREMIUM - ITUPEVA')
on conflict (nome) do nothing;


-- ───────────────────────────────────────────────────────────────
-- 3. TRIGGERS
-- ───────────────────────────────────────────────────────────────

-- 3.1 updated_at automático em admissoes
create or replace function public.atualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

drop trigger if exists admissoes_updated_at on public.admissoes;
create trigger admissoes_updated_at
  before update on public.admissoes
  for each row execute function public.atualizar_updated_at();

-- 3.2 profiles.lojas só aceita lojas que existem.
-- (Postgres não permite FK em arrays; este trigger faz o papel dela.)
create or replace function public.validar_lojas_do_perfil()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  invalidas text[];
begin
  select array_agg(l) into invalidas
  from unnest(new.lojas) as l
  where not exists (select 1 from public.lojas where nome = l);

  if invalidas is not null then
    raise exception 'Lojas inexistentes no perfil: %', array_to_string(invalidas, ', ');
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_validar_lojas on public.profiles;
create trigger profiles_validar_lojas
  before insert or update of lojas on public.profiles
  for each row execute function public.validar_lojas_do_perfil();

-- 3.3 Renomear loja propaga para os perfis vinculados.
-- (Em admissoes, quem propaga é o ON UPDATE CASCADE da FK.)
create or replace function public.propagar_renome_loja()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.nome is distinct from old.nome then
    update public.profiles
       set lojas = array_replace(lojas, old.nome, new.nome)
     where old.nome = any(lojas);
  end if;
  return new;
end;
$$;

drop trigger if exists lojas_propagar_renome on public.lojas;
create trigger lojas_propagar_renome
  after update of nome on public.lojas
  for each row execute function public.propagar_renome_loja();

-- 3.4 Excluir loja remove o vínculo dos perfis.
-- (Só chega aqui se não houver admissões: a FK é RESTRICT.)
create or replace function public.remover_loja_dos_perfis()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.profiles
     set lojas = array_remove(lojas, old.nome)
   where old.nome = any(lojas);
  return old;
end;
$$;

drop trigger if exists lojas_remover_dos_perfis on public.lojas;
create trigger lojas_remover_dos_perfis
  after delete on public.lojas
  for each row execute function public.remover_loja_dos_perfis();


-- ───────────────────────────────────────────────────────────────
-- 4. FUNÇÕES AUXILIARES DO RLS
--
-- Por que SECURITY DEFINER? A política "admin vê todos os perfis"
-- precisa consultar a própria tabela profiles. Se essa consulta
-- passasse pelo RLS de profiles, o Postgres entraria em loop
-- ("infinite recursion detected in policy"). Funções SECURITY
-- DEFINER rodam com o dono da função e leem profiles sem RLS,
-- quebrando o ciclo. search_path fixo evita sequestro de schema.
-- ───────────────────────────────────────────────────────────────

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
$$;

-- Lojas do usuário logado, somente se ele for gerente ou supervisor.
create or replace function public.minhas_lojas()
returns text[]
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select lojas from public.profiles
      where id = auth.uid() and role in ('gerente', 'supervisor')),
    '{}'::text[]
  );
$$;

-- Ninguém anônimo precisa dessas funções.
revoke execute on function public.is_admin()     from public, anon;
revoke execute on function public.minhas_lojas() from public, anon;
grant  execute on function public.is_admin()     to authenticated;
grant  execute on function public.minhas_lojas() to authenticated;


-- ───────────────────────────────────────────────────────────────
-- 5. ROW LEVEL SECURITY
-- Uma política por comando (sem "for all"), para ficar explícito
-- o que cada papel pode fazer. Sem política = negado.
-- (select ...) em volta das funções faz o Postgres avaliá-las uma
-- vez por consulta, não uma vez por linha.
-- ───────────────────────────────────────────────────────────────

alter table public.lojas     enable row level security;
alter table public.profiles  enable row level security;
alter table public.admissoes enable row level security;

-- 5.1 ADMISSOES ------------------------------------------------

drop policy if exists "admissoes: admin seleciona"      on public.admissoes;
drop policy if exists "admissoes: admin insere"         on public.admissoes;
drop policy if exists "admissoes: admin atualiza"       on public.admissoes;
drop policy if exists "admissoes: admin exclui"         on public.admissoes;
drop policy if exists "admissoes: gerente seleciona"    on public.admissoes;

create policy "admissoes: admin seleciona"
  on public.admissoes for select to authenticated
  using ((select public.is_admin()));

create policy "admissoes: admin insere"
  on public.admissoes for insert to authenticated
  with check ((select public.is_admin()));

create policy "admissoes: admin atualiza"
  on public.admissoes for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "admissoes: admin exclui"
  on public.admissoes for delete to authenticated
  using ((select public.is_admin()));

-- Gerente e supervisor: somente leitura, somente as lojas do perfil.
-- "in (select unnest(...))" compara com cada loja do array e deixa o
-- Postgres calcular a lista uma vez só por consulta.
create policy "admissoes: gerente seleciona"
  on public.admissoes for select to authenticated
  using (loja in (select unnest(public.minhas_lojas())));

-- 5.2 PROFILES -------------------------------------------------

drop policy if exists "profiles: usuario le o proprio"  on public.profiles;
drop policy if exists "profiles: admin seleciona"       on public.profiles;
drop policy if exists "profiles: admin insere"          on public.profiles;
drop policy if exists "profiles: admin atualiza"        on public.profiles;
drop policy if exists "profiles: admin exclui"          on public.profiles;

-- Sem esta política o app não saberia o papel e as lojas da gerente.
create policy "profiles: usuario le o proprio"
  on public.profiles for select to authenticated
  using (id = (select auth.uid()));

create policy "profiles: admin seleciona"
  on public.profiles for select to authenticated
  using ((select public.is_admin()));

create policy "profiles: admin insere"
  on public.profiles for insert to authenticated
  with check ((select public.is_admin()));

create policy "profiles: admin atualiza"
  on public.profiles for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "profiles: admin exclui"
  on public.profiles for delete to authenticated
  using ((select public.is_admin()));

-- 5.3 LOJAS ----------------------------------------------------

drop policy if exists "lojas: autenticados leem"  on public.lojas;
drop policy if exists "lojas: admin insere"       on public.lojas;
drop policy if exists "lojas: admin atualiza"     on public.lojas;
drop policy if exists "lojas: admin exclui"       on public.lojas;

create policy "lojas: autenticados leem"
  on public.lojas for select to authenticated
  using (true);

create policy "lojas: admin insere"
  on public.lojas for insert to authenticated
  with check ((select public.is_admin()));

create policy "lojas: admin atualiza"
  on public.lojas for update to authenticated
  using ((select public.is_admin()))
  with check ((select public.is_admin()));

create policy "lojas: admin exclui"
  on public.lojas for delete to authenticated
  using ((select public.is_admin()));


-- ───────────────────────────────────────────────────────────────
-- 6. PRIMEIRO ADMIN (rodar DEPOIS de criar o usuário no painel)
--
-- 1) Supabase → Authentication → Users → Add user → Create new user
--    (marque "Auto Confirm User").
-- 2) Troque o e-mail e o nome abaixo e rode só este bloco:
--
-- insert into public.profiles (id, email, nome, role, lojas)
-- select id, email, 'Seu Nome', 'admin', '{}'
-- from auth.users
-- where email = 'seu.email@empresa.com.br';

-- ───────────────────────────────────────────────────────────────
-- 7. PERMISSÕES DE TABELA (GRANTS)
--
-- O RLS decide QUAIS LINHAS cada um vê. Estes GRANTs decidem se o
-- papel pode tocar na tabela. Sem eles, nem o admin consegue ler o
-- próprio perfil: o Postgres responde "permission denied" antes de
-- o RLS sequer ser consultado.
--
-- anon (visitante sem login) não recebe nada: todo acesso exige
-- sessão. TRUNCATE é revogado de todos porque ele IGNORA o RLS.
-- ───────────────────────────────────────────────────────────────

grant usage on schema public to authenticated, service_role;

-- Usuários logados: o RLS filtra as linhas.
grant select, insert, update, delete on all tables in schema public to authenticated;

-- service_role: usado só no servidor, para criar e editar contas.
grant select, insert, update, delete on all tables in schema public to service_role;

-- Ninguém precisa destes, e TRUNCATE contorna o RLS.
revoke truncate, references, trigger on all tables in schema public
  from anon, authenticated, service_role;

-- Visitante sem login não acessa nada.
revoke all on all tables in schema public from anon;
revoke usage on schema public from anon;

-- Mesmas regras para tabelas criadas no futuro.
alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated, service_role;
alter default privileges in schema public
  revoke truncate, references, trigger on tables from anon, authenticated, service_role;
alter default privileges in schema public revoke all on tables from anon;
-- ───────────────────────────────────────────────────────────────
