# MenuChef 🍔

Starter full-stack **white-label de cardápio online e delivery**, pronto para demonstrar e evoluir. Um único projeto Next.js atende vários restaurantes — cada um com seu slug, logo, cor, cardápio, fila de pedidos e layout de impressão.

> **MVP de demonstração.** O `/admin` não tem autenticação por padrão. Proteja-o antes de publicar em produção (veja [Segurança](#segurança-e-produção)).

---

## O que está pronto

- **Cardápio público mobile-first** em `/[slug]` com branding dinâmico (cor primária, logo, nome e contato do tenant).
- **Categorias com navegação sticky** e scrollspy, cards de produto e modal de detalhes.
- **Carrinho com adicionais**: grupos de opções com mínimo/máximo, preço extra e observações por item.
- **Checkout completo**: entrega, retirada ou mesa, PIX/dinheiro/cartão, troco para dinheiro, taxa de entrega e resumo. O checkout só lista os métodos habilitados para aquele tenant.
- **Preço recalculado no servidor** a partir do banco — o cliente nunca define quanto vai pagar.
- **KDS de cozinha** em `/admin/[slug]`: fila por status, avanço rápido, cancelamento e alerta sonoro.
- **Tempo real via SSE**: novos pedidos e mudanças de status chegam sem refresh; reconexão automática.
- **Recibo térmico 80mm**: pop-up com CSS `@page`, layout monoespaçado e conteúdo escapado.
- **Multi-tenant** com seed de dois restaurantes, cardápios, opções e pedidos de exemplo em todos os estágios.
- **API modular** com validação Zod, erros padronizados e DTOs serializáveis.
- **TypeScript strict**, Tailwind CSS 4, ESLint e build de produção.

---

## Stack

| Camada | Tecnologia |
| --- | --- |
| Framework | Next.js **15** (App Router, Route Handlers, Server Components) |
| Linguagem | TypeScript |
| Estilo | Tailwind CSS 4 |
| Banco | PostgreSQL 16 |
| ORM | Prisma 6 |
| Validação | Zod |
| Realtime | Server-Sent Events (EventSource + hub in-process) |
| Ícones/UX | lucide-react + sonner |
| Seed | `tsx` + Prisma Client |

---

## Demos do seed

| Restaurante | Cardápio | Cozinha |
| --- | --- | --- |
| **Brasa Burger** | [`/brasa-burger`](http://localhost:3000/brasa-burger) | [`/admin/brasa-burger`](http://localhost:3000/admin/brasa-burger) |
| **Verde Vivo** | [`/verde-vivo`](http://localhost:3000/verde-vivo) | [`/admin/verde-vivo`](http://localhost:3000/admin/verde-vivo) |

A raiz `/admin` redireciona para o tenant definido em `NEXT_PUBLIC_DEFAULT_TENANT_SLUG` (ou para o primeiro tenant criado).

### Roteiro rápido de teste

1. Abra o cardápio em uma janela e o KDS em outra.
2. Monte um pedido com adicionais e finalize no checkout.
3. O pedido aparece no KDS em tempo real.
4. No KDS, clique em **Ativar som** (o navegador exige um gesto para liberar áudio).
5. Avance o pedido: **Iniciar preparo → Marcar como pronto → Saiu para entrega → Concluir**.
6. Clique no ícone de impressora para abrir o cupom de 80mm.

---

## Como rodar

### Pré-requisitos

- Node.js **20+** (testado com Node 24)
- PostgreSQL **14+** local **ou** Docker
- npm

### 1. Instalar e configurar

```bash
git clone https://github.com/ErikMartinsss-hub/MenuChef.git
cd MenuChef
npm install

# Linux/macOS
cp .env.example .env

# Windows PowerShell
Copy-Item .env.example .env
```

### 2. Subir o PostgreSQL

Com Docker:

```bash
docker compose up -d
```

O `docker-compose.yml` cria o banco `menuchef` em `localhost:5432` com usuário/senha `menuchef`, exatamente como no `.env.example`.

<details>
<summary>Sem Docker? Use um PostgreSQL local</summary>

```sql
CREATE USER menuchef WITH PASSWORD 'menuchef';
CREATE DATABASE menuchef OWNER menuchef;
```

E mantenha no `.env`:

```env
DATABASE_URL="postgresql://menuchef:menuchef@localhost:5432/menuchef?schema=public"
```

</details>

### 3. Criar o schema e popular o banco

```bash
npm run db:push
npm run db:seed
```

O seed é **idempotente para os tenants de demonstração**: remove apenas `brasa-burger` e `verde-vivo` e recria tudo.

### 4. Rodar

```bash
npm run dev
```

- Landing: <http://localhost:3000>
- Cardápio: <http://localhost:3000/brasa-burger>
- Cozinha: <http://localhost:3000/admin/brasa-burger>
- Healthcheck: <http://localhost:3000/api/health>

---

## Variáveis de ambiente

| Variável | Obrigatória | Descrição |
| --- | --- | --- |
| `DATABASE_URL` | sim | Connection string PostgreSQL usada pela app e pelo Prisma CLI. |
| `NEXT_PUBLIC_APP_URL` | não | URL pública usada em metadados/Open Graph. Padrão: `http://localhost:3000`. |
| `NEXT_PUBLIC_DEFAULT_TENANT_SLUG` | não | Tenant para o qual `/admin` redireciona. Padrão: primeiro criado. |
| `PRISMA_LOG_QUERIES` | não | `true` para logar SQL no servidor em desenvolvimento. |

---

## Scripts

| Comando | O que faz |
| --- | --- |
| `npm run dev` | Servidor de desenvolvimento. |
| `npm run build` | Gera Prisma Client e compila para produção. |
| `npm run start` | Sobe o build de produção. |
| `npm run lint` | ESLint (flat config). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run db:push` | Sincroniza o schema sem criar migration (rápido para MVP). |
| `npm run db:migrate` | Cria/aplica migration de desenvolvimento. |
| `npm run db:seed` | Popula os dois restaurantes de demo. |
| `npm run db:studio` | Abre o Prisma Studio. |
| `npm run db:reset` | Reseta o banco e reaplica migrations. |

> Para produção, prefira `prisma migrate deploy` com migrations versionadas. O projeto começa com `db:push` para o primeiro contato ser imediato.

---

## Estrutura

```text
MenuChef/
├─ prisma/
│  ├─ schema.prisma          # modelo multi-tenant
│  └─ seed.ts                # 2 restaurantes + pedidos de exemplo
├─ public/brands/            # logos dos tenants demo
├─ src/
│  ├─ app/
│  │  ├─ [slug]/             # cardápio público (Server Component)
│  │  ├─ admin/              # redirecionador + KDS
│  │  ├─ api/
│  │  │  ├─ tenants/         # leitura de tenant e produtos
│  │  │  ├─ orders/          # criação e atualização de pedidos
│  │  │  ├─ realtime/[slug]/ # stream SSE
│  │  │  └─ health/          # healthcheck do banco
│  │  ├─ layout.tsx
│  │  ├─ page.tsx            # landing
│  │  └─ globals.css         # tokens + tema dinâmico
│  ├─ components/
│  │  ├─ storefront/         # header, menu, modal, sacola, checkout
│  │  ├─ admin/              # KDS e card de pedido
│  │  └─ ui/                 # Button, Dialog, Badge, Stepper, Image
│  ├─ hooks/                 # carrinho, SSE, áudio, relógio
│  ├─ lib/
│  │  ├─ order-service.ts    # pricing/validação transacional
│  │  ├─ queries.ts          # leituras + DTOs
│  │  ├─ receipt.ts          # HTML do cupom 80mm
│  │  ├─ realtime.ts         # hub pub/sub do SSE
│  │  ├─ validators.ts       # schemas Zod
│  │  └─ ...
│  └─ types/                 # contratos compartilhados
├─ docker-compose.yml
├─ .env.example
└─ README.md
```

---

## Modelo de dados (Prisma)

```text
Tenant 1─N Category 1─N Product 1─N ProductOptionGroup 1─N ProductOption
   │                        │
   │                        └─N OrderItem (snapshot)
   └─N Order 1─N OrderItem
```

Decisões relevantes:

- **Preços em `Decimal(10,2)`** no banco e cálculos em centavos no servidor, evitando erros de ponto flutuante.
- **OrderItem guarda snapshot** de nome, preço unitário, opções e observações. Editar o cardápio não altera pedidos históricos.
- **`orderNumber` curto por tenant**, gerado por um contador atômico (`Tenant.orderSequence`) dentro de transação. O número aparece como `#0042`.
- **Opções são validadas novamente no servidor**: pertinência ao produto, mínimo/máximo por grupo e preço.
- **`tenantId` em Product** além da categoria permite consultas diretas por tenant e defesa em profundidade.
- **`OrderStatus`**: `PENDING`, `PREPARING`, `READY`, `DISPATCHED`, `COMPLETED`, `CANCELLED`.
- **`OrderType`**: `DELIVERY`, `TAKEOUT`, `TABLE`.
- **`PaymentMethod`**: `PIX`, `CASH`, `CARD`.
- **`PaymentStatus`**: `PENDING`, `PAID`, `REFUNDED` (rastreio de pagamento por pedido).
- **`TenantPaymentSettings`**: configuração de pagamento **1:1 com o tenant** (flags de métodos, chave PIX, titular, cidade, instruções). No MVP atual o provider é `MANUAL`.

### Cancelamento

Pedidos cancelados saem das abas ativas. O KDS permite cancelar enquanto o pedido está pendente ou em preparo.

---

## Pagamentos por loja

O objetivo do modelo é que **cada loja tenha o seu próprio pagamento** (conta PIX diferente, formas habilitadas diferente). Hoje o MVP implementa o caminho **manual**:

- Cada tenant tem um registro `TenantPaymentSettings` (1:1).
- O tenant escolhe quais métodos existem no cardápio público: **PIX**, **Dinheiro** e/ou **Cartão**.
- Se PIX for habilitado, o admin informa a **chave PIX** daquele estabelecimento (CPF/CNPJ/e-mail/telefone/chave aleatória), o **nome do titular**, a **cidade** (BR Code) e instruções para o cliente.
- O checkout público (`/[slug]`) filtra os métodos habilitados e, se PIX estiver ativo, mostra a chave da loja para o cliente copiar/colar ou acompanhar no comprovante.
- O sucesso do pedido mostra o status de pagamento e as instruções PIX (com botão de copiar chave).
- O KDS (`/admin/[slug]`) mostra o status (`Pago`/`A pagar`/`Estornado`) e tem a ação **Marcar como pago** (fluxo manual de conferência).
- O recibo 80mm imprime o status de pagamento junto ao total.

### Rotas

- `GET /api/tenants/[slug]/payment-settings` → `{ payment: { provider, pixEnabled, cashEnabled, cardEnabled, pixKeyType, pixKey, pixHolderName, pixCity, instructions } }`
- `PUT /api/tenants/[slug]/payment-settings` → atualiza os campos (Zod valida ao menos um método e a chave PIX conforme o tipo).
- `GET /api/orders/[id]/payment` e `PATCH /api/orders/[id]/payment` → `{ paymentStatus }` ∈ `PENDING | PAID | REFUNDED`.

### Configuração no admin

A página de configurações fica em `/admin/[slug]/pagamentos` e salva via `PUT`. No seed, os dois restaurantes já vêm configurados:

| Tenant | PIX | Dinheiro | Cartão | Chave |
| --- | --- | --- | --- | --- |
| **Brasa Burger** | ✅ | ✅ | ✅ | CNPJ `12.345.678/0001-90` |
| **Verde Vivo** | ✅ | ✅ | ❌ (desabilitado) | E-mail `financeiro@verdevivo.com.br` |

Isso demonstra o efeito do filtro: no cardápio do **Verde Vivo** não aparece a opção de cartão.

### Próximo passo: pagamentos automáticos (gateway por tenant)

O modelo já prepara o terreno para o próximo incremento:

- O enum `PaymentProvider` (`MANUAL`, `MERCADO_PAGO`, `STRIPE`, `PAGARME`, `ASAAS`) aceita o gateway escolhido pelo tenant.
- No futuro, cada tenant terá **suas próprias credenciais** (conta/merchant account) no provedor, preferencialmente via **Connect / subcontas** (Mercado Pago Connect, Stripe Connect, Asaas subaccounts, Pagar.me), para o dinheiro cair na conta daquela loja.
- O checkout consultará a configuração pública do tenant e criará o charge **no servidor** usando as credenciais daquele tenant (nunca no client).
- Webhooks por tenant (`/api/webhooks/payments/[provider]/[slug]`) validarão assinatura e atualizarão `paymentStatus`/`paidAt` com idempotência.
- Para PIX dinâmico, o BR Code/EVP será gerado com a chave e os dados daquele tenant no servidor.

---

## API

Todas as respostas são JSON. Erros de validação retornam `422` com `{ error, details }`.

| Método | Rota | Descrição |
| --- | --- | --- |
| `GET` | `/api/tenants` | Lista resumos dos tenants. |
| `GET` | `/api/tenants/[slug]` | Tenant completo: branding, categorias, produtos e opções. |
| `GET` | `/api/tenants/[slug]/products` | Categorias e produtos ativos do tenant. |
| `GET` | `/api/tenants/[slug]/orders?status=active\|completed\|all&limit=120` | Fila do KDS. |
| `GET` | `/api/tenants/[slug]/payment-settings` | Configuração de pagamento pública do tenant (métodos habilitados + chave PIX). |
| `PUT` | `/api/tenants/[slug]/payment-settings` | Atualiza métodos habilitados e chave PIX do tenant. |
| `POST` | `/api/orders` | Cria pedido, recalcula preços e publica evento SSE. |
| `GET` | `/api/orders/[id]` | Consulta um pedido. |
| `PATCH` | `/api/orders/[id]` | Atualiza status (`{ "status": "PREPARING" }`). |
| `GET` | `/api/orders/[id]/payment` | Consulta status de pagamento do pedido. |
| `PATCH` | `/api/orders/[id]/payment` | Atualiza status de pagamento (`{ "paymentStatus": "PAID" }`). |
| `GET` | `/api/realtime/[slug]` | Stream SSE de `order.created` / `order.updated`. |
| `GET` | `/api/health` | Status do banco. |

### Exemplo: criar pedido

```bash
curl -X POST http://localhost:3000/api/orders \
  -H "Content-Type: application/json" \
  -d '{
    "tenantSlug": "brasa-burger",
    "type": "DELIVERY",
    "customerName": "Marina Souza",
    "customerPhone": "(11) 98888-1234",
    "address": "Rua Harmonia, 321, apto 12",
    "paymentMethod": "PIX",
    "notes": "Entregar na portaria",
    "items": [
      {
        "productId": "<PRODUCT_ID>",
        "quantity": 1,
        "optionIds": ["<OPTION_ID_1>", "<OPTION_ID_2>"],
        "notes": "Sem cebola"
      }
    ]
  }'
```

O payload só envia IDs de produto/opção e quantidades. **Preço, taxas e total são calculados no servidor** dentro de uma transação que também gera o próximo `orderNumber`.

### Exemplo: avançar status

```bash
curl -X PATCH http://localhost:3000/api/orders/<ORDER_ID> \
  -H "Content-Type: application/json" \
  -d '{ "status": "PREPARING" }'
```

---

## Tempo real (SSE)

Fluxo:

1. O KDS abre `EventSource` em `/api/realtime/[slug]`.
2. A rota resolve o `tenantId` e se inscreve no hub em memória.
3. `POST /api/orders` e `PATCH /api/orders/[id]` publicam `order.created` / `order.updated`.
4. O hub envia o evento apenas para os inscritos daquele tenant.
5. Heartbeat a cada 25s mantém a conexão viva; `retry: 3000` faz o EventSource reconectar.
6. Ao reconectar, o KDS re-sincroniza a fila via API para cobrir eventos perdidos durante a queda.

> **Limite importante:** o hub é in-process. Funciona perfeitamente em um único processo Node (dev, um container, uma VPS) e é ideal para o MVP. Em múltiplas instâncias/serverless, troque `src/lib/realtime.ts` por Redis pub/sub, Postgres `LISTEN/NOTIFY` ou um serviço gerenciado. O resto do app não precisa mudar.

---

## Impressão térmica 80mm

`src/lib/receipt.ts` monta um documento HTML autocontido:

```css
@page { size: 80mm auto; margin: 0; }
body { width: 80mm; font-family: "Courier New", monospace; }
.receipt { width: 74mm; }
```

- Botão **Imprimir recibo** em cada card do KDS abre um pop-up e chama `window.print()`.
- Inclui logo (se `printSettings.showLogo !== false`), cabeçalho configurável, dados do cliente, endereço/mesa, itens com adicionais, observações, taxa, troco e rodapé.
- Conteúdo digitado pelo cliente é escapado antes de entrar no HTML.
- Funciona com impressoras térmicas que expõem driver de impressão no sistema (Epson, Elgin, Bematech, i9, etc.).
- Para **ESC/POS bruto** (sem diálogo do navegador) seria necessário um agente local ou impressão via rede/SDK — o pop-up cobre o caso de uso de balcão do MVP.

Configuração por tenant em `Tenant.printSettings`:

```json
{
  "footerNote": "Obrigado pela preferência!",
  "receiptHeader": "Hambúrgueres artesanais",
  "showLogo": true,
  "paperWidthMm": 80
}
```

---

## Decisões de segurança já implementadas

- Validação de entrada com **Zod** nas rotas.
- **Preço autoritativo no servidor**, com verificação de produto ativo e vínculo ao tenant.
- Opções validadas contra o produto e regras de min/max.
- **Transação** para sequência + criação do pedido.
- **Escapamento de HTML** no cupom.
- Nenhum segredo no client.
- Queries Prisma parametrizadas.

### Segurança e produção

Este repositório é um MVP funcional e **não inclui autenticação**. Antes de produção:

1. **Proteja `/admin` e as rotas de escrita** com autenticação (Auth.js, Clerk, Supabase Auth etc.) e autorização por tenant.
2. Adicione **rate limiting** em `POST /api/orders` e no login.
3. Restrinja CORS/referer e configure **CSP** e headers de segurança.
4. Use **Redis/Postgres pub-sub** para SSE em múltiplas instâncias.
5. Adicione logs estruturados, métricas e alertas de falha de impressão/pedido.
6. Configure backup do PostgreSQL e migrations versionadas (`prisma migrate deploy`).
7. Substitua as imagens Unsplash por imagens próprias/otimizadas no seu storage.
8. Para PIX/cartão reais, integre um PSP (Mercado Pago, Stripe, Pagar.me etc.) e webhooks idempotentes.

### Dependências e auditoria

- O projeto fixa **Next.js 15** e **Prisma 6** por compatibilidade com o escopo pedido.
- O PostCSS usado internamente pelo Next foi forçado para `8.5.32` via `overrides` no `package.json`, corrigindo as advisories de PostCSS sem sair do Next 15.
- `npm audit --omit=dev` ainda reporta advisories em `@prisma/config`/`deepmerge-ts` (tooling do Prisma CLI) e no **Zod 3**. As correções exigem upgrades major para **Prisma 7** e **Zod 4**; avalie-os antes de ir para produção.
- As entradas públicas são validadas com limites de tamanho/quantidade no Zod, o que reduz a superfície da advisory do Zod, mas não substitui o upgrade.

---

## Deploy

- **App**: qualquer host Node.js que mantenha conexões abertas (Railway, Render, Fly.io, VPS, Docker). O SSE exige runtime Node persistente.
- **Banco**: PostgreSQL gerenciado (Neon, Supabase, RDS). Rode `prisma migrate deploy` no release.
- **Vercel**: páginas e APIs funcionam, mas SSE em funções serverless tem timeout e o hub in-process não compartilha eventos entre instâncias. Para Vercel, use pub/sub externo + stream compatível (ex.: Redis + rota edge/node com heartbeat) ou um serviço de realtime.
- **Impressão**: o pop-up roda no navegador do operador; a impressora precisa estar instalada naquela máquina.

---

## Roadmap sugerido

- [ ] Autenticação e painel para cadastrar tenants/produtos.
- [ ] Acompanhamento do pedido em tempo real para o cliente.
- [ ] Cupons, área de entrega, horários de funcionamento e pedido mínimo.
- [ ] Integração de pagamento online (PIX/cartão) com webhooks.
- [ ] Pagamentos automáticos por tenant via gateway (Mercado Pago Connect / Asaas subaccounts) com webhooks.
- [ ] Impressão automática ao aceitar pedido via agente ESC/POS.
- [ ] Histórico/faturamento e relatórios por tenant.
- [ ] Redis pub/sub para escalar SSE horizontalmente.
- [ ] Testes E2E (Playwright) dos fluxos de pedido e KDS.

---

## Licença

Uso livre como base de estudo e projeto. As imagens de demonstração vêm do Unsplash e pertencem aos seus autores; troque-as antes de usar comercialmente.
