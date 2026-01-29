export interface Unit {
    id: number;
    code: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    deleted_at?: string;
}

export interface CreateUnitDTO {
    code: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    is_active: boolean;
}

export interface UpdateUnitDTO {
    code: string;
    name: string;
    description?: string;
    address?: string;
    phone?: string;
    is_active: boolean;
}
