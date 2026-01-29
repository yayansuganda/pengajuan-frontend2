'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Percent, Calendar } from 'lucide-react';
import { PotonganJangkaWaktu, CreatePotonganJangkaWaktuDTO, UpdatePotonganJangkaWaktuDTO } from '../core/Entity';
import { PotonganJangkaWaktuRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const repository = new PotonganJangkaWaktuRepositoryImpl();

export const PotonganJangkaWaktuList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<PotonganJangkaWaktu[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(100);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PotonganJangkaWaktu | null>(null);
    const [formData, setFormData] = useState({
        min_bulan: 0,
        max_bulan: 0,
        potongan_persen: 0,
        description: '',
        is_active: true,
    });

    useEffect(() => {
        // Redirect if not super-admin
        if (user && user.role !== 'super-admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [page, user]);

    const fetchData = async () => {
        try {
            showLoading('Memuat data...');
            const response = await repository.getAll(page, limit);
            setData(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal memuat data'));
        }
    };

    const handleDelete = async (id: string) => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus data ini?');
        if (!confirmed) return;

        try {
            showLoading('Menghapus data...');
            await repository.delete(id);
            hideLoading();
            await showSuccess('Data berhasil dihapus');
            fetchData();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal menghapus data'));
        }
    };

    const openCreateModal = () => {
        setEditingItem(null);
        setFormData({
            min_bulan: 0,
            max_bulan: 0,
            potongan_persen: 0,
            description: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: PotonganJangkaWaktu) => {
        setEditingItem(item);
        setFormData({
            min_bulan: item.min_bulan || 0,
            max_bulan: item.max_bulan || 0,
            potongan_persen: item.potongan_persen || 0,
            description: item.description || '',
            is_active: item.is_active ?? true,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            min_bulan: 0,
            max_bulan: 0,
            potongan_persen: 0,
            description: '',
            is_active: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.min_bulan <= 0 || formData.max_bulan <= 0) {
            showError('Rentang bulan harus lebih dari 0');
            return;
        }

        if (formData.min_bulan > formData.max_bulan) {
            showError('Bulan minimum tidak boleh lebih besar dari bulan maksimum');
            return;
        }

        if (formData.potongan_persen <= 0 || formData.potongan_persen > 100) {
            showError('Potongan persen harus antara 0-100');
            return;
        }

        try {
            showLoading(editingItem ? 'Mengupdate data...' : 'Menambahkan data...');

            if (editingItem) {
                await repository.update(editingItem.id, formData as UpdatePotonganJangkaWaktuDTO);
                hideLoading();
                await showSuccess('Data berhasil diupdate');
            } else {
                await repository.create(formData as CreatePotonganJangkaWaktuDTO);
                hideLoading();
                await showSuccess('Data berhasil ditambahkan');
            }

            closeModal();
            fetchData();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal menyimpan data'));
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Potongan Jangka Waktu</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Kelola data master potongan berdasarkan jangka waktu pembiayaan
                    </p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Data
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentang Waktu</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potongan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2 text-sm font-medium text-gray-900">
                                                <Calendar className="h-4 w-4 text-gray-400" />
                                                {item.min_bulan} - {item.max_bulan} Bulan
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-3 py-1 text-sm font-semibold text-indigo-700">
                                                    <Percent className="h-3.5 w-3.5" />
                                                    {item.potongan_persen}%
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                item.is_active 
                                                    ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' 
                                                    : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
                                            }`}>
                                                {item.is_active ? 'Aktif' : 'Nonaktif'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(item)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit className="h-4 w-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.id)}
                                                className="text-red-600 hover:text-red-900"
                                            >
                                                <Trash2 className="h-4 w-4 inline" />
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                        <div className="flex-1 flex justify-between sm:hidden">
                            <button
                                onClick={() => setPage(p => Math.max(1, p - 1))}
                                disabled={page === 1}
                                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                                disabled={page === totalPages}
                                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                            >
                                Next
                            </button>
                        </div>
                        <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                            <div>
                                <p className="text-sm text-gray-700">
                                    Menampilkan <span className="font-medium">{(page - 1) * limit + 1}</span> sampai{' '}
                                    <span className="font-medium">{Math.min(page * limit, total)}</span> dari{' '}
                                    <span className="font-medium">{total}</span> hasil
                                </p>
                            </div>
                            <div>
                                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                    {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                        <button
                                            key={p}
                                            onClick={() => setPage(p)}
                                            className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${p === page
                                                ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600'
                                                : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                                                }`}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </nav>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Modal Form */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        {/* Backdrop with Blur - halaman di belakang tetap terlihat */}
                        <div 
                            className="fixed inset-0 bg-black/20 backdrop-blur-md transition-all duration-300" 
                            onClick={closeModal}
                        ></div>

                        {/* Modal */}
                        <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {editingItem ? 'Edit Potongan Jangka Waktu' : 'Tambah Potongan Jangka Waktu'}
                                </h3>
                                <button
                                    onClick={closeModal}
                                    className="text-gray-400 hover:text-gray-500"
                                >
                                    <X className="h-5 w-5" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    {/* Rentang Waktu */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label htmlFor="min_bulan" className="block text-sm font-medium text-gray-700 mb-1">
                                                Min Bulan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="min_bulan"
                                                required
                                                min="1"
                                                value={formData.min_bulan}
                                                onChange={(e) => setFormData({ ...formData, min_bulan: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="6"
                                            />
                                        </div>
                                        <div>
                                            <label htmlFor="max_bulan" className="block text-sm font-medium text-gray-700 mb-1">
                                                Max Bulan <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="number"
                                                id="max_bulan"
                                                required
                                                min="1"
                                                value={formData.max_bulan}
                                                onChange={(e) => setFormData({ ...formData, max_bulan: parseInt(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="12"
                                            />
                                        </div>
                                    </div>

                                    {/* Potongan Persentase */}
                                    <div>
                                        <label htmlFor="potongan_persen" className="block text-sm font-medium text-gray-700 mb-1">
                                            Potongan (%) <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="number"
                                                id="potongan_persen"
                                                required
                                                min="0.01"
                                                max="100"
                                                step="0.01"
                                                value={formData.potongan_persen}
                                                onChange={(e) => setFormData({ ...formData, potongan_persen: parseFloat(e.target.value) || 0 })}
                                                className="w-full px-3 py-2 pr-8 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                placeholder="17.00"
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <span className="text-gray-500 sm:text-sm">%</span>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            Contoh: 17 untuk 17%
                                        </p>
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={3}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            placeholder="Deskripsi singkat..."
                                        />
                                    </div>

                                    {/* Status Active */}
                                    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-md border border-gray-200">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                                        />
                                        <div className="flex-1">
                                            <label htmlFor="is_active" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                Status Aktif
                                            </label>
                                            <p className="text-xs text-gray-500 mt-0.5">
                                                Data aktif dapat digunakan dalam sistem
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-6 flex items-center justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        <Save className="h-4 w-4" />
                                        Simpan
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
