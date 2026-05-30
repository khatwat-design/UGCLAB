#!/bin/bash
set -e

echo "UGCLab Deployment Script"

APP_URL="${APP_URL:-https://api.ugclab.com}"

health_check() {
    local max_attempts=30
    local attempt=1

    echo "Running health check on ${APP_URL}/api/health..."

    while [ $attempt -le $max_attempts ]; do
        local response
        response=$(curl -sf "${APP_URL}/api/health" 2>/dev/null || true)

        if echo "$response" | jq -e '.status == "ok"' >/dev/null 2>&1; then
            echo "Health check passed! (attempt $attempt)"
            return 0
        fi

        echo "Waiting... attempt $attempt/$max_attempts"
        sleep 5
        attempt=$((attempt + 1))
    done

    echo "Health check failed after $max_attempts attempts"
    echo "Last response: $response"
    return 1
}

deploy_backend() {
    cd backend
    composer install --no-dev --optimize-autoloader --no-interaction
    php artisan config:cache
    php artisan route:cache
    php artisan view:cache
    php artisan migrate --force
    php artisan storage:link --force 2>/dev/null || true
    php artisan optimize
    cd ..
    echo "Backend deployed"
}

deploy_frontend() {
    cd frontend
    npm ci --include=dev
    npm run build

    if pm2 list 2>/dev/null | grep -q ugclab-frontend; then
        pm2 restart ugclab-frontend --update-env
    else
        pm2 start npm --name ugclab-frontend -- start -- -p 3002
    fi

    pm2 save
    cd ..
    echo "Frontend deployed"
}

deploy_docker() {
    echo "Deploying with Docker Compose..."
    docker compose pull
    docker compose up -d --remove-orphans
    echo "Docker deployment complete"
}

case "${1:-all}" in
    backend)
        deploy_backend
        health_check
        ;;
    frontend)
        deploy_frontend
        ;;
    docker)
        deploy_docker
        health_check
        ;;
    all)
        deploy_backend
        deploy_frontend
        health_check
        ;;
    health)
        health_check
        ;;
    *)
        echo "Usage: $0 [frontend|backend|all|health]" && exit 1
        ;;
esac
