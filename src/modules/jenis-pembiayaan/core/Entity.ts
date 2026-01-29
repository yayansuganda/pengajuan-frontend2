export interface JenisPembiayaan {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateJenisPembiayaanDTO {
    name: string;
    description?: string;
}

export interface UpdateJenisPembiayaanDTO {
    name: string;
    description?: string;
}
