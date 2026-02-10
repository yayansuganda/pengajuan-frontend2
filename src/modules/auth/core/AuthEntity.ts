export type UserRole = 'admin' | 'officer' | 'verifier' | 'manager' | 'juru-buku' | 'admin-unit' | 'admin-pusat' | 'petugas-pos' | 'admin-pos' | 'super-admin';

export interface User {
    id: string;
    username: string;
    name: string;
    role: UserRole;
    unit?: string;
    token?: string;
}

export interface LoginResponse {
    token: string;
    user: User;
}
