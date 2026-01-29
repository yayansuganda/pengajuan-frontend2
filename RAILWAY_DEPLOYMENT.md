# Railway Deployment Guide - Frontend

## Environment Variables yang Harus Diset di Railway

Untuk deploy `pengajuan_frontend` di Railway, Anda perlu mengatur environment variable berikut:

### Required Environment Variables:

```bash
NEXT_PUBLIC_API_URL=<URL_BACKEND_API_ANDA>
NODE_ENV=production
```

**Contoh:**
- Jika backend Anda di Railway: `NEXT_PUBLIC_API_URL=https://pengajuan-backend-production.up.railway.app`
- Jika backend Anda di server lain: `NEXT_PUBLIC_API_URL=https://api.yourdomain.com`

## Cara Set Environment Variables di Railway:

1. Buka project Railway Anda
2. Pilih service `pengajuan_frontend`
3. Klik tab **Variables**
4. Tambahkan variable berikut:
   - **Name**: `NEXT_PUBLIC_API_URL`
   - **Value**: URL backend API Anda (contoh: `https://pengajuan-backend-production.up.railway.app`)
5. Railway akan otomatis set `NODE_ENV=production`

## Build Configuration

Railway akan otomatis menjalankan:
```bash
npm install
npm run build
npm start
```

## Troubleshooting

### Error: "Cannot read properties of null (reading 'useContext')"
✅ **FIXED**: Sudah ditambahkan `export const dynamic = 'force-dynamic'` di semua halaman yang menggunakan `useAuth`

### Error: API URL masih localhost
- Pastikan `NEXT_PUBLIC_API_URL` sudah diset di Railway Variables
- Restart deployment setelah menambahkan environment variable

### Error: CORS
- Pastikan backend sudah mengizinkan origin dari frontend Railway URL
- Update CORS configuration di backend untuk include Railway frontend URL

## Verifikasi Deployment

Setelah deploy berhasil, cek:
1. Buka browser console di deployed app
2. Lihat log "🔧 Creating HTTP Client"
3. Pastikan "🔧 API URL" menunjuk ke backend yang benar (bukan localhost)

## Notes

- Semua halaman authenticated sudah dikonfigurasi dengan `dynamic = 'force-dynamic'` untuk menghindari prerendering issues
- API URL akan otomatis menggunakan `NEXT_PUBLIC_API_URL` dari environment variables
- Jika `NEXT_PUBLIC_API_URL` tidak diset, akan fallback ke `http://localhost:8081` (untuk development)
