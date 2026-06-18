#!/usr/bin/env bash
set -e

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
BACKEND_DIR="$ROOT_DIR/backend"
FRONTEND_DIR="$ROOT_DIR/frontend"

FPORT=${1:-4000}
BPORT=${2:-8001}

RESERVED=(5000 6000)

# Auto-find free ports if given ports are taken or reserved
find_free_port() {
    local port=$1
    while lsof -i :"$port" &>/dev/null 2>&1; do
        port=$((port + 1))
    done
    for r in "${RESERVED[@]}"; do
        if [ "$port" = "$r" ]; then
            port=$((port + 1))
        fi
    done
    echo "$port"
}

FPORT=$(find_free_port "$FPORT")
BPORT=$(find_free_port "$BPORT")

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

info()  { echo -e "${GREEN}[INFO]${NC} $1"; }
warn()  { echo -e "${YELLOW}[WARN]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }

cleanup() {
    info "Shutting down..."
    [ -n "$BACKEND_PID" ] && kill "$BACKEND_PID" 2>/dev/null
    [ -n "$FRONTEND_PID" ] && kill "$FRONTEND_PID" 2>/dev/null
    exit 0
}
trap cleanup SIGINT SIGTERM

command -v php     >/dev/null || { error "PHP not found"; exit 1; }
command -v composer>/dev/null || { error "Composer not found"; exit 1; }
command -v node    >/dev/null || { error "Node.js not found"; exit 1; }
command -v npm     >/dev/null || { error "npm not found"; exit 1; }

info "PHP $(php -v | head -1)"
info "Node $(node -v)"
info "npm $(npm -v)"

# ── Backend setup ─────────────────────────────────────────────────
info "Setting up backend..."

cd "$BACKEND_DIR"

if [ ! -f .env ]; then
    cp .env.example .env
    info ".env created from .env.example"
fi

sed -i '' 's/DB_CONNECTION=mysql/DB_CONNECTION=sqlite/' .env 2>/dev/null || true
sed -i '' 's/DB_HOST=127.0.0.1/# DB_HOST=127.0.0.1/' .env 2>/dev/null || true
sed -i '' 's/DB_PORT=3306/# DB_PORT=3306/' .env 2>/dev/null || true
sed -i '' 's/DB_DATABASE=ugclab/# DB_DATABASE=ugclab/' .env 2>/dev/null || true
sed -i '' 's/DB_USERNAME=root/# DB_USERNAME=root/' .env 2>/dev/null || true
sed -i '' 's/DB_PASSWORD=/# DB_PASSWORD=/' .env 2>/dev/null || true

if ! grep -q "^DB_DATABASE=" .env 2>/dev/null; then
    echo "DB_DATABASE=$BACKEND_DIR/database/database.sqlite" >> .env
fi

sed -i '' 's/APP_ENV=production/APP_ENV=local/' .env 2>/dev/null || true
sed -i '' 's/APP_DEBUG=false/APP_DEBUG=true/' .env 2>/dev/null || true
sed -i '' 's/LOG_LEVEL=error/LOG_LEVEL=debug/' .env 2>/dev/null || true
sed -i '' 's/SESSION_SECURE_COOKIE=true/SESSION_SECURE_COOKIE=false/' .env 2>/dev/null || true
sed -i '' "s|FRONTEND_URL=.*|FRONTEND_URL=http://localhost:$FPORT|" .env 2>/dev/null || true
sed -i '' 's/BROADCAST_CONNECTION=.*/BROADCAST_CONNECTION=log/' .env 2>/dev/null || true
sed -i '' 's/QUEUE_CONNECTION=.*/QUEUE_CONNECTION=sync/' .env 2>/dev/null || true
sed -i '' 's/CACHE_STORE=.*/CACHE_STORE=file/' .env 2>/dev/null || true
sed -i '' 's/SESSION_DRIVER=.*/SESSION_DRIVER=file/' .env 2>/dev/null || true

info "Configured SQLite for local development"

touch database/database.sqlite

if [ ! -d vendor ]; then
    info "Installing Composer dependencies..."
    composer install --no-interaction
fi

APP_KEY=$(grep "^APP_KEY=" .env | cut -d= -f2)
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force
fi

info "Running migrations..."
php artisan migrate --force

# ── Frontend setup ───────────────────────────────────────────────
cd "$FRONTEND_DIR"

cat > .env.local <<-EOF
NEXT_PUBLIC_API_URL=http://localhost:$BPORT/api
NEXT_TELEMETRY_DISABLED=1
EOF

if [ ! -d node_modules ]; then
    info "Installing npm dependencies..."
    npm install
fi

# ── Start servers ─────────────────────────────────────────────────
info "Starting backend on http://localhost:$BPORT ..."
cd "$BACKEND_DIR"
php artisan serve --port="$BPORT" --host=127.0.0.1 &
BACKEND_PID=$!

info "Starting frontend on http://localhost:$FPORT ..."
cd "$FRONTEND_DIR"
npx next dev --port "$FPORT" &
FRONTEND_PID=$!

echo ""
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo -e "${GREEN}  UGCLab running!${NC}"
echo -e "${GREEN}  Frontend: http://localhost:$FPORT${NC}"
echo -e "${GREEN}  Backend:  http://localhost:$BPORT${NC}"
echo -e "${GREEN}  Ctrl+C to stop${NC}"
echo -e "${GREEN}══════════════════════════════════════════════════════════════${NC}"
echo ""

wait
