'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Percent, DollarSign, Layers } from 'lucide-react';
import { Potongan, CreatePotonganDTO, UpdatePotonganDTO } from '../core/Entity';
import { PotonganRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new PotonganRepositoryImpl();

// Helpers
const formatNilai = (nilai: number, kategori: string) => {
    if (kategori === 'nominal') {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(nilai);
    }
    return `${nilai}%`;
};

// Interface Shared
interface ListViewProps {
    data: Potongan[];
    openCreateModal: () => void;
    openEditModal: (item: Potongan) => void;
    handleDelete: (id: string) => void;
    page: number;
    setPage: (p: number) => void;
    total: number;
    limit: number;
    totalPages: number;
}

// --- Mobile View ---
const MobileView = ({ data, openCreateModal, openEditModal, handleDelete }: ListViewProps) => (
    <MobileLayoutWrapper>
        <div className="pt-6 px-4 pb-24">
            <div className="mb-5 flex justify-between items-center">
                <h1 className="text-xl font-bold text-slate-800">Master Potongan</h1>
                <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold">
                    {data.length} Data
                </div>
            </div>

            <div className="space-y-3">
                {data.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                            <Layers className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                            <div className="flex justify-between items-start gap-4">
                                <div className="flex-1">
                                    <div className="flex items-center gap-2 mb-1">
                                        <h3 className="font-bold text-slate-800 text-base">{item.nama_potongan}</h3>
                                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${item.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}`}>
                                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
                                    </div>
                                    <p className="text-xs text-slate-500 line-clamp-2">{item.description || 'Tidak ada deskripsi'}</p>
                                </div>
                                <div className="shrink-0 flex gap-2">
                                    <button onClick={() => openEditModal(item)} className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="pt-3 border-t border-slate-50 flex items-center justify-between text-sm">
                                <div className="flex items-center gap-2 text-slate-600">
                                    <span className={`p-1 rounded-md ${item.kategori === 'nominal' ? 'bg-emerald-50 text-emerald-600' : 'bg-blue-50 text-blue-600'}`}>
                                        {item.kategori === 'nominal' ? <DollarSign className="w-3.5 h-3.5" /> : <Percent className="w-3.5 h-3.5" />}
                                    </span>
                                    <span className="font-medium capitalize">{item.kategori}</span>
                                </div>
                                <span className="font-bold text-slate-800 text-base">
                                    {formatNilai(item.persentase_nominal, item.kategori)}
                                </span>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={openCreateModal}
                className="fixed bottom-24 right-5 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    </MobileLayoutWrapper>
);

// --- Desktop View ---
const DesktopView = ({
    data, openCreateModal, openEditModal, handleDelete,
    page, setPage, total, limit, totalPages
}: ListViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Potongan</h1>
                <p className="mt-2 text-sm text-gray-700">Kelola data master potongan (nominal atau persentase)</p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <Plus className="h-5 w-5" /> Tambah Data
                </button>
            </div>
        </div>

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
                            <tr><td colSpan={7} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td></tr>
                        ) : (
                            data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-medium text-gray-900">{item.nama_potongan}</div></td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${item.kategori === 'nominal' ? 'bg-emerald-50 text-emerald-700 ring-1 ring-inset ring-emerald-600/20' : 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20'}`}>
                                            {item.kategori === 'nominal' ? <DollarSign className="h-3.5 w-3.5" /> : <Percent className="h-3.5 w-3.5" />}
                                            {item.kategori === 'nominal' ? 'Nominal' : 'Persentase'}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap"><div className="text-sm font-semibold text-gray-900">{formatNilai(item.persentase_nominal, item.kategori)}</div></td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{item.description || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.is_active ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}>{item.is_active ? 'Aktif' : 'Nonaktif'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${(item.is_view ?? true) ? 'bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}>{(item.is_view ?? true) ? 'Tampil' : 'Tersembunyi'}</span>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(item)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="h-4 w-4 inline" /></button>
                                        <button onClick={() => handleDelete(item.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4 inline" /></button>
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
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- Main Container ---
export const PotonganList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<Potongan[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(100);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<Potongan | null>(null);
    const [formData, setFormData] = useState({ nama_potongan: '', persentase_nominal: 0, kategori: 'persentase' as 'persentase' | 'nominal', description: '', is_active: true, is_view: true });

    useEffect(() => {
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
        setFormData({ nama_potongan: '', persentase_nominal: 0, kategori: 'persentase', description: '', is_active: true, is_view: true });
        setIsModalOpen(true);
    };

    const openEditModal = (item: Potongan) => {
        setEditingItem(item);
        setFormData({ nama_potongan: item.nama_potongan || '', persentase_nominal: item.persentase_nominal || 0, kategori: item.kategori || 'persentase', description: item.description || '', is_active: item.is_active ?? true, is_view: item.is_view ?? true });
        setIsModalOpen(true);
    };

    const closeModal = () => { setIsModalOpen(false); setEditingItem(null); setFormData({ nama_potongan: '', persentase_nominal: 0, kategori: 'persentase', description: '', is_active: true, is_view: true }); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.nama_potongan.trim()) { showError('Nama potongan harus diisi'); return; }
        if (formData.persentase_nominal <= 0) { showError('Nilai harus lebih dari 0'); return; }
        if (formData.kategori === 'persentase' && formData.persentase_nominal > 100) { showError('Nilai persentase tidak boleh lebih dari 100%'); return; }
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

    const totalPages = Math.ceil(total / limit);
    const viewProps = { data, openCreateModal, openEditModal, handleDelete, page, setPage, total, limit, totalPages };

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
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Potongan <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.nama_potongan} onChange={(e) => setFormData({ ...formData, nama_potongan: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Masukkan nama..." />
                                    </div>

                                    <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
                                        <label className="block text-xs font-bold text-gray-700 mb-2 uppercase tracking-wide">Kategori</label>
                                        <div className="grid grid-cols-2 gap-3">
                                            <button type="button" onClick={() => setFormData({ ...formData, kategori: 'persentase', persentase_nominal: 0 })} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData.kategori === 'persentase' ? 'border-indigo-500 bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                                <Percent className={`h-6 w-6 mb-1 ${formData.kategori === 'persentase' ? 'text-indigo-600' : 'text-slate-400'}`} />
                                                <span className={`text-xs font-bold ${formData.kategori === 'persentase' ? 'text-indigo-700' : 'text-slate-500'}`}>Persentase</span>
                                            </button>
                                            <button type="button" onClick={() => setFormData({ ...formData, kategori: 'nominal', persentase_nominal: 0 })} className={`flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all ${formData.kategori === 'nominal' ? 'border-emerald-500 bg-white shadow-sm' : 'border-transparent hover:bg-white/50'}`}>
                                                <DollarSign className={`h-6 w-6 mb-1 ${formData.kategori === 'nominal' ? 'text-emerald-600' : 'text-slate-400'}`} />
                                                <span className={`text-xs font-bold ${formData.kategori === 'nominal' ? 'text-emerald-700' : 'text-slate-500'}`}>Nominal</span>
                                            </button>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nilai ({formData.kategori}) <span className="text-red-500">*</span></label>
                                        <input type="number" required min={formData.kategori === 'persentase' ? "0.01" : "1"} max={formData.kategori === 'persentase' ? "100" : undefined} step={formData.kategori === 'persentase' ? "0.01" : "1"} value={formData.persentase_nominal} onChange={(e) => setFormData({ ...formData, persentase_nominal: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
                                        <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                                    </div>

                                    <div className="flex gap-4">
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm font-medium text-slate-700">Aktif</span>
                                        </label>
                                        <label className="flex items-center gap-2 cursor-pointer">
                                            <input type="checkbox" checked={formData.is_view} onChange={(e) => setFormData({ ...formData, is_view: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                            <span className="text-sm font-medium text-slate-700">Tampil di View</span>
                                        </label>
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
