# Frontend Environment Setup

File environment telah dibuat untuk memudahkan development.

## File yang Dibuat

1. **`.env.local`** - Environment untuk development lokal (tidak di-commit ke git)
2. **`.env.example`** - Template environment (di-commit ke git)
3. **`ENV.md`** - Dokumentasi lengkap environment variables

## Environment Variables

```bash
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8081

# Application Configuration
NEXT_PUBLIC_APP_NAME=MM Pengajuan
NEXT_PUBLIC_APP_VERSION=1.0.0

# Environment
NODE_ENV=development
```

## Cara Penggunaan

### Development
File `.env.local` sudah dibuat dan siap digunakan. Restart development server untuk apply changes:

```bash
# Stop current server (Ctrl+C)
npm run dev
```

### Production
Untuk production, buat file `.env.production`:

```bash
cp .env.example .env.production
```

Lalu update `NEXT_PUBLIC_API_URL` dengan URL production API Anda.

## Catatan Penting

- ✅ `.env.local` - Sudah dibuat, siap digunakan
- ✅ `.env.example` - Template untuk tim development
- ⚠️ Jangan commit `.env.local` atau `.env.production` ke git
- 📝 Update `.env.example` jika menambah variable baru

## Restart Server

Setelah membuat/mengubah file `.env.local`, **restart development server** agar perubahan diterapkan.
