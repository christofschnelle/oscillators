#!/usr/bin/env sh

# Abort on errors
set -e

# Build
echo "Building..."
npm run build

# Create .nojekyll to bypass Jekyll processing
touch dist/.nojekyll

# Navigate into the build output directory
cd dist

# Initialize git if not already
git init
git add -A
git commit -m 'deploy'

# Deploy to gh-pages branch
# Replace YOUR_USERNAME/vue-demo with your actual GitHub repo
echo "Deploying to GitHub Pages..."
git push -f git@github.com:christofschnelle/oscillators.git master:gh-pages

cd ..

echo "Deployed successfully!"
