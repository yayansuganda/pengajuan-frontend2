'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Percent, DollarSign } from 'lucide-react';
import { Potongan, CreatePotonganDTO, UpdatePotonganDTO } from '../core/Entity';
import { PotonganRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const repository = new PotonganRepositoryImpl();

export const PotonganList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<Potongan[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(100);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Potongan | null>(null);
    const [formData, setFormData] = useState({
        nama_potongan: '',
        persentase_nominal: 0,
        kategori: 'persentase' as 'persentase' | 'nominal',
        description: '',
        is_active: true,
        is_view: true,
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
            nama_potongan: '',
            persentase_nominal: 0,
            kategori: 'persentase',
            description: '',
            is_active: true,
            is_view: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Potongan) => {
        setEditingItem(item);
        setFormData({
            nama_potongan: item.nama_potongan || '',
            persentase_nominal: item.persentase_nominal || 0,
            kategori: item.kategori || 'persentase',
            description: item.description || '',
            is_active: item.is_active ?? true,
            is_view: item.is_view ?? true,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({
            nama_potongan: '',
            persentase_nominal: 0,
            kategori: 'persentase',
            description: '',
            is_active: true,
            is_view: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!formData.nama_potongan.trim()) {
            showError('Nama potongan harus diisi');
            return;
        }

        if (formData.persentase_nominal <= 0) {
            showError('Nilai harus lebih dari 0');
            return;
        }

        if (formData.kategori === 'persentase' && formData.persentase_nominal > 100) {
            showError('Nilai persentase tidak boleh lebih dari 100%');
            return;
        }

        try {
            showLoading(editingItem ? 'Mengupdate data...' : 'Menambahkan data...');

            if (editingItem) {
                await repository.update(editingItem.id, formData as UpdatePotonganDTO);
                hideLoading();
                await showSuccess('Data berhasil diupdate');
            } else {
                await repository.create(formData as CreatePotonganDTO);
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

    const formatNilai = (nilai: number, kategori: string) => {
        if (kategori === 'nominal') {
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai);
        }
        return `${nilai}%`;
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="sm:flex sm:items-center mb-6">
                <div className="sm:flex-auto">
                    <h1 className="text-2xl font-semibold text-gray-900">Potongan</h1>
                    <p className="mt-2 text-sm text-gray-700">
                        Kelola data master potongan (nominal atau persentase)
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
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama Potongan</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kategori</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nilai</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">View</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {data.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data
                                    </td>
                                </tr>
                            ) : (
                                data.map((item) => (
                                    <tr key={item.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-medium text-gray-900">{item.nama_potongan}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${
                                                item.kategori === 'nominal' 
                                                    ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' 
                                                    : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'
                                            }`}>
                                                {item.kategori === 'nominal' ? <DollarSign className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
                                                {item.kategori === 'nominal' ? 'Nominal' : 'Persentase'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-gray-900">
                                                {formatNilai(item.persentase_nominal, item.kategori)}
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
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${
                                                (item.is_view ?? true)
                                                    ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' 
                                                    : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'
                                            }`}>
                                                {(item.is_view ?? true) ? 'Tampil' : 'Tersembunyi'}
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
                        {/* Backdrop with Blur */}
                        <div 
                            className="fixed inset-0 bg-black/20 backdrop-blur-md transition-all duration-300" 
                            onClick={closeModal}
                        ></div>

                        {/* Modal */}
                        <div className="relative bg-white rounded-lg shadow-2xl max-w-lg w-full animate-in fade-in zoom-in-95 duration-200">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {editingItem ? 'Edit Potongan' : 'Tambah Potongan'}
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
                                    {/* Nama Potongan */}
                                    <div>
                                        <label htmlFor="nama_potongan" className="block text-sm font-medium text-gray-700 mb-1">
                                            Nama Potongan <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="nama_potongan"
                                            required
                                            value={formData.nama_potongan}
                                            onChange={(e) => setFormData({ ...formData, nama_potongan: e.target.value })}
                                            className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Contoh: Administrasi, Provisi"
                                        />
                                    </div>

                                    {/* Kategori */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">
                                            Kategori <span className="text-red-500">*</span>
                                        </label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                                                formData.kategori === 'persentase' 
                                                    ? 'border-indigo-500 bg-indigo-50' 
                                                    : 'border-gray-200 bg-white'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="kategori"
                                                    value="persentase"
                                                    checked={formData.kategori === 'persentase'}
                                                    onChange={(e) => setFormData({ ...formData, kategori: 'persentase', persentase_nominal: 0 })}
                                                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <span className="block text-sm font-medium text-gray-900">Persentase</span>
                                                    <span className="block text-xs text-gray-500">Dalam bentuk %</span>
                                                </div>
                                                <Percent className={`h-5 w-5 ${formData.kategori === 'persentase' ? 'text-indigo-600' : 'text-gray-400'}`} />
                                            </label>
                                            <label className={`flex items-center p-3 border-2 rounded-lg cursor-pointer transition-all hover:bg-gray-50 ${
                                                formData.kategori === 'nominal' 
                                                    ? 'border-emerald-500 bg-emerald-50' 
                                                    : 'border-gray-200 bg-white'
                                            }`}>
                                                <input
                                                    type="radio"
                                                    name="kategori"
                                                    value="nominal"
                                                    checked={formData.kategori === 'nominal'}
                                                    onChange={(e) => setFormData({ ...formData, kategori: 'nominal', persentase_nominal: 0 })}
                                                    className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300"
                                                />
                                                <div className="ml-3 flex-1">
                                                    <span className="block text-sm font-medium text-gray-900">Nominal</span>
                                                    <span className="block text-xs text-gray-500">Dalam Rupiah</span>
                                                </div>
                                                <DollarSign className={`h-5 w-5 ${formData.kategori === 'nominal' ? 'text-emerald-600' : 'text-gray-400'}`} />
                                            </label>
                                        </div>
                                    </div>

                                    {/* Nilai */}
                                    <div>
                                        <label htmlFor="persentase_nominal" className="block text-sm font-medium text-gray-700 mb-1">
                                            {formData.kategori === 'persentase' ? 'Nilai Persentase (%)' : 'Nilai Nominal (Rp)'} <span className="text-red-500">*</span>
                                        </label>
                                        <div className="relative">
                                            {formData.kategori === 'nominal' && (
                                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-medium">Rp</span>
                                                </div>
                                            )}
                                            <input
                                                type="number"
                                                id="persentase_nominal"
                                                required
                                                min={formData.kategori === 'persentase' ? "0.01" : "1"}
                                                max={formData.kategori === 'persentase' ? "100" : undefined}
                                                step={formData.kategori === 'persentase' ? "0.01" : "1"}
                                                value={formData.persentase_nominal}
                                                onChange={(e) => setFormData({ ...formData, persentase_nominal: parseFloat(e.target.value) || 0 })}
                                                className={`w-full ${formData.kategori === 'nominal' ? 'pl-10' : ''} ${formData.kategori === 'persentase' ? 'pr-8' : ''} px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent`}
                                                placeholder={formData.kategori === 'persentase' ? '2.5' : '50000'}
                                            />
                                            {formData.kategori === 'persentase' && (
                                                <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                    <span className="text-gray-500 sm:text-sm font-medium">%</span>
                                                </div>
                                            )}
                                        </div>
                                        <p className="mt-1 text-xs text-gray-500">
                                            {formData.kategori === 'persentase' 
                                                ? 'Contoh: 2.5 untuk 2.5%' 
                                                : 'Contoh: 50000 untuk Rp 50.000'}
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

                                    {/* Status Settings */}
                                    <div className="space-y-3">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Pengaturan Status
                                        </label>
                                        
                                        {/* Is Active */}
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

                                        {/* Is View */}
                                        <div className="flex items-center gap-3 p-3 bg-blue-50 rounded-md border border-blue-200">
                                            <input
                                                type="checkbox"
                                                id="is_view"
                                                checked={formData.is_view}
                                                onChange={(e) => setFormData({ ...formData, is_view: e.target.checked })}
                                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                            />
                                            <div className="flex-1">
                                                <label htmlFor="is_view" className="block text-sm font-medium text-gray-900 cursor-pointer">
                                                    Tampilkan di View
                                                </label>
                                                <p className="text-xs text-gray-500 mt-0.5">
                                                    Data ditampilkan di halaman frontend user
                                                </p>
                                            </div>
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
