import { Potongan, CreatePotonganDTO, UpdatePotonganDTO } from './Entity';

export interface PotonganRepository {
    getAll(page?: number, limit?: number): Promise<{
        data: Potongan[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<Potongan>;
    create(data: CreatePotonganDTO): Promise<Potongan>;
    update(id: string, data: UpdatePotonganDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
