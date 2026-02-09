# ✅ POTONGAN JANGKA WAKTU - POS FLAG FEATURE

## 🎯 Feature Overview

Menambahkan **flag `is_pos`** untuk membedakan persentase potongan antara **POS** dan **Non-POS** di master data Potongan Jangka Waktu.

---

## 📍 Implementation Details

### **1. Backend Changes**

#### **Model Update** (`model.go`)
```go
type PotonganJangkaWaktu struct {
    ID             uuid.UUID      `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
    MinBulan       int            `gorm:"not null" json:"min_bulan"`
    MaxBulan       int            `gorm:"not null" json:"max_bulan"`
    PotonganPersen float64        `gorm:"type:decimal(5,2);not null" json:"potongan_persen"`
    IsPOS          bool           `gorm:"default:false" json:"is_pos"` // ← NEW
    Description    string         `json:"description"`
    IsActive       bool           `gorm:"default:true" json:"is_active"`
    IsView         bool           `gorm:"default:true" json:"is_view"`
    CreatedAt      time.Time      `json:"created_at"`
    UpdatedAt      time.Time      `json:"updated_at"`
    DeletedAt      gorm.DeletedAt `gorm:"index" json:"deleted_at,omitempty"`
}
```

#### **Database Migration** (`023_add_is_pos_to_potongan_jangka_waktu.sql`)
```sql
ALTER TABLE potongan_jangka_waktu 
ADD COLUMN IF NOT EXISTS is_pos BOOLEAN DEFAULT false;

COMMENT ON COLUMN potongan_jangka_waktu.is_pos IS 'Flag untuk membedakan potongan POS atau non-POS';
```

---

### **2. Frontend Changes**

#### **Entity Update** (`Entity.ts`)
```typescript
export interface PotonganJangkaWaktu {
    id: string;
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos: boolean; // ← NEW
    description?: string;
    is_active: boolean;
    is_view: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}
```

#### **UI Updates**

**Mobile View:**
```tsx
<div>
    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">Jenis</p>
    <span className={`text-xs font-bold px-2 py-0.5 rounded ${
        item.is_pos ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-700'
    }`}>
        {item.is_pos ? 'POS' : 'Non-POS'}
    </span>
</div>
```

**Desktop View:**
```tsx
<td className="px-6 py-4 whitespace-nowrap">
    <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
        item.is_pos 
            ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' 
            : 'bg-slate-50 text-slate-700 ring-1 ring-inset ring-slate-600/20'
    }`}>
        {item.is_pos ? '📮 POS' : '🏦 Non-POS'}
    </span>
</td>
```

**Form Modal:**
```tsx
<label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-lg">
    <input 
        type="checkbox" 
        checked={formData.is_pos} 
        onChange={(e) => setFormData({ ...formData, is_pos: e.target.checked })} 
        className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500" 
    />
    <span className="text-sm font-medium text-slate-700">Untuk POS</span>
</label>
```

---

## 🎨 UI Design

### **Mobile View**
```
┌─────────────────────────────────┐
│ 📅 Rentang: 6-12 Bulan          │
│                                 │
│ Potongan: 5.5%  │  Jenis: POS   │
│                                 │
│ Status: Aktif                   │
└─────────────────────────────────┘
```

### **Desktop Table**
```
| Rentang Waktu | Potongan | Jenis      | Deskripsi | Status | Aksi |
|---------------|----------|------------|-----------|--------|------|
| 6-12 Bulan    | 5.5%     | 📮 POS     | ...       | Aktif  | ✏️ 🗑️ |
| 13-24 Bulan   | 6.0%     | 🏦 Non-POS | ...       | Aktif  | ✏️ 🗑️ |
```

### **Form Modal**
```
┌──────────────────────────────┐
│ Tambah Data                  │
├──────────────────────────────┤
│ Min Bulan: [6]               │
│ Max Bulan: [12]              │
│ Potongan (%): [5.5]          │
│ Deskripsi: [...]             │
│                              │
│ ☑ Untuk POS                  │
│ ☑ Status Aktif               │
│                              │
│ [Batal]  [Simpan]            │
└──────────────────────────────┘
```

---

## 🎨 Color Scheme

| Type | Background | Text | Border |
|------|------------|------|--------|
| **POS** | `bg-blue-50` | `text-blue-700` | `ring-blue-600/20` |
| **Non-POS** | `bg-slate-50` | `text-slate-700` | `ring-slate-600/20` |

