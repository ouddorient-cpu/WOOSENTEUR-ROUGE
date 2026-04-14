#!/bin/bash

# ==========================================
# QUICK START SCRIPT - Woosenteur Marketing Hub
# ==========================================

echo "🚀 Woosenteur Marketing Hub - Quick Start"
echo ""

# 1. Check Node version
echo "✓ Vérification Node.js..."
NODE_VERSION=$(node -v)
echo "  Node version: $NODE_VERSION"

# 2. Install dependencies
echo ""
echo "✓ Installation des dépendances..."
npm install

# 3. Create .env.local
echo ""
echo "✓ Préparation du fichier .env.local..."
if [ ! -f ".env.local" ]; then
    echo "  ⚠️ Fichier .env.local non trouvé"
    echo "  📋 Copie .env.example → .env.local"
    cp .env.example .env.local
    echo "  ⚠️ TODO: Remplissez les clés API dans .env.local!"
else
    echo "  ✓ .env.local existe déjà"
fi

# 4. Build
echo ""
echo "✓ Build du projet..."
npm run build

# 5. Ready
echo ""
echo "✅ Configuration complète!"
echo ""
echo "🎯 Prochaines étapes:"
echo "  1. Remplissez .env.local avec vos clés API"
echo "  2. npm run dev"
echo "  3. Visitez http://localhost:3000/dashboard/marketing"
echo ""
echo "📖 Documentation: Voir MARKETING_HUB_GUIDE.md"
