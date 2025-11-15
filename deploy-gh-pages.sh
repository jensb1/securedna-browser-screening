#!/bin/bash
set -e

echo "🚀 Deploying to GitHub Pages..."

# Build the application
echo "📦 Building application..."
npm run build

# Check if gh-pages branch exists
if git show-ref --verify --quiet refs/heads/gh-pages; then
    echo "✓ gh-pages branch exists"
else
    echo "Creating gh-pages branch..."
    git checkout --orphan gh-pages
    git rm -rf .
    git commit --allow-empty -m "Initial gh-pages commit"
    git checkout main
fi

# Deploy to gh-pages
echo "📤 Deploying to gh-pages branch..."
git checkout gh-pages
cp -r dist/* .
git add .
git commit -m "Deploy: $(date '+%Y-%m-%d %H:%M:%S')" || echo "No changes to commit"
git push origin gh-pages
git checkout main

echo "✅ Deployed successfully!"
echo "🌐 Your site will be available at: https://<username>.github.io/<repo-name>/"
