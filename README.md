# Project Code Academic

Plataforma web de quizzes educacionais para universitários, com ranking geral e por faculdades, tela de perfil, painel admin simples e interface moderna (shadcn/ui + Tailwind). O backend serve a API e os assets do frontend no mesmo servidor.

## Principais recursos
- Autenticação simples no cliente com usuário admin padrão (admin@gmail.com / 123456) e sincronização best-effort com a API
- Quizzes com pontuação, ranking de usuários (Top 10) e ranking por universidades
- API REST em Express para: health, upsert de usuários (único e em lote), incremento de pontuação, leaderboards
- Persistência em banco:
  - Padrão: SQLite (better-sqlite3), com arquivo em `./data/app.db`
  - Opcional: MySQL gerenciado (mysql2) usando variáveis de ambiente
- Build único: o servidor Express também distribui o frontend (pasta `dist/`)

## Stack
- Frontend: Vite + React + TypeScript + shadcn/ui + Tailwind CSS
- Backend: Node.js + Express + TypeScript
- Banco: SQLite (default via better‑sqlite3) ou MySQL (mysql2)

## Scripts úteis
```
# Desenvolvimento (client + hot reload)
npm run dev

# Apenas servidor em dev (TSX)
npm run dev:server

# Apenas client em dev
npm run dev:client

# Ambos em paralelo
npm run dev:all

# Build de produção (gera dist/)
npm run build

# Pré-visualização do build	npm run preview

# Iniciar servidor de produção (Express + dist)
npm start
```

## Variáveis de ambiente (`.env`)
Veja `.env.example` para o conjunto completo. Principais:
- `API_PORT`: porta da API (default 3001)
- `VITE_API_URL`: base da API para o cliente (em produção, normalmente vazio)
- Banco (SQLite default):
  - `DB_CLIENT=sqlite`
- Banco (MySQL opcional):
  - `DB_CLIENT=mysql`
  - `DB_HOST`, `DB_PORT` (3306), `DB_USER`, `DB_PASSWORD`, `DB_DATABASE`
  - Ou `DB_URL=mysql://user:pass@host:3306/dbname`
  - `DB_SSL=true` para serviços gerenciados que exigem SSL

## Endpoints principais
- `GET /api/health` → `{ ok: true }` se o banco responder
- `POST /api/users/upsert` → cria/atualiza usuário por email/id
- `POST /api/users/bulk-upsert` → cria/atualiza vários usuários
- `POST /api/users/:id/score` → incrementa pontuação de um usuário
- `POST /api/users/by-email/:email/score` → incrementa pontuação por email
- `GET /api/leaderboard?limit=10` → Top usuários (com rank)
- `GET /api/leaderboard/universities` → ranking por universidades (com rank)

## Desenvolvimento local (passos rápidos)
```
# 1) Instalar dependências
npm install

# 2) Subir em modo dev (Vite)
npm run dev

# 3) Acessar em http://localhost:8080 (proxy para API em 3001)
```

## Build e execução local (produção)
```
# 1) Gerar build do frontend
npm run build

# 2) Iniciar servidor (Express servindo dist/)
npm start

# 3) Teste de saúde
curl http://localhost:3001/api/health
```

## Deploy rápido na Oracle (VM + Docker + SQLite)
1. (Opcional) Abra porta 80 no OCI (Security List/NSG): Ingress TCP 80 de 0.0.0.0/0
2. Na VM, instale Docker (Ubuntu):
```
sudo apt-get update -y
sudo apt-get install -y docker.io
sudo systemctl enable --now docker
```
3. Clone e entre no projeto:
```
cd ~
git clone <SUA_REPO_URL> codea
cd codea
```
4. Build da imagem:
```
docker build -t codea:latest .
```
5. Crie diretório persistente para SQLite:
```
sudo mkdir -p /opt/codea-data
sudo chown 1000:1000 /opt/codea-data
```
6. Suba o container (porta 80 → 3001):
```
docker run -d --name codea --restart=always \
  -p 80:3001 \
  -e NODE_ENV=production \
  -e DB_CLIENT=sqlite \
  -v /opt/codea-data:/app/data \
  codea:latest
```
7. Teste:
```
curl http://127.0.0.1/api/health  # deve retornar {"ok":true}
```
8. Acesse pelo IP público: `http://SEU_IP_PUBLICO`

### Usando MySQL (opcional)
Substitua as variáveis ao rodar o container:
```
docker run -d --name codea --restart=always \
  -p 80:3001 \
  -e NODE_ENV=production \
  -e DB_CLIENT=mysql \
  -e DB_HOST=... -e DB_PORT=3306 \
  -e DB_USER=... -e DB_PASSWORD=... -e DB_DATABASE=... \
  -e DB_SSL=true \
  codea:latest
```
A tabela `users` é criada automaticamente na primeira execução.

## Solução de problemas (rápido)
- Ver logs: `docker logs --tail=200 -f codea`
- Testar API dentro do container: `docker exec -it codea sh -lc "curl -v http://127.0.0.1:3001/api/health"`
- Porta 80 ocupada? Use `-p 8080:3001` e acesse `http://SEU_IP_PUBLICO:8080`

## Licença
Este projeto é fornecido "como está" para fins educacionais/demonstração.
