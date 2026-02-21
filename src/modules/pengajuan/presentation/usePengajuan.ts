import { useState, useEffect } from 'react';
import { PengajuanRepositoryImpl } from '../data/PengajuanRepositoryImpl';
import { Pengajuan } from '../core/PengajuanEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';

const pengajuanRepository = new PengajuanRepositoryImpl();

export const usePengajuan = () => {
    const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        // SKIP fetch kalau di fronting module (no auth)
        if (typeof window !== 'undefined') {
            const isFrontingRoute = window.location.pathname.startsWith('/fronting');
            if (isFrontingRoute) {
                console.log('[usePengajuan] Skipping fetch in fronting module (no auth required)');
                setLoading(false);
                return;
            }
        }
        fetchPengajuan();
    }, []);

    const fetchPengajuan = async () => {
        // Check if in fronting module
        const isFrontingRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/fronting');

        try {
            if (!isFrontingRoute) {
                showLoading('Memuat data pengajuan...');
            }
            setLoading(true);
            const data = await pengajuanRepository.getPengajuanList({
                status: 'all',
                page: 1,
                limit: 1000,
            });
            setPengajuanList(Array.isArray(data) ? data : []);
            if (!isFrontingRoute) {
                hideLoading();
            }
        } catch (err: any) {
            if (!isFrontingRoute) {
                hideLoading();
            }
            const errorMessage = err.message || 'Failed to fetch pengajuan list';
            setError(errorMessage);

            // Don't show error popup in fronting module
            if (!isFrontingRoute) {
                showError(errorMessage);
            } else {
                console.log('[usePengajuan] Error in fronting module (silent):', errorMessage);
            }
            console.error(err);
            setPengajuanList([]); // Ensure it's always an array
        } finally {
            setLoading(false);
        }
    };

    const createPengajuan = async (data: any) => {
        const isFrontingRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/fronting');

        try {
            if (!isFrontingRoute) {
                showLoading('Menyimpan pengajuan...');
            }
            setLoading(true);
            await pengajuanRepository.createPengajuan(data);
            if (!isFrontingRoute) {
                hideLoading();
            }
            // Optional: Show success message or redirect happens in component
        } catch (err: any) {
            if (!isFrontingRoute) {
                hideLoading();
            }
            const errorMessage = err.response?.data?.error || err.message || 'Gagal menyimpan pengajuan';
            setError(errorMessage);

            if (!isFrontingRoute) {
                showError(errorMessage);
            }
            console.error(err);
            throw err; // Re-throw so component knows it failed
        } finally {
            setLoading(false);
        }
    };

    const updatePengajuan = async (id: string, data: any) => {
        const isFrontingRoute = typeof window !== 'undefined' && window.location.pathname.startsWith('/fronting');

        try {
            if (!isFrontingRoute) {
                showLoading('Menyimpan perubahan...');
            }
            setLoading(true);
            await pengajuanRepository.updatePengajuan(id, data);
            if (!isFrontingRoute) {
                hideLoading();
            }
        } catch (err: any) {
            if (!isFrontingRoute) {
                hideLoading();
            }
            const errorMessage = err.response?.data?.error || err.message || 'Gagal menyimpan perubahan';
            setError(errorMessage);

            if (!isFrontingRoute) {
                showError(errorMessage);
            }
            console.error(err);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    return {
        pengajuanList,
        loading,
        error,
        refresh: fetchPengajuan,
        createPengajuan,
        updatePengajuan,
    };
};
