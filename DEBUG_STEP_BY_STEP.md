# 🔍 DEBUGGING is_pos - STEP BY STEP

## ✅ Yang Sudah Saya Lakukan

1. ✅ Added `console.log` di **frontend** (PotonganJangkaWaktuList.tsx)
2. ✅ Added `println` di **backend** (potongan_jangka_waktu_handler.go)
3. ✅ Backend sudah restart otomatis

---

## 📝 LANGKAH TEST (Ikuti Dengan Teliti!)

### **Step 1: Buka Browser Console**

1. Buka: http://localhost:3001/data-master/potongan-jangka-waktu
2. Tekan **F12** (atau klik kanan → Inspect)
3. Pilih tab **Console**
4. **JANGAN TUTUP** console ini

---

### **Step 2: Buka Terminal Backend**

1. Buka terminal yang menjalankan backend
2. Pastikan terlihat: `Listening and serving HTTP on :8081`
3. **JANGAN TUTUP** terminal ini

---

### **Step 3: Create Data Baru**

1. Di halaman potongan-jangka-waktu, klik **"Tambah Data"**
2. Isi form:
   ```
   Min Bulan: 99
   Max Bulan: 100
   Potongan (%): 25.5
   Deskripsi: TEST DEBUG POS
   ```
3. **CENTANG** checkbox **"Untuk POS"** ✅
4. **CENTANG** checkbox **"Status Aktif"** ✅
5. Klik **"Simpan"**

---

### **Step 4: Lihat Log Frontend (Browser Console)**

Anda akan melihat:

```
=== FRONTEND DEBUG ===
FormData: {
  min_bulan: 99,
  max_bulan: 100,
  potongan_persen: 25.5,
  is_pos: ???,  ← LIHAT INI!
  description: "TEST DEBUG POS",
  is_active: true
}
is_pos value: ???  ← LIHAT INI!
=====================
```

**CATAT**: Apakah `is_pos: true` atau `is_pos: false`?

---

### **Step 5: Lihat Log Backend (Terminal)**

Di terminal backend, Anda akan melihat:

```
=== CREATE DEBUG ===
MinBulan: 99
MaxBulan: 100
PotonganPersen: 25.5
IsPOS: ???  ← LIHAT INI!
IsActive: true
===================
```

**CATAT**: Apakah `IsPOS: true` atau `IsPOS: false`?

---

### **Step 6: Cek Database**

Jalankan query:

```sql
SELECT min_bulan, max_bulan, potongan_persen, is_pos, description 
FROM potongan_jangka_waktu 
WHERE description = 'TEST DEBUG POS';
```

**CATAT**: Apakah `is_pos = t` atau `is_pos = f`?

---

## 📊 Analisis Hasil

### **Scenario A: Frontend TRUE, Backend TRUE, Database FALSE**
```
Frontend: is_pos: true  ✅
Backend:  IsPOS: true   ✅
Database: is_pos = f    ❌
```

**Masalah**: GORM tidak menyimpan field boolean dengan benar  
**Solusi**: Update repository method

---

### **Scenario B: Frontend TRUE, Backend FALSE, Database FALSE**
```
Frontend: is_pos: true  ✅
Backend:  IsPOS: false  ❌
Database: is_pos = f    ❌
```

**Masalah**: Data tidak dikirim dengan benar dari frontend ke backend  
**Solusi**: Cek HTTP request payload

---

### **Scenario C: Frontend FALSE, Backend FALSE, Database FALSE**
```
Frontend: is_pos: false ❌
Backend:  IsPOS: false  ❌
Database: is_pos = f    ❌
```

**Masalah**: Checkbox tidak mengupdate state formData  
**Solusi**: Fix checkbox onChange handler

---

## 🎯 Tolong Laporkan Hasil

Setelah test, tolong screenshot atau copy-paste:

1. **Browser Console** (log frontend)
2. **Terminal Backend** (log backend)  
3. **Database Query Result**

Dengan 3 informasi ini, saya bisa tahu PERSIS di mana masalahnya! 🔍

---

## 🚀 Quick Test Command

Untuk cek database cepat:

```bash
psql -U postgres -d koperasi_db -c "SELECT min_bulan, max_bulan, is_pos, description FROM potongan_jangka_waktu WHERE description = 'TEST DEBUG POS';"
```

---

**SILAKAN TEST SEKARANG DAN LAPORKAN HASILNYA!** 🎯
