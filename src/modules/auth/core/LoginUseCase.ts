import { AuthRepository } from '../core/AuthRepository';
import { LoginResponse } from '../core/AuthEntity';

export class LoginUseCase {
    constructor(private authRepository: AuthRepository) { }

    async execute(username: string, password: string): Promise<LoginResponse> {
        if (!username || !password) {
            throw new Error('Username and password are required');
        }
        return this.authRepository.login(username, password);
    }
}
