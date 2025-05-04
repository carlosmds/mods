#!/bin/bash

# Get the directory where the script is located
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
BACKEND_DIR="$( cd "$SCRIPT_DIR/../../backend" && pwd )"

# Create dist directory if it doesn't exist
mkdir -p "$BACKEND_DIR/dist"

# Create a temporary directory for packaging
TEMP_DIR=$(mktemp -d)

# Copy Lambda function and package.json
cp "$BACKEND_DIR/src/lambda/content-moderation.js" "$TEMP_DIR/index.js"
cp "$BACKEND_DIR/package.json" "$TEMP_DIR/"

# Create utils directory and copy required files
mkdir -p "$TEMP_DIR/utils"
cp "$BACKEND_DIR/src/utils/email.js" "$TEMP_DIR/utils/"
cp "$BACKEND_DIR/src/utils/ssm.js" "$TEMP_DIR/utils/"

# Create i18n directory and copy required files
mkdir -p "$TEMP_DIR/i18n"
cp "$BACKEND_DIR/src/i18n/config.js" "$TEMP_DIR/i18n/"
cp -r "$BACKEND_DIR/src/i18n/locales" "$TEMP_DIR/i18n/"

# Install production dependencies
cd "$TEMP_DIR"
npm install --production

# Create zip file quietly
zip -r "$BACKEND_DIR/dist/content-moderation.zip" . > /dev/null 2>&1

# Clean up
cd "$BACKEND_DIR"
rm -rf "$TEMP_DIR"

echo "Lambda content moderation function packaged successfully!" 