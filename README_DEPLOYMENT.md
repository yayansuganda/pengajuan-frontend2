# Panduan Deployment Enterprise dengan Podman

Dokumen ini menjelaskan cara menjalankan aplikasi `pengajuan_frontend` menggunakan Podman dengan setup Enterprise (Load Balancing, Replicas, & High Availability).

## 1. Prasyarat

Pastikan Anda telah menginstal:
- **Podman Desktop** atau **Podman CLI**
- **podman-compose** (untuk local development)

### Cek Instalasi
```bash
podman --version
podman-compose --version
```

---

## 2. Struktur Project Enterprise

Aplikasi ini dikonfigurasi untuk berjalan dengan arsitektur berikut:
- **Nginx Load Balancer**: Mengatur traffic masuk di port **8888** (Local) atau **80** (Production).
- **Next.js Replicas**: 3 Instance aplikasi berjalan paralel untuk menangani beban tinggi.
- **Healthchecks**: Monitoring otomatis status kesehatan aplikasi.
- **Resource Limits**: Pembatasan CPU (0.5) dan RAM (1GB) untuk stabilitas.

File konfigurasi terkait:
- `Containerfile`: Definisi image container (Multi-stage build).
- `compose.yaml`: Orkestrasi untuk deployment lokal.
- `quadlets/`: Konfigurasi systemd untuk deployment production Linux.
- `nginx/nginx.conf`: Konfigurasi load balancer.

---

## 3. Menjalankan di Local (macOS / Windows)

Untuk pengembangan lokal, kita menggunakan `podman-compose`.

### Langkah 1: Persiapan VM (Khusus macOS)
Jika Anda belum pernah menjalankan Podman sebelumnya:
```bash
# Inisialisasi VM Linux
podman machine init --cpus 2 --memory 4096

# Jalankan VM
podman machine start
```

### Langkah 2: Jalankan Aplikasi
```bash
# Build dan jalankan background
podman-compose up -d --build
```

### Langkah 3: Verifikasi
Cek apakah container berjalan:
```bash
podman ps
```
Anda harus melihat 4 container:
1. `pengajuan-frontend-stack_nginx_1` (Load Balancer)
2. `pengajuan-frontend-stack_nextjs_1` (App Replica 1)
3. `pengajuan-frontend-stack_nextjs_2` (App Replica 2)
4. `pengajuan-frontend-stack_nextjs_3` (App Replica 3)

### Langkah 4: Akses Aplikasi
Buka browser dan kunjungi:
👉 **http://localhost:8888**

*(Catatan: Port 8888 digunakan untuk menghindari konflik dengan aplikasi lain di port 80/8080)*

---

## 4. Troubleshooting Local

**Masalah: "Bind address already in use"**
Artinya port 8888 sedang dipakai aplikasi lain.
Solusi:
1. Cek port: `lsof -i :8888`
2. Stop aplikasi tersebut, ATAU
3. Ubah port di `compose.yaml` (bagian `nginx` -> `ports`).

**Masalah: Aplikasi "Unhealthy"**
Container Next.js butuh waktu untuk starting. Tunggu 1-2 menit.
Cek logs:
```bash
podman logs pengajuan-frontend-stack_nextjs_1
```

---

## 5. Deployment ke Production (Linux Server)

Untuk server production (RHEL, CentOS, Ubuntu), gunakan **Quadlets** (Systemd) untuk performa & manajemen terbaik.

### Langkah 1: Upload Kode ke Server
Upload seluruh folder project ke server Linux Anda.

### Langkah 2: Jalankan Script Deploy Otomatis
Kami telah menyediakan script untuk setup otomatis:

```bash
# Beri izin eksekusi
chmod +x deploy_prod.sh

# Jalankan script
./deploy_prod.sh
```

Script ini akan:
1. Menginstall file Quadlet ke `~/.config/containers/systemd/`.
2. Reload systemd.
3. Build image dan menjalankan service.
4. Mengaktifkan 3 replika dan load balancer.

### Langkah 3: Akses Production
Aplikasi akan berjalan di **Port 80** server Anda.
👉 **http://IP-SERVER-ANDA**

### Manajemen Production
```bash
# Cek status
systemctl --user status pengajuan-proxy

# Stop aplikasi
systemctl --user stop pengajuan-proxy pengajuan-app@1 pengajuan-app@2 pengajuan-app@3
```
