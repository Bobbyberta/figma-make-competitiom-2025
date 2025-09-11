# Script Reference Guide

Quick reference for all automation scripts in the Figma Make Competition Portfolio.

## 🚀 Main Scripts

### `./setup-project.sh`
**Complete project initialization**
- Initializes git repository
- Sets up git hooks
- Updates .cursorrules
- Builds all apps
- Creates initial commit

```bash
./setup-project.sh
```

### `./build-all.sh`
**Build all applications for production**
- Installs dependencies for each app
- Builds all React apps to `/build` folders
- Colored output with progress indicators

```bash
./build-all.sh
```

### `./update-cursorrules.sh`
**Update AI documentation**
- Scans project structure
- Updates .cursorrules with current app counts
- Adds git information and timestamps
- Lists all current applications

```bash
./update-cursorrules.sh
```

### `./setup-git-hooks.sh`
**Configure git automation**
- Sets up pre-push hook (updates docs before push)
- Sets up post-commit hook (updates after structure changes)
- Interactive prompts for auto-committing updates

```bash
./setup-git-hooks.sh
```

### `./serve.py`
**Local development server**
- Python HTTP server with CORS headers
- Serves portfolio and all built apps
- Opens browser automatically

```bash
python3 serve.py [port]    # Default port: 8000
```

## 🔄 Git Hooks (Automatic)

### Pre-Push Hook
- **Trigger**: `git push`
- **Action**: Updates .cursorrules before pushing
- **Prompt**: Asks to auto-commit documentation updates

### Post-Commit Hook  
- **Trigger**: `git commit` (when app structure changes)
- **Action**: Updates .cursorrules after structural changes
- **Detection**: Watches for changes to package.json, vite.config.*, build-all.sh, index.html

## 📋 Common Workflows

### Adding a New App
```bash
# 1. Create app directory and files
mkdir "Category/New App Name"
cd "Category/New App Name"
# ... create your React app with base: './' in vite.config.ts

# 2. Add to portfolio
# Edit index.html apps array
# Edit build-all.sh to include new app

# 3. Build and update
./build-all.sh
./update-cursorrules.sh

# 4. Test
python3 serve.py
```

### Deployment to GitHub Pages
```bash
# Build everything
./build-all.sh

# Update documentation  
./update-cursorrules.sh

# Commit and push (hooks will handle updates)
git add .
git commit -m "feat: add new app"
git push origin main
```

### Development Cycle
```bash
# Make changes to apps or portfolio
# ...

# Build and test
./build-all.sh
python3 serve.py

# Update docs and commit
./update-cursorrules.sh
git add .
git commit -m "update: description of changes"
git push
```

## 🛠️ Maintenance

### Manual Updates
- Run `./update-cursorrules.sh` after adding/removing apps
- Run `./build-all.sh` after app code changes
- Check git hooks with `ls -la .git/hooks/`

### Troubleshooting
- **Script not executable**: `chmod +x script-name.sh`
- **Git hooks not working**: Re-run `./setup-git-hooks.sh`
- **Apps not loading**: Check Vite configs have `base: './'`
- **Build failures**: Ensure all package.json files exist

### Removing Git Hooks
```bash
rm .git/hooks/pre-push .git/hooks/post-commit
```

## 📖 Documentation Files

- **`.cursorrules`**: AI assistant guidelines (auto-generated)
- **`README.md`**: Main project documentation
- **`SCRIPTS.md`**: This file - script reference
- **Individual app READMEs**: In each app directory

## 🤖 For AI Agents

1. **Always read `.cursorrules` first** for complete project context
2. **Use scripts for consistency** - don't manually duplicate their functionality
3. **Update documentation** with `./update-cursorrules.sh` after changes
4. **Test thoroughly** with `python3 serve.py` before committing
5. **Follow established patterns** documented in .cursorrules

---

*This file provides quick reference for all automation scripts. For detailed project documentation, see `.cursorrules` and `README.md`.*
