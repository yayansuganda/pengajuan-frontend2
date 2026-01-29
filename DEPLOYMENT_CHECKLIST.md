# Railway Deployment Checklist

## Pre-Deployment ✓

- [x] Fix useContext error dengan `export const dynamic = 'force-dynamic'`
- [x] Update semua authenticated pages
- [x] Test build lokal berhasil (`npm run build`)
- [x] Buat `.env.production` template
- [x] Update `httpClient.ts` dengan logging
- [x] Buat dokumentasi deployment

## Deployment Steps

### Step 1: Persiapan Backend
- [ ] Pastikan backend sudah deployed di Railway
- [ ] Catat URL backend Railway (contoh: `https://pengajuan-backend-production.up.railway.app`)
- [ ] Test backend API endpoint (contoh: `https://your-backend.railway.app/health` atau `/api/v1/auth/login`)

### Step 2: Set Environment Variables di Railway Frontend
- [ ] Buka Railway Dashboard
- [ ] Pilih service `pengajuan_frontend`
- [ ] Klik tab **Variables**
- [ ] Tambahkan variable:
  - **Name**: `NEXT_PUBLIC_API_URL`
  - **Value**: `https://your-backend.railway.app` (ganti dengan URL backend Anda)
- [ ] Save/Add variable

### Step 3: Deploy
- [ ] Push code ke repository (jika belum)
- [ ] Railway akan auto-trigger deployment
- [ ] Atau manual redeploy: **Deploy** → **Redeploy**
- [ ] Tunggu hingga deployment selesai (biasanya 3-5 menit)

### Step 4: Verifikasi Deployment
- [ ] Buka URL frontend Railway di browser
- [ ] Buka Developer Console (F12)
- [ ] Cek console logs:
  ```
  🔧 Creating HTTP Client
  🔧 API URL: https://your-backend.railway.app  ← HARUS backend URL, bukan localhost
  🔧 Environment: production
  ```
- [ ] Test login ke aplikasi
- [ ] Test navigasi ke halaman-halaman:
  - [ ] Dashboard
  - [ ] Data Master → Jenis Pelayanan
  - [ ] Data Master → Jenis Pembiayaan
  - [ ] Unit
  - [ ] Users
  - [ ] Pengajuan

### Step 5: Update Backend CORS (Jika Perlu)
- [ ] Catat URL frontend Railway (contoh: `https://pengajuan-frontend-production.up.railway.app`)
- [ ] Update backend CORS configuration untuk allow frontend URL
- [ ] Redeploy backend jika perlu

## Post-Deployment Checks

### Functional Tests
- [ ] Login berhasil
- [ ] Dashboard menampilkan data
- [ ] CRUD operations berfungsi:
  - [ ] Create data baru
  - [ ] Read/View data
  - [ ] Update data
  - [ ] Delete data
- [ ] Navigation antar halaman lancar
- [ ] Logout berhasil

### Performance Checks
- [ ] Halaman load dengan cepat (< 3 detik)
- [ ] Tidak ada error di console
- [ ] API calls berhasil (cek Network tab)

### Security Checks
- [ ] HTTPS aktif (🔒 di address bar)
- [ ] Token authentication berfungsi
- [ ] Redirect ke login jika tidak authenticated

## Troubleshooting

### Jika Build Gagal
1. Cek Railway build logs
2. Pastikan semua dependencies ter-install
3. Cek syntax error di code

### Jika API Error
1. Cek `NEXT_PUBLIC_API_URL` sudah benar
2. Test backend URL secara langsung
3. Cek CORS configuration di backend
4. Cek Railway logs untuk detail error

### Jika useContext Error
1. Pastikan semua pages sudah ada `export const dynamic = 'force-dynamic'`
2. Rebuild aplikasi
3. Clear Railway cache dan redeploy

## Environment Variables Reference

```bash
# Frontend (Railway Variables)
NEXT_PUBLIC_API_URL=https://pengajuan-backend-production.up.railway.app

# Backend CORS (harus allow)
ALLOWED_ORIGINS=https://pengajuan-frontend-production.up.railway.app
```

## Useful Commands

```bash
# Local build test
npm run build

# Local production test
npm run build && npm start

# Check environment
echo $NEXT_PUBLIC_API_URL
```

## Support Documents

- `RAILWAY_DEPLOYMENT.md` - Panduan lengkap
- `FIX_SUMMARY.md` - Detail perbaikan
- `RAILWAY_QUICK_REFERENCE.txt` - Quick reference

---

**Last Updated**: 2025-12-20
**Status**: Ready for deployment ✅
