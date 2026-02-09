export interface Pensiunan {
    nopen: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;

    // Data Pensiun
    jenis_pensiun: string;
    jenis_dapem: string; // NEW: dari API
    kantor_bayar: string;
    kode_kantor: string; // NEW: dari API
    kode_kprk: string; // NEW: dari API
    nama_bank: string;
    mitra: string; // NEW: dari API (TASPEN, dll)
    no_rekening: string;

    // Data Gaji
    gaji_pokok: number;
    tunjangan: number;
    potongan: number;
    gaji_bersih: number;
    bulan_dapem: string; // NEW: dari API (periode pembayaran)

    // Status
    status_keaktifan: string; // Aktif, Meninggal, dll
    status_dapem: string; // NEW: dari API (kode status)
    last_updated: string;
}
