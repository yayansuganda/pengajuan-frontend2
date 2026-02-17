#!/bin/bash
set -e

echo "=== Deployment Darurat (Mode Simple) ==="
echo "Menggunakan podman-compose yang terbukti sukses di local."

# 1. Cek & Install podman-compose jika belum ada
if ! command -v podman-compose &> /dev/null; then
    echo "🔍 podman-compose tidak ditemukan. Mencoba install..."
    if command -v pip3 &> /dev/null; then
        pip3 install podman-compose --user --break-system-packages || pip3 install podman-compose --user
    elif command -v apt &> /dev/null; then
        sudo apt update && sudo apt install -y podman-compose
    elif command -v dnf &> /dev/null; then
        sudo dnf install -y podman-compose
    else
        echo "❌ Gagal install podman-compose automatos. Mohon install manual: 'pip3 install podman-compose'"
        exit 1
    fi
fi

# 2. Pastikan path pip ada di PATH (jika install --user)
export PATH=$PATH:$HOME/.local/bin

echo "✅ podman-compose siap."

# 3. Matikan deployment lama (jika ada sisa)
podman-compose down 2>/dev/null || true

# 4. Jalankan Deployment Production
# Menggabungkan compose.yaml (dasar) dengan compose.prod.yaml (setting production)
echo "🚀 Memulai aplikasi..."
podman-compose -f compose.yaml -f compose.prod.yaml up -d --build

# 5. Cek Status
echo "📊 Status Container:"
podman ps
echo ""
echo "✅ DEPLOYMENT SELESAI!"
echo "Aplikasi berjalan di port 8080 (Localhost)."
echo "Pastikan Tunnel Cloudflare Anda mengarah ke: http://localhost:8080"
