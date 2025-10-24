# Task Manager API - Backend

Sistema de gerenciamento de tarefas com autenticação JWT, construído com NestJS, PostgreSQL e Prisma ORM.

## 📋 Índice

- [Tecnologias](#-tecnologias)
- [Pré-requisitos](#-pré-requisitos)
- [Instalação Local](#-instalação-local)
- [Executando com Docker](#-executando-com-docker)
- [Deploy no AWS App Runner](#-deploy-no-aws-app-runner)
- [Documentação da API](#-documentação-da-api)
- [Testes](#-testes)
- [Estrutura do Projeto](#-estrutura-do-projeto)

---

## 🚀 Tecnologias

- **Framework:** NestJS 11
- **Linguagem:** TypeScript
- **Banco de Dados:** PostgreSQL 16
- **ORM:** Prisma 6
- **Autenticação:** JWT (Passport.js)
- **Validação:** class-validator
- **Documentação:** Swagger/OpenAPI
- **Testes:** Jest
- **Containerização:** Docker

---

## 📦 Pré-requisitos

### Para executar localmente:
- Node.js >= 20
- pnpm >= 8
- PostgreSQL >= 14

### Para executar com Docker:
- Docker >= 20
- Docker Compose >= 2

---

## 💻 Instalação Local

### 1. Clone o repositório

```bash
git clone <seu-repositorio>
cd backend
```

### 2. Instale as dependências

```bash
pnpm install
```

### 3. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o arquivo `.env` com suas configurações:

```env
# Application
NODE_ENV="development"
PORT=3000

# Database
DATABASE_URL="postgresql://taskuser:taskpass@localhost:5432/taskmanager?schema=public"

# JWT
JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
JWT_EXPIRES_IN="7d"

# CORS
CORS_ORIGIN="http://localhost:3001"
```

### 4. Execute as migrações do banco

```bash
pnpm prisma:migrate
```

### 5. (Opcional) Popule o banco com dados iniciais

```bash
pnpm prisma:seed
```

### 6. Inicie o servidor

```bash
# Modo desenvolvimento (com hot reload)
pnpm start:dev

# Modo produção
pnpm build
pnpm start:prod
```

A API estará disponível em: `http://localhost:3000`

---

## 🐳 Executando com Docker

### Modo Produção

```bash
# 1. Copiar .env.example para .env (se ainda não fez)
cp .env.example .env

# 2. Subir containers (PostgreSQL + API)
pnpm docker:up

# 3. Ver logs
pnpm docker:logs

# 4. Parar containers
pnpm docker:down
```

### Modo Desenvolvimento (com hot reload)

```bash
# 1. Subir containers em modo dev
pnpm docker:up:dev

# 2. Ver logs
pnpm docker:logs:dev

# 3. Parar containers
pnpm docker:down:dev
```

### Comandos Docker úteis

```bash
# Rebuild da imagem
pnpm docker:build

# Limpar volumes e containers
pnpm docker:clean

# Acessar banco de dados
docker exec -it taskmanager-db psql -U taskuser -d taskmanager

# Acessar shell do container
docker exec -it taskmanager-api sh
```

---

## ☁️ Deploy no AWS App Runner

### Passo 1: Preparar a imagem Docker

```bash
# 1. Build da imagem de produção
docker build -t taskmanager-api:latest .

# 2. Testar localmente
docker run -p 3000:3000 \
  -e DATABASE_URL="sua-connection-string" \
  -e JWT_SECRET="seu-secret" \
  taskmanager-api:latest
```

### Passo 2: Enviar para Amazon ECR

```bash
# 1. Autenticar no ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com

# 2. Criar repositório (apenas primeira vez)
aws ecr create-repository --repository-name taskmanager-api --region us-east-1

# 3. Tag da imagem
docker tag taskmanager-api:latest <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager-api:latest

# 4. Push para ECR
docker push <seu-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager-api:latest
```

### Passo 3: Criar banco de dados RDS PostgreSQL

1. Acesse o console AWS RDS
2. Clique em "Create database"
3. Escolha:
   - **Engine:** PostgreSQL 16
   - **Template:** Free tier (para testes) ou Production
   - **DB instance identifier:** taskmanager-db
   - **Master username:** taskuser
   - **Master password:** (defina uma senha forte)
   - **DB name:** taskmanager
4. Em **Connectivity**:
   - **Public access:** Yes (para testes) ou No (produção com VPC)
5. Anote o **Endpoint** do banco (ex: `taskmanager-db.xxxxx.us-east-1.rds.amazonaws.com`)

### Passo 4: Criar serviço no App Runner

1. Acesse o console AWS App Runner
2. Clique em "Create service"
3. **Source**:
   - **Repository type:** Container registry
   - **Provider:** Amazon ECR
   - **Container image URI:** `<seu-account-id>.dkr.ecr.us-east-1.amazonaws.com/taskmanager-api:latest`
   - **Deployment trigger:** Automatic (ou Manual)
4. **Service settings**:
   - **Service name:** taskmanager-api
   - **Port:** 3000
5. **Environment variables** (IMPORTANTE - Configure aqui):
   ```
   NODE_ENV=production
   PORT=3000
   DATABASE_URL=postgresql://taskuser:SUA_SENHA@taskmanager-db.xxxxx.us-east-1.rds.amazonaws.com:5432/taskmanager?schema=public
   JWT_SECRET=gere-um-secret-forte-aqui-use-openssl-rand-base64-32
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=https://seu-frontend.com
   ```
6. **Health check**:
   - **Path:** `/health`
   - **Interval:** 30 seconds
7. Clique em "Create & deploy"

### Como configurar variáveis de ambiente no App Runner (Console Web):

1. Acesse seu serviço no App Runner
2. Clique na aba "Configuration"
3. Na seção "Environment variables", clique em "Edit"
4. Adicione cada variável:
   - Clique em "Add environment variable"
   - **Key:** NODE_ENV | **Value:** production
   - **Key:** PORT | **Value:** 3000
   - **Key:** DATABASE_URL | **Value:** postgresql://...
   - E assim por diante
5. Clique em "Save changes"
6. O App Runner vai reiniciar automaticamente com as novas variáveis

### URLs após deploy

- **API:** `https://xxxxx.us-east-1.awsapprunner.com`
- **Swagger:** `https://xxxxx.us-east-1.awsapprunner.com/api`
- **Health Check:** `https://xxxxx.us-east-1.awsapprunner.com/health`

---

## 📚 Documentação da API

### Swagger UI

Acesse a documentação interativa:
- **Local:** http://localhost:3000/api
- **Produção:** https://sua-url.awsapprunner.com/api

### Endpoints principais

#### Autenticação

```bash
# Cadastro
POST /auth/signup
Body: {
  "email": "usuario@example.com",
  "password": "senha123",
  "name": "Nome do Usuário",
  "role": "USER" // ou "ADMIN"
}

# Login
POST /auth/signin
Body: {
  "email": "usuario@example.com",
  "password": "senha123"
}
Response: {
  "accessToken": "jwt-token",
  "user": { ... }
}
```

#### Tarefas (requer autenticação)

```bash
# Criar tarefa
POST /tasks
Headers: Authorization: Bearer <token>
Body: {
  "title": "Minha tarefa",
  "description": "Descrição",
  "priority": "HIGH",
  "status": "PENDING",
  "dueDate": "2025-12-31T23:59:59.000Z"
}

# Listar tarefas
GET /tasks?page=1&limit=10&status=PENDING&priority=HIGH
Headers: Authorization: Bearer <token>

# Obter tarefa
GET /tasks/:id
Headers: Authorization: Bearer <token>

# Atualizar tarefa
PATCH /tasks/:id
Headers: Authorization: Bearer <token>
Body: { "title": "Novo título" }

# Atualizar status
PATCH /tasks/:id/status
Headers: Authorization: Bearer <token>
Body: { "status": "COMPLETED" }

# Deletar tarefa
DELETE /tasks/:id
Headers: Authorization: Bearer <token>
```

---

## 🧪 Testes

```bash
# Todos os testes
pnpm test

# Testes em watch mode
pnpm test:watch

# Cobertura de testes
pnpm test:cov

# Testes E2E
pnpm test:e2e
```

---

## 📁 Estrutura do Projeto

```
backend/
├── src/
│   ├── application/           # Camada de aplicação (casos de uso)
│   │   ├── auth/              # Módulo de autenticação
│   │   │   ├── usecases/      # Casos de uso (SignUp, SignIn)
│   │   │   ├── service/       # Serviço de orquestração
│   │   │   ├── ports/         # Contratos (UserDao)
│   │   │   └── errors/        # Erros customizados
│   │   └── task/              # Módulo de tarefas
│   │       ├── usecases/      # Casos de uso (CRUD)
│   │       ├── service/       # Serviço de orquestração
│   │       ├── ports/         # Contratos (TaskDao)
│   │       └── errors/        # Erros customizados
│   ├── infrastructure/        # Implementações técnicas
│   │   ├── database/          # Camada de dados
│   │   │   ├── daos/          # Data Access Objects (Prisma)
│   │   │   └── prisma/        # Setup Prisma
│   │   └── security/          # JWT Strategy
│   ├── interfaces/            # Interfaces externas
│   │   └── http/              # Controllers REST
│   │       ├── api/v1/        # Endpoints v1
│   │       ├── guards/        # Guards de autenticação
│   │       ├── decorators/    # Decorators customizados
│   │       └── filters/       # Exception filters
│   ├── config/                # Configurações
│   └── main.ts                # Bootstrap
├── prisma/
│   ├── schema.prisma          # Schema do banco
│   └── migrations/            # Migrações
├── test/                      # Testes E2E
├── Dockerfile                 # Produção
├── Dockerfile.dev             # Desenvolvimento
├── docker-compose.yml         # Produção
├── docker-compose.dev.yml     # Desenvolvimento
└── README.md
```

### Arquitetura Hexagonal

Este projeto segue a **Arquitetura Hexagonal (Ports & Adapters)**:

- **Application:** Lógica de negócio pura, independente de frameworks
- **Infrastructure:** Implementações concretas (Prisma, JWT, etc.)
- **Interfaces:** Pontos de entrada (HTTP, CLI, etc.)

**Benefícios:**
- Testável (mocks fáceis)
- Independente de frameworks
- Fácil substituição de tecnologias

---

## 🔐 Segurança

- ✅ Senhas hasheadas com bcrypt (10 rounds)
- ✅ Autenticação JWT
- ✅ Validação de inputs com class-validator
- ✅ CORS configurável
- ✅ Headers de segurança

---

## 🌟 Features

- ✅ Cadastro e login de usuários
- ✅ Autenticação JWT
- ✅ Roles (USER e ADMIN)
- ✅ CRUD completo de tarefas
- ✅ Filtros e paginação
- ✅ Prioridades (LOW, MEDIUM, HIGH)
- ✅ Status (PENDING, IN_PROGRESS, COMPLETED)
- ✅ Datas de vencimento
- ✅ Ordenação customizável
- ✅ Documentação Swagger
- ✅ Testes unitários (25 testes)
- ✅ Docker ready
- ✅ AWS App Runner ready

---

## 📝 Licença

Este projeto é privado e proprietário.

---

## 👨‍💻 Autor

Vinicius Vieira Parizoto.
