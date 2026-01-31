'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, CheckCircle, XCircle, X, Save, Building2, MapPin, Phone, Layers } from 'lucide-react';
import { Unit, CreateUnitDTO, UpdateUnitDTO } from '../core/UnitEntity';
import { UnitRepositoryImpl } from '../data/UnitRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const unitRepository = new UnitRepositoryImpl();

// Interface
interface ListViewProps {
    units: Unit[];
    search: string;
    setSearch: (val: string) => void;
    openCreateModal: () => void;
    openEditModal: (unit: Unit) => void;
    handleDelete: (id: number) => void;
    page: number;
    setPage: (p: number) => void;
    total: number;
    limit: number;
    totalPages: number;
    handleSearch: (e: React.FormEvent) => void;
}

// --- Mobile View ---
const MobileView = ({
    units, search, setSearch, openCreateModal, openEditModal, handleDelete
}: ListViewProps) => (
    <MobileLayoutWrapper>
        <div className="pt-6 px-4 pb-24">
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Master Unit</h1>
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Cari unit..."
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
                    />
                </div>
            </div>

            <div className="space-y-3">
                {units.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                            <Building2 className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada data unit</p>
                    </div>
                ) : (
                    units.map((unit) => (
                        <div key={unit.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                            <div className="flex items-start gap-4">
                                <div className="p-3 bg-indigo-50 rounded-xl text-indigo-600 shrink-0">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex justify-between items-start">
                                        <h3 className="font-bold text-slate-800 text-base">{unit.name}</h3>
                                        <div className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${unit.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {unit.is_active ? 'AKTIF' : 'NONAKTIF'}
                                        </div>
                                    </div>
                                    <p className="text-xs font-mono text-slate-500 mt-0.5 bg-slate-100 inline-block px-1.5 py-0.5 rounded">{unit.code}</p>

                                    <div className="mt-2 text-xs text-slate-500 space-y-1">
                                        {unit.address && (
                                            <div className="flex items-center gap-1.5 align-top">
                                                <MapPin className="w-3.5 h-3.5 shrink-0" />
                                                <span className="truncate">{unit.address}</span>
                                            </div>
                                        )}
                                        {unit.phone && (
                                            <div className="flex items-center gap-1.5">
                                                <Phone className="w-3.5 h-3.5 shrink-0" />
                                                <span>{unit.phone}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-2 pt-2 border-t border-slate-50 justify-end">
                                <button onClick={() => openEditModal(unit)} className="flex-1 py-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100 text-xs font-bold flex justify-center items-center gap-2">
                                    <Edit className="w-4 h-4" /> Edit
                                </button>
                                <button onClick={() => handleDelete(unit.id)} className="flex-1 py-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100 text-xs font-bold flex justify-center items-center gap-2">
                                    <Trash2 className="w-4 h-4" /> Hapus
                                </button>
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
    units, search, setSearch, openCreateModal, openEditModal, handleDelete,
    page, setPage, total, limit, totalPages, handleSearch
}: ListViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
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
                <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                    <Plus className="h-5 w-5" /> Tambah Unit
                </button>
            </div>
        </div>

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
                            <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-500">Tidak ada data unit</td></tr>
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
                                                <CheckCircle className="h-3 w-3" /> Aktif
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center gap-1 rounded-full bg-red-50 px-2 py-1 text-xs font-medium text-red-700">
                                                <XCircle className="h-3 w-3" /> Nonaktif
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(unit)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="h-4 w-4 inline" /></button>
                                        <button onClick={() => handleDelete(unit.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4 inline" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Desktop */}
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
export const UnitList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [units, setUnits] = useState<Unit[]>([]);
    const [search, setSearch] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUnit, setEditingUnit] = useState<Unit | null>(null);
    const [formData, setFormData] = useState({ code: '', name: '', description: '', address: '', phone: '', is_active: true });

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
        fetchUnits();
    }, [page, user]);

    // Live search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) fetchUnits();
            else setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUnits = async () => {
        try {
            showLoading('Memuat data unit...');
            const response = await unitRepository.getAll(search, page, limit);
            setUnits(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal memuat data unit')); }
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUnits(); };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus unit ini?');
        if (!confirmed) return;
        try {
            showLoading('Menghapus unit...');
            await unitRepository.delete(id);
            hideLoading();
            await showSuccess('Unit berhasil dihapus');
            fetchUnits();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal menghapus unit')); }
    };

    const openCreateModal = () => { setEditingUnit(null); setFormData({ code: '', name: '', description: '', address: '', phone: '', is_active: true }); setIsModalOpen(true); };
    const openEditModal = async (unit: Unit) => { setEditingUnit(unit); setFormData({ code: unit.code, name: unit.name, description: unit.description || '', address: unit.address || '', phone: unit.phone || '', is_active: unit.is_active }); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingUnit(null); setFormData({ code: '', name: '', description: '', address: '', phone: '', is_active: true }); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.name.trim()) { showError('Nama unit harus diisi'); return; }
        try {
            showLoading(editingUnit ? 'Mengupdate unit...' : 'Menambahkan unit...');
            if (editingUnit) { await unitRepository.update(editingUnit.id, formData as UpdateUnitDTO); hideLoading(); await showSuccess('Unit berhasil diupdate'); }
            else { await unitRepository.create(formData as CreateUnitDTO); hideLoading(); await showSuccess('Unit berhasil ditambahkan'); }
            closeModal();
            fetchUnits();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal menyimpan data unit')); }
    };

    const totalPages = Math.ceil(total / limit);
    const viewProps = { units, search, setSearch, openCreateModal, openEditModal, handleDelete, page, setPage, total, limit, totalPages, handleSearch };

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
                                <h3 className="text-base font-bold text-gray-900">{editingUnit ? 'Edit Unit' : 'Tambah Unit'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Kode Unit <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.code} onChange={(e) => setFormData({ ...formData, code: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:bg-slate-50 disabled:text-slate-500" placeholder="Contoh: JKT-PST" disabled={!!editingUnit} />
                                        {editingUnit && <p className="mt-1 text-[10px] text-gray-500 font-medium">Kode tidak dapat diubah</p>}
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Unit <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="Contoh: Unit Cabang Jakarta" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Alamat</label>
                                        <textarea rows={2} value={formData.address} onChange={(e) => setFormData({ ...formData, address: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Alamat lengkap..." />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Telepon</label>
                                            <input type="tel" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" placeholder="021-12345678" />
                                        </div>
                                        <div className="flex items-center pt-6">
                                            <label className="flex items-center gap-2 cursor-pointer p-2 bg-slate-50 rounded-lg w-full">
                                                <input type="checkbox" checked={formData.is_active} onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })} className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500" />
                                                <span className="text-sm font-medium text-slate-700">Status Aktif</span>
                                            </label>
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Deskripsi</label>
                                        <textarea rows={2} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none" placeholder="Deskripsi singkat..." />
                                    </div>
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
