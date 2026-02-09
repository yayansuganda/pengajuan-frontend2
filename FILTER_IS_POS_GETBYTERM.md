# ✅ FILTER is_pos = false ADDED TO GetByTerm

## 🎯 Requirement

Pada menu pengajuan baru (`/pengajuan/create`), jika jenis pelayanan **BUKAN POS**, maka perhitungan persentase potongan harus mengambil data dari `potongan_jangka_waktu` dengan filter `is_pos = false`.

---

## 🔧 Changes Made

### **File**: `potongan_jangka_waktu_repository.go`

#### **Before:**
```go
func (r *potonganJangkaWaktuRepository) GetByTerm(bulan int) (*domain.PotonganJangkaWaktu, error) {
    var potongan domain.PotonganJangkaWaktu
    err := DB.Where("min_bulan <= ? AND max_bulan >= ? AND is_active = true", bulan, bulan).
        First(&potongan).Error
    return &potongan, err
}
```

#### **After:**
```go
func (r *potonganJangkaWaktuRepository) GetByTerm(bulan int) (*domain.PotonganJangkaWaktu, error) {
    var potongan domain.PotonganJangkaWaktu
    err := DB.Where("min_bulan <= ? AND max_bulan >= ? AND is_active = true AND is_pos = false", bulan, bulan).
        First(&potongan).Error
    return &potongan, err
}
```

**Change**: Added `AND is_pos = false` to WHERE clause

---

## ✅ Verification (Database Query Test)

### **Test 1: Bulan = 12**
```sql
SELECT id, min_bulan, max_bulan, potongan_persen, is_pos, description
FROM potongan_jangka_waktu
WHERE min_bulan <= 12 
  AND max_bulan >= 12 
  AND is_active = true 
  AND is_pos = false
LIMIT 1;
```

**Result:**
```
                  id                  | min_bulan | max_bulan | potongan_persen | is_pos |              description               
--------------------------------------+-----------+-----------+-----------------+--------+----------------------------------------
 0a172407-0866-4aeb-a678-1d4aef00697d |         6 |        12 |           17.00 | f      | Potongan untuk jangka waktu 6-12 bulan
```

✅ **PASS** - Returns Non-POS data (is_pos = f)

---

### **Test 2: Bulan = 24**
```sql
SELECT id, min_bulan, max_bulan, potongan_persen, is_pos
FROM potongan_jangka_waktu
WHERE min_bulan <= 24 
  AND max_bulan >= 24 
  AND is_active = true 
  AND is_pos = false
LIMIT 1;
```

**Result:**
```
                  id                  | min_bulan | max_bulan | potongan_persen | is_pos
--------------------------------------+-----------+-----------+-----------------+--------
 68a7475f-143f-4a97-aa79-7e01be8664c9 |         6 |        84 |           21.00 | f
```

✅ **PASS** - Returns Non-POS data (is_pos = f)

---

### **Test 3: Bulan = 50 (Ada data POS di rentang ini)**

**Data yang tersedia:**
```
                  id                  | min_bulan | max_bulan | potongan_persen | is_pos |  jenis  
--------------------------------------+-----------+-----------+-----------------+--------+---------
 1fdef009-91d1-44d9-9a63-82bd7d9d4b5b |         6 |        86 |           21.00 | t      | POS      ← Ada data POS!
 68a7475f-143f-4a97-aa79-7e01be8664c9 |         6 |        84 |           21.00 | f      | Non-POS
```

**Query dengan filter is_pos = false:**
```sql
SELECT id, min_bulan, max_bulan, potongan_persen, is_pos,
       CASE WHEN is_pos THEN '❌ SALAH - POS' ELSE '✅ BENAR - Non-POS' END as result
FROM potongan_jangka_waktu
WHERE min_bulan <= 50 
  AND max_bulan >= 50 
  AND is_active = true 
  AND is_pos = false
LIMIT 1;
```

**Result:**
```
                  id                  | min_bulan | max_bulan | potongan_persen | is_pos |      result       
--------------------------------------+-----------+-----------+-----------------+--------+-------------------
 68a7475f-143f-4a97-aa79-7e01be8664c9 |         6 |        84 |           21.00 | f      | ✅ BENAR - Non-POS
```

✅ **PASS** - Correctly filters out POS data and returns only Non-POS

---

## 📊 Impact

### **Before Fix:**
```
User creates pengajuan dengan jangka waktu 12 bulan
    ↓
Backend: GetByTerm(12)
    ↓
Query: WHERE min_bulan <= 12 AND max_bulan >= 12 AND is_active = true
    ↓
Result: Bisa return data POS ATAU Non-POS (tidak konsisten!)
    ↓
❌ Perhitungan potongan bisa salah!
```

### **After Fix:**
```
User creates pengajuan dengan jangka waktu 12 bulan (Non-POS)
    ↓
Backend: GetByTerm(12)
    ↓
Query: WHERE min_bulan <= 12 AND max_bulan >= 12 AND is_active = true AND is_pos = false
    ↓
Result: SELALU return data Non-POS
    ↓
✅ Perhitungan potongan BENAR!
```

---

## 🎯 Use Case

### **Scenario 1: Pengajuan Non-POS (BRI, BPD, dll)**
```
Jangka waktu: 12 bulan
Jenis pelayanan: BRI (Non-POS)
    ↓
GetByTerm(12) dengan filter is_pos = false
    ↓
Return: Potongan 17% (Non-POS rate)
```

### **Scenario 2: Pengajuan POS**
```
Jangka waktu: 12 bulan
Jenis pelayanan: POS
    ↓
GetByTerm(12) dengan filter is_pos = false
    ↓
Return: Potongan 17% (Non-POS rate)
```

**Note**: Untuk pengajuan POS, nanti perlu dibuat method terpisah `GetByTermPOS()` atau parameter tambahan jika ingin menggunakan rate POS.

---

## ✅ Summary

| Aspect | Status |
|--------|--------|
| **Filter Added** | ✅ `AND is_pos = false` |
| **Query Tested** | ✅ 3 test cases passed |
| **Returns POS data** | ❌ No (correctly filtered) |
| **Returns Non-POS data** | ✅ Yes |
| **Backend restart needed** | ✅ Yes (auto-restart) |

---

## 🚀 Ready for Testing

Backend sudah restart otomatis. Filter `is_pos = false` sudah ditambahkan dan **VERIFIED** dengan database query.

Sekarang saat create pengajuan baru dengan jenis pelayanan Non-POS, sistem akan **HANYA** mengambil persentase potongan dari data dengan `is_pos = false`.

---

**Last Updated**: 2026-02-10 07:09:31 +08:00  
**Change**: Added `AND is_pos = false` filter to GetByTerm query  
**Verified**: ✅ Database query tests passed  
**Status**: ✅ READY FOR USE  
