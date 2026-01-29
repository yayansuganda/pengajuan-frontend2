export interface Pensiunan {
    nopen: string;
    nama_lengkap: string;
    tanggal_lahir: string;
    jenis_kelamin: string;
    alamat: string;

    // Data Pensiun
    jenis_pensiun: string;
    kantor_bayar: string;
    nama_bank: string;
    no_rekening: string;

    // Data Gaji
    gaji_pokok: number;
    tunjangan: number;
    potongan: number;
    gaji_bersih: number;

    // Status
    status_keaktifan: string; // Aktif, Meninggal, dll
    last_updated: string;
}
