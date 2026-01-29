export interface User {
    id: number;
    username: string;
    role: string;
    unit: string;
    name: string;
    created_at: string;
    updated_at: string;
}

export interface CreateUserDTO {
    username: string;
    password: string;
    role: string;
    unit: string;
    name: string;
}

export interface UpdateUserDTO {
    username: string;
    password?: string; // Optional - only if changing password
    role: string;
    unit: string;
    name: string;
}
