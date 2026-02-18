#!/bin/bash

echo "=== DEEP DIVE QUADLET DEBUGGING ==="

# 1. Cek Lokasi Generator
GENERATOR=$(command -v /usr/libexec/podman/quadlet || command -v /usr/lib/systemd/system-generators/podman-system-generator || echo "NOT_FOUND")
echo "Generator Binary: $GENERATOR"

if [ "$GENERATOR" == "NOT_FOUND" ]; then
    echo "❌ CRITICAL: Binary Quadlet tidak ditemukan!" 
    echo "Coba install: sudo apt install podman-docker (Ubuntu) atau sudo dnf install podman-plugins (RHEL)"
    exit 1
fi

# 2. Cek Environment Systemd
echo "DBUS_SESSION_BUS_ADDRESS: ${DBUS_SESSION_BUS_ADDRESS:-'MISSING! (Perlu enable-linger)'}"
echo "XDG_RUNTIME_DIR: ${XDG_RUNTIME_DIR:-'MISSING!'}"

# 3. Validasi Syntax File Quadlet
echo -e "\n=== MENGUJI GENERATOR SECARA MANUAL ==="
export QUADLET_UNIT_DIRS="$HOME/.config/containers/systemd"

# Jalankan dengan verbose (-v) untuk melihat kenapa dia menolak file kita
$GENERATOR --user -v --dryrun

echo -e "\n=== CEK HASIL GENERATE DI FOLDER SYSTEM ==="
GENERATED_DIR="/run/user/$(id -u)/systemd/generator"
if [ -d "$GENERATED_DIR" ]; then
    ls -la "$GENERATED_DIR" | grep pengajuan
else
    echo "❌ Folder generator systemd tidak ada: $GENERATED_DIR"
fi

echo -e "\n=== SOLUSI MANUAL (JIKA GENERATOR MACET) ==="
echo "Jika output di atas kosong, jalankan perintah ini untuk memaksa:"
echo "mkdir -p ~/.config/systemd/user/"
echo "$GENERATOR --user -v -output-dir ~/.config/systemd/user/"
