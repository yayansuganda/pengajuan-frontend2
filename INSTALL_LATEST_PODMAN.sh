#!/bin/bash

# Panduan Instalasi Podman Terbaru
# Jalankan script ini di server Linux untuk menginstall/update Podman.

echo "Mendeteksi OS..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    OS=$NAME
    VER=$VERSION_ID
else
    echo "OS tidak dikenali."
    exit 1
fi

echo "OS Anda: $OS $VER"

if [[ "$OS" == "Ubuntu" ]]; then
    echo "--- Cara Install di Ubuntu ---"
    echo "1. Hapus versi lama (jika ada)"
    if command -v podman &> /dev/null; then
        sudo apt-get remove -y podman runc
    fi
    
    echo "2. Tambahkan Repository Resmi (Kubic Project) untuk versi terbaru"
    # Ubuntu 22.04 ke atas (Jammy)
    if [[ "$VER" == "22.04" ]] || [[ "$VER" == "24.04" ]]; then
       sudo apt-get update && sudo apt-get install -y podman
       echo "Versi Ubuntu default cukup baru."
    else
       # Ubuntu 20.04 (Focal) butuh repo khusus
       echo "Menambahkan repo untuk Ubuntu 20.04..."
       . /etc/os-release
       echo "deb https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_${VERSION_ID}/ /" | sudo tee /etc/apt/sources.list.d/devel:kubic:libcontainers:stable.list
       curl -L "https://download.opensuse.org/repositories/devel:/kubic:/libcontainers:/stable/xUbuntu_${VERSION_ID}/Release.key" | sudo apt-key add -
       sudo apt-get update
       sudo apt-get -y upgrade
       sudo apt-get -y install podman
    fi

elif [[ "$OS" == "CentOS Linux" ]] || [[ "$OS" == "Rocky Linux" ]] || [[ "$OS" == "Red Hat Enterprise Linux" ]]; then
    echo "--- Cara Install di RHEL/CentOS ---"
    echo "RHEL 8/9 memiliki modul container-tools yang selalu update."
    sudo dnf -y module disable container-tools
    sudo dnf -y module enable container-tools:rhel8
    sudo dnf -y module install container-tools
    sudo dnf -y update podman

else
    echo "OS lain: Silakan cek https://podman.io/docs/installation"
fi

echo ""
echo "--- Verifikasi ---"
podman --version
echo "Pastikan versi >= 4.4.0 untuk fitur Quadlet."
