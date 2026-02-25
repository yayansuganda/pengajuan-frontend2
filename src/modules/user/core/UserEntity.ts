export interface User {
    id: number;
    username: string;
    role: string;
    unit: string;
    unit_id?: string;
    name: string;
    regional_kode?: string;
    kcu_kode?: string;
    kc_kode?: string;
    created_at: string;
    updated_at: string;
}

export interface CreateUserDTO {
    username: string;
    password: string;
    role: string;
    unit: string;
    unit_id?: string;
    name: string;
    regional_kode?: string;
    kcu_kode?: string;
    kc_kode?: string;
}

export interface UpdateUserDTO {
    username?: string;
    password?: string; // Optional - only if changing password
    role?: string;
    unit?: string;
    unit_id?: string;
    name?: string;
    regional_kode?: string;
    kcu_kode?: string;
    kc_kode?: string;
}
