# ✅ MAKS JANGKA WAKTU CONVERTED TO MONTHS

## 🎯 Requirement

Input "Maks Jangka Waktu (Bln)" di form pengajuan baru (`/pengajuan/create`) harus menampilkan data dalam **BULAN**, bukan TAHUN.

---

## 🔧 Changes Made

### **File**: `CreatePengajuanWizard.tsx`

#### **1. Update Calculation (useEffect lines 392-398)**

**Before (Years):**
```typescript
if (maksJangkaWaktu > 0) {
    // Convert back to years for display
    const years = Math.floor(maksJangkaWaktu / 12);
    setFormData(prev => ({ ...prev, maksimal_jangka_waktu_usia: years.toString() }));
}
```

**After (Months):**
```typescript
if (maksJangkaWaktu > 0) {
    // Use months directly
    setFormData(prev => ({ ...prev, maksimal_jangka_waktu_usia: maksJangkaWaktu.toString() }));
}
```

#### **2. Update Maks Pembiayaan Calculation (useEffect lines 407-409)**

**Before (Years * 12):**
```typescript
// Calculate: Gaji Tersedia * Maks Jangka Waktu (in years) * 12 months
const maksPembiayaan = gajiTersedia * maksJangkaWaktu * 12;
```

**After (Months):**
```typescript
// Calculate: Gaji Tersedia * Maks Jangka Waktu (in months)
const maksPembiayaan = gajiTersedia * maksJangkaWaktu;
```

---

## 📊 Example

**Settings:**
- Batas Usia Pelunasan: 75 tahun (900 bulan)
- Usia Nasabah: 30 tahun (360 bulan)

**Calculation:**
- Sisa Usia = 900 - 360 = **540 bulan**

**Display:**
- Before: `45` (Tahun)
- After: `540` (Bulan) ✅

**Maks Pembiayaan Calculation:**
- Gaji Tersedia: Rp 1.000.000
- Before: `1.000.000 * 45 * 12` = `540.000.000`
- After: `1.000.000 * 540` = `540.000.000` ✅ (Hasil sama, rumus disesuaikan)

---

## ✅ Status

- [x] Code updated
- [x] Logic verified
- [x] Display unit confirmed (months)

**SUDAH SELESAI DAN SIAP DIGUNAKAN!** 🚀
