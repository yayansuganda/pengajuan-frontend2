export interface Pengajuan {
    id: string; // UUID
    user_id: string; // UUID
    user?: {
        id: string; // UUID
        name: string;
        username: string;
        role: string;
        unit: string;
    };
    unit: string;
    status: string; // 'Pending', 'Proses Persetujuan', 'Disetujui', 'Ditolak'
    notes?: string;
    reject_reason?: string;

    // Data Diri
    nik: string;
    name: string;
    jenis_kelamin?: string;
    tempat_lahir?: string;
    tanggal_lahir?: string;
    alamat?: string;
    rt?: string;
    rw?: string;
    kelurahan?: string;
    kecamatan?: string;
    kabupaten?: string;
    provinsi?: string;
    kode_pos?: string;
    nama_ibu_kandung?: string;
    pendidikan_terakhir?: string;
    usia?: number;

    // Data Pensiun
    nopen?: string;
    jenis_pensiun?: string;
    kantor_bayar?: string;
    nama_bank?: string;
    no_rekening?: string;
    nomor_rekening_giro_pos?: string;

    // Data Dapem & Keuangan
    jenis_dapem?: string;
    bulan_dapem?: string;
    status_dapem?: string;
    gaji_bersih?: number;
    gaji_tersedia?: number;

    // Data Pengajuan
    jenis_pelayanan_id?: string;
    jenis_pelayanan?: {
        id: string;
        name: string;
        description?: string;
    };
    jenis_pembiayaan_id?: string;
    jenis_pembiayaan?: {
        id: string;
        name: string;
        description?: string;
    };
    kategori_pembiayaan?: string; // Macro or Micro
    maksimal_jangka_waktu_usia?: number;
    jangka_waktu?: number;
    maksimal_pembiayaan?: number;
    jumlah_pembiayaan: number;
    besar_angsuran?: number;
    total_potongan?: number;
    nominal_terima?: number;
    kantor_pos_petugas?: string;

    // Status & Metadata
    approval?: string;

    // Files
    ktp_url?: string;
    slip_gaji_url?: string;
    borrower_photos?: string; // JSON array of URLs
    pengajuan_permohonan_url?: string;
    dokumen_akad_url?: string;
    flagging_url?: string;
    surat_pernyataan_beda_url?: string;
    karip_buku_asabri_url?: string;
    surat_permohonan_anggota_url?: string;
    sk_pensiun_url?: string; // SK Pensiun (Required)
    disbursement_proof_url?: string;
    shipping_receipt_url?: string;

    // Location
    latitude?: number;
    longitude?: number;

    // Disbursement/Pencairan (Legacy/Optional for now)
    disbursement?: {
        id: string; // UUID
        loan_id: string; // UUID
        status: string;
        bank_name: string;
        account_number: string;
        account_name: string;
        notes?: string;
        proof_url?: string;
        created_at: string;
    };

    // Timestamps
    created_at: string;
    updated_at: string;
}

export interface PengajuanFilter {
    status?: string;
    search?: string;
    limit?: number;
    page?: number;
}
