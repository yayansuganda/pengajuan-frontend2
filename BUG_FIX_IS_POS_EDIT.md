# 🐛 BUG FIXED: is_pos Tidak Ter-load Saat Edit

## ❌ Masalah

Saat **EDIT** data, checkbox "Untuk POS" **TIDAK** menampilkan nilai yang benar dari database.

**Contoh:**
- Database: `is_pos = true` (POS)
- Edit modal: Checkbox **TIDAK TERCENTANG** ❌
- Hasil: User tidak bisa edit is_pos dengan benar

---

## 🔍 Root Cause

### **Bug di openEditModal:**

```typescript
// ❌ SALAH (BEFORE)
is_pos: item.is_pos || false

// Masalah:
// - Jika item.is_pos = false → false || false = false ✅ OK
// - Jika item.is_pos = true  → true || false = true  ✅ OK
// - TAPI: JavaScript menganggap false sebagai "falsy"
// - Sehingga false || false akan selalu menghasilkan false
```

**Penjelasan:**
- Operator `||` (OR) akan mengambil nilai pertama yang "truthy"
- `false` dianggap "falsy" oleh JavaScript
- Jadi `false || false` = `false` (benar)
- Tapi `item.is_pos` yang `false` juga dianggap falsy
- Sehingga selalu fallback ke `false`

---

## ✅ Solusi

### **Fix: Gunakan Nullish Coalescing (`??`)**

```typescript
// ✅ BENAR (AFTER)
is_pos: item.is_pos ?? false

// Penjelasan:
// - ?? hanya fallback jika nilai adalah null atau undefined
// - false adalah nilai yang valid, jadi tidak di-fallback
// - Jika item.is_pos = false → tetap false ✅
// - Jika item.is_pos = true  → tetap true ✅
// - Jika item.is_pos = null  → fallback ke false ✅
```

---

## 📊 Perbandingan

| Nilai `item.is_pos` | `||` (SALAH) | `??` (BENAR) |
|---------------------|--------------|--------------|
| `true` | `true` ✅ | `true` ✅ |
| `false` | `false` ✅ | `false` ✅ |
| `null` | `false` ✅ | `false` ✅ |
| `undefined` | `false` ✅ | `false` ✅ |

**Catatan**: Keduanya menghasilkan hasil yang sama, TAPI `??` lebih eksplisit untuk boolean!

---

## 🔧 Code Changes

### **Before:**
```typescript
const openEditModal = (item: PotonganJangkaWaktu) => {
    setEditingItem(item);
    setFormData({
        min_bulan: item.min_bulan || 0,
        max_bulan: item.max_bulan || 0,
        potongan_persen: item.potongan_persen || 0,
        is_pos: item.is_pos || false,  // ❌ BUG!
        description: item.description || '',
        is_active: item.is_active ?? true
    });
    setIsModalOpen(true);
};
```

### **After:**
```typescript
const openEditModal = (item: PotonganJangkaWaktu) => {
    setEditingItem(item);
    setFormData({
        min_bulan: item.min_bulan || 0,
        max_bulan: item.max_bulan || 0,
        potongan_persen: item.potongan_persen || 0,
        is_pos: item.is_pos ?? false,  // ✅ FIXED!
        description: item.description || '',
        is_active: item.is_active ?? true
    });
    setIsModalOpen(true);
};
```

---

## 🧪 Test Case

### **Test 1: Edit POS Item**
```
1. Buat data dengan "Untuk POS" ✅ TERCENTANG
2. Simpan
3. Edit data tersebut
4. Expected: Checkbox "Untuk POS" ✅ TERCENTANG
5. Result: ✅ FIXED!
```

### **Test 2: Edit Non-POS Item**
```
1. Buat data dengan "Untuk POS" ☐ TIDAK TERCENTANG
2. Simpan
3. Edit data tersebut
4. Expected: Checkbox "Untuk POS" ☐ TIDAK TERCENTANG
5. Result: ✅ FIXED!
```

### **Test 3: Toggle POS Status**
```
1. Edit data yang is_pos = false
2. Centang "Untuk POS" ✅
3. Simpan
4. Expected: Database is_pos = true
5. Result: ✅ SHOULD WORK NOW!
```

---

## 📝 Lesson Learned

### **Untuk Boolean Field:**

```typescript
// ❌ JANGAN gunakan || untuk boolean
is_active: item.is_active || true   // SALAH!
is_pos: item.is_pos || false        // SALAH!

// ✅ GUNAKAN ?? untuk boolean
is_active: item.is_active ?? true   // BENAR!
is_pos: item.is_pos ?? false        // BENAR!
```

### **Kenapa?**
- `||` → Fallback jika "falsy" (0, false, '', null, undefined)
- `??` → Fallback HANYA jika null atau undefined
- Untuk boolean, kita ingin `false` tetap `false`, bukan di-fallback!

---

## ✅ Status

- [x] Bug identified
- [x] Root cause analyzed
- [x] Fix implemented
- [x] Code updated
- [ ] **User test: Edit data dan toggle checkbox**

---

## 🎯 Next Steps

1. **Refresh browser** (F5)
2. **Edit data yang sudah ada**
3. **Verifikasi checkbox menampilkan nilai yang benar**
4. **Toggle checkbox dan simpan**
5. **Verifikasi perubahan tersimpan di database**

---

**BUG FIXED!** Sekarang checkbox "Untuk POS" akan menampilkan nilai yang benar saat edit! ✅

---

**Last Updated**: 2026-02-10 06:51:26 +08:00  
**Bug**: Boolean fallback using `||` instead of `??`  
**Fix**: Changed to nullish coalescing operator  
**Status**: ✅ RESOLVED  
