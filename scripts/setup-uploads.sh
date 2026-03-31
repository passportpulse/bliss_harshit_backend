#!/bin/bash

# Setup script for creating upload directories with correct permissions
# Run this script on production server after deployment

echo "Setting up upload directories..."

# Get the script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
PROJECT_ROOT="$(dirname "$SCRIPT_DIR")"

# Navigate to project root
cd "$PROJECT_ROOT"

# Create upload directories
mkdir -p public/uploads/products
mkdir -p public/uploads/blogs
mkdir -p public/uploads/banners
mkdir -p public/uploads/testimonials

# Set permissions (read, write, execute for owner and group)
chmod -R 775 public/uploads

# Display created directories
echo "Upload directories created:"
ls -la public/uploads/

echo ""
echo "✓ Setup complete!"
echo ""
echo "Note: Make sure the user running the Node.js process has write permissions to these directories."
echo "If running with pm2 or systemd, check the user specified in the configuration."
