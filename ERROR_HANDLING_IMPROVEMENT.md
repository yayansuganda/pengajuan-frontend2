# Error Handling Improvement - Frontend

## Ringkasan Perubahan

Telah dilakukan perbaikan pada penanganan error di seluruh modul frontend untuk menampilkan pesan error yang lebih user-friendly, khususnya untuk error duplicate key dari database.

## Perubahan yang Dilakukan

### 1. Error Handler Utility (`src/shared/utils/errorHandler.ts`)

Dibuat utility function baru untuk mengubah error dari backend menjadi pesan yang lebih mudah dipahami pengguna:

**Fitur Utama:**
- **Duplicate Key Handling**: Mengubah error seperti `"ERROR: duplicate key value violates unique constraint "users_username_key" (SQLSTATE 23505)"` menjadi `"Username sudah digunakan. Silakan gunakan username yang berbeda."`
- **Foreign Key Violation**: Menampilkan pesan bahwa data masih digunakan oleh data lain
- **Not Null Violation**: Menampilkan pesan bahwa field tertentu harus diisi
- **Network Errors**: Menampilkan pesan koneksi internet
- **Authentication Errors**: Menampilkan pesan username/password salah

**Fungsi yang Tersedia:**
- `parseErrorMessage(error)`: Mengubah error object menjadi pesan user-friendly
- `handleError(error, defaultMessage)`: Wrapper function yang mudah digunakan di catch block

### 2. HTTP Client Update (`src/shared/utils/httpClient.ts`)

HTTP client telah diupdate untuk:
- Menggunakan `parseErrorMessage()` di response interceptor
- Menambahkan property `userMessage` pada error object untuk pesan yang sudah di-parse

### 3. Modul yang Telah Diupdate

Semua modul berikut telah diupdate untuk menggunakan error handler yang baru:

#### Data Master:
- ✅ **User Management** (`src/modules/user/presentation/UserList.tsx`)
- ✅ **Unit Management** (`src/modules/unit/presentation/UnitList.tsx`)
- ✅ **Jenis Pelayanan** (`src/modules/jenis-pelayanan/presentation/JenisPelayananList.tsx`)
- ✅ **Jenis Pembiayaan** (`src/modules/jenis-pembiayaan/presentation/JenisPembiayaanList.tsx`)

#### Transaksi:
- ✅ **Pengajuan Detail** (`src/modules/pengajuan/presentation/PengajuanDetail.tsx`)

## Contoh Penggunaan

### Sebelum:
```typescript
try {
    await repository.create(data);
} catch (error: any) {
    let errorMessage = 'Gagal menyimpan data';
    if (error.response?.data?.error) {
        errorMessage = error.response.data.error;
    } else if (error.message) {
        errorMessage = error.message;
    }
    showError(errorMessage);
}
```

### Sesudah:
```typescript
import { handleError } from '@/shared/utils/errorHandler';

try {
    await repository.create(data);
} catch (error: any) {
    showError(handleError(error, 'Gagal menyimpan data'));
}
```

## Mapping Error Messages

| Error Asli dari Database | Pesan User-Friendly |
|-------------------------|---------------------|
| `duplicate key value violates unique constraint "users_username_key"` | `Username sudah digunakan. Silakan gunakan username yang berbeda.` |
| `duplicate key value violates unique constraint "units_code_key"` | `Kode sudah digunakan. Silakan gunakan kode yang berbeda.` |
| `duplicate key value violates unique constraint "users_nip_key"` | `NIP sudah digunakan. Silakan gunakan nip yang berbeda.` |
| `violates foreign key constraint` | `Data tidak dapat dihapus karena masih digunakan oleh data lain.` |
| `violates not-null constraint` | `[Field] harus diisi.` |
| `invalid credentials` | `Username atau password salah.` |
| `Network Error` | `Tidak dapat terhubung ke server. Periksa koneksi internet Anda.` |

## Field Mapping

Utility ini secara otomatis mengubah nama field teknis menjadi label yang lebih friendly:

| Field Name | Label |
|-----------|-------|
| username | Username |
| nip | NIP |
| code | Kode |
| name | Nama |
| email | Email |
| phone | Nomor Telepon |
| nik | NIK |

## Manfaat

1. **User Experience Lebih Baik**: Pengguna tidak lagi melihat error teknis dari database
2. **Konsistensi**: Semua modul menggunakan format error yang sama
3. **Maintainability**: Error handling terpusat di satu file utility
4. **Bahasa Indonesia**: Semua pesan error dalam bahasa Indonesia yang mudah dipahami
5. **Debugging**: Error asli tetap di-log ke console untuk developer

## Testing

Untuk menguji perubahan ini:

1. Coba buat user dengan username yang sudah ada
2. Coba buat unit dengan kode yang sudah ada
3. Coba hapus data yang masih digunakan oleh data lain
4. Coba submit form dengan field required yang kosong

Semuanya seharusnya menampilkan pesan error yang jelas dan mudah dipahami dalam bahasa Indonesia.
