import { User, CreateUserDTO, UpdateUserDTO } from './UserEntity';

export interface UserRepository {
    getAll(search?: string, role?: string, page?: number, limit?: number): Promise<{
        data: User[];
        total: number;
        page: number;
        limit: number;
    }>;
    getById(id: number): Promise<User>;
    create(user: CreateUserDTO): Promise<User>;
    update(id: number, user: UpdateUserDTO): Promise<void>;
    delete(id: number): Promise<void>;
}
