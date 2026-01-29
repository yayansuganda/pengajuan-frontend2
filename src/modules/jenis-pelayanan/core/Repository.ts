import { JenisPelayanan, CreateJenisPelayananDTO, UpdateJenisPelayananDTO } from './Entity';

export interface JenisPelayananRepository {
    getAll(search?: string, page?: number, limit?: number): Promise<{
        data: JenisPelayanan[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<JenisPelayanan>;
    create(data: CreateJenisPelayananDTO): Promise<JenisPelayanan>;
    update(id: string, data: UpdateJenisPelayananDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
