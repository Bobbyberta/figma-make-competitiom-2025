# Figma Make Competition Portfolio

A unified hosting solution for multiple React applications across three categories: Applications, Games, and Simulations. **Production-ready** for GitHub Pages deployment.

## 🚀 Quick Start

### First-Time Setup
```bash
# Complete project setup (git, hooks, build)
./setup-project.sh
```

### Development
```bash
# Build all apps for production
./build-all.sh

# Update AI documentation
./update-cursorrules.sh

# Serve locally
python3 serve.py
```

### GitHub Pages Deployment
1. Create GitHub repository and add remote
2. Push: `git push -u origin main`
3. Go to Settings → Pages → Source: "GitHub Actions"
4. Automatic deployment on every push

### Alternative Local Serving
```bash
# Node.js HTTP Server
npm install -g http-server
http-server . -p 8000 --cors -o

# VS Code Live Server Extension
# Right-click index.html → "Open with Live Server"
```

## 📁 Project Structure

```
Figma Make Competition/
├── index.html                    # Main portfolio entry point
├── styles.css                    # Production-ready CSS (no CDN dependencies)
├── serve.py                      # Python HTTP server with CORS
├── build-all.sh                  # Script to build all apps for production
├── setup-project.sh              # Complete project setup script
├── update-cursorrules.sh         # Updates .cursorrules with current project info
├── setup-git-hooks.sh            # Configures git hooks for automation
├── .cursorrules                  # AI assistant guidelines and project documentation
├── .github/workflows/deploy.yml  # GitHub Pages deployment workflow
├── Applications/                 # Productivity apps (1 app)
│   └── Time Zone Calculator/
├── Games/                        # Interactive games (2 apps)
│   ├── Glass Root Game Prototype/
│   └── Rain Topography Simulation App/
└── Simulations/                  # Scientific simulations (6 apps)
    ├── Bird Murmuration Simulator/
    ├── Fractal Simulation with Config/
    ├── Interactive Beach Simulation/
    ├── Interactive Matrix Transformations/
    ├── Reaction-Diffusion Simulation App/
    └── Vector Fields Visualization Tool/
```

## 🛠️ Adding New Apps

To add a new application to the portfolio:

1. **Create your app directory** in the appropriate category folder (`Applications/`, `Games/`, or `Simulations/`)

2. **Build your app for production**: `cd "Your App Directory" && npm run build`

3. **Update the app registry** in `index.html` by adding a new entry to the `apps` array:

```javascript
{
    name: "Your App Name",
    category: "applications", // or "games" or "simulations"
    description: "Brief description of what your app does",
    path: "./Applications/Your App Name/build/index.html", // Note: /build/ for production
    tags: ["tag1", "tag2", "tag3"]
}
```

4. **Update `build-all.sh`** to include your new app in the build process

That's it! The portfolio will automatically display your new app in the correct category.

## 🎨 Features

- **Category-based navigation**: Filter apps by Applications, Games, or Simulations
- **Responsive design**: Works on desktop, tablet, and mobile
- **iframe-based routing**: Each app loads in its own iframe for complete isolation
- **Back navigation**: Easy return to the main portfolio from any app
- **Search tags**: Visual tags help users understand what each app does
- **Hover effects**: Interactive cards with smooth animations

## 🔧 Technical Details

### Why This Approach?

This solution prioritizes:
- **Minimal development**: No complex build processes or framework dependencies
- **Easy maintenance**: Single file app registry for all updates
- **AI-friendly**: Clear structure and documentation for future AI modifications
- **Independence**: Each app remains a standalone project
- **No conflicts**: iframe isolation prevents CSS/JS conflicts between apps

### Tech Stack

- **Frontend**: Pure HTML, custom CSS (production-ready), and JavaScript
- **Build**: Individual Vite builds for each React app (configured for relative paths)
- **Deployment**: GitHub Actions + GitHub Pages
- **Serving**: Python HTTP server with CORS support (local development)
- **Routing**: Client-side iframe navigation
- **Apps**: Individual React/Vite applications

### Important Configuration

All Vite configs include `base: './'` to ensure assets load correctly when served from iframes. This is crucial for the portfolio to work properly.

### Browser Support

Works in all modern browsers. Requires JavaScript enabled for navigation.

## 🤖 AI Assistant System

This project includes a comprehensive AI assistance system with automatic documentation updates.

### .cursorrules File
- **Comprehensive project documentation** for AI agents
- **Architecture guidelines** and best practices
- **Common tasks and solutions** with examples
- **Troubleshooting guides** for typical issues
- **Automatically updated** with current project stats

### Automated Documentation
```bash
# Manual update
./update-cursorrules.sh

# Automatic updates via git hooks
git commit   # Updates after structural changes
git push     # Updates before pushing to remote
```

### Git Hooks
- **pre-push**: Updates documentation before pushing
- **post-commit**: Updates after app structure changes  
- **Interactive prompts** to auto-commit documentation updates

### For AI Agents
1. **Always read `.cursorrules` first** - contains complete project context
2. **Update documentation** after making structural changes
3. **Follow established patterns** documented in .cursorrules
4. **Test changes** with the provided development tools

## 🤖 AI Agent Instructions

When modifying this portfolio:

1. **Read `.cursorrules`**: Complete project documentation and guidelines
2. **App registry is in `index.html`**: Look for the `apps` array in the JavaScript section
3. **Categories are fixed**: `applications`, `games`, `simulations`
4. **Required app properties**: `name`, `category`, `description`, `path`, `tags`
5. **Update documentation**: Run `./update-cursorrules.sh` after changes
6. **Testing**: Use `python3 serve.py` to test changes locally

### Common Modifications

- **Add app**: Insert new object in `apps` array, update build-all.sh, run update script
- **Remove app**: Delete object from `apps` array, update build-all.sh
- **Update app**: Modify properties in existing app object
- **Change styling**: Update CSS classes following mobile-first approach
- **Add category**: Update nav buttons, `getCategoryColor` function, and documentation

## 📞 Support

This is a self-contained solution requiring minimal dependencies. If you encounter issues:

1. Ensure you're serving over HTTP (not opening files directly)
2. Check browser console for any JavaScript errors
3. Verify all app paths are correct relative to the root directory
4. Make sure individual apps work independently

Happy coding! 🎉
