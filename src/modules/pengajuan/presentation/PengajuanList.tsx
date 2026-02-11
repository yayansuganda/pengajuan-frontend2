'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Calendar, FileText, ChevronRight, Briefcase, History } from 'lucide-react';
import { Pengajuan, PengajuanFilter } from '../core/PengajuanEntity';
import { PengajuanRepositoryImpl } from '../data/PengajuanRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { getFrontingUser } from '@/modules/fronting/core/frontingAuth';
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
    forceVisible?: boolean;
}

const STATUS_OPTIONS = [
    { value: '', label: 'Semua Status' },
    { value: 'Pending', label: 'Pending' },
    { value: 'Menunggu Approval Manager', label: 'Menunggu Manager' },
    { value: 'Menunggu Verifikasi Admin Unit', label: 'Verifikasi Admin Unit' },
    { value: 'Menunggu Pencairan', label: 'Menunggu Pencairan' },
    { value: 'Dicairkan', label: 'Dicairkan' },
    { value: 'Selesai', label: 'Selesai' },
    { value: 'Disetujui', label: 'Disetujui' },
    { value: 'Ditolak', label: 'Ditolak' },
];

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Disetujui': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        case 'Menunggu Approval Manager': return 'bg-blue-100 text-blue-700 border-blue-200';
        case 'Menunggu Verifikasi Admin Unit': return 'bg-purple-100 text-purple-700 border-purple-200';
        case 'Menunggu Pencairan': return 'bg-orange-100 text-orange-700 border-orange-200';
        case 'Dicairkan': return 'bg-teal-100 text-teal-700 border-teal-200';
        case 'Selesai': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'Ditolak': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'Pending': return 'bg-amber-100 text-amber-700 border-amber-200';
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
const MobileView = ({ data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router, user, forceVisible }: ViewProps) => (
    <MobileLayoutWrapper showBackground={false} forceVisible={forceVisible} moduleName={forceVisible ? 'fronting' : 'default'}>
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
                <div className="flex justify-between items-center gap-2">
                    <h1 className="text-lg font-bold text-slate-800">Daftar Pengajuan</h1>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => router.push('/pengajuan/history')}
                            className="flex items-center gap-1.5 text-xs font-semibold text-indigo-700 bg-indigo-50 px-3 py-1.5 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition-colors"
                        >
                            <History className="w-3.5 h-3.5" />
                            History
                        </button>
                        <div className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-1 rounded">
                            Total: {data.length}
                        </div>
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
                    <div className="flex flex-col items-center justify-center py-16 text-center px-4">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                            <FileText className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-slate-700 text-sm font-semibold mb-1">Belum ada pengajuan</p>
                        <p className="text-slate-500 text-xs mb-4">
                            {(user?.role === 'petugas-pos' || user?.role === 'admin-pos') 
                                ? 'Buat pengajuan baru untuk melihat data di sini'
                                : 'Data tidak ditemukan'}
                        </p>
                        <button
                            onClick={() => router.push('/pengajuan/create')}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-blue-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Buat Pengajuan
                        </button>
                    </div>
                ) : (
                    data.map((item) => (
                        <div
                            key={item.id}
                            onClick={() => router.push(`/pengajuan/${item.id}`)}
                            className="bg-white p-3.5 rounded-xl border border-slate-100 shadow-sm active:scale-[0.98] transition-transform"
                        >
                            <div className="flex justify-between items-start mb-2">
                                <h3 className="font-bold text-slate-800 text-sm line-clamp-1 flex-1 mr-2">{item.nama_lengkap || 'Nama tidak tersedia'}</h3>
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
const DesktopView = ({ data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router, user }: ViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">Daftar Pengajuan</h1>
                <p className="mt-2 text-sm text-gray-700">Kelola data pengajuan pembiayaan</p>
                
                {/* NIPPOS Filter Badge untuk Petugas Pos */}
                {(user?.role === 'petugas-pos' || user?.role === 'admin-pos') && (() => {
                    const frontingUser = getFrontingUser();
                    return frontingUser?.nippos ? (
                        <div className="mt-3 inline-flex items-center gap-2 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg px-4 py-2">
                            <span className="text-lg">🔍</span>
                            <div>
                                <p className="text-xs font-semibold text-blue-900">
                                    Filter Aktif untuk NIPPOS
                                </p>
                                <p className="text-xs text-blue-700">
                                    <span className="font-mono font-bold">{frontingUser.nippos}</span> - {frontingUser.name}
                                </p>
                            </div>
                        </div>
                    ) : null;
                })()}
            </div>
            <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none flex gap-3">
                <button
                    onClick={() => router.push('/pengajuan/history')}
                    className="flex items-center gap-2 rounded-md bg-white px-3 py-2 text-center text-sm font-semibold text-indigo-600 shadow-sm ring-1 ring-inset ring-indigo-200 hover:bg-indigo-50"
                >
                    <History className="w-4 h-4" />
                    History
                </button>
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
                                                <div className="font-medium text-gray-900">{item.nama_lengkap || 'Nama tidak tersedia'}</div>
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
interface PengajuanListProps {
    viewMode?: 'mobile' | 'desktop' | 'responsive';
    forceVisible?: boolean;
}

export const PengajuanList: React.FC<PengajuanListProps> = ({ viewMode = 'responsive', forceVisible = false }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<Pengajuan[]>([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('');
    const [dateFilter, setDateFilter] = useState('');
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // IMPORTANT: /fronting/pengajuan HARUS fetch data (dengan filter NIPPOS)
        // ONLY skip jika benar-benar tidak ada auth
        console.log('[PengajuanList] useEffect triggered');
        console.log('[PengajuanList] Current path:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
        console.log('[PengajuanList] User:', user);
        
        fetchData();
    }, [statusFilter, dateFilter, user]); // Fetch immediately on select change or user change

    useEffect(() => {
        // Debounce search untuk semua routes (termasuk /fronting/pengajuan)
        const timer = setTimeout(() => {
            fetchData(); // Fetch debounce on text search
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchData = async () => {
        console.log('[PengajuanList] 📊 ========== FETCH DATA START ==========');
        console.log('[PengajuanList] Current path:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
        console.log('[PengajuanList] User from useAuth():', user);
        console.log('[PengajuanList] User role:', user?.role);
        console.log('[PengajuanList] User ID:', user?.id);
        
        // Check token
        const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
        const storedUser = typeof window !== 'undefined' ? localStorage.getItem('user') : null;
        console.log('[PengajuanList] ========== AUTH CHECK ==========');
        console.log('[PengajuanList] Token exists?', !!token);
        console.log('[PengajuanList] Token (first 20 chars):', token ? token.substring(0, 20) + '...' : 'NULL');
        console.log('[PengajuanList] Stored user exists?', !!storedUser);
        console.log('[PengajuanList] Stored user:', storedUser ? JSON.parse(storedUser) : null);
        
        // FORCE CHECK: Jika di route /fronting/pengajuan, SELALU apply filter NIPPOS
        const isFrontingRoute = typeof window !== 'undefined' && window.location.pathname.includes('/fronting');
        console.log('[PengajuanList] Is fronting route?', isFrontingRoute);
        console.log('[PengajuanList] Full pathname:', typeof window !== 'undefined' ? window.location.pathname : 'SSR');
        
        try {
            setIsLoading(true);
            const filter: PengajuanFilter = {};
            if (search) filter.search = search;
            if (statusFilter) filter.status = statusFilter;
            
            // FILTER BY NIPPOS
            // Prioritas 1: Jika di /fronting route, SELALU ambil dari localStorage
            // Prioritas 2: Jika role petugas-pos/admin-pos, SELALU ambil dari localStorage
            const isPetugasPos = user?.role === 'petugas-pos' || user?.role === 'admin-pos';
            const shouldFilterByNIPPOS = isFrontingRoute || isPetugasPos;
            
            console.log('[PengajuanList] Should filter by NIPPOS?', shouldFilterByNIPPOS);
            console.log('[PengajuanList] Is Petugas Pos role?', isPetugasPos);
            
            if (shouldFilterByNIPPOS) {
                // Ambil NIPPOS dari localStorage
                const frontingUser = getFrontingUser();
                console.log('[PengajuanList] ========== LOCALSTORAGE CHECK ==========');
                console.log('[PengajuanList] fronting_user:', frontingUser);
                console.log('[PengajuanList] NIPPOS:', frontingUser?.nippos);
                console.log('[PengajuanList] Name:', frontingUser?.name);
                
                if (frontingUser && frontingUser.nippos) {
                    console.log('[PengajuanList] ✅ APPLYING NIPPOS FILTER:', frontingUser.nippos);
                    filter.petugas_nippos = frontingUser.nippos;
                    
                    // IMPORTANT: Check if user is logged in
                    // If in fronting route but user is null (not logged in), redirect to /fronting for auto-login
                    if (isFrontingRoute && !user && typeof window !== 'undefined') {
                        const token = localStorage.getItem('token');
                        if (!token) {
                            console.warn('[PengajuanList] ⚠️ User not logged in but in fronting route. Redirecting to /fronting for auto-login...');
                            window.location.href = '/fronting';
                            return;
                        }
                    }
                } else {
                    console.error('[PengajuanList] ❌❌❌ NO NIPPOS IN LOCALSTORAGE! ❌❌❌');
                    console.error('[PengajuanList] This is the problem! User must access /fronting/?data=... first!');
                    
                    // Redirect to /fronting if in fronting route
                    if (isFrontingRoute && typeof window !== 'undefined') {
                        console.warn('[PengajuanList] Redirecting to /fronting...');
                        window.location.href = '/fronting';
                        return;
                    }
                    
                    setData([]);
                    setIsLoading(false);
                    return;
                }
            }

            console.log('[PengajuanList] 📊 ========== MAKING API REQUEST ==========');
            console.log('[PengajuanList] Filter object:', JSON.stringify(filter, null, 2));
            console.log('[PengajuanList] API URL will be: /pengajuan with params:', filter);
            
            const result = await repository.getPengajuanList(filter);
            
            console.log('[PengajuanList] ✅ ========== API RESPONSE ==========');
            console.log('[PengajuanList] Total items received:', result.length);
            console.log('[PengajuanList] Raw response:', result);

            let filteredResult = result;
            if (dateFilter) {
                // Client side date filtering as basic implementation
                filteredResult = result.filter(item => item.created_at.startsWith(dateFilter));
                console.log('[PengajuanList] 📅 After date filter:', filteredResult.length, 'items');
            }

            // Debug: Verify filter for Petugas Pos
            if (user?.role === 'petugas-pos' || user?.role === 'admin-pos') {
                const frontingUser = getFrontingUser();
                if (frontingUser?.nippos && filteredResult.length > 0) {
                    const matchingCount = filteredResult.filter(item => item.petugas_nippos === frontingUser.nippos).length;
                    const nullCount = filteredResult.filter(item => !item.petugas_nippos).length;
                    console.log('[PengajuanList] 🔍 Filter Verification:');
                    console.log('  - Expected NIPPOS:', frontingUser.nippos);
                    console.log('  - Total items:', filteredResult.length);
                    console.log('  - Matching NIPPOS:', matchingCount);
                    console.log('  - NULL NIPPOS:', nullCount);
                    console.log('  - Other NIPPOS:', filteredResult.length - matchingCount - nullCount);
                }
            }

            setData(filteredResult);
            setIsLoading(false);
        } catch (error: any) {
            console.error(error);
            setIsLoading(false);
        }
    };

    const viewProps = { data, search, setSearch, statusFilter, setStatusFilter, dateFilter, setDateFilter, isLoading, router, user, forceVisible };

    const isMobileMode = viewMode === 'mobile';

    return (
        <>
            <div className={isMobileMode ? '' : 'md:hidden'}>
                <MobileView {...viewProps} />
            </div>
            {!isMobileMode && (
                <div className="hidden md:block"><DesktopView {...viewProps} /></div>
            )}
        </>
    );
};
