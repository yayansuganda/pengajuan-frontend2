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
        fetchPengajuan();
    }, []);

    const fetchPengajuan = async () => {
        try {
            showLoading('Memuat data pengajuan...');
            setLoading(true);
            const data = await pengajuanRepository.getPengajuanList();
            setPengajuanList(Array.isArray(data) ? data : []);
            hideLoading();
        } catch (err: any) {
            hideLoading();
            const errorMessage = err.message || 'Failed to fetch pengajuan list';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
            setPengajuanList([]); // Ensure it's always an array
        } finally {
            setLoading(false);
        }
    };

    const createPengajuan = async (data: any) => {
        try {
            showLoading('Menyimpan pengajuan...');
            setLoading(true);
            await pengajuanRepository.createPengajuan(data);
            hideLoading();
            // Optional: Show success message or redirect happens in component
        } catch (err: any) {
            hideLoading();
            const errorMessage = err.response?.data?.error || err.message || 'Gagal menyimpan pengajuan';
            setError(errorMessage);
            showError(errorMessage);
            console.error(err);
            throw err; // Re-throw so component knows it failed
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
    };
};
