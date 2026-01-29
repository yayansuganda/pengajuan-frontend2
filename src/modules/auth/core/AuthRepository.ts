import { LoginResponse } from './AuthEntity';

export interface AuthRepository {
    login(username: string, password: string): Promise<LoginResponse>;
    logout(): void;
    getCurrentUser(): Promise<LoginResponse | null>;
}
