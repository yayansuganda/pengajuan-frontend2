import { JenisPembiayaan, CreateJenisPembiayaanDTO, UpdateJenisPembiayaanDTO } from './Entity';

export interface JenisPembiayaanRepository {
    getAll(search?: string, page?: number, limit?: number): Promise<{
        data: JenisPembiayaan[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<JenisPembiayaan>;
    create(data: CreateJenisPembiayaanDTO): Promise<JenisPembiayaan>;
    update(id: string, data: UpdateJenisPembiayaanDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
