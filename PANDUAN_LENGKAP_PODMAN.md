# Panduan Lengkap: Deployment Enterprise dengan Podman (Dari 0 sampai Sukses)

Dokumen ini dibuat khusus untuk Anda yang baru pertama kali menggunakan **Podman**. Panduan ini mencakup semua langkah yang telah kita lakukan di project ini, mulai dari instalasi, konfigurasi, menangani error, hingga aplikasi berjalan sukses.

---

## 🏗️ Bagian 1: Pengenalan Singkat
**Apa itu Podman?**
Podman adalah alat untuk menjalankan aplikasi dalam "waddah" (container) terisolasi, mirip seperti Docker.
- **Kelebihan**: Lebih aman (rootless), ringan (daemonless), dan gratis (open source).
- **Bedanya**: Di macOS/Windows, Podman butuh "Mesin Linux Virtual" (Podman Machine) kecil untuk berjalan di latar belakang.

---

## 🛠️ Bagian 2: Instalasi (macOS)

Jika Anda belum menginstall Podman, lakukan langkah ini di Terminal:

1. **Install via Homebrew** (Cara termudah):
   ```bash
   brew install podman podman-compose
   ```

2. **Inisialisasi Mesin Podman**:
   Karena macOS bukan Linux, kita butuh VM kecil. Perintah ini mendownload dan membuat VM tersebut:
   ```bash
   # Membuat VM dengan 2 CPU dan 4GB RAM (Standar Enterprise)
   podman machine init --cpus 2 --memory 4096
   ```

3. **Jalankan Mesin**:
   ```bash
   podman machine start
   ```
   *Jika sukses, Anda akan melihat pesan "Machine started successfully".*

---

## 🚀 Bagian 3: Menjalankan Project di Laptop (Local)

Kita menggunakan **`podman-compose`** untuk menjalankan project ini di laptop Anda. Ini membaca file `compose.yaml` yang sudah saya siapkan.

### 1. File Konfigurasi yang Saya Buat untuk Anda:
- **`Containerfile`**: Resep untuk membungkus aplikasi Next.js Anda menjadi image container.
- **`compose.yaml`**: Instruksi untuk menjalankan 4 container sekaligus (1 Nginx Load Balancer + 3 Aplikasi Next.js).
- **`nginx/nginx.conf`**: Konfigurasi agar Nginx membagi beban traffic ke 3 aplikasi tersebut.

### 2. Menjalankan Aplikasi
Buka terminal di folder project `pengajuan_frontend`, lalu ketik:

```bash
podman-compose up -d --build
```

**Penjelasan Perintah:**
- `up`: Jalankan container.
- `-d`: Detached (jalan di background agar terminal tidak macet).
- `--build`: Paksa buat ulang image baru (penting jika ada perubahan code/config).

### 3. Cek Apakah Sudah Jalan?
Ketik perintah ini untuk melihat container yang aktif:
```bash
podman ps
```
**Tampilan Sukses:**
Anda harus melihat 4 baris container:
1. `..._nginx_1` (Ports: **0.0.0.0:8888->80/tcp**)
2. `..._nextjs_1`
3. `..._nextjs_2`
4. `..._nextjs_3`

### 4. Akses Aplikasi
Buka browser dan kunjungi:
👉 **[http://localhost:8888](http://localhost:8888)**

⚠️ **Kenapa port 8888?**
Tadi kita sempat gagal di port 80 dan 8080 karena port tersebut sudah dipakai oleh aplikasi lain di laptop Anda (Apache/MAMP). Jadi saya pindahkan ke 8888 agar aman.

---

## 📋 Bagian 4: Masalah yang Kita Hadapi & Solusinya

Ini rekap error yang kita perbaiki tadi, agar Anda paham sejarahnya:

1. **Error `swcMinify`**:
   - *Penyebab*: Fitur lama Next.js yang sudah dihapus di versi baru.
   - *Solusi*: Saya hapus baris `swcMinify: true` di `next.config.ts`.

2. **Error `Connection Refused / Socket missing`**:
   - *Penyebab*: Podman Machine (VM Linux) belum jalan di laptop Anda.
   - *Solusi*: Saya jalankan `podman machine init` dan `podman machine start`.

3. **Error `Bind address already in use` (Port 80/8080)**:
   - *Penyebab*: Ada web server lain (Apache) yang berjalan di laptop Anda.
   - *Solusi*: Saya ubah port di `compose.yaml` menjadi **8888**.

4. **Error `Recursion / Stack Limit` di .env**:
   - *Penyebab*: Ada variabel yang memanggil dirinya sendiri (`API_URL=${API_URL}`).
   - *Solusi*: Saya hapus baris bermasalah tersebut di `.env.production`.

---

## 🏢 Bagian 5: Cara Deploy ke Server Kantor (Enterprise/Production)

Untuk server Linux sungguhan (bukan laptop), kita **TIDAK** menggunakan `podman-compose`, tapi fitur canggih bernama **Quadlets** (Systemd) agar aplikasi otomatis restart jika server mati.

### Langkah-langkah di Server Linux:
1. Upload folder project ini ke server.
2. Masuk ke terminal server.
3. Jalankan script otomatis yang saya buat:
   ```bash
   chmod +x deploy_prod.sh  # Beri izin eksekusi
   ./deploy_prod.sh         # Jalankan scriptnya
   ```
4. Aplikasi akan jalan otomatis dan dilindungi oleh sistem Linux (Systemd).

---

## 💡 Tips & Trik Podman

**Melihat error/log aplikasi:**
```bash
# Lihat log Nginx
podman logs pengajuan-frontend-stack_nginx_1

# Lihat log Aplikasi Next.js
podman logs pengajuan-frontend-stack_nextjs_1
```

**Mematikan aplikasi:**
```bash
podman-compose down
```

**Restart aplikasi (misal setelah edit code):**
```bash
podman-compose restart
```

Semoga panduan ini membantu! Jangan ragu bertanya jika ada yang masih membingungkan.
