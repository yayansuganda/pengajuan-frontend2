import { JenisPembiayaanRepository } from '../core/Repository';
import { JenisPembiayaan, CreateJenisPembiayaanDTO, UpdateJenisPembiayaanDTO } from '../core/Entity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class JenisPembiayaanRepositoryImpl implements JenisPembiayaanRepository {
    private httpClient = createHttpClient();

    async getAll(search?: string, page: number = 1, limit: number = 10): Promise<{
        data: JenisPembiayaan[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: JenisPembiayaan[];
            total: number;
            page: number;
            limit: number;
        }>(`/jenis-pembiayaan?${params.toString()}`);

        return response.data;
    }

    async getById(id: string): Promise<JenisPembiayaan> {
        const response = await this.httpClient.get<{ data: JenisPembiayaan }>(`/jenis-pembiayaan/${id}`);
        return response.data.data;
    }

    async create(data: CreateJenisPembiayaanDTO): Promise<JenisPembiayaan> {
        const response = await this.httpClient.post<{ data: JenisPembiayaan }>('/jenis-pembiayaan', data);
        return response.data.data;
    }

    async update(id: string, data: UpdateJenisPembiayaanDTO): Promise<void> {
        await this.httpClient.put(`/jenis-pembiayaan/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete(`/jenis-pembiayaan/${id}`);
    }
}
