import { useState, useEffect, useCallback } from 'react';
import { RekonsiliasiStats } from '../core/RekonsiliasiDashboardEntity';
import { RekonsiliasiDashboardRepository } from '../data/RekonsiliasiDashboardRepository';

const repo = new RekonsiliasiDashboardRepository();

export const useRekonsiliasiDashboard = () => {
    const [stats, setStats] = useState<RekonsiliasiStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');

    const fetchStats = useCallback(async () => {
        try {
            setLoading(true);
            setError('');
            const data = await repo.getStats(dateFrom || undefined, dateTo || undefined);
            setStats(data);
        } catch (err: any) {
            const errorMessage = err.message || 'Gagal memuat data rekonsiliasi';
            setError(errorMessage);
            console.error(err);
        } finally {
            setLoading(false);
        }
    }, [dateFrom, dateTo]);

    useEffect(() => {
        fetchStats();
    }, [fetchStats]);

    return {
        stats,
        loading,
        error,
        dateFrom,
        dateTo,
        setDateFrom,
        setDateTo,
        refresh: fetchStats,
    };
};
