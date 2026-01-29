import { SettingRepository } from '../core/Repository';
import { Setting, CreateSettingDTO, UpdateSettingDTO } from '../core/Entity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class SettingRepositoryImpl implements SettingRepository {
    private httpClient = createHttpClient();

    async getAll(page: number = 1, limit: number = 100): Promise<{
        data: Setting[];
        total: number;
        page: number;
        limit: number;
    }> {
        const params = new URLSearchParams();
        params.append('page', page.toString());
        params.append('limit', limit.toString());

        const response = await this.httpClient.get<{
            data: Setting[];
            total: number;
            page: number;
            limit: number;
        }>(`/settings?${params.toString()}`);

        return response.data;
    }

    async getActive(): Promise<Setting> {
        const response = await this.httpClient.get<{ data: Setting }>('/settings/active');
        return response.data.data;
    }

    async getById(id: string): Promise<Setting> {
        const response = await this.httpClient.get<{ data: Setting }>(`/settings/${id}`);
        return response.data.data;
    }

    async create(data: CreateSettingDTO): Promise<Setting> {
        const response = await this.httpClient.post<{ data: Setting }>('/settings', data);
        return response.data.data;
    }

    async update(id: string, data: UpdateSettingDTO): Promise<void> {
        await this.httpClient.put(`/settings/${id}`, data);
    }

    async delete(id: string): Promise<void> {
        await this.httpClient.delete(`/settings/${id}`);
    }
}
