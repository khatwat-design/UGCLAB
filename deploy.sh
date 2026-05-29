#!/bin/bash
# Deployment script for UGCLab platform
# Usage: bash deploy.sh [frontend|backend|all]

set -e

echo "🚀 UGCLab Deployment Script"
echo "==========================="

deploy_backend() {
    echo ""
    echo "📦 Backend Deployment"
    echo "---------------------"

    cd backend

    # 1. Install PHP dependencies
    echo "→ Installing PHP dependencies..."
    composer install --no-dev --optimize-autoloader --no-interaction

    # 2. Clear and cache config
    echo "→ Caching config..."
    php artisan config:cache

    # 3. Cache routes
    echo "→ Caching routes..."
    php artisan route:cache

    # 4. Cache views
    echo "→ Caching views..."
    php artisan view:cache

    # 5. Run migrations
    echo "→ Running migrations..."
    php artisan migrate --force

    # 6. Create storage link (if not exists)
    echo "→ Creating storage link..."
    php artisan storage:link --force 2>/dev/null || true

    # 7. Optimize
    echo "→ Optimizing..."
    php artisan optimize

    cd ..
    echo "✅ Backend deployed successfully!"
}

deploy_frontend() {
    echo ""
    echo "📦 Frontend Deployment"
    echo "----------------------"

    cd frontend

    # 1. Install Node dependencies
    echo "→ Installing Node dependencies..."
    npm ci --omit=dev

    # 2. Build
    echo "→ Building..."
    npm run build

    # 3. Start (using process manager like PM2 in production)
    echo "→ Build complete. Start with: npm start"
    echo "   (Use PM2 or similar for production)"

    cd ..
    echo "✅ Frontend built successfully!"
}

# Main
case "${1:-all}" in
    backend)
        deploy_backend
        ;;
    frontend)
        deploy_frontend
        ;;
    all)
        deploy_backend
        deploy_frontend
        echo ""
        echo "🎉 Full deployment complete!"
        ;;
    *)
        echo "Usage: $0 [frontend|backend|all]"
        exit 1
        ;;
esac
