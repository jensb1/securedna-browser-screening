#!/bin/bash
set -e

# Script to rebuild and update WASM files from the SecureDNA repository
# Usage: ./update-wasm.sh [path-to-securedna-repo]

SECUREDNA_REPO="${1:-../securedna}"
WASM_CRATE="$SECUREDNA_REPO/crates/wasm_bindings/screening"
TARGET_DIR="./src/wasm"

echo "🔧 Updating WASM from SecureDNA repository..."
echo "   SecureDNA repo: $SECUREDNA_REPO"
echo "   WASM crate: $WASM_CRATE"
echo ""

# Check if SecureDNA repo exists
if [ ! -d "$SECUREDNA_REPO" ]; then
    echo "❌ Error: SecureDNA repository not found at $SECUREDNA_REPO"
    echo "   Usage: ./update-wasm.sh [path-to-securedna-repo]"
    exit 1
fi

# Check if the screening crate exists
if [ ! -d "$WASM_CRATE" ]; then
    echo "❌ Error: Screening WASM crate not found at $WASM_CRATE"
    exit 1
fi

# Check if wasm-pack is installed
if ! command -v wasm-pack &> /dev/null; then
    echo "❌ Error: wasm-pack is not installed"
    echo "   Install it with: cargo install wasm-pack"
    exit 1
fi

# Navigate to the WASM crate
cd "$WASM_CRATE"

echo "📦 Building WASM with wasm-pack..."
wasm-pack build --target web --out-dir pkg

# Check if build succeeded
if [ ! -f "pkg/screening_wasm_bg.wasm" ]; then
    echo "❌ Error: WASM build failed - files not found"
    exit 1
fi

# Navigate back to the UI repo
cd - > /dev/null

echo "📋 Copying WASM files to $TARGET_DIR..."

# Create target directory if it doesn't exist
mkdir -p "$TARGET_DIR"

# Copy the WASM files
cp "$WASM_CRATE/pkg/screening_wasm_bg.wasm" "$TARGET_DIR/"
cp "$WASM_CRATE/pkg/screening_wasm.js" "$TARGET_DIR/"
cp "$WASM_CRATE/pkg/screening_wasm.d.ts" "$TARGET_DIR/"
cp "$WASM_CRATE/pkg/screening_wasm_bg.wasm.d.ts" "$TARGET_DIR/"
cp "$WASM_CRATE/pkg/package.json" "$TARGET_DIR/"

echo "✅ WASM files updated successfully!"
echo ""
echo "📊 File sizes:"
ls -lh "$TARGET_DIR"/*.wasm "$TARGET_DIR"/*.js | awk '{print "   " $9 ": " $5}'
echo ""
echo "🔄 You may need to restart the dev server for changes to take effect."
