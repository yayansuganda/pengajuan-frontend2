'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Calendar, FileText, ChevronRight, Briefcase } from 'lucide-react';
import { Pengajuan, PengajuanFilter } from '../core/PengajuanEntity';
import { PengajuanRepositoryImpl } from '../data/PengajuanRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
// Components
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new PengajuanRepositoryImpl();

// Interface
interface ViewProps {
    data: Pengajuan[];
    search: string;
    setSearch: (val: string) => void;
    statusFilter: string;
    setStatusFilter: (val: string) => void;
    dateFilter: string;
    setDateFilter: (val: string) => void;
    isLoading: boolean;
    router: any;
    user: any;
}

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Proses Persetujuan', label: 'Proses' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Ditolak', label: 'Ditolak' },
    { value: 'Pencairan', label: 'Pencairan' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Disetujui': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Pencairan': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Ditolak': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'Proses Persetujuan': return 'bg-amber-100 text-amber-700 border-amber-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0
    }).format(value);
};

const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('id-ID', {
        day: 'numeric',
        month: 'short',
        year: 'numeric'
    });
};

// --- Mobile View ---
const MobileView = ({ data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router }: ViewProps) => (
    <MobileLayoutWrapper showBackground={false}>
        {/* Layer 1: Full Page Background */}
        <div className="fixed inset-0 z-0 pointer-events-none">
            <img src="/images/loan_header_bg.png" alt="bg" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
        </div>

        {/* Layer 2: 30% Header Background */}
        <div className="fixed top-0 left-0 right-0 h-[250px] z-0 overflow-hidden rounded-b-3xl pointer-events-none">
            <img src="/images/loan_header_bg.png" alt="header" className="w-full h-full object-cover object-center" />
        </div>

        <div className="relative z-10 pt-4 px-4 pb-24 h-full flex flex-col">
            {/* Header & Filter Section */}
            <div className="flex-none mb-4 gap-3 flex flex-col">
                <div className="flex justify-between items-center">
                    <h1 className="text-lg font-bold text-slate-800">Daftar Pengajuan</h1>
                    <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                        Total: {data.length}
                    </div>
                </div>

                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100 space-y-3">
                    {/* Search Bar */}
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari Nama / NIK..."
                            className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                        />
                    </div>

                    {/* Filters Row */}
                    <div className="flex gap-2">
                        <div className="relative flex-1">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="w-full pl-3 pr-8 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 appearance-none focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                            >
                                {STATUS_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                            {/* Custom Arrow */}
                            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                                <svg className="w-3 h-3 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7"></path></svg>
                            </div>
                        </div>

                        <div className="relative flex-1">
                            <input
                                type="date"
                                value={dateFilter}
                                onChange={(e) => setDateFilter(e.target.value)}
                                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-medium text-slate-600 focus:bg-white focus:ring-2 focus:ring-indigo-500 transition-colors"
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* List Content */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pb-20 -mx-4 px-4">
                {isLoading ? (
                    <div className="space-y-2">
                        {[1, 2, 3, 4].map(i => <div key={i} className="h-20 bg-white rounded-lg border border-slate-100 animate-pulse" />)}
                    </div>
                ) : data.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-16 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm font-medium">Data tidak ditemukan</p>
                    </div>
                ) : (
                    data.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/pengajuan/${item.id}`)}
                            className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 mr-2">{item.nama_lengkap}</h3>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider border whitespace-nowrap ${getStatusColor(item.status)}`}>
                                    {item.status}
                                </span>
                            </div>

                            <div className="flex items-end justify-between">
                                <div className="space-y-0.5">
                                    <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                        <Calendar className="w-3 h-3" />
                                        <span>{formatDate(item.created_at)}</span>
                                    </div>
                                    {item.unit && (
                                        <div className="flex items-center gap-1.5 text-xs text-slate-500">
                                            <Briefcase className="w-3 h-3" />
                                            <span className="truncate max-w-[120px]">{item.unit}</span>
                                        </div>
                                    )}
                                </div>
                                <div className="text-right">
                                    <p className="text-[10px] text-slate-400 font-medium uppercase">Nominal</p>
                                    <p className="text-sm font-bold text-indigo-600">{formatCurrency(item.jumlah_pembiayaan)}</p>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* FAB */}
            <button
                onClick={() => router.push('/pengajuan/create')}
                className="fixed bottom-24 right-5 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    </MobileLayoutWrapper>
);

