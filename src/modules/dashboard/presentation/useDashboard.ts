import { useState, useEffect } from 'react';
import { DashboardRepositoryImpl } from '../data/DashboardRepositoryImpl';
import { DashboardStats } from '../core/DashboardEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';

const dashboardRepository = new DashboardRepositoryImpl();

export const useDashboard = (month?: string) => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchStats();
    }, [month]);

    const fetchStats = async () => {
        try {
            showLoading('Memuat statistik...');
            setLoading(true);
            const data = await dashboardRepository.getStats(month);
            setStats(data);
            hideLoading();
        } catch (err: any) {
            hideLoading();
            const errorMessage = err.message || 'Failed to fetch dashboard stats';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return {
        stats,
        loading,
        error,
        refresh: fetchStats,
    };
};

