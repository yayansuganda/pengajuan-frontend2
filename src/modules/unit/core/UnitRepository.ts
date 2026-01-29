import { Unit, CreateUnitDTO, UpdateUnitDTO } from './UnitEntity';

export interface UnitRepository {
    getAll(search?: string, page?: number, limit?: number): Promise<{
        data: Unit[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: number): Promise<Unit>;
    create(unit: CreateUnitDTO): Promise<Unit>;
    update(id: number, unit: UpdateUnitDTO): Promise<void>;
    delete(id: number): Promise<void>;
}
