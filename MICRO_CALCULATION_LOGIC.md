# ✅ MICRO CALCULATION LOGIC

## 🎯 Requirement

Jika "Kategori Pembiayaan" adalah **Micro**, maka inputan:
1. **Max Jangka Waktu**
2. **Maks Pembiayaan**

Harus diambil langsung dari **Settings** (Menu Pengaturan), BUKAN hasil perhitungan rumus standar.
Untuk kategori **Macro** atau lainnya, tetap menggunakan rumus perhitungan yang ada.

---

## 🔧 Implementation Logic

### **File**: `CreatePengajuanWizard.tsx`

#### **1. Maks Jangka Waktu Calculation**

```typescript
useEffect(() => {
    if (formData.usia && settings) {
        // [MICRO] Use value from Settings
        if (formData.kategori_pembiayaan === 'Micro' && settings.mikro_jangka_waktu > 0) {
            setFormData(prev => ({ 
                ...prev, 
                maksimal_jangka_waktu_usia: settings.mikro_jangka_waktu.toString() 
            }));
            return;
        }

        // [MACRO] Calculate based on Age Limit (Batas Usia - Usia Sekarang)
        if (settings.batas_usia_perhitungan_lunas) {
            // ... standard formula ...
        }
    }
}, [formData.usia, settings, formData.kategori_pembiayaan]);
```

#### **2. Maks Pembiayaan Calculation**

```typescript
useEffect(() => {
    // [MICRO] Use value from Settings
    if (formData.kategori_pembiayaan === 'Micro' && settings && settings.mikro_maksimal_pembiayaan > 0) {
        setFormData(prev => ({
            ...prev,
            maksimal_pembiayaan: Math.round(settings.mikro_maksimal_pembiayaan).toString()
        }));
        return;
    }

    // [MACRO] Calculate based on Salary (Gaji Tersedia * Jangka Waktu)
    const gajiTersedia = parseFloat(...) || 0;
    const maksJangkaWaktu = parseInt(...) || 0;
    
    if (gajiTersedia > 0 && maksJangkaWaktu > 0) {
        const maksPembiayaan = gajiTersedia * maksJangkaWaktu;
        // ... set form data ...
    }
}, [formData.gaji_tersedia, formData.maksimal_jangka_waktu_usia, formData.kategori_pembiayaan, settings]);
```

---

## 📊 Verification

1.  **Select "Micro"**:
    *   `Maks Jangka Waktu` -> Mengambil nilai dari Settings (misal: 121 bulan).
    *   `Maks Pembiayaan` -> Mengambil nilai dari Settings (misal: Rp 100.000.000).

2.  **Select "Macro"**:
    *   `Maks Jangka Waktu` -> Dihitung berdasarkan Umur.
    *   `Maks Pembiayaan` -> Dihitung `Gaji Tersedia * Jangka Waktu`.

**STATUS: COMPLETED** 🚀
