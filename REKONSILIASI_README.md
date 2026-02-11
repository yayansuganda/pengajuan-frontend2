# Menu Rekonsiliasi

## Deskripsi
Menu Rekonsiliasi adalah fitur untuk melihat dan mengekspor data pengajuan yang melalui POS (Pospay) untuk keperluan rekonsiliasi data.

## Akses
Menu ini hanya dapat diakses oleh:
- **super-admin**
- **admin-pos**

## Fitur

### 1. Tampilan Data
- Menampilkan list semua pengajuan yang jenis pelayanannya adalah "POS"
- Tabel menampilkan kolom utama:
  - No
  - Tanggal
  - Status
  - NIK
  - Nama Lengkap
  - NOPEN
  - Jenis Pembiayaan
  - Jumlah Pembiayaan
  - Tenor
  - Angsuran
  - Nominal Terima
  - NIPPOS
  - Petugas POS
  - KCU
  - Unit

### 2. Pencarian
- Fitur search untuk mencari berdasarkan:
  - NIK
  - Nama Lengkap
  - NOPEN
  - NIPPOS
  - Nama Petugas POS
  - Status

### 3. Export Excel
- Mengekspor **SEMUA KOLOM** dari database ke file Excel
- File Excel berisi semua field lengkap termasuk:
  - Data Diri (NIK, nama, alamat lengkap, dll)
  - Data Pensiun (NOPEN, jenis pensiun, bank, rekening, dll)
  - Data Dapem & Keuangan
  - Data Pengajuan (jenis pelayanan, pembiayaan, tenor, jumlah, dll)
  - Data Petugas POS (NIPPOS, nama, phone, KCU, KC, KCP, dll)
  - Files/URLs (KTP, slip gaji, dokumen akad, dll)
  - Location (latitude, longitude)
  - Timestamps (created_at, updated_at)
- Total **83 kolom** diekspor ke Excel
- Nama file: `Rekonsiliasi_POS_YYYY-MM-DDTHH-MM-SS.xlsx`

### 4. Refresh Data
- Tombol refresh untuk memuat ulang data terbaru dari database

## Akses Menu
- URL: `http://localhost:3000/rekonsiliasi`
- Menu muncul di sidebar setelah menu "Fronting" (untuk role super-admin dan admin-pos)
- Icon: ClipboardCheck

## Library yang Digunakan
- **xlsx**: Untuk export data ke format Excel

## Update: Admin POS Access Control

### Akses Menu untuk Admin POS
Role **admin-pos** sekarang memiliki akses terbatas:

**✅ Yang Bisa Diakses:**
- `/rekonsiliasi` - Menu Rekonsiliasi (Halaman utama)
- `/profile` - Halaman Profile user

**❌ Yang Tidak Bisa Diakses:**
- `/dashboard` - Dashboard
- `/pengajuan` - List Pengajuan
- `/pengecekan` - Pengecekan
- `/cek-status` - Cek Status
- `/fronting` - Fronting
- Semua menu Data Master (Unit, User, Jenis Pelayanan, dll)

### Mekanisme Proteksi
1. **Sidebar**: Admin-pos hanya melihat menu "Rekonsiliasi" di sidebar
2. **Auto Redirect**: Jika admin-pos mencoba akses halaman lain (selain rekonsiliasi dan profile), akan otomatis di-redirect ke `/rekonsiliasi`
3. **Protected Routes**: Sistem akan mencegah admin-pos mengakses halaman yang tidak diizinkan

### Pengalaman User
- **Login sebagai admin-pos** → Langsung masuk ke halaman Rekonsiliasi
- **Mencoba akses menu lain** → Otomatis redirect ke Rekonsiliasi
- **Sidebar hanya menampilkan** → Menu Rekonsiliasi saja

