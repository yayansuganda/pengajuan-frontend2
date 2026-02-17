#!/bin/bash

# Diagnostic Script for Podman Quadlet Issues
echo "=== SYSTEM INFO ==="
echo "User: $(whoami)"
echo "OS Info: $(cat /etc/os-release | grep PRETTY_NAME)"
echo "Podman Version: $(podman --version 2>/dev/null || echo 'Not Installed')"
echo "Systemd Version: $(systemctl --version | head -n 1)"

echo -e "\n=== QUADLET FILES CHECK ==="
QUADLET_DIR="$HOME/.config/containers/systemd"
ls -la "$QUADLET_DIR" 2>/dev/null || echo "Directory does not exist!"

echo -e "\n=== GENERATOR CHECK ==="
# Try to manually trigger the generator to see errors
/usr/lib/systemd/system-generators/podman-system-generator --user --dryrun 2>/dev/null || \
/usr/libexec/podman/quadlet --user --dryrun 2>/dev/null || \
echo "Cannot find quadlet generator binary!"

echo -e "\n=== UNIT STATUS CHECK ==="
systemctl --user list-unit-files | grep pengajuan || echo "No units found matching 'pengajuan'"
