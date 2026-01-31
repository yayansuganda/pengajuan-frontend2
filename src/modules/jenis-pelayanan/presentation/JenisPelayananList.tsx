'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, X, Save, Briefcase, FileText } from 'lucide-react';
import { JenisPelayanan, CreateJenisPelayananDTO, UpdateJenisPelayananDTO } from '../core/Entity';
import { JenisPelayananRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Import Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new JenisPelayananRepositoryImpl();

// --- Components Interface --- (Shared structure)
interface ListViewProps {
    data: JenisPelayanan[];
    search: string;
    setSearch: (val: string) => void;
    openCreateModal: () => void;
    openEditModal: (item: JenisPelayanan) => void;
    handleDelete: (id: string) => void;
    page: number;
    setPage: (p: number) => void;
    total: number;
    limit: number;
    totalPages: number;
    handleSearchSubmit: (e: React.FormEvent) => void;
}

// --- Mobile View ---
const MobileView = ({
    data, search, setSearch, openCreateModal, openEditModal, handleDelete
}: ListViewProps) => (
    <MobileLayoutWrapper>
        <div className="pt-6 px-4 pb-24">
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Jenis Pelayanan</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari data..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {data.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                            <Briefcase className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-start gap-3 active:bg-slate-50 transition-colors">
                            <div className="p-2.5 bg-blue-50 rounded-lg text-blue-600 shrink-0">
                                <Briefcase className="w-5 h-5" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="font-bold text-slate-800 truncate">{item.name}</h3>
                                <p className="text-sm text-slate-500 mt-0.5 line-clamp-2">{item.description || 'Tidak ada deskripsi'}</p>
                            </div>
                            <div className="flex flex-col gap-2">
                                <button onClick={() => openEditModal(item)} className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100">
                                    <Edit className="w-4 h-4" />
                                </button>
                                <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100">
                                    <Trash2 className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={openCreateModal}
                className="fixed bottom-24 right-5 h-14 w-14 bg-indigo-600 rounded-full shadow-lg shadow-indigo-600/30 flex items-center justify-center text-white z-40 hover:bg-indigo-700 active:scale-95 transition-all"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    </MobileLayoutWrapper>
);

// --- Desktop View ---
const DesktopView = ({
    data, search, setSearch, openCreateModal, openEditModal, handleDelete,
    page, setPage, total, limit, totalPages, handleSearchSubmit
}: ListViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Jenis Pelayanan</h1>
                <p className="mt-2 text-sm text-gray-700">
                    Kelola data master jenis pelayanan
                </p>
            </div>
        </div>

        {/* Search & Create */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <form onSubmit={handleSearchSubmit} className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari..."
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
                    Tambah
                </button>
            </div>
        </div>

        {/* Table */}
        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr>
                                <td colSpan={3} className="px-6 py-12 text-center text-gray-500">
                                    Tidak ada data
                                </td>
                            </tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4">
                                            <Edit className="h-4 w-4 inline" />
                                        </button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900">
                                            <Trash2 className="h-4 w-4 inline" />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Desktop Pagination */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Menampilkan <span className="font-medium">{(page - 1) * limit + 1}</span> sampai <span className="font-medium">{Math.min(page * limit, total)}</span> dari <span className="font-medium">{total}</span> hasil
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${p === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- Main Container ---
export const JenisPelayananList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<JenisPelayanan[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<JenisPelayanan | null>(null);
    const [formData, setFormData] = useState({ name: '', description: '' });

    useEffect(() => {
        if (user && user.role !== 'super-admin') {
            router.push('/dashboard');
            return;
        }
        fetchData();
    }, [page, user]);

    // Live search debounce
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) fetchData();
            else setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        try {
            showLoading('Memuat data...');
            const response = await repository.getAll(search, page, limit);
            setData(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal memuat data'));
        }
    };

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setPage(1);
        fetchData();
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
        setFormData({ name: '', description: '' });
        setIsModalOpen(true);
    };

    const openEditModal = (item: JenisPelayanan) => {
        setEditingItem(item);
        setFormData({ name: item.name, description: item.description || '' });
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingItem(null);
        setFormData({ name: '', description: '' });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) {
            showError('Nama harus diisi');
            return;
        }
        try {
            showLoading(editingItem ? 'Mengupdate data...' : 'Menambahkan data...');
            if (editingItem) {
                await repository.update(editingItem.id, formData as UpdateJenisPelayananDTO);
                hideLoading();
                await showSuccess('Data berhasil diupdate');
            } else {
                await repository.create(formData as CreateJenisPelayananDTO);
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
    const viewProps = { data, search, setSearch, openCreateModal, openEditModal, handleDelete, page, setPage, total, limit, totalPages, handleSearchSubmit };

    return (
        <>
            <div className="md:hidden"><MobileView {...viewProps} /></div>
            <div className="hidden md:block"><DesktopView {...viewProps} /></div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-base font-bold text-gray-900">{editingItem ? 'Edit Data' : 'Tambah Data'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label htmlFor="name" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama <span className="text-red-500">*</span></label>
                                        <input type="text" id="name" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow" placeholder="Masukkan nama..." />
                                    </div>
                                    <div>
                                        <label htmlFor="description" className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
                                        <textarea id="description" rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none transition-shadow" placeholder="Tambahkan deskripsi (opsional)..." />
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:scale-95 transition-all">Batal</button>
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"><Save className="h-4 w-4" /> Simpan Data</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
