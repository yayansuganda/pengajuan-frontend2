import { UserRepository } from '../core/UserRepository';
import { User, CreateUserDTO, UpdateUserDTO } from '../core/UserEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class UserRepositoryImpl implements UserRepository {
    private httpClient = createHttpClient();

    async getAll(search?: string, role?: string, page: number = 1, limit: number = 10): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (role) params.append('role', role);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: User[];
            total: number;
            page: number;
            limit: number;
        }>(`/users?${params.toString()}`);

        return response.data;
    }

    async getById(id: number): Promise<User> {
        const response = await this.httpClient.get<{ data: User }>(`/users/${id}`);
        return response.data.data;
    }

    async create(user: CreateUserDTO): Promise<User> {
        const response = await this.httpClient.post<{ data: User }>('/users', user);
        return response.data.data;
    }

    async update(id: number, user: UpdateUserDTO): Promise<void> {
        await this.httpClient.put(`/users/${id}`, user);
    }

    async delete(id: number): Promise<void> {
        await this.httpClient.delete(`/users/${id}`);
    }
}
