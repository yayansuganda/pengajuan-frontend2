export interface StatusHistory {
    status: string;
    date: string;
    description: string;
    actor?: string; // Siapa yang melakukan aksi ini (misal: Staff Admin, Kepala Cabang)
    is_completed: boolean;
}

export interface PengajuanStatusResult {
    id: string; // ID Pengajuan
    nik: string;
    nama_lengkap: string;
    jenis_pembiayaan: string;
    jumlah_pembiayaan: number;
    tanggal_pengajuan: string;
    status_terakhir: string;
    history: StatusHistory[];
}
