import { AuthRepository } from '../core/AuthRepository';
import { LoginResponse } from '../core/AuthEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class AuthRepositoryImpl implements AuthRepository {
    private httpClient = createHttpClient();

    async login(username: string, password: string): Promise<LoginResponse> {
        const response = await this.httpClient.post<LoginResponse>('/auth/login', { username, password });
        if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('user', JSON.stringify(response.data.user));
        }
        return response.data;
    }

    logout(): void {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
    }

    async getCurrentUser(): Promise<LoginResponse | null> {
        const token = localStorage.getItem('token');
        const userStr = localStorage.getItem('user');
        if (token && userStr) {
            return {
                token,
                user: JSON.parse(userStr),
            };
        }
        return null;
    }
}
