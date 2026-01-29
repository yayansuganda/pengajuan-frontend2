import { PotonganJangkaWaktu, CreatePotonganJangkaWaktuDTO, UpdatePotonganJangkaWaktuDTO } from './Entity';

export interface PotonganJangkaWaktuRepository {
    getAll(page?: number, limit?: number): Promise<{
        data: PotonganJangkaWaktu[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: string): Promise<PotonganJangkaWaktu>;
    getByTerm(bulan: number): Promise<PotonganJangkaWaktu>;
    create(data: CreatePotonganJangkaWaktuDTO): Promise<PotonganJangkaWaktu>;
    update(id: string, data: UpdatePotonganJangkaWaktuDTO): Promise<void>;
    delete(id: string): Promise<void>;
}
