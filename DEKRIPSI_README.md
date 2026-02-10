# Dokumentasi Masalah Dekripsi Fronting

## 📋 Status

**⚠️ Dekripsi HAMPIR BERHASIL** - Sudah menemukan Double Base64, butuh kode backend untuk finalisasi

## 🔐 Informasi Enkripsi

### Yang Sudah Diketahui:
- **Algoritma**: AES-128-CTR
- **Secret Key**: `KEYSMMFR23012026` (16 bytes)
- **IV Key**: `XIVMMFRI23012026` (16 bytes)  
- **Format Data**: **DOUBLE BASE64 ENCODED** ⚠️ (temuan dari screenshot!)

### ✅ Proses Dekripsi (dari Screenshot):
1. **Base64 Decode pertama** → Menghasilkan base64 string lagi
2. **Base64 Decode kedua** → Menghasilkan encrypted binary data
3. **AES-128-CTR Decrypt** → Menghasilkan JSON data

### Contoh Data Terenkripsi:
```
SVl4R1VuVkpFZFZGQlhlT2p1ekt3cDF1SEVBanQ1RnNCMVdlbjdMa3VkdE8rTmQyNjRoVVNPUGltU2d0M2pHaHQxUWNxRnlvams2TVRuT0M1WXY5RHJyVWJUUDBlUi8veUVyUUlHTzIzK1AyK2hoYnc3cWNvaDRQYi9jNS83Nk9xNFl6UXBtaWhnUzkwMWxiUGpaVlEybnJOTE8yZUwxaWU1dit1Nm1MQkQzQng2NTUrRlBzZFZZT241OFpmWm1FNEFIdHRGOUFRVXNvaVJ0QU5ib1pKVTBsSmxjdnhjby8xRXFSRU9BTk9DcDJkc2FjK3Voam9zbzlJWEtsUmJyVVFTbzNBN1RZbitycENQN0MrTU9VNERJa2ZwZXlMZz09
```

## 🧪 Metode Yang Sudah Dicoba

### 1. Direct AES-128-CTR
```javascript
key = Buffer.from('KEYSMMFR23012026', 'utf8')
iv = Buffer.from('XIVMMFRI23012026', 'utf8')
decipher = crypto.createDecipheriv('aes-128-ctr', key, iv)
```
**Result**: Garbage data (bukan UTF-8 valid)

### 2. MD5 Hashed Keys
```javascript
key = crypto.createHash('md5').update('KEYSMMFR23012026').digest()
iv = crypto.createHash('md5').update('XIVMMFRI23012026').digest()
```
**Result**: Garbage data

### 3. SHA256 Keys (first 16 bytes)
```javascript
key = crypto.createHash('sha256').update('KEYSMMFR23012026').digest().slice(0, 16)
iv = crypto.createHash('sha256').update('XIVMMFRI23012026').digest().slice(0, 16)
```
**Result**: Garbage data

### 4. Double Decryption
```javascript
// Decrypt once
let decrypted1 = decrypt(encryptedData, key, iv)
// Decrypt again
let decrypted2 = decrypt(decrypted1, key, iv)
// Result is base64 string, but decoding gives garbage
```
**Result**: Base64 string, tapi tidak valid

### 5. Alternative Modes
- ECB mode - Failed
- CBC mode - Failed
- CTR dengan berbagai IV - Failed

## ⚠️ Masalah Yang Ditemukan

1. **Hasil dekripsi selalu garbage data** - Ini menunjukkan:
   - Key atau IV tidak cocok
   - Ada pre/post processing yang tidak diketahui
   - Format enkripsi berbeda dari standard

2. **Double decrypt menghasilkan base64** - Tapi decode base64-nya masih garbage

3. **Tidak ada error saat dekripsi** - Artinya parameter valid, tapi hasilnya salah

## 🔧 Yang Dibutuhkan Untuk Menyelesaikan

**SANGAT PENTING**: Kami membutuhkan **kode enkripsi dari backend** untuk menyelesaikan masalah ini.

### Informasi Yang Kami Butuhkan:

1. **Kode enkripsi lengkap** dari backend (PHP/Java/Python/dll)
   ```php
   // Contoh yang kami butuhkan:
   function encryptData($data) {
       $key = 'KEYSMMFR23012026';
       $iv = 'XIVMMFRI23012026';
       // ...kode enkripsi lengkap...
       return $encrypted;
   }
   ```

2. **Library yang digunakan**:
   - OpenSSL?
   - mcrypt?
   - Laravel Encryption?
   - Library custom?

3. **Pre-processing data sebelum enkripsi**:
   - Apakah data di-compress dulu?
   - Apakah ada serialize?
   - Apakah ada base64 encode sebelum enkripsi?

4. **Post-processing data setelah enkripsi**:
   - Apakah ada base64 encode lagi?
   - Apakah ada format khusus?

## 📁 File Yang Sudah Dibuat

### 1. Module Dekripsi
**Path**: `src/modules/fronting/core/frontingAuth.ts`

Sudah include:
- Fungsi `decryptFrontingData()` dengan multiple fallback methods
- Interface `FrontingUserData`
- Session management functions
- Support untuk AES-128-CTR dan fallback methods

### 2. Testing Page
**Path**: `src/app/fronting/decrypt-test/page.tsx`

Testing UI untuk decrypt data di browser.
**URL**: `http://localhost:3000/fronting/decrypt-test`

### 3. Node.js Test Script
**Path**: `decrypt-test.js`

Script untuk testing dekripsi di terminal:
```bash
node decrypt-test.js
```

### 4. Manual Test Script
**Path**: `decrypt-manual.js`

Script untuk test manual dengan custom IV:
```bash
node decrypt-manual.js
```

## 🚀 Cara Menggunakan (Setelah Dekripsi Fixed)

### Di Frontend:
```typescript
import { decryptFrontingData } from '@/modules/fronting/core/frontingAuth';

// Di component
const encryptedData = searchParams.get('data');
if (encryptedData) {
    const userData = decryptFrontingData(encryptedData);
    if (userData) {
        // User authenticated!
        console.log(userData.name, userData.nippos);
    }
}
```

### Testing di Browser:
1. Buka `http://localhost:3000/fronting/decrypt-test`
2. Paste encrypted data
3. Click "Decrypt Data"
4. Lihat console untuk detail

## 📞 Next Steps

**ACTION REQUIRED**:
1. **Dapatkan kode enkripsi backend** dari developer yang membuat enkripsi
2. Share kode tersebut untuk analisa
3. Kami akan update fungsi dekripsi dengan method yang tepat
4. Test dan verifikasi

## 💡 Temporary Workaround

Sementara dekripsi belum fix, Anda bisa:
1. Bypass authentication untuk development
2. Gunakan mock data untuk testing UI
3. Atau akses direct tanpa parameter `data`

---

**Created**: February 10, 2026
**Status**: Waiting for backend encryption code
**Priority**: HIGH - Blocking feature
