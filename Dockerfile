# Stage 1: Dependencies
FROM node:20-alpine AS dependencies

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar dependências de produção
RUN pnpm install --frozen-lockfile --prod

# Stage 2: Build
FROM node:20-alpine AS builder

# Instalar pnpm
RUN corepack enable && corepack prepare pnpm@latest --activate

WORKDIR /app

# Copiar arquivos de dependências
COPY package.json pnpm-lock.yaml ./

# Instalar todas as dependências (incluindo dev)
RUN pnpm install --frozen-lockfile

# Copiar código fonte
COPY . .

# Gerar Prisma Client
RUN pnpm prisma:generate

# Build da aplicação
RUN pnpm build

# Stage 3: Production
FROM node:20-alpine AS production

# Instalar apenas ferramentas necessárias
RUN apk add --no-cache dumb-init

# Criar usuário não-root
RUN addgroup -g 1001 -S nodejs && adduser -S nodejs -u 1001

WORKDIR /app

# Copiar dependências de produção do stage 1
COPY --from=dependencies --chown=nodejs:nodejs /app/node_modules ./node_modules

# Copiar build do stage 2
COPY --from=builder --chown=nodejs:nodejs /app/dist ./dist
COPY --from=builder --chown=nodejs:nodejs /app/prisma ./prisma

# Copiar package.json para ter acesso aos scripts
COPY --chown=nodejs:nodejs package.json ./

# Gerar Prisma Client no ambiente de produção
RUN npx prisma generate

# Trocar para usuário não-root
USER nodejs

# Expor porta
EXPOSE 3000

# Usar dumb-init para lidar com sinais corretamente
ENTRYPOINT ["dumb-init", "--"]

# Comando de inicialização
CMD ["sh", "-c", "npx prisma migrate deploy && node dist/main"]
