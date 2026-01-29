export interface JenisPelayanan {
    id: string;
    name: string;
    description?: string;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateJenisPelayananDTO {
    name: string;
    description?: string;
}

export interface UpdateJenisPelayananDTO {
    name: string;
    description?: string;
}
