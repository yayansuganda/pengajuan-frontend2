# Templates Folder

Folder ini berisi file template dokumen yang dapat didownload oleh user.

## File yang Diperlukan:

### 1. SURAT_PERMOHONAN_ANGGOTA_PEMBIAYAAN.pdf
**Deskripsi**: Template Surat Permohonan Anggota & Pembiayaan untuk pengajuan pembiayaan pensiunan.

**Cara Menambahkan**:
1. Dapatkan file PDF template dari tim admin/legal
2. Rename file menjadi: `SURAT_PERMOHONAN_ANGGOTA_PEMBIAYAAN.pdf`
3. Simpan di folder ini: `/public/templates/`
4. File akan otomatis accessible di: `http://localhost:3000/templates/SURAT_PERMOHONAN_ANGGOTA_PEMBIAYAAN.pdf`

## Status Saat Ini:

❌ **SURAT_PERMOHONAN_ANGGOTA_PEMBIAYAAN.pdf** - Belum tersedia

Jika user klik "Download Template", akan muncul popup info bahwa template belum tersedia.

## Cara Menambahkan Template Baru:

1. Simpan file PDF ke folder `/public/templates/`
2. Update file `CreatePengajuanWizard.tsx` di bagian `UPLOAD_FIELDS`:
   ```typescript
   { 
     name: 'upload_nama_field', 
     label: 'Nama Dokumen', 
     hasTemplate: true,  // Set true untuk menampilkan button download
     required: true 
   }
   ```
3. Update link download di render function jika nama file berbeda

## Catatan:

- File di folder `/public/` dapat diakses langsung via URL tanpa `/public/` prefix
- Contoh: file `/public/templates/file.pdf` → URL: `/templates/file.pdf`
- Maksimal ukuran file di Next.js: ~50MB (tergantung hosting)
- Format yang disupport: PDF, DOC, DOCX, XLS, XLSX
