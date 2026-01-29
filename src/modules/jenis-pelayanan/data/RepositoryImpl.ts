import { JenisPelayananRepository } from '../core/Repository';
import { JenisPelayanan, CreateJenisPelayananDTO, UpdateJenisPelayananDTO } from '../core/Entity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class JenisPelayananRepositoryImpl implements JenisPelayananRepository {
    private httpClient = createHttpClient();

    async getAll(search?: string, page: number = 1, limit: number = 10): Promise<{
        data: JenisPelayanan[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: JenisPelayanan[];
            total: number;
            page: number;
            limit: number;
        }>(`/jenis-pelayanan?${params.toString()}`);

        return response.data;
    }

    async getById(id: string): Promise<JenisPelayanan> {
        const response = await this.httpClient.get<{ data: JenisPelayanan }>(`/jenis-pelayanan/${id}`);
        return response.data.data;
    }

    async create(data: CreateJenisPelayananDTO): Promise<JenisPelayanan> {
        const response = await this.httpClient.post<{ data: JenisPelayanan }>('/jenis-pelayanan', data);
        return response.data.data;
    }

    async update(id: string, data: UpdateJenisPelayananDTO): Promise<void> {
        await this.httpClient.put(`/jenis-pelayanan/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete(`/jenis-pelayanan/${id}`);
    }
}
