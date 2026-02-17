# Panduan Enterprise: Cloudflare Tunnel & SSL (Zero Trust)

Panduan ini mengubah arsitektur deployment Anda menjadi **Zero Trust**. 
Artinya:
1. **Tidak ada Port Terbuka**: Port 80/443 di server Anda akan ditutup total. Aman dari scanner hacker.
2. **SSL Otomatis**: Cloudflare menangani sertifikat HTTPS secara gratis dan otomatis perpanjang.
3. **DDos Protection**: Server Anda terlindungi di belakang jaringan Cloudflare.

---

## 🏗️ Persiapan di Cloudflare Dashboard

1. Login ke **[Cloudflare Zero Trust](https://one.dash.cloudflare.com/)**.
2. Masuk ke menu **Networks** > **Tunnels**.
3. Klik **Create a Tunnel**.
   - Pilih **Cloudflared**.
   - Beri nama, misal: `pengajuan-prod`.
4. **Simpan Token**:
   - Anda akan melihat perintah instalasi. **JANGAN** jalankan perintahnya.
   - Cukup **COPY TOKEN**-nya saja. Token adalah deretan karakter panjang acak setelah `--token`.

---

## ⚙️ Konfigurasi di Server (Podman Quadlets)

Kami telah menyiapkan file `quadlets/pengajuan-tunnel.container`.

### 1. Masukkan Token
Edit file tersebut di server (atau di local lalu upload lagi) dan tempel token Anda:

```ini
# File: quadlets/pengajuan-tunnel.container
Environment=TUNNEL_TOKEN=eyJhIjoiM... (Tempel Token Panjang Disini)
```

### 2. Update Deployment
Jalankan ulang script deploy untuk menerapkan perubahan:

```bash
./deploy_prod.sh
```

---

## 🔗 Menghubungkan Domain (Route Traffic)

Kembali ke Cloudflare Dashboard (halaman Tunnel yang tadi):

1. Klik **Next** (Tab "Public Hostname").
2. Tambahkan **Public Hostname**:
   - **Subdomain**: misal `app` (jadinya `app.domainanda.com`).
   - **Domain**: Pilih domain Anda.
3. Konfigurasi **Service** (PENTING!):
   - **Type**: `HTTP`
   - **URL**: `pengajuan-proxy:80`
   
   ⚠️ *Penjelasan*: Kita mengarahkan traffic ke container Nginx (`pengajuan-proxy`) di port 80. Ini berjalan di jaringan internal Podman, jadi tidak perlu HTTPS di tahap ini (SSL sudah ditangani Cloudflare di depan).

4. Klik **Save Tunnel**.

---

## ✅ Selesai!

Sekarang akses `https://app.domainanda.com`.
- Website akan terbuka dengan **Gembok Hijau (SSL Aman)**.
- Server Anda terkunci rapat (tidak ada port terbuka).
- Traffic berjalan lewat jalur khusus (Tunnel) yang terenkripsi.
