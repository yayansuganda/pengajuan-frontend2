# 4. Generate & Start Units (Manual Way)
echo "Generating systemd units from Quadlets..."

# Jika Quadlet generator gagal otomatis, kita jalankan manual untuk melihat ERROR-nya
QUADLET_BIN=$(find /usr/libexec/podman -name quadlet 2>/dev/null || which quadlet || echo "")

if [ -z "$QUADLET_BIN" ]; then
    echo "❌ ERROR FATAL: Binary 'quadlet' tidak ditemukan di server ini!"
    echo "Mohon pastikan paket 'podman' terinstall lengkap (kadang butuh 'podman-plugins' atau sejenisnya)."
    exit 1
fi

echo "Running Quadlet generator: $QUADLET_BIN"
$QUADLET_BIN --user --dryrun

echo "Reloading systemd..."
systemctl --user daemon-reload

# Cek apakah unit file TERBENTUK?
if [ ! -f ~/.config/systemd/user/pengajuan-proxy.service ] && [ ! -f /run/user/$(id -u)/systemd/generator/pengajuan-proxy.service ]; then
    echo "❌ ERROR: File service systemd tidak terbentuk!"
    echo "Cek isi folder ~/.config/containers/systemd/ :"
    ls -la ~/.config/containers/systemd/
    exit 1
fi
