#!/bin/bash
# Script to help set up Vercel connection via CLI

echo "=========================================="
echo "Vercel GitHub Connection Setup Script"
echo "=========================================="
echo ""

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel
    echo "✅ Vercel CLI installed"
else
    echo "✅ Vercel CLI is already installed"
fi

echo ""
echo "=========================================="
echo "Next Steps (MUST be done manually):"
echo "=========================================="
echo ""
echo "1. Login to Vercel:"
echo "   vercel login"
echo ""
echo "2. Link your project:"
echo "   vercel link"
echo ""
echo "3. This will prompt you to:"
echo "   - Create a new project or link to existing"
echo "   - Connect to GitHub repository"
echo "   - Set up project settings"
echo ""
echo "4. After linking, deploy:"
echo "   vercel --prod"
echo ""
echo "=========================================="
echo "Note: You MUST complete steps 1-2 manually"
echo "as they require browser authentication"
echo "=========================================="

