# Pengajuan Frontend - Railway Deployment Ready ✅

Next.js frontend application for MM Pengajuan loan management system.

## 🚀 Quick Start

### Local Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Open http://localhost:3000
```

### Environment Variables

Create `.env.local` for local development:

```bash
NEXT_PUBLIC_API_URL=http://localhost:8081
NODE_ENV=development
```

## 🚂 Railway Deployment

### Prerequisites

1. Backend sudah deployed di Railway
2. Catat URL backend Railway

### Deployment Steps

#### 1. Set Environment Variables di Railway

Buka Railway Dashboard → Service `pengajuan_frontend` → Tab **Variables**

Tambahkan:
```
NEXT_PUBLIC_API_URL=https://your-backend.railway.app
```

**⚠️ PENTING**: Ganti `your-backend.railway.app` dengan URL backend Railway Anda!

#### 2. Deploy

- Push code ke repository
- Railway akan auto-deploy
- Atau manual: **Deploy** → **Redeploy**

#### 3. Verifikasi

Buka app → Developer Console (F12) → Cek logs:
```
🔧 Creating HTTP Client
🔧 API URL: https://your-backend.railway.app  ← Harus backend URL
🔧 Environment: production
```

### Pre-Deploy Check

Jalankan script helper untuk verify build:

```bash
./railway-check.sh
```

## 📚 Documentation

- **[DEPLOYMENT_CHECKLIST.md](./DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment checklist
- **[RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)** - Detailed deployment guide
- **[FIX_SUMMARY.md](./FIX_SUMMARY.md)** - Fix summary untuk Railway errors
- **[RAILWAY_QUICK_REFERENCE.txt](./RAILWAY_QUICK_REFERENCE.txt)** - Quick reference card

## 🔧 Build Commands

```bash
# Development
npm run dev

# Production build
npm run build

# Start production server
npm start

# Lint
npm run lint
```

## 🏗️ Tech Stack

- **Framework**: Next.js 16.1.0 (App Router)
- **React**: 19.2.0
- **Styling**: Tailwind CSS 4
- **HTTP Client**: Axios
- **UI Icons**: Lucide React
- **Notifications**: React Hot Toast

## 📁 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── (authenticated)/   # Protected routes
│   │   ├── dashboard/
│   │   ├── data-master/
│   │   ├── pengajuan/
│   │   ├── unit/
│   │   └── users/
│   └── login/             # Public routes
├── modules/               # Feature modules
│   ├── auth/
│   ├── dashboard/
│   ├── jenis-pelayanan/
│   ├── jenis-pembiayaan/
│   ├── pengajuan/
│   ├── unit/
│   └── user/
└── shared/                # Shared utilities
    └── utils/
        └── httpClient.ts
```

## 🔐 Authentication

- JWT-based authentication
- Token stored in localStorage
- Auto-redirect to login on 401
- Role-based access control (super-admin, manager, petugas)

## 🎨 Features

- ✅ User authentication & authorization
- ✅ Dashboard with statistics
- ✅ Master data management (Unit, Jenis Pelayanan, Jenis Pembiayaan)
- ✅ User management (super-admin only)
- ✅ Loan application (Pengajuan) management
- ✅ PDF generation for loan documents
- ✅ Responsive design
- ✅ Toast notifications

## 🐛 Troubleshooting

### Build Error: "Cannot read properties of null (reading 'useContext')"

✅ **FIXED**: All authenticated pages now use `export const dynamic = 'force-dynamic'`

### API calls to localhost in production

✅ **FIXED**: Set `NEXT_PUBLIC_API_URL` in Railway environment variables

### CORS Error

Update backend CORS to allow frontend Railway URL:
```go
// In backend main.go
AllowOrigins: []string{
    "http://localhost:3000",
    "https://your-frontend.railway.app",  // Add this
}
```

## 📝 Notes

- All authenticated pages use dynamic rendering to prevent SSR issues
- API URL is configurable via environment variables
- Build tested and working ✅
- Ready for Railway deployment ✅

## 🆘 Support

Jika ada masalah saat deployment:

1. Cek Railway logs
2. Verify environment variables
3. Test backend API endpoint
4. Lihat troubleshooting di `DEPLOYMENT_CHECKLIST.md`

---

**Version**: 0.1.0  
**Last Updated**: 2025-12-20  
**Status**: Production Ready ✅
