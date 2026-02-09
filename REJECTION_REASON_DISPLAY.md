# ✅ REJECTION REASON DISPLAY FEATURE

## 🎯 Feature Overview

Menampilkan **alasan penolakan** di halaman detail pengajuan ketika status pengajuan adalah **"Ditolak"**.

---

## 📍 Implementation Details

### **Display Conditions**
```typescript
{pengajuan.status === 'Ditolak' && pengajuan.reject_reason && (
    // Show rejection reason alert
)}
```

Alert box hanya muncul jika:
1. ✅ Status pengajuan = `'Ditolak'`
2. ✅ Field `reject_reason` tidak kosong

---

## 🎨 UI Design

### **Mobile View**
```tsx
<div className="bg-rose-50 border-l-4 border-rose-500 rounded-lg p-4">
    <div className="flex items-start gap-3">
        <XCircle className="w-5 h-5 text-rose-500 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
            <h3 className="text-sm font-bold text-rose-900 mb-1">
                Alasan Penolakan
            </h3>
            <p className="text-xs text-rose-800 leading-relaxed">
                {pengajuan.reject_reason}
            </p>
        </div>
    </div>
</div>
```

**Features:**
- ✅ Compact design for mobile
- ✅ Red color scheme (rose-50, rose-500, rose-800)
- ✅ Left border accent (4px)
- ✅ XCircle icon
- ✅ Smaller text (text-xs, text-sm)

### **Desktop View**
```tsx
<div className="bg-rose-50 border-l-4 border-rose-500 rounded-xl p-5 shadow-sm">
    <div className="flex items-start gap-4">
        <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-rose-100 rounded-full flex items-center justify-center">
                <XCircle className="w-6 h-6 text-rose-600" />
            </div>
        </div>
        <div className="flex-1">
            <h3 className="text-base font-bold text-rose-900 mb-2">
                Alasan Penolakan
            </h3>
            <p className="text-sm text-rose-800 leading-relaxed">
                {pengajuan.reject_reason}
            </p>
        </div>
    </div>
</div>
```

**Features:**
- ✅ Larger design for desktop
- ✅ Circular icon container (w-10 h-10)
- ✅ Shadow effect (shadow-sm)
- ✅ Larger text (text-sm, text-base)
- ✅ More padding (p-5)

---

## 📍 Placement

### **Mobile View**
```
Header Info (Nama, NIK, Status)
    ↓
[REJECTION REASON ALERT] ← NEW
    ↓
Main Card (Financial Summary, Tabs)
```

### **Desktop View**
```
Hero Header (Status, Nama, NIK)
    ↓
[REJECTION REASON ALERT] ← NEW
    ↓
Financial Summary Cards
    ↓
Tab Navigation (Detail, Dokumen)
```

---

## 🎨 Color Scheme

| Element | Color Class | Hex |
|---------|-------------|-----|
| Background | `bg-rose-50` | #FFF1F2 |
| Border | `border-rose-500` | #F43F5E |
| Icon | `text-rose-500/600` | #F43F5E / #E11D48 |
| Title | `text-rose-900` | #881337 |
| Text | `text-rose-800` | #9F1239 |
| Icon BG | `bg-rose-100` | #FFE4E6 |

---

## 📄 Data Source

### **Backend Field**
```go
// Backend model.go
RejectReason string `gorm:"type:text" json:"reject_reason,omitempty"`
```

### **Frontend Entity**
```typescript
// PengajuanEntity.ts
reject_reason?: string;
```

### **How It's Set**
Ketika manager menolak pengajuan:
```typescript
await pengajuanRepository.updateStatus(id, 'Ditolak', rejectReasonText);
```

---

## 🧪 Testing

### **Test Scenarios**

#### **1. Status Ditolak WITH Reason**
```
✅ Alert box muncul
✅ Menampilkan alasan penolakan
✅ Styling merah (rose)
✅ Icon XCircle muncul
```

#### **2. Status Ditolak WITHOUT Reason**
```
✅ Alert box TIDAK muncul
✅ Tidak ada error
```

#### **3. Status Lain (Pending, Disetujui, dll)**
```
✅ Alert box TIDAK muncul
✅ Tidak ada error
```

---

## 📱 Responsive Design

| Screen | Layout | Icon Size | Text Size |
|--------|--------|-----------|-----------|
| **Mobile** | Compact, flex-start | 5x5 (w-5 h-5) | xs/sm |
| **Desktop** | Spacious, circular icon | 6x6 in 10x10 container | sm/base |

---

## 🎯 User Experience

### **Before**
```
❌ User tidak tahu kenapa pengajuan ditolak
❌ Harus menghubungi admin untuk info
❌ Tidak ada feedback yang jelas
```

### **After**
```
✅ Alasan penolakan langsung terlihat
✅ Prominent red alert box
✅ Clear feedback untuk user
✅ Tidak perlu kontak admin
```

---

## 📊 Implementation Summary

| Aspect | Details |
|--------|---------|
| **Files Modified** | 1 file |
| **Lines Added** | ~45 lines |
| **Locations** | 3 (Mobile + 2 Desktop views) |
| **Conditional** | Yes (status + reason check) |
| **Responsive** | Yes (mobile & desktop) |
| **Icon** | XCircle from lucide-react |
| **Color** | Rose (red) theme |

---

## ✅ COMPLETE!

**Rejection reason sekarang ditampilkan dengan jelas di halaman detail pengajuan!**

**Features:**
- ✅ Conditional display (only when status = Ditolak)
- ✅ Prominent red alert box
- ✅ Responsive design (mobile & desktop)
- ✅ Clear icon and typography
- ✅ Professional styling

---

**Last Updated**: 2026-02-10 06:24:27 +08:00  
**Status**: ✅ IMPLEMENTED  
**Tested**: Ready for testing  
