export interface PotonganJangkaWaktu {
    id: string;
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos: boolean; // Flag untuk membedakan POS atau non-POS
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
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}

export interface UpdatePotonganJangkaWaktuDTO {
    min_bulan: number;
    max_bulan: number;
    potongan_persen: number;
    is_pos?: boolean;
    description?: string;
    is_active?: boolean;
    is_view?: boolean;
}
