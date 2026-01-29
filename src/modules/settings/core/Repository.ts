import { Setting, CreateSettingDTO, UpdateSettingDTO } from './Entity';

export interface SettingRepository {
    getAll(page?: number, limit?: number): Promise<{
        data: Setting[];
        total: number;
        page: number;
        limit: number;
    }>;
    getActive(): Promise<Setting>;
    getById(id: string): Promise<Setting>;
    create(data: CreateSettingDTO): Promise<Setting>;
    update(id: string, data: UpdateSettingDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
