#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/../../backend" && pwd )"

# Create dist directory if it doesn't exist
mkdir -p "$BACKEND_DIR/dist"

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)

# Copy Lambda entrypoint and main app
cp "$BACKEND_DIR/src/lambda.js" "$TEMP_DIR/"
cp "$BACKEND_DIR/src/index.js" "$TEMP_DIR/"
cp "$BACKEND_DIR/src/constants.js" "$TEMP_DIR/"
cp "$BACKEND_DIR/package.json" "$TEMP_DIR/"

# Copy routes
mkdir -p "$TEMP_DIR/routes"
cp "$BACKEND_DIR/src/routes/"*.js "$TEMP_DIR/routes/"

# Copy middleware
mkdir -p "$TEMP_DIR/middleware"
cp "$BACKEND_DIR/src/middleware/"*.js "$TEMP_DIR/middleware/"

# Copy utils
mkdir -p "$TEMP_DIR/utils"
cp "$BACKEND_DIR/src/utils/"*.js "$TEMP_DIR/utils/"

# Copy i18n config and locales
mkdir -p "$TEMP_DIR/i18n"
cp "$BACKEND_DIR/src/i18n/config.js" "$TEMP_DIR/i18n/"
cp -r "$BACKEND_DIR/src/i18n/locales" "$TEMP_DIR/i18n/"

# Install production dependencies
cd "$TEMP_DIR"
npm install --production

# Create zip file quietly
zip -r "$BACKEND_DIR/dist/backend-api.zip" . > /dev/null 2>&1

# Clean up
cd "$BACKEND_DIR"
rm -rf "$TEMP_DIR"

echo "Lambda backend API packaged successfully!"