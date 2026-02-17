# Panduan Instalasi Podman (Syarat Quadlet)

Agar fitur otentikasi systemd (Quadlet) berfungsi, server Anda **WAJIB** terinstall Podman versi **4.4** ke atas.

## 1. Instalasi (Pilih Sesuai OS Server)

### 👉 Ubuntu 22.04 / 24.04 / Debian
```bash
sudo apt-get update
sudo apt-get -y install podman
```
*Jika Ubuntu Anda versi lama (20.04 kebawah), Podman bawaannya terlalu tua. Anda mungkin perlu upgrade OS atau menggunakan Snap.*

### 👉 RHEL 9 / CentOS 9 / Rocky Linux 9 (Enterprise Standard)
Ini adalah OS terbaik untuk Podman.
```bash
sudo dnf -y install podman
```

### 👉 RHEL 8 / CentOS 8
```bash
sudo dnf -y module install container-tools
```

---

## 2. Verifikasi Versi (PENTING)
Setelah install, cek versinya:
```bash
podman --version
```
Pastikan hasilnya minimal `4.4.x`. Jika `3.x` atau `4.0`, script deploy **TIDAK AKAN JALAN** karena Quadlet belum didukung.

---

## 3. Aktifkan Fitur "Linger" (Wajib untuk Rootless)
Agar aplikasi **tetap jalan** setelah Anda logout dari SSH (tidak mati sendiri), jalankan perintah ini:

```bash
# Aktifkan untuk user saat ini
loginctl enable-linger $(whoami)
```

Setelah itu, **REBOOT** server Anda sekali agar efeknya aktif sempurna.

---

## 4. Jalankan Deploy Ulang
Setelah server nyala kembali, masuk ke folder project dan deploy:

```bash
cd pengajuan_frontend
./deploy_prod.sh
```
