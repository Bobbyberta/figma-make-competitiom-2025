#!/bin/bash

# Setup git hooks to automatically update .cursorrules when pushing to git

set -e

PROJECT_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
GIT_HOOKS_DIR="$PROJECT_ROOT/.git/hooks"

echo "🔧 Setting up git hooks for automatic .cursorrules updates..."

# Check if we're in a git repository
if [ ! -d "$PROJECT_ROOT/.git" ]; then
    echo "❌ This is not a git repository. Please run 'git init' first."
    exit 1
fi

# Create hooks directory if it doesn't exist
mkdir -p "$GIT_HOOKS_DIR"

# Create pre-push hook
cat > "$GIT_HOOKS_DIR/pre-push" << 'EOF'
#!/bin/bash

# Pre-push hook to update .cursorrules before pushing to remote

echo "🔄 Updating .cursorrules before push..."

# Get the project root (where this script is located)
PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# Run the update script
if [ -f "$PROJECT_ROOT/update-cursorrules.sh" ]; then
    cd "$PROJECT_ROOT"
    ./update-cursorrules.sh
    
    # Check if .cursorrules was modified
    if git diff --quiet .cursorrules; then
        echo "📝 .cursorrules is up to date"
    else
        echo "📝 .cursorrules updated with current project info"
        echo "💡 Consider committing the updated .cursorrules file:"
        echo "   git add .cursorrules"
        echo "   git commit -m 'docs: update .cursorrules with current project info'"
        echo ""
        echo "🤔 Do you want to auto-commit the .cursorrules update? [y/N]"
        read -r response
        if [[ "$response" =~ ^[Yy]$ ]]; then
            git add .cursorrules
            git commit -m "docs: update .cursorrules with current project info"
            echo "✅ .cursorrules committed automatically"
        else
            echo "⚠️  .cursorrules updated but not committed"
        fi
    fi
else
    echo "⚠️  update-cursorrules.sh not found, skipping update"
fi

echo "🚀 Proceeding with push..."
EOF

# Make the hook executable
chmod +x "$GIT_HOOKS_DIR/pre-push"

# Create post-commit hook for local updates
cat > "$GIT_HOOKS_DIR/post-commit" << 'EOF'
#!/bin/bash

# Post-commit hook to update .cursorrules after significant commits

PROJECT_ROOT="$(git rev-parse --show-toplevel)"

# Check if this commit added/modified apps or build scripts
if git diff --name-only HEAD~1 HEAD | grep -E "(package\.json|vite\.config\.|build-all\.sh|index\.html)" > /dev/null; then
    echo "🔄 Detected changes to app structure, updating .cursorrules..."
    
    if [ -f "$PROJECT_ROOT/update-cursorrules.sh" ]; then
        cd "$PROJECT_ROOT"
        ./update-cursorrules.sh
        echo "✅ .cursorrules updated"
    fi
fi
EOF

# Make the hook executable
chmod +x "$GIT_HOOKS_DIR/post-commit"

# Test the update script
echo "🧪 Testing the update script..."
"$PROJECT_ROOT/update-cursorrules.sh"

echo ""
echo "✅ Git hooks setup complete!"
echo ""
echo "📋 What was installed:"
echo "   🪝 pre-push hook: Updates .cursorrules before pushing to remote"
echo "   🪝 post-commit hook: Updates .cursorrules after app structure changes"
echo ""
echo "💡 Usage:"
echo "   • Hooks run automatically on git push/commit"
echo "   • Manual update: ./update-cursorrules.sh"
echo "   • The hooks will prompt to auto-commit .cursorrules changes"
echo ""
echo "🔍 To check hook status:"
echo "   ls -la .git/hooks/"
echo ""
echo "🗑️  To remove hooks:"
echo "   rm .git/hooks/pre-push .git/hooks/post-commit"
