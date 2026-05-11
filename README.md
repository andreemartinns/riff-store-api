# 🎸 Riff Store API

API REST para uma loja de equipamentos de guitarra e rock. Permite gerenciar produtos, categorias e pedidos, com sistema de autenticação por JWT.

---

## Tecnologias

- Node.js
- Express
- Prisma ORM
- MySQL
- bcrypt
- jsonwebtoken
- dotenv
- Nodemon

---

## Como rodar localmente

### Pré-requisitos

- Node.js v18+
- MySQL rodando localmente

### Passo a passo

```bash
# 1. Clone o repositório
git clone https://github.com/seu-usuario/riff-store-api.git
cd riff-store-api

# 2. Instale as dependências
npm install

# 3. Configure as variáveis de ambiente
cp .env.example .env
# Edite o .env com suas credenciais do MySQL e um JWT_SECRET de sua escolha

# 4. Crie o banco e rode as migrations
npx prisma migrate dev --name init

# 5. Inicie o servidor em modo desenvolvimento
npm run dev
```

O servidor vai rodar em `http://localhost:3000`

---

## Endpoints

### Auth

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/auth/register` | Cadastra um novo usuário | ❌ |
| POST | `/auth/login` | Realiza login e retorna JWT | ❌ |

**POST /auth/register**
```json
{
  "name": "João Silva",
  "email": "joao@email.com",
  "password": "senha123"
}
```

**POST /auth/login**
```json
{
  "email": "joao@email.com",
  "password": "senha123"
}
```

---

### Categorias

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/categories` | Lista todas as categorias | ❌ |
| GET | `/categories/:id` | Busca categoria por ID (com produtos) | ❌ |
| POST | `/categories` | Cria uma categoria | ✅ Admin |
| PUT | `/categories/:id` | Atualiza uma categoria | ✅ Admin |
| DELETE | `/categories/:id` | Remove uma categoria | ✅ Admin |

---

### Produtos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| GET | `/products` | Lista todos os produtos | ❌ |
| GET | `/products/:id` | Busca produto por ID | ❌ |
| POST | `/products` | Cria um produto | ✅ Admin |
| PUT | `/products/:id` | Atualiza um produto | ✅ Admin |
| DELETE | `/products/:id` | Remove um produto | ✅ Admin |

**POST /products**
```json
{
  "name": "Gibson Les Paul Standard",
  "brand": "Gibson",
  "description": "Guitarra elétrica com captadores humbucker",
  "price": 12999.90,
  "stock": 5,
  "categoryId": 1
}
```

---

### Pedidos

| Método | Rota | Descrição | Auth |
|--------|------|-----------|------|
| POST | `/orders` | Cria um pedido | ✅ Cliente |
| GET | `/orders/me` | Lista pedidos do usuário logado | ✅ Cliente |
| GET | `/orders/:id` | Busca pedido por ID | ✅ Cliente/Admin |
| PATCH | `/orders/:id/status` | Atualiza status do pedido | ✅ Admin |
| GET | `/orders` | Lista todos os pedidos | ✅ Admin |

**POST /orders**
```json
{
  "items": [
    { "productId": 1, "quantity": 1 },
    { "productId": 3, "quantity": 2 }
  ]
}
```

**PATCH /orders/:id/status**
```json
{
  "status": "CONFIRMED"
}
```
Status disponíveis: `PENDING` · `CONFIRMED` · `SHIPPED` · `DELIVERED` · `CANCELLED`

---

## Autenticação

Rotas protegidas exigem o token JWT no header:

```
Authorization: Bearer <seu_token>
```

O token é retornado no login e tem validade de 7 dias.

Usuários com `role: ADMIN` têm acesso a rotas de gerenciamento. Por padrão, novos cadastros recebem `role: CUSTOMER`.

---

## Estrutura do projeto

```
riff-store-api/
├── prisma/
│   └── schema.prisma
├── src/
│   ├── server.js
│   ├── lib/
│   │   └── prisma.js
│   ├── routes/
│   │   ├── auth.routes.js
│   │   ├── product.routes.js
│   │   ├── category.routes.js
│   │   └── order.routes.js
│   ├── controllers/
│   │   ├── auth.controller.js
│   │   ├── product.controller.js
│   │   ├── category.controller.js
│   │   └── order.controller.js
│   └── middlewares/
│       └── auth.middleware.js
├── .env.example
├── .gitignore
├── README.md
└── package.json
```
