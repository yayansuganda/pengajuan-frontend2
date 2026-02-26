import { useState, useEffect, useMemo } from 'react';
import { AuthRepositoryImpl } from '../data/AuthRepositoryImpl';
import { LoginUseCase } from '../core/LoginUseCase';
import { User } from '../core/AuthEntity';
import { useRouter } from 'next/navigation';

export const useAuth = () => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const router = useRouter();

    // Create instances only in browser
    const authRepository = useMemo(() => new AuthRepositoryImpl(), []);
    const loginUseCase = useMemo(() => new LoginUseCase(authRepository), [authRepository]);

    useEffect(() => {
        const checkAuth = async () => {
            const currentUser = await authRepository.getCurrentUser();
            if (currentUser) {
                setUser(currentUser.user);
            }
            setLoading(false);
        };
        checkAuth();
    }, [authRepository]);

    const login = async (username: string, password: string) => {
        try {
            const response = await loginUseCase.execute(username, password);
            setUser(response.user);
            // Roles that can only access Rekonsiliasi are redirected there directly
            const rekonOnlyRoles = ['admin-pos', 'regional-pos', 'kcu-pos', 'kc-pos'];
            if (rekonOnlyRoles.includes(response.user.role)) {
                router.push('/rekonsiliasi/dashboard');
            } else {
                router.push('/dashboard');
            }
        } catch (error) {
            console.error('Login failed', error);
            throw error;
        }
    };

    const logout = () => {
        authRepository.logout();
        setUser(null);
        router.push('/login');
    };

    return {
        user,
        loading,
        login,
        logout,
    };
};
