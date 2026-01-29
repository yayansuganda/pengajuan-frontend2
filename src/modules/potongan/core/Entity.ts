export interface Potongan {
    id: string;
    nama_potongan: string;
    persentase_nominal: number;
    kategori: 'nominal' | 'persentase';
    description?: string;
    is_active: boolean;
    is_view: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreatePotonganDTO {
    nama_potongan: string;
    persentase_nominal: number;
    kategori: 'nominal' | 'persentase';
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}

export interface UpdatePotonganDTO {
    nama_potongan: string;
    persentase_nominal: number;
    kategori: 'nominal' | 'persentase';
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}
