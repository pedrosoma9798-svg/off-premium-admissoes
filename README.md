# OFF Premium — Controle de Admissões

App interno para o RH registrar admissões e as gerentes acompanharem quando
cada pessoa começa. Next.js 14 + Supabase + Vercel, tudo no plano gratuito.

- **RH (admin):** cadastra e edita admissões, contas de acesso e lojas.
- **Gerente / supervisor:** vê, só para leitura, as admissões das suas lojas.

---

## 1. Criar o projeto no Supabase

1. Acesse <https://supabase.com>, faça login e clique em **New project**.
2. Dê um nome (ex.: `off-premium-admissoes`), crie uma senha forte para o
   banco e escolha a região **South America (São Paulo)**.
3. Aguarde o projeto ficar pronto (1 a 2 minutos).

## 2. Rodar o SQL

1. No menu lateral, abra **SQL Editor → New query**.
2. Cole todo o conteúdo de [`supabase/schema.sql`](supabase/schema.sql).
3. Clique em **Run**. Deve terminar com "Success". Avisos (NOTICE) são normais.

O script cria as tabelas `lojas`, `admissoes` e `profiles`, cadastra as 15
lojas e liga as regras de segurança (RLS).

## 3. Desligar o autocadastro

Ninguém deve conseguir criar conta sozinho.

1. **Authentication → Sign In / Providers** (ou **Settings**, conforme a versão do painel).
2. Desative **Allow new users to sign up**. As contas criadas pelo RH no
   app já nascem confirmadas, sem e-mail de confirmação.

## 4. Criar o primeiro admin

As demais contas são criadas pelo próprio app. A primeira, não.

1. **Authentication → Users → Add user → Create new user**.
2. Informe e-mail e senha e marque **Auto Confirm User**.
3. Volte ao **SQL Editor**, troque os dados abaixo e rode:

```sql
insert into public.profiles (id, email, nome, role, lojas)
select id, email, 'Seu Nome', 'admin', '{}'
from auth.users
where email = 'seu.email@empresa.com.br';
```

## 5. Configurar o `.env.local` (para rodar no seu computador)

1. Copie `.env.local.example` para `.env.local`.
2. Em **Project Settings → API** (ou **API Keys**), copie:

| Variável | Onde encontrar | Pode ir para o navegador? |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Project URL | Sim |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | chave `anon` ou `publishable` | Sim (o RLS protege os dados) |
| `SUPABASE_SERVICE_ROLE_KEY` | chave `service_role` ou `secret` | **Nunca** |

> A `SUPABASE_SERVICE_ROLE_KEY` ignora todas as regras de segurança do banco.
> Ela só é usada no servidor, para criar e editar contas. Nunca coloque o
> prefixo `NEXT_PUBLIC_` nela e nunca a envie para o Git.

3. Rode localmente (Node 18.18 ou mais novo):

```bash
npm install
npm run dev
```

Abra <http://localhost:3000> e entre com o admin do passo 4.

## 6. Deploy na Vercel

1. Suba o projeto para um repositório no GitHub. O `.gitignore` já impede
   o envio do `.env.local`.
2. Em <https://vercel.com>, clique em **Add New → Project** e importe o
   repositório. A Vercel detecta Next.js sozinha.
3. Em **Environment Variables**, cadastre as 3 variáveis do passo 5.
4. Clique em **Deploy**.
5. Copie a URL gerada (ex.: `https://off-premium-admissoes.vercel.app`) e,
   no Supabase, vá em **Authentication → URL Configuration** e coloque essa
   URL em **Site URL**.

## 7. Uso no dia a dia

**RH**
- **Admissões ativas:** tudo que não está "Iniciado". Busca e filtros ficam
  na URL, então dá para salvar o link de um filtro.
- **Iniciado** manda o registro para o **Histórico**. Para desfazer, abra o
  registro no histórico, clique em **Editar** e troque o status.
- **Usuários:** crie a conta, marque as lojas e passe a senha à pessoa por um
  canal privado. Na edição, dá para redefinir a senha.
- **Lojas:** renomear atualiza automaticamente admissões e acessos. Loja que
  fechou: use **Desativar** (some dos formulários, o histórico fica).

**Gerente**
- Abre o link no celular, entra e vê os 3 blocos da loja.
- Os dados atualizam ao recarregar a página.
- Supervisor (ou quem tem mais de uma loja) escolhe a loja no topo, ou
  "Todas as lojas".

## 8. Regras importantes já implementadas

- **Segurança no banco, não só na tela:** cada consulta da gerente passa pelo
  RLS do Postgres. Mesmo chamando a API direto, ela só recebe dados das
  próprias lojas.
- **Fuso de Brasília:** a Vercel roda em UTC. O "hoje" do painel é calculado
  em `America/Sao_Paulo`, então um início marcado para hoje não some às 21h.
- **"Última atualização"** é o horário em que a página foi carregada.

## 9. Notificações por e-mail (fase 2)

Hoje `notificarGerente()` em [`lib/notifications.ts`](lib/notifications.ts)
só escreve no log (Vercel → projeto → **Logs**). Ela já é chamada ao criar
uma admissão e ao mudar data de início ou status. Para enviar e-mail:

1. Crie conta no <https://resend.com> e verifique o domínio da empresa.
2. `npm install resend` e adicione `RESEND_API_KEY` nas variáveis da Vercel.
3. Troque o corpo da função por algo assim:

```ts
import { Resend } from 'resend'
import { criarClienteAdmin } from './supabase/admin'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function notificarGerente(admissao: Admissao, motivo: MotivoNotificacao = 'atualizada') {
  // Busca os e-mails de quem tem acesso à loja
  const { data } = await criarClienteAdmin()
    .from('profiles')
    .select('email')
    .contains('lojas', [admissao.loja])
  const destinatarios = (data ?? []).map((p) => p.email)
  if (destinatarios.length === 0) return

  await resend.emails.send({
    from: 'Admissões OFF Premium <admissoes@seudominio.com.br>',
    to: destinatarios,
    subject: `Admissão ${motivo}: ${admissao.nome}`,
    text: `${admissao.nome} (${admissao.cargo}) — status: ${admissao.status}` +
      (admissao.data_inicio ? ` — início: ${admissao.data_inicio}` : ''),
  })
}
```

## 10. Observações sobre o plano gratuito

- **Supabase free pausa o projeto após 7 dias sem nenhum acesso.** Com uso
  diário isso não acontece. Se pausar, reative em um clique no painel; os
  dados não se perdem.
- O plano free não tem backup automático. Para uma cópia de segurança, use
  **Database → Backups** (planos pagos) ou exporte as tabelas pelo
  **Table Editor** de tempos em tempos.

## Estrutura

```
app/
  login/            entrar e sair
  admin/            área do RH (ativas, nova, [id]/editar, historico, usuarios, lojas)
  gerente/          painel da gerente
  auth/sem-perfil/  encerra sessão de conta sem perfil
components/         formulários, listas, chips, cabeçalho
lib/
  constants.ts      cargos, status, papéis e cores
  datas.ts          datas no fuso de Brasília
  auth.ts           perfil logado e checagem de admin
  consultas.ts      consultas reutilizadas
  notifications.ts  gancho de notificação
  supabase/         clientes (navegador, servidor, admin, middleware)
supabase/schema.sql tabelas, seed, triggers, RLS
docs/PROMPT_AJUSTADO.md  especificação revisada
```

## Logo

`public/logo.png` é uma versão provisória com as cores da marca. Para usar a
oficial, substitua o arquivo mantendo a proporção 720×200 (ou ajuste
`components/Logo.tsx`).
