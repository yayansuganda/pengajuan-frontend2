#!/bin/bash

# Railway Deployment Helper Script
# This script helps verify the build before deploying to Railway

echo "╔════════════════════════════════════════════════════════════╗"
echo "║                                                            ║"
echo "║  🚂 Railway Deployment - Pre-Deploy Check                 ║"
echo "║                                                            ║"
echo "╚════════════════════════════════════════════════════════════╝"
echo ""

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found!"
    echo "   Please run this script from the pengajuan_frontend directory"
    exit 1
fi

echo "📋 Step 1: Checking environment files..."
if [ -f ".env.local" ]; then
    echo "✅ .env.local found"
    echo "   Current NEXT_PUBLIC_API_URL:"
    grep NEXT_PUBLIC_API_URL .env.local || echo "   (not set)"
else
    echo "⚠️  .env.local not found (optional for local dev)"
fi

if [ -f ".env.production" ]; then
    echo "✅ .env.production found"
else
    echo "❌ .env.production not found!"
fi

echo ""
echo "📋 Step 2: Checking dependencies..."
if [ -d "node_modules" ]; then
    echo "✅ node_modules found"
else
    echo "⚠️  node_modules not found. Running npm install..."
    npm install
fi

echo ""
echo "📋 Step 3: Running build test..."
echo "   This will take a few moments..."
echo ""

# Run build
if npm run build; then
    echo ""
    echo "✅ Build successful!"
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ✅ PRE-DEPLOY CHECK PASSED                                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "📝 Next Steps:"
    echo ""
    echo "1. Set environment variable di Railway:"
    echo "   NEXT_PUBLIC_API_URL=https://your-backend.railway.app"
    echo ""
    echo "2. Push code ke repository (jika belum)"
    echo ""
    echo "3. Deploy atau redeploy di Railway"
    echo ""
    echo "4. Verifikasi deployment:"
    echo "   - Buka app di browser"
    echo "   - Check console logs (F12)"
    echo "   - Pastikan API URL benar"
    echo ""
    echo "📚 Lihat DEPLOYMENT_CHECKLIST.md untuk panduan lengkap"
    echo ""
else
    echo ""
    echo "❌ Build failed!"
    echo ""
    echo "╔════════════════════════════════════════════════════════════╗"
    echo "║  ❌ PRE-DEPLOY CHECK FAILED                                ║"
    echo "╚════════════════════════════════════════════════════════════╝"
    echo ""
    echo "Please fix the build errors before deploying to Railway."
    echo ""
    exit 1
fi
