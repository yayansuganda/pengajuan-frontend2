import { PotonganJangkaWaktuRepository } from '../core/Repository';
import { PotonganJangkaWaktu, CreatePotonganJangkaWaktuDTO, UpdatePotonganJangkaWaktuDTO } from '../core/Entity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class PotonganJangkaWaktuRepositoryImpl implements PotonganJangkaWaktuRepository {
    private httpClient = createHttpClient();

    async getAll(page: number = 1, limit: number = 100): Promise<{
        data: PotonganJangkaWaktu[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: PotonganJangkaWaktu[];
            total: number;
            page: number;
            limit: number;
        }>(`/potongan-jangka-waktu?${params.toString()}`);

        return response.data;
    }

    async getById(id: string): Promise<PotonganJangkaWaktu> {
        const response = await this.httpClient.get<{ data: PotonganJangkaWaktu }>(`/potongan-jangka-waktu/${id}`);
        return response.data.data;
    }

    async getByTerm(bulan: number): Promise<PotonganJangkaWaktu> {
        const response = await this.httpClient.get<{ data: PotonganJangkaWaktu }>(`/potongan-jangka-waktu/by-term?bulan=${bulan}`);
        return response.data.data;
    }

    async create(data: CreatePotonganJangkaWaktuDTO): Promise<PotonganJangkaWaktu> {
        const response = await this.httpClient.post<{ data: PotonganJangkaWaktu }>('/potongan-jangka-waktu', data);
        return response.data.data;
    }

    async update(id: string, data: UpdatePotonganJangkaWaktuDTO): Promise<void> {
        await this.httpClient.put(`/potongan-jangka-waktu/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete(`/potongan-jangka-waktu/${id}`);
    }
}
