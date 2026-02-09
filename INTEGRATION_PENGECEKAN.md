# Integrasi API Pengecekan Pensiunan - Pos Indonesia

## Overview
Halaman pengecekan (`/pengecekan`) telah diintegrasikan dengan API eksternal dari Pos Indonesia untuk mendapatkan data pensiunan secara real-time.

## Konfigurasi API

### Base URL
```
https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun
```

### Authentication Headers
- **X-Partner-Id**: `M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL`
- **X-Signature**: JWT Token (generated dynamically)

### Secret Key
```
jNlMdUdxtqflm5LqX1aMZAR7sHQgyqOnu2tpDp84eOm40nDCqzFqJvaD7JJX1j55
```

## Implementasi JWT Signature

### Algoritma: HMAC SHA256

JWT Token terdiri dari 3 bagian yang dipisahkan dengan titik (`.`):
```
header.payload.signature
```

### 1. Header
```json
{
  "alg": "HS256",
  "typ": "JWT"
}
```

### 2. Payload
```json
{
  "idpensiun": "08000511000"
}
```

### 3. Signature
```
HMACSHA256(
  base64UrlEncode(header) + "." + base64UrlEncode(payload),
  secret
)
```

## File yang Dibuat/Dimodifikasi

### 1. `/src/shared/utils/jwtHelper.ts` (BARU)
Helper class untuk generate JWT token dengan HMAC SHA256.

**Fungsi Utama:**
- `generateToken(payload)`: Generate JWT token lengkap
- `getPartnerId()`: Return Partner ID untuk header
- `base64UrlEncode()`: Encode string ke Base64URL format
- `hmacSha256()`: Generate HMAC SHA256 signature

### 2. `/src/modules/pengecekan/data/PengecekanRepositoryImpl.ts` (DIUPDATE)
Repository implementation yang memanggil API eksternal.

**Perubahan:**
- Mengganti internal API call dengan external API
- Menambahkan JWT signature generation
- Menambahkan custom headers (X-Partner-Id, X-Signature)
- Mapping response API ke entity Pensiunan

## Flow Pengecekan Data

```
User Input NOPEN
    ↓
Generate JWT Token
    ↓
Call External API dengan Headers:
  - Content-Type: application/json
  - X-Partner-Id: M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL
  - X-Signature: <JWT_TOKEN>
    ↓
Receive Response
    ↓
Map to Pensiunan Entity
    ↓
Display to User
```

## Request Example

```typescript
POST https://pospay-callback.posindonesia.co.id/proxy2-api/dev/pensiun/pos/request/dapempensiun

Headers:
{
  "Content-Type": "application/json",
  "X-Partner-Id": "M0ABAYOWOCGBHWCCL4QXEOCKK1ED3MZL",
  "X-Signature": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZHBlbnNpdW4iOiIwODAwMDUxMTAwMCJ9.hod6R9iXY_Wd_fk1gkgu314RKPwiHo4CpLh_4y06kE"
}

Body:
{
  "idpensiun": "08000511000"
}
```

## Response Mapping

API response akan dimapping ke entity `Pensiunan`:

| Field Entity | Possible API Fields |
|--------------|---------------------|
| nopen | nopen |
| nama_lengkap | nama_lengkap, nama |
| tanggal_lahir | tanggal_lahir, tgl_lahir |
| jenis_kelamin | jenis_kelamin, gender |
| jenis_pensiun | jenis_pensiun, jenis_penerima |
| status_keaktifan | status_keaktifan, status |
| kantor_bayar | kantor_bayar, kantor |
| alamat | alamat |
| nama_bank | nama_bank, bank |
| no_rekening | no_rekening, rekening |
| gaji_pokok | gaji_pokok, gaji_kotor |
| tunjangan | tunjangan |
| potongan | potongan |
| gaji_bersih | gaji_bersih, gaji_netto |
| last_updated | last_updated (or current timestamp) |

## Dependencies

### Installed Packages
```bash
npm install crypto-js
npm install --save-dev @types/crypto-js
```

**crypto-js** digunakan untuk:
- HMAC SHA256 hashing
- Base64 encoding
- JWT signature generation

## Testing

Untuk menguji integrasi:

1. Buka halaman: `http://localhost:3001/pengecekan`
2. Masukkan NOPEN: `08000511000` (contoh dari dokumentasi)
3. Klik "Cek Data"
4. Sistem akan:
   - Generate JWT token
   - Call external API
   - Display hasil atau error message

## Error Handling

Jika API call gagal:
- Error akan di-catch dan di-log ke console
- User akan melihat pesan error yang user-friendly
- Status "Tidak Ditemukan" akan ditampilkan

## Security Notes

⚠️ **PENTING:**
- Secret key saat ini hardcoded di frontend (untuk development)
- Untuk production, pertimbangkan untuk:
  - Pindahkan signature generation ke backend
  - Simpan secret key di environment variables backend
  - Frontend hanya call backend proxy endpoint

## Troubleshooting

### CORS Error
Jika terjadi CORS error, API server perlu mengizinkan origin dari aplikasi Anda.

### Invalid Signature
Pastikan:
- Payload format sesuai (field `idpensiun`)
- Secret key benar
- Base64URL encoding benar (tidak ada padding `=`)

### Data Tidak Ditemukan
- Pastikan NOPEN valid dan terdaftar di sistem
- Cek response API di Network tab browser
- Periksa mapping field di console log
