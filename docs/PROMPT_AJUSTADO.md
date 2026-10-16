# Prompt ajustado — OFF Premium · Controle de Admissões

> Versão revisada do prompt original pelo método OPERA (Objetivo, Persona,
> Estrutura, Restrições, Avaliação). Mudanças em relação ao original estão
> listadas no fim deste arquivo.

---

## PERSONA

Você é um engenheiro full-stack sênior especializado em Next.js (App Router),
TypeScript e Supabase (Auth, Postgres e RLS), com experiência em apps
internos mobile-first para varejo.

## OBJETIVO

Construir o webapp **"OFF Premium — Controle de Admissões"**, pronto para
deploy na Vercel (plano free) com Supabase (plano free). Textos de UI, rotas
e comentários em português.

**Contexto.** A OFF Premium é uma rede de outlets. O RH aprova candidatos e a
gerente de cada loja precisa saber **quando** cada novo funcionário começa,
para se organizar. Hoje é planilha. O app tem dois ambientes: RH (admin,
leitura e escrita) e Gerente (somente leitura).

## STACK

- Next.js **14.2.x** (≥ 14.2.35, com patches de segurança), App Router, TypeScript
- Tailwind CSS 3
- Supabase Auth (e-mail + senha) + Postgres, via `@supabase/ssr`
- Sem real-time: dados atualizam ao recarregar a página
- Mobile-first (gerentes usam pelo celular; testar em 375 px)

## MODELO DE DADOS

**`lojas`** (editável pelo admin no app)
- `nome text PK`, `ativa boolean default true`, `created_at timestamptz`
- Seed inicial com as 15 lojas: PALLADIUM OUTLET, DOWNTOWN, CATARINA OUTLET,
  BH OUTLET, CONTAGEM, RIBEIRÃO PRETO, OUTLET GUARULHOS, LEBLON, PRAIA,
  SALVADOR OUTLET, BRASILIA OUTLET, NOVO HAMBURGO OUTLET, TIJUCAS,
  OUTLET IFASHION SC, ITUPEVA (todas com prefixo `OFF PREMIUM - `)
- Renomear uma loja propaga o novo nome para `admissoes.loja`
  (FK `ON UPDATE CASCADE`) e para `profiles.lojas` (trigger com `array_replace`)
- Loja em uso não é excluída; o admin a desativa (some dos formulários)

**`admissoes`**
- `id uuid PK`, `nome text NOT NULL`, `cargo text NOT NULL`,
  `loja text NOT NULL → FK lojas(nome)`, `data_aprovacao date NOT NULL`,
  `data_inicio date NULL`, `status text NOT NULL`,
  `created_at`, `updated_at` (trigger)
- `cargo` ∈ Vendedor · Vendedor Extra Natal · ADM · ADM Extra Natal ·
  ASL (Auxiliar de Loja) · Gerente
- `status` ∈ Pendente · Data confirmada · Desistente · Iniciado
- Validar enums com `CHECK` no banco **e** no formulário; listas em
  `/lib/constants.ts`

**`profiles`**
- `id uuid PK → auth.users`, `email`, `nome`,
  `role` ∈ admin · gerente · supervisor, `lojas text[]` (vazio para admin)
- Trigger valida que toda loja do array existe em `lojas`

## AUTENTICAÇÃO E RLS

- Sem autocadastro. Só o admin cria contas.
- Criação/edição de contas usa `auth.admin.*` com a **service role key**,
  exclusivamente em server actions (`import 'server-only'`), sempre
  verificando antes que quem chama é admin. A chave nunca vai ao cliente.
- Políticas que precisam saber o papel/lojas do usuário usam funções
  `SECURITY DEFINER` (`is_admin()`, `minhas_lojas()`), para evitar recursão
  de RLS em `profiles`.
- Políticas (uma por comando, sem `FOR ALL`):
  - `admissoes`: admin → SELECT/INSERT/UPDATE/DELETE; gerente/supervisor →
    SELECT onde `loja = ANY(minhas_lojas())`
  - `profiles`: usuário lê o próprio perfil; admin lê e escreve todos
  - `lojas`: autenticados leem; admin escreve
- Middleware protege `/admin` e `/gerente`; layouts verificam o papel.

## DATAS (regra obrigatória)

- "Hoje" = data atual em **America/Sao_Paulo** (a Vercel roda em UTC).
- Colunas `date` chegam como `"AAAA-MM-DD"`: formatar por manipulação de
  string, nunca com `new Date("AAAA-MM-DD")` (vira meia-noite UTC e mostra o
  dia anterior no Brasil).

## ÁREA DO RH — `/admin`

Menu: Admissões ativas · Histórico · Usuários · Lojas.

