#!/bin/bash

# Build script for all Figma Make Competition apps
# This script installs dependencies and builds each app for production

set -e  # Exit on any error

echo "🚀 Building Figma Make Competition Portfolio..."
echo "================================================"

# Color codes for better output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m' # No Color

build_app() {
    local app_path="$1"
    local app_name="$2"
    
    echo -e "\n${BLUE}📦 Building: ${app_name}${NC}"
    echo "Path: $app_path"
    
    if [ -f "$app_path/package.json" ]; then
        cd "$app_path"
        
        # Install dependencies if node_modules doesn't exist
        if [ ! -d "node_modules" ]; then
            echo "Installing dependencies..."
            npm install
        fi
        
        # Build the app
        echo "Building for production..."
        npm run build
        
        echo -e "${GREEN}✅ Built: ${app_name}${NC}"
        cd - > /dev/null
    else
        echo -e "${RED}❌ No package.json found in: $app_path${NC}"
    fi
}

# Build all applications
echo -e "\n${BLUE}🏢 APPLICATIONS${NC}"
build_app "Applications/Time Zone Calculator" "Time Zone Calculator"

echo -e "\n${BLUE}🎮 GAMES${NC}"
build_app "Games/Glass Root Game Prototype" "Glass Root Game Prototype"
build_app "Games/Rain Topography Simulation App" "Rain Topography Simulation App"

echo -e "\n${BLUE}🔬 SIMULATIONS${NC}"
build_app "Simulations/Bird Murmuration Simulator" "Bird Murmuration Simulator"
build_app "Simulations/Fractal Simulation with Config" "Fractal Simulation with Config"
build_app "Simulations/Interactive Beach Simulation" "Interactive Beach Simulation"
build_app "Simulations/Interactive Matrix Transformations" "Interactive Matrix Transformations"
build_app "Simulations/Reaction-Diffusion Simulation App" "Reaction-Diffusion Simulation App"
build_app "Simulations/Vector Fields Visualization Tool" "Vector Fields Visualization Tool"

echo -e "\n${GREEN}🎉 All apps built successfully!${NC}"
echo -e "You can now deploy to GitHub Pages or serve locally with: ${BLUE}python3 serve.py${NC}"
# Test comment
