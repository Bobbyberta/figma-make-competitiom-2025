#!/bin/bash

# Complete project setup script for Figma Make Competition Portfolio
# This script initializes git, sets up hooks, and configures the project

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo "🚀 Setting up Figma Make Competition Portfolio..."
echo "================================================"

# Step 1: Initialize git if not already done
if [ ! -d ".git" ]; then
    echo "📁 Initializing git repository..."
    git init
    echo "✅ Git repository initialized"
else
    echo "✅ Git repository already exists"
fi

# Step 2: Create .gitignore if it doesn't exist
if [ ! -f ".gitignore" ]; then
    echo "📝 Creating .gitignore..."
    cat > .gitignore << 'EOF'
# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Production builds are committed for GitHub Pages
# build/ folders are NOT ignored - they're needed for deployment

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Editor directories and files
.vscode/
.idea/
*.swp
*.swo
*~

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# Logs
logs
*.log
EOF
    echo "✅ .gitignore created"
fi

# Step 3: Update .cursorrules
echo "📚 Updating .cursorrules..."
./update-cursorrules.sh

# Step 4: Setup git hooks
echo "🔧 Setting up git hooks..."
./setup-git-hooks.sh

# Step 5: Build all apps
echo "🏗️  Building all applications..."
./build-all.sh

# Step 6: Create initial commit
echo "💾 Creating initial commit..."
git add .
git commit -m "feat: initial commit - Figma Make Competition Portfolio

- Add unified portfolio hosting solution
- Include 9 React applications across 3 categories
- Configure GitHub Pages deployment
- Add comprehensive .cursorrules for AI assistance
- Set up automated documentation updates"

echo ""
echo "🎉 Project setup complete!"
echo ""
echo "📋 What's been configured:"
echo "   ✅ Git repository initialized"
echo "   ✅ .gitignore configured"
echo "   ✅ .cursorrules with project documentation"
echo "   ✅ Git hooks for automatic updates"
echo "   ✅ All apps built for production"
echo "   ✅ Initial commit created"
echo ""
echo "🚀 Next steps:"
echo "   1. Create GitHub repository"
echo "   2. Add remote: git remote add origin <your-repo-url>"
echo "   3. Push: git push -u origin main"
echo "   4. Enable GitHub Pages in repository settings"
echo ""
echo "💡 Development workflow:"
echo "   • Local development: python3 serve.py"
echo "   • Build all apps: ./build-all.sh"
echo "   • Update docs: ./update-cursorrules.sh"
echo "   • Git hooks will handle updates automatically"
echo ""
echo "📖 For AI assistance, always reference .cursorrules first!"