// --- Desktop View ---
const DesktopView = ({ data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router }: ViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Daftar Pengajuan</h1>
                <p className="mt-2 text-sm text-gray-700">Kelola data pengajuan pembiayaan</p>
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
                <button
                    onClick={() => router.push('/pengajuan/create')}
                    className="block rounded-md bg-indigo-600 px-3 py-2 text-center text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
                >
                    Buat Pengajuan
                </button>
            </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="col-span-1 md:col-span-2 relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Cari nama atau NIK..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
                <div className="col-span-1">
                    <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        {STATUS_OPTIONS.map((opt) => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1">
                    <input
                        type="date"
                        value={dateFilter}
                        onChange={(e) => setDateFilter(e.target.value)}
                        className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>
            </div>
        </div>

        {/* Table Content */}
        <div className="mt-8 flow-root">
            <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
                <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
                    <div className="overflow-hidden shadow ring-1 ring-black ring-opacity-5 sm:rounded-lg">
                        <table className="min-w-full divide-y divide-gray-300">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Pemohon</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Nominal</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                                    <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                    <th className="relative py-3.5 pl-3 pr-4 sm:pr-6"><span className="sr-only">Detail</span></th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                                {isLoading ? (
                                    <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">Memuat data...</td></tr>
                                ) : data.length === 0 ? (
                                    <tr><td colSpan={6} className="px-3 py-10 text-center text-sm text-gray-500">Tidak ada pengajuan</td></tr>
                                ) : (
                                    data.map((item) => (
                                        <tr key={item.id} className="hover:bg-gray-50 cursor-pointer" onClick={() => router.push(`/pengajuan/${item.id}`)}>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <div className="font-medium text-gray-900">{item.nama_lengkap}</div>
                                                <div className="text-gray-500">{item.nik}</div>
                                            </td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.unit || '-'}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm font-medium text-gray-900">{formatCurrency(item.jumlah_pembiayaan)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{formatDate(item.created_at)}</td>
                                            <td className="whitespace-nowrap px-3 py-4 text-sm">
                                                <span className={`inline-flex rounded-full px-2 text-xs font-semibold leading-5 ${getStatusColor(item.status).replace('border', '')}`}>
                                                    {item.status}
                                                </span>
                                            </td>
                                            <td className="relative whitespace-nowrap py-4 pl-3 pr-4 text-right text-sm font-medium sm:pr-6">
                                                <span className="text-indigo-600 hover:text-indigo-900">Detail</span>
                                            </td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    </div>
);

// --- Main Container ---
export const PengajuanList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<Pengajuan[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, [statusFilter, dateFilter]); // Fetch immediately on select change

    useEffect(() => {
        const timer = setTimeout(() => {
            fetchData(); // Fetch debounce on text search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        try {
            setIsLoading(true);
            const filter: PengajuanFilter = {};
            if (search) filter.search = search;
            if (statusFilter) filter.status = statusFilter;
            // Assuming backend supports 'date' or we filter client side.
            // Sending as custom param if supported or just ignoring if not.
            // If client side filtering needed:

            const result = await repository.getPengajuanList(filter);

            let filteredResult = result;
            if (dateFilter) {
                // Client side date filtering as basic implementation
                filteredResult = result.filter(item => item.created_at.startsWith(dateFilter));
            }

            setData(filteredResult);
            setIsLoading(false);
        } catch (error: any) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const viewProps = { data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router, user };

    return (
        <>
            <div className="md:hidden"><MobileView {...viewProps} /></div>
            <div className="hidden md:block"><DesktopView {...viewProps} /></div>
        </>
    );
};
