import { UnitRepository } from '../core/UnitRepository';
import { Unit, CreateUnitDTO, UpdateUnitDTO } from '../core/UnitEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class UnitRepositoryImpl implements UnitRepository {
    private httpClient = createHttpClient();

    async getAll(search?: string, page: number = 1, limit: number = 10): Promise<{
        data: Unit[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: Unit[];
            total: number;
            page: number;
            limit: number;
        }>(`/units?${params.toString()}`);

        return response.data;
    }

    async getById(id: number): Promise<Unit> {
        const response = await this.httpClient.get<{ data: Unit }>(`/units/${id}`);
        return response.data.data;
    }

    async create(unit: CreateUnitDTO): Promise<Unit> {
        const response = await this.httpClient.post<{ data: Unit }>('/units', unit);
        return response.data.data;
    }

    async update(id: number, unit: UpdateUnitDTO): Promise<void> {
        await this.httpClient.put(`/units/${id}`, unit);
    }

    async delete(id: number): Promise<void> {
        await this.httpClient.delete(`/units/${id}`);
    }
}