**Admissões ativas** (status ≠ Iniciado): busca por nome; filtros por loja,
cargo e status; ordenação por data de aprovação desc; botão "Nova admissão"
(`/admin/nova`). Cada linha: nome, cargo, loja, aprovação, início, status
(chip) e ações: editar, marcar como iniciado, marcar como desistente,
excluir (com confirmação). Tabela no desktop, cards no celular.

**Formulário:** nome, cargo, loja (lojas ativas), data de aprovação, data de
início (opcional), status. Ao preencher data de início com status
"Pendente", sugerir "Data confirmada".

**Histórico** (`/admin/historico`): registros "Iniciado", com opção de
reabrir a edição.

**Usuários:** criar e editar gerente/supervisor/admin: nome, e-mail, senha
(redefinível na edição), papel, lojas vinculadas (checkbox).

**Lojas:** adicionar, renomear, ativar/desativar.

**Notificação:** `notificarGerente(admissao)` em `/lib/notifications.ts`
como placeholder (`console.log`), chamada ao criar e ao alterar data/status.
README explica como plugar o Resend.

## ÁREA DA GERENTE — `/gerente` (somente leitura)

Vê apenas admissões das lojas do perfil, exceto "Iniciado". Dashboard:

```
Admissões — OFF PREMIUM - PALLADIUM OUTLET

🟢 Próximos inícios
   15/10 — Rebecca Rodrigues — Vendedor Extra Natal
🟡 Aguardando data de início — 2 admissões (nome + cargo)
🔴 Desistências — 1 (nome + cargo)

Última atualização: 15/10/2026 14:32
```

- Próximos inícios: status "Data confirmada" e `data_inicio >= hoje`,
  ordem crescente; data em destaque (grande, negrito, verde).
- Aguardando: status "Pendente" (contagem + lista).
- Desistências: status "Desistente" (contagem + lista).
- Usuário com mais de uma loja (supervisor) ganha seletor: uma loja ou
  "Todas as lojas" (na visão geral, cada item mostra a loja).
- "Última atualização" = horário de carregamento da página, em Brasília.

## IDENTIDADE VISUAL

Logo em `/public/logo.png` (fundo #1a1a1a, "OFF" #8a8a8a, "PREMIUM"
#ffffff); se não houver arquivo, gerar um provisório com essas cores.
Chips: Pendente amber-100/800 · Data confirmada emerald-100/800 ·
Desistente red-100/800 · Iniciado gray-200/600. Minimalista, muito espaço
em branco, `rounded-xl`, sombra sutil.

## RESTRIÇÕES

- App começa vazio; sem importação de XLSX.
- Fora do escopo: e-mail real, log de auditoria, Gupy, exportar CSV, real-time.
- Não simplificar o RLS. Comentar o código em português onde ajudar.
- Dependências com versão exata.

## ESTRUTURA DA ENTREGA

Projeto completo como arquivos (repositório/zip), contendo:
1. `supabase/schema.sql` — tabelas, seed de lojas, triggers, funções, RLS
2. `.env.local.example` — URL, anon key, service role key
3. `package.json` e configs
4. Todo o código do app
5. `README.md` — Supabase do zero, SQL, primeiro admin, `.env`, deploy na
   Vercel, como plugar Resend
6. Checklist de próximos passos

## AVALIAÇÃO (critérios de aceite)

- [ ] `npm run build` passa sem erros de tipo
- [ ] Admin cria, edita e exclui admissões
- [ ] Admin cria contas e define as lojas de cada uma
- [ ] Admin gerencia lojas; renomear não quebra vínculos
- [ ] Gerente vê **somente** suas lojas — garantido pelo RLS, não só pela UI
- [ ] Dashboard da gerente com os 3 blocos e contagens corretas
- [ ] Próximos inícios em ordem crescente, data em destaque
- [ ] Chips com as 4 cores
- [ ] "Iniciado" sai da lista ativa e vai para o histórico
- [ ] Datas corretas no fuso de Brasília, inclusive após as 21h
- [ ] Funciona em 375 px
- [ ] Service role key nunca aparece no bundle do cliente

---

## O que mudou em relação ao original

| Pilar | Antes | Depois |
|---|---|---|
| Objetivo | Claro | Mantido; contexto condensado |
| Persona | Ausente | Engenheiro full-stack sênior Next.js/Supabase |
| Estrutura | "Todos os arquivos em blocos de código" (~40 blocos num chat) | Entrega como projeto/arquivos |
| Restrições | Lojas fixas em `constants.ts`; sem regra de fuso; sem service role | Tabela `lojas` editável; fuso de Brasília; service role server-only; RLS com `SECURITY DEFINER` |
| Avaliação | 9 critérios | + build sem erro, RLS como garantia, fuso, segredo fora do bundle |

Mantidos ao pé da letra, por decisão do cliente: sem `CHECK` ligando
"Data confirmada" a `data_inicio` preenchida, e desistências exibidas sem
janela de tempo.
