FROM node:20-alpine AS builder

WORKDIR /app

# Enable corepack to use the pnpm version specified in package.json
RUN corepack enable

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY backend/package.json ./backend/
COPY frontend/package.json ./frontend/

# Install dependencies
RUN pnpm install --frozen-lockfile

COPY . .

# Build the backend
RUN pnpm --filter backend build

# Deploy backend (prod deps only) to /prod/backend
RUN pnpm --filter backend --prod deploy --legacy /prod/backend

FROM node:20-alpine

WORKDIR /app

COPY --from=builder /prod/backend/node_modules ./node_modules
COPY --from=builder /app/backend/dist ./dist
COPY --from=builder /prod/backend/package.json ./

EXPOSE 3000

CMD ["node", "dist/main"]
