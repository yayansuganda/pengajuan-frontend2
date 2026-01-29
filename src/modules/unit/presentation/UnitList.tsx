'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, X, Save } from 'lucide-react';
import { Unit, CreateUnitDTO, UpdateUnitDTO } from '../core/UnitEntity';
import { UnitRepositoryImpl } from '../data/UnitRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const unitRepository = new UnitRepositoryImpl();

export const UnitList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [units, setUnits] = useState<Unit[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        address: '',
        phone: '',
        is_active: true,
    });

    useEffect(() => {
        // Redirect if not super-admin
        if (user && user.role !== 'super-admin') {
            router.push('/dashboard');
            return;
        }
        fetchUnits();
    }, [page, user]);

    const fetchUnits = async () => {
        try {
            showLoading('Memuat data unit...');
            const response = await unitRepository.getAll(search, page, limit);
            setUnits(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal memuat data unit'));
        }
    };

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchUnits();
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus unit ini?');
        if (!confirmed) return;

        try {
            showLoading('Menghapus unit...');
            await unitRepository.delete(id);
            hideLoading();
            await showSuccess('Unit berhasil dihapus');
            fetchUnits();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal menghapus unit'));
        }
    };

    const openCreateModal = () => {
        setEditingUnit(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            address: '',
            phone: '',
            is_active: true,
        });
        setIsModalOpen(true);
    };

    const openEditModal = async (unit: Unit) => {
        setEditingUnit(unit);
        setFormData({
            code: unit.code,
            name: unit.name,
            description: unit.description || '',
            address: unit.address || '',
            phone: unit.phone || '',
            is_active: unit.is_active,
        });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUnit(null);
        setFormData({
            code: '',
            name: '',
            description: '',
            address: '',
            phone: '',
            is_active: true,
        });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            showError('Nama unit harus diisi');
            return;
        }

        try {
            showLoading(editingUnit ? 'Mengupdate unit...' : 'Menambahkan unit...');

            if (editingUnit) {
                // Update
                await unitRepository.update(editingUnit.id, formData as UpdateUnitDTO);
                hideLoading();
                await showSuccess('Unit berhasil diupdate');
            } else {
                // Create
                await unitRepository.create(formData as CreateUnitDTO);
                hideLoading();
                await showSuccess('Unit berhasil ditambahkan');
            }

            closeModal();
            fetchUnits();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal menyimpan data unit'));
        }
    };

    const totalPages = Math.ceil(total / limit);

    return (
        <div className="px-4 sm:px-6 lg:px-8">

            {/* Search & Create */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                    <form onSubmit={handleSearch} className="flex-1 max-w-md">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                placeholder="Cari nama unit..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                className="pl-9 w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                            />
                        </div>
                    </form>
                    <button
                        onClick={openCreateModal}
                        className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500"
                    >
                        <Plus className="h-5 w-5" />
                        Tambah Unit
                    </button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Kode</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Alamat</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Telepon</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {units.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        Tidak ada data unit
                                    </td>
                                </tr>
                            ) : (
                                units.map((unit) => (
                                    <tr key={unit.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-600">{unit.code}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{unit.name}</td>
                                        <td className="px-6 py-4 text-sm text-gray-500">{unit.address || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{unit.phone || '-'}</td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {unit.is_active ? (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-1 text-xs font-medium text-green-700">
                                                    <CheckCircle className="h-3 w-3" />
                                                    Aktif
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                    <XCircle className="h-3 w-3" />
                                                    Nonaktif
                                                </span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                onClick={() => openEditModal(unit)}
                                                className="text-indigo-600 hover:text-indigo-900 mr-4"
                                            >
                                                <Edit className="h-4 w-4 inline" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(unit.id)}
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
                        {/* Transparent Backdrop */}
                        <div className="fixed inset-0" onClick={closeModal}></div>

                        {/* Modal */}
                        <div className="relative bg-white rounded-lg shadow-xl max-w-lg w-full">
                            {/* Header */}
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
                                <h3 className="text-base font-semibold text-gray-900">
                                    {editingUnit ? 'Edit Unit' : 'Tambah Unit Baru'}
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
                                <div className="space-y-3">
                                    {/* Code */}
                                    <div>
                                        <label htmlFor="code" className="block text-xs font-medium text-gray-700 mb-1">
                                            Kode Unit <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="code"
                                            required
                                            value={formData.code}
                                            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Contoh: JKT-PST"
                                            disabled={!!editingUnit}
                                        />
                                        {editingUnit && (
                                            <p className="mt-1 text-xs text-gray-500">Kode tidak dapat diubah</p>
                                        )}
                                    </div>

                                    {/* Name */}
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-medium text-gray-700 mb-1">
                                            Nama Unit <span className="text-red-500">*</span>
                                        </label>
                                        <input
                                            type="text"
                                            id="name"
                                            required
                                            value={formData.name}
                                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="Contoh: Unit Cabang Jakarta"
                                        />
                                    </div>

                                    {/* Description */}
                                    <div>
                                        <label htmlFor="description" className="block text-xs font-medium text-gray-700 mb-1">
                                            Deskripsi
                                        </label>
                                        <textarea
                                            id="description"
                                            rows={2}
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            placeholder="Deskripsi singkat..."
                                        />
                                    </div>

                                    {/* Address */}
                                    <div>
                                        <label htmlFor="address" className="block text-xs font-medium text-gray-700 mb-1">
                                            Alamat
                                        </label>
                                        <textarea
                                            id="address"
                                            rows={2}
                                            value={formData.address}
                                            onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                            placeholder="Alamat lengkap..."
                                        />
                                    </div>

                                    {/* Phone */}
                                    <div>
                                        <label htmlFor="phone" className="block text-xs font-medium text-gray-700 mb-1">
                                            Telepon
                                        </label>
                                        <input
                                            type="tel"
                                            id="phone"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                            className="w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                            placeholder="021-12345678"
                                        />
                                    </div>

                                    {/* Is Active */}
                                    <div className="flex items-center pt-1">
                                        <input
                                            type="checkbox"
                                            id="is_active"
                                            checked={formData.is_active}
                                            onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                            className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <label htmlFor="is_active" className="ml-2 block text-xs text-gray-700">
                                            Unit Aktif
                                        </label>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="mt-4 flex items-center justify-end gap-2">
                                    <button
                                        type="button"
                                        onClick={closeModal}
                                        className="rounded-md bg-white px-3 py-1.5 text-xs font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                                    >
                                        Batal
                                    </button>
                                    <button
                                        type="submit"
                                        className="inline-flex items-center gap-1.5 rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-indigo-500"
                                    >
                                        <Save className="h-3 w-3" />
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
