'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Edit, Trash2, X, Save, Percent, Calendar, Clock, Layers } from 'lucide-react';
import { PotonganJangkaWaktu, CreatePotonganJangkaWaktuDTO, UpdatePotonganJangkaWaktuDTO } from '../core/Entity';
import { PotonganJangkaWaktuRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new PotonganJangkaWaktuRepositoryImpl();

// Interface
interface ListViewProps {
    data: PotonganJangkaWaktu[];
    openCreateModal: () => void;
    openEditModal: (item: PotonganJangkaWaktu) => void;
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
                <h1 className="text-xl font-bold text-slate-800">Jangka Waktu</h1>
                <div className="text-xs bg-indigo-50 text-indigo-600 px-2 py-1 rounded-lg font-bold">
                    {data.length} Data
                </div>
            </div>

            <div className="space-y-3">
                {data.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                            <Clock className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data ditemukan</p>
                    </div>
                ) : (
                    data.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                            <div className="flex justify-between items-start gap-3 mb-2">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                                        <Calendar className="w-4 h-4" />
                                    </div>
                                    <div>
                                        <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wide">Rentang</h4>
                                        <p className="font-bold text-slate-800">{item.min_bulan} - {item.max_bulan} Bulan</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(item)} className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-slate-50">
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">Potongan</p>
                                    <div className="flex items-center gap-1.5 font-bold text-indigo-600">
                                        <Percent className="w-3.5 h-3.5" />
                                        {item.potongan_persen}%
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] uppercase text-slate-400 font-semibold mb-0.5">Status</p>
                                    <span className={`text-xs font-bold ${item.is_active ? 'text-emerald-600' : 'text-slate-500'}`}>
                                        {item.is_active ? 'Aktif' : 'Nonaktif'}
                                    </span>
                                </div>
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
    data, openCreateModal, openEditModal, handleDelete,
    page, setPage, total, limit, totalPages
}: ListViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Potongan Jangka Waktu</h1>
                <p className="mt-2 text-sm text-gray-700">Kelola data master potongan berdasarkan jangka waktu pembiayaan</p>
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
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rentang Waktu</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Potongan</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Deskripsi</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {data.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data</td></tr>
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
                                        <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${item.is_active ? 'bg-green-50 text-green-700 ring-1 ring-inset ring-green-600/20' : 'bg-gray-50 text-gray-700 ring-1 ring-inset ring-gray-600/20'}`}>
                                            {item.is_active ? 'Aktif' : 'Nonaktif'}
                                        </span>
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
            {/* Pagination Component - reused logic */}
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
export const PotonganJangkaWaktuList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<PotonganJangkaWaktu[]>([]);
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(100);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingItem, setEditingItem] = useState<PotonganJangkaWaktu | null>(null);
    const [formData, setFormData] = useState({ min_bulan: 0, max_bulan: 0, potongan_persen: 0, description: '', is_active: true });

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
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

    const openCreateModal = () => { setEditingItem(null); setFormData({ min_bulan: 0, max_bulan: 0, potongan_persen: 0, description: '', is_active: true }); setIsModalOpen(true); };
    const openEditModal = (item: PotonganJangkaWaktu) => { setEditingItem(item); setFormData({ min_bulan: item.min_bulan || 0, max_bulan: item.max_bulan || 0, potongan_persen: item.potongan_persen || 0, description: item.description || '', is_active: item.is_active ?? true }); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingItem(null); setFormData({ min_bulan: 0, max_bulan: 0, potongan_persen: 0, description: '', is_active: true }); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.min_bulan <= 0 || formData.max_bulan <= 0) { showError('Rentang bulan harus lebih dari 0'); return; }
        if (formData.min_bulan > formData.max_bulan) { showError('Bulan minimum tidak boleh lebih besar dari bulan maksimum'); return; }
        if (formData.potongan_persen <= 0 || formData.potongan_persen > 100) { showError('Potongan persen harus antara 0-100'); return; }
        try {
            showLoading(editingItem ? 'Mengupdate data...' : 'Menambahkan data...');
            if (editingItem) { await repository.update(editingItem.id, formData as UpdatePotonganJangkaWaktuDTO); hideLoading(); await showSuccess('Data berhasil diupdate'); }
            else { await repository.create(formData as CreatePotonganJangkaWaktuDTO); hideLoading(); await showSuccess('Data berhasil ditambahkan'); }
            closeModal();
            fetchData();
        } catch (error: any) {
            hideLoading(); showError(handleError(error, 'Gagal menyimpan data'));
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
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Min Bulan <span className="text-red-500">*</span></label>
                                            <input type="number" required min="1" value={formData.min_bulan} onChange={(e) => setFormData({ ...formData, min_bulan: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="6" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Max Bulan <span className="text-red-500">*</span></label>
                                            <input type="number" required min="1" value={formData.max_bulan} onChange={(e) => setFormData({ ...formData, max_bulan: parseInt(e.target.value) || 0 })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="12" />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Potongan (%) <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <input type="number" required min="0.01" max="100" step="0.01" value={formData.potongan_persen} onChange={(e) => setFormData({ ...formData, potongan_persen: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-2.5 pr-10 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-slate-500 font-bold">%</div>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
                                        <textarea rows={3} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" />
                                    </div>
                                    <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-lg">
                                        <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                        <span className="text-sm font-medium text-slate-700">Status Aktif</span>
                                    </label>
                                </div>
                                <div className="mt-8 flex items-center justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:scale-95 transition-all">Batal</button>
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"><Save className="h-4 w-4" /> Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