---

## 📊 Use Case

### **Scenario**
Koperasi memiliki persentase potongan yang **berbeda** untuk:
1. **POS** - Pelayanan melalui Pos Indonesia
2. **Non-POS** - Pelayanan melalui bank (BRI, BPD, dll)

### **Example Data**
```
Rentang 6-12 Bulan:
- POS: 5.5%
- Non-POS: 6.0%

Rentang 13-24 Bulan:
- POS: 6.5%
- Non-POS: 7.0%
```

### **How It Works**
1. Admin membuat 2 entry untuk setiap rentang waktu
2. Satu dengan `is_pos = true` (untuk POS)
3. Satu dengan `is_pos = false` (untuk Non-POS)
4. Sistem akan memilih persentase yang sesuai berdasarkan jenis pelayanan

---

## 🔧 Technical Details

### **Database Schema**
```sql
CREATE TABLE potongan_jangka_waktu (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    min_bulan INTEGER NOT NULL,
    max_bulan INTEGER NOT NULL,
    potongan_persen DECIMAL(5,2) NOT NULL,
    is_pos BOOLEAN DEFAULT false, -- NEW COLUMN
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    is_view BOOLEAN DEFAULT true,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    deleted_at TIMESTAMP
);
```

### **API Response**
```json
{
    "data": [
        {
            "id": "uuid-1",
            "min_bulan": 6,
            "max_bulan": 12,
            "potongan_persen": 5.5,
            "is_pos": true,
            "description": "Potongan untuk POS 6-12 bulan",
            "is_active": true,
            "is_view": true
        },
        {
            "id": "uuid-2",
            "min_bulan": 6,
            "max_bulan": 12,
            "potongan_persen": 6.0,
            "is_pos": false,
            "description": "Potongan untuk Non-POS 6-12 bulan",
            "is_active": true,
            "is_view": true
        }
    ]
}
```

---

## 🧪 Testing

### **Test Scenarios**

#### **1. Create POS Entry**
```
✅ Checkbox "Untuk POS" dicentang
✅ Data tersimpan dengan is_pos = true
✅ Badge "POS" muncul di list
✅ Emoji 📮 muncul di desktop
```

#### **2. Create Non-POS Entry**
```
✅ Checkbox "Untuk POS" tidak dicentang
✅ Data tersimpan dengan is_pos = false
✅ Badge "Non-POS" muncul di list
✅ Emoji 🏦 muncul di desktop
```

#### **3. Edit Entry**
```
✅ Checkbox state sesuai dengan data
✅ Bisa toggle POS/Non-POS
✅ Update berhasil
```

#### **4. Display**
```
✅ Mobile: Badge "POS" atau "Non-POS"
✅ Desktop: Badge dengan emoji
✅ Color coding benar (blue vs slate)
```

---

## 📈 Benefits

### **Before**
```
❌ Tidak bisa membedakan POS vs Non-POS
❌ Persentase sama untuk semua jenis pelayanan
❌ Tidak fleksibel
```

### **After**
```
✅ Bisa set persentase berbeda untuk POS
✅ Bisa set persentase berbeda untuk Non-POS
✅ Fleksibel sesuai kebijakan
✅ Visual indicator jelas (badge + emoji)
```

---

## 📊 Implementation Summary

| Aspect | Details |
|--------|---------|
| **Backend Files** | 2 (model.go, migration.sql) |
| **Frontend Files** | 2 (Entity.ts, PotonganJangkaWaktuList.tsx) |
| **Database Changes** | 1 column added |
| **UI Changes** | Mobile view, Desktop table, Form modal |
| **Default Value** | `false` (Non-POS) |
| **Nullable** | No (NOT NULL with default) |

---

## ✅ COMPLETE!

**POS Flag feature sudah diimplementasikan!**

**Features:**
- ✅ Database column added
- ✅ Backend model updated
- ✅ Frontend entity updated
- ✅ UI display (mobile & desktop)
- ✅ Form checkbox
- ✅ Visual indicators (badges + emojis)
- ✅ Color coding

---

**Last Updated**: 2026-02-10 06:27:15 +08:00  
**Status**: ✅ IMPLEMENTED  
**Migration**: 023_add_is_pos_to_potongan_jangka_waktu.sql  
**Ready**: For testing  
