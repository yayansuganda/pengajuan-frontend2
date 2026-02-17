#!/bin/bash
set -e

echo "Starting Enterprise Quadlet Deployment..."

# 1. Ensure configuration directory exists
mkdir -p ~/.config/containers/systemd/

# 2. Get current project directory on the server
PROJECT_DIR=$(pwd)
echo "Deploying from: $PROJECT_DIR"

# 3. Deploy and FIX paths in Quadlet files (Dynamic Path Adjustment)
# Fix Context path in build file
sed "s|Context=.*|Context=$PROJECT_DIR|g" quadlets/pengajuan.build > ~/.config/containers/systemd/pengajuan.build

# Fix Volume path in proxy file
sed "s|Volume=.*|Volume=$PROJECT_DIR/nginx/nginx.conf:/etc/nginx/nginx.conf:ro|g" quadlets/pengajuan-proxy.container > ~/.config/containers/systemd/pengajuan-proxy.container

# Copy other files as-is
cp quadlets/pengajuan.network ~/.config/containers/systemd/
cp quadlets/pengajuan-app@.container ~/.config/containers/systemd/

echo "Quadlet artifacts deployed with correct paths."

# 4. Reload systemd to generate units
echo "Attempting to generate units with /usr/libexec/podman/quadlet..."
/usr/libexec/podman/quadlet --user --dryrun 2>/dev/null || echo "Generator check skipped (binary not found at checked path)"

echo "Reloading systemd user daemon..."
systemctl --user daemon-reload

# 5. Start Network and Build Service
echo "Starting network and build..."
systemctl --user start pengajuan.network pengajuan-build

# 6. Start Application Replicas (Scaling to 3)
echo "Starting 3 application replicas..."
systemctl --user start pengajuan-app@1 pengajuan-app@2 pengajuan-app@3

# 7. Start Load Balancer
echo "Starting Nginx load balancer..."
systemctl --user start pengajuan-proxy

# 8. Check Status
echo "Deployment Complete. Checking status..."
systemctl --user status pengajuan-proxy --no-pager
podman ps
