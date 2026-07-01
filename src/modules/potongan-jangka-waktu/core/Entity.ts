export interface PotonganJangkaWaktu {
    id: string;
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos: boolean; // Flag untuk membedakan POS atau non-POS
    jenis_pelayanan_id?: string | null;
    jenis_pelayanan?: {
        id: string;
        name: string;
        description?: string;
    } | null;
    description?: string;
    is_active: boolean;
    is_view: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreatePotonganJangkaWaktuDTO {
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos?: boolean;
    jenis_pelayanan_id?: string | null;
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}

export interface UpdatePotonganJangkaWaktuDTO {
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos?: boolean;
    jenis_pelayanan_id?: string | null;
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}
