# 🔍 DEBUG: Kenapa is_pos Tidak Tersimpan?

## 📊 Status Database Saat Ini

Semua data memiliki `is_pos = false`:

```
                  id                  | min_bulan | max_bulan | is_pos |         created_at         
--------------------------------------+-----------+-----------+--------+----------------------------
 68a7475f-143f-4a97-aa79-7e01be8664c9 |         6 |        84 | f      | 2026-02-10 06:43:04.015815
 a5ce580d-cd68-4cb4-a8d5-e102e8186bfd |         1 |         2 | f      | 2026-01-26 15:41:32.783467
```

**Masalah**: Meskipun checkbox "Untuk POS" dicentang, data tetap tersimpan sebagai `false`.

---

## 🔍 Langkah Debug

### **1. Restart Backend dengan Logging**

Saya sudah menambahkan debug logging di backend. Silakan:

1. **Stop backend** (Ctrl+C di terminal backend)
2. **Restart backend**:
   ```bash
   cd /Users/yayansuganda/Projects/pengajuan/pengajuan_backend
   go run cmd/api/main.go
   ```

### **2. Test Create Data Baru**

1. Buka: http://localhost:3001/data-master/potongan-jangka-waktu
2. Klik **"Tambah Data"**
3. Isi form:
   ```
   Min Bulan: 1
   Max Bulan: 5
   Potongan (%): 10.5
   ☑ Untuk POS  ← CENTANG!
   ☑ Status Aktif
   ```
4. Klik **"Simpan"**

### **3. Lihat Log Backend**

Di terminal backend, Anda akan melihat:

```
=== CREATE DEBUG ===
MinBulan: 1
MaxBulan: 5
PotonganPersen: 10.5
IsPOS: true  ← HARUS TRUE!
IsActive: true
===================
```

**Jika `IsPOS: false`** → Frontend tidak mengirim data dengan benar  
**Jika `IsPOS: true`** → Backend menerima tapi tidak menyimpan

---

## 🔧 Kemungkinan Masalah

### **Masalah 1: Frontend Tidak Mengirim `is_pos`**

**Cek Browser Console:**
1. Tekan **F12**
2. Tab **Network**
3. Submit form
4. Klik request **POST /potongan-jangka-waktu**
5. Tab **Payload** atau **Request**
6. Lihat apakah ada `"is_pos": true`

**Expected Payload:**
```json
{
  "min_bulan": 1,
  "max_bulan": 5,
  "potongan_persen": 10.5,
  "is_pos": true,  ← HARUS ADA!
  "description": "",
  "is_active": true
}
```

### **Masalah 2: GORM Tidak Menyimpan Field Boolean**

Jika backend log menunjukkan `IsPOS: true` tapi database tetap `false`, maka masalahnya di GORM.

**Solusi**: Update repository untuk explicitly set field:

```go
func (r *potonganJangkaWaktuRepository) Create(potongan *domain.PotonganJangkaWaktu) error {
    return DB.Create(potongan).Error
}
```

Atau gunakan `Select` untuk force update:

```go
func (r *potonganJangkaWaktuRepository) Update(potongan *domain.PotonganJangkaWaktu) error {
    return DB.Model(potongan).Select("*").Updates(potongan).Error
}
```

---

## 📝 Checklist Debug

Silakan lakukan langkah-langkah berikut dan beri tahu hasilnya:

- [ ] **Backend restarted** dengan logging
- [ ] **Create data baru** dengan checkbox "Untuk POS" dicentang
- [ ] **Lihat log backend** - Apakah `IsPOS: true`?
- [ ] **Cek browser Network tab** - Apakah payload ada `"is_pos": true`?
- [ ] **Cek database** - Apakah data tersimpan dengan `is_pos = t`?

---

## 🎯 Tolong Laporkan

Setelah test, tolong beri tahu:

1. **Apa yang muncul di log backend?**
   ```
   IsPOS: ??? (true atau false?)
   ```

2. **Apa yang ada di Network tab browser?**
   ```json
   {
     "is_pos": ??? (true atau false atau tidak ada?)
   }
   ```

3. **Apa yang ada di database?**
   ```sql
   SELECT is_pos FROM potongan_jangka_waktu 
   WHERE created_at > '2026-02-10 06:45:00' 
   ORDER BY created_at DESC LIMIT 1;
   ```

Dengan informasi ini, saya bisa tahu di mana masalahnya dan fix dengan tepat! 🔍

---

**Next**: Restart backend → Test create → Report hasil log