### Role Comparison
| Menu | super-admin | admin-pos | officer | verifier | manager |
|------|-------------|-----------|---------|----------|---------|
| Dashboard | ✅ | ❌ | ✅ | ✅ | ✅ |
| Pengajuan | ✅ | ❌ | ✅ | ✅ | ✅ |
| Rekonsiliasi | ✅ | ✅ | ❌ | ❌ | ❌ |
| Profile | ✅ | ✅ | ✅ | ✅ | ✅ |

## Update: Admin POS Melihat Semua Data POS Tanpa Filter

### Perubahan Backend (loan_handler.go)
Role **admin-pos** sekarang diperlakukan seperti **super-admin** saat mengambil data:

**Sebelumnya:**
- Admin-pos WAJIB menyediakan parameter `petugas_nippos` dalam query
- Jika tidak ada `petugas_nippos`, backend mengembalikan data kosong
- Admin-pos hanya bisa melihat data NIPPOS tertentu

**Sekarang:**
- Admin-pos **TIDAK PERLU** parameter `petugas_nippos`
- Admin-pos melihat **SEMUA data pengajuan** tanpa filter unit atau NIPPOS
- Frontend akan filter hanya yang `jenis_pelayanan === 'POS'`
- Hasilnya: Admin-pos melihat **semua pengajuan POS** dari seluruh NIPPOS dan unit

### Ringkasan Akses Data

| Role | Filter Applied | Lihat Data |
|------|----------------|------------|
| super-admin | Tidak ada filter | Semua data pengajuan |
| admin-pos | Hanya `jenis_pelayanan = POS` (di frontend) | Semua data POS dari semua NIPPOS |
| petugas-pos | `petugas_nippos` (wajib) | Data POS dari NIPPOS sendiri saja |
| officer | `user_id` (own data) | Data pengajuan yang dibuat sendiri |
| verifier | `unit` | Data dari unit sendiri |
| manager | `unit` + `status` | Data unit sendiri sesuai status |

### File yang Diubah
- **Backend**: `pengajuan_backend/internal/adapter/handler/loan_handler.go`
  - Line ~480: Menambahkan `|| role == "admin-pos"` ke kondisi super-admin
  - Line ~517: Menghapus `admin-pos` dari validasi NIPPOS wajib
  
- **Frontend**: Tidak ada perubahan diperlukan (sudah filter POS di client-side)

### Testing
Login sebagai admin-pos dan akses `/rekonsiliasi`:
- ✅ Melihat semua data pengajuan POS
- ✅ Tidak terbatas pada NIPPOS tertentu
- ✅ Bisa export semua data POS ke Excel
- ✅ Search berfungsi di semua data POS

## Update: Scrollable Table

### Fitur Scroll Tabel
Tabel di halaman Rekonsiliasi sekarang memiliki scroll yang lebih baik:

**Scroll Vertikal:**
- Maksimal tinggi tabel: **600px**
- Jika data lebih banyak, akan muncul scrollbar vertikal
- **Sticky header**: Header tabel tetap terlihat saat scroll ke bawah
- Shadow pada header untuk indikator scroll

**Scroll Horizontal:**
- Otomatis muncul jika kolom terlalu banyak
- Smooth scrolling behavior
- 15 kolom dapat di-scroll ke kanan-kiri

**Custom Scrollbar:**
- Lebar scrollbar: 10px (lebih terlihat)
- Warna: Abu-abu terang dengan track abu-abu lebih terang
- Hover effect: Warna berubah lebih gelap saat di-hover
- Rounded corners untuk estetika lebih baik
- Compatible dengan Firefox (scrollbar-width: thin)

**Keuntungan:**
- ✅ Mudah navigasi data banyak
- ✅ Header tetap terlihat (tahu kolom apa yang sedang dilihat)
- ✅ Scrollbar jelas dan mudah digunakan
- ✅ Tidak membuat halaman terlalu panjang
- ✅ Responsive untuk semua ukuran layar

**Browser Support:**
- Chrome/Edge: Custom scrollbar dengan webkit
- Firefox: Thin scrollbar native
- Safari: Custom scrollbar dengan webkit
