# Panduan Cloudflare Tunnel (Lokal & Production)

Agar конфигураsi Anda "Portable" (bisa dites di lokal, lalu langsung jalan di server), kita menggunakan file `.env` untuk menyimpan Token Cloudflare.

## 1. Dapatkan Token
1. Buka Dashboard Cloudflare Zero Trust > Networks > Tunnels.
2. Create Tunnel > Pilih **Cloudflared**.
3. Copy token panjang (setelah `--token`).

## 2. Masukkan ke Config Lokal
Buka file `.env` di folder project ini, dan isi bagian paling bawah:

```bash
TUNNEL_TOKEN=eyJhIjoiM... (Tempel Token Disini)
```

## 3. Jalankan di Local
Restart podman-compose Anda:

```bash
podman-compose down
podman-compose up -d --build
```

- Jika token benar, status container `tunnel` akan **"Up"**.
- Cek dashboard Cloudflare, status Tunnel akan berubah menjadi **"Healthy"** / **"Connected"**.
- Anda bisa mengakses web dari domain public yang Anda set di Cloudflare (misal: `https://app.domainanda.com`).

---

## 4. Deploy ke Server (Tanpa Config Ulang)

Karena script deploy kita (`deploy_prod.sh`) dan Quadlet (`quadlets/pengajuan-tunnel.container`) sudah saya update untuk mengambil token dari environment, Anda hanya perlu memastikan file `.env` (atau tokennya) sudah ada di server.

**Cara Paling Mudah di Server:**
Saat menjalankan Quadlet di server, edit file `quadlets/pengajuan-tunnel.container` sekali saja:

```ini
Environment=TUNNEL_TOKEN=eyJhIjoi...
```

Atau jika ingin full otomatis tanpa edit file di server, pastikan script deploy membaca env var dari server Anda.
