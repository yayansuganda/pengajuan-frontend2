import { PotonganRepository } from '../core/Repository';
import { Potongan, CreatePotonganDTO, UpdatePotonganDTO } from '../core/Entity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class PotonganRepositoryImpl implements PotonganRepository {
    private httpClient = createHttpClient();

    async getAll(page: number = 1, limit: number = 100): Promise<{
        data: Potongan[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: Potongan[];
            total: number;
            page: number;
            limit: number;
        }>(`/potongan?${params.toString()}`);

        return response.data;
    }

    async getById(id: string): Promise<Potongan> {
        const response = await this.httpClient.get<{ data: Potongan }>(`/potongan/${id}`);
        return response.data.data;
    }

    async create(data: CreatePotonganDTO): Promise<Potongan> {
        const response = await this.httpClient.post<{ data: Potongan }>('/potongan', data);
        return response.data.data;
    }

    async update(id: string, data: UpdatePotonganDTO): Promise<void> {
        await this.httpClient.put(`/potongan/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete(`/potongan/${id}`);
    }
}
