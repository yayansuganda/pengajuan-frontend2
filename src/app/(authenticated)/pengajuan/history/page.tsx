'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, History, Clock, CheckCircle, XCircle, FileText, ChevronRight } from 'lucide-react';
import { Pengajuan } from '@/modules/pengajuan/core/PengajuanEntity';
import { PengajuanRepositoryImpl } from '@/modules/pengajuan/data/PengajuanRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new PengajuanRepositoryImpl();

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Selesai': return 'bg-indigo-100 text-indigo-700 border-indigo-200';
        case 'Ditolak': return 'bg-rose-100 text-rose-700 border-rose-200';
        case 'Disetujui': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
        default: return 'bg-slate-100 text-slate-700 border-slate-200';
    }
};

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'Selesai': return <CheckCircle className="w-4 h-4" />;
        case 'Ditolak': return <XCircle className="w-4 h-4" />;
        case 'Disetujui': return <CheckCircle className="w-4 h-4" />;
        default: return <Clock className="w-4 h-4" />;
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
        month: 'long',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    });
};

export default function PengajuanHistoryPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [data, setData] = useState<Pengajuan[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isMobile, setIsMobile] = useState(false);

    useEffect(() => {
        const checkMobile = () => setIsMobile(window.innerWidth < 768);
        checkMobile();
        window.addEventListener('resize', checkMobile);
        return () => window.removeEventListener('resize', checkMobile);
    }, []);

    useEffect(() => {
        fetchHistory();
    }, []);

    const fetchHistory = async () => {
        try {
            setIsLoading(true);

            // Fetch with high limit to get all data
            // Backend will still filter by unit based on user role
            // Send status='all' to prevent backend from applying default status filter
            const allData = await repository.getPengajuanList({
                status: 'all', // Special value to get all statuses
                limit: 1000, // Get more data
                page: 1
            });

            console.log('📊 History Debug Info:');
            console.log('- User role:', user?.role);
            console.log('- User unit:', user?.unit);
            console.log('- Total data fetched:', allData.length);
            console.log('- Sample data:', allData.slice(0, 2));

            // Filter by unit_id for non-super-admin users
            let filteredByUnit = allData;
            if (user?.role !== 'super-admin') {
                console.log('- Applying unit filter...');
                console.log('- User unit value:', JSON.stringify(user?.unit));

                if (user?.unit) {
                    filteredByUnit = allData.filter((item: Pengajuan) => {
                        const match = item.unit === user.unit;
                        console.log(`  Item: "${item.name}" | item.unit="${item.unit}" | user.unit="${user.unit}" | Match: ${match}`);
                        return match;
                    });
                    console.log('- After unit filter:', filteredByUnit.length);
                } else {
                    console.log('⚠️ User has no unit property, showing all data');
                }
            } else {
                console.log('- No unit filter applied (super-admin)');
            }

            // Filter only completed or rejected submissions
            const historyData = filteredByUnit.filter((item: Pengajuan) =>
                item.status === 'Selesai' || item.status === 'Ditolak'
            );

            console.log('- After status filter (Selesai/Ditolak):', historyData.length);
            console.log('- Final history data:', historyData);

            // Sort by date (newest first)
            historyData.sort((a, b) =>
                new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime()
            );

            setData(historyData);
        } catch (error) {
            console.error('Error fetching history:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (id: string) => {
        router.push(`/pengajuan/${id}`);
    };

    // Mobile View
    const MobileView = () => (
        <MobileLayoutWrapper showBackground={false}>
            {/* Background layers */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/images/loan_header_bg.png" alt="bg" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
            </div>

            <div className="fixed top-0 left-0 right-0 h-[200px] z-0 overflow-hidden rounded-b-3xl pointer-events-none">
                <img src="/images/loan_header_bg.png" alt="header" className="w-full h-full object-cover object-center" />
            </div>

            <div className="relative z-10 pt-4 px-4 pb-24 h-full flex flex-col">
                {/* Header */}
                <div className="flex-none mb-4">
                    <div className="flex items-center gap-3 mb-4">
                        <button
                            onClick={() => router.back()}
                            className="p-2 rounded-lg bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-white transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-slate-700" />
                        </button>
                        <div className="flex-1">
                            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                <History className="w-5 h-5 text-indigo-600" />
                                History Pengajuan
                            </h1>
                            <p className="text-xs text-slate-600 mt-0.5">
                                {user?.role === 'super-admin'
                                    ? 'Semua riwayat pengajuan selesai & ditolak'
                                    : `Riwayat pengajuan ${user?.unit || 'unit Anda'}`
                                }
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="flex-1 overflow-y-auto space-y-3">
                    {isLoading ? (
                        <div className="flex justify-center items-center py-12">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                        </div>
                    ) : data.length === 0 ? (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-8 text-center">
                            <History className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Belum ada riwayat pengajuan</p>
                        </div>
                    ) : (
                        data.map((item) => (
                            <div
                                key={item.id}
                                onClick={() => handleViewDetail(item.id)}
                                className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 hover:shadow-md transition-shadow cursor-pointer"
                            >
                                <div className="flex items-start justify-between mb-3">
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-slate-800 text-sm mb-1">{item.name}</h3>
                                        <p className="text-xs text-slate-500">NIK: {item.nik}</p>
                                        {item.unit && (
                                            <p className="text-xs text-slate-500">Unit: {item.unit}</p>
                                        )}
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-400 flex-shrink-0" />
                                </div>

                                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-100">
                                    <div>
                                        <p className="text-xs text-slate-500 mb-1">Jumlah Pembiayaan</p>
                                        <p className="font-bold text-indigo-600 text-sm">{formatCurrency(item.jumlah_pembiayaan)}</p>
                                    </div>
                                    <div className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold ${getStatusColor(item.status)}`}>
                                        {getStatusIcon(item.status)}
                                        {item.status}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        {formatDate(item.updated_at)}
                                    </div>
                                    {item.status === 'Ditolak' && item.reject_reason && (
                                        <div className="text-rose-600 font-medium">Lihat alasan</div>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </MobileLayoutWrapper>
    );

    // Desktop View
    const DesktopView = () => (
        <div className="px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => router.back()}
                    className="flex items-center gap-2 text-sm text-slate-600 hover:text-slate-900 mb-4"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Kembali
                </button>
                <div className="flex items-center gap-3">
                    <History className="w-8 h-8 text-indigo-600" />
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">History Pengajuan</h1>
                        <p className="mt-1 text-sm text-gray-600">
                            {user?.role === 'super-admin'
                                ? 'Riwayat semua pengajuan yang sudah selesai atau ditolak'
                                : `Riwayat pengajuan ${user?.unit || 'unit Anda'} yang sudah selesai atau ditolak`
                            }
                        </p>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                {isLoading ? (
                    <div className="flex justify-center items-center py-12">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
                    </div>
                ) : data.length === 0 ? (
                    <div className="text-center py-12">
                        <History className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Belum ada riwayat pengajuan</p>
                    </div>
                ) : (
                    <table className="min-w-full divide-y divide-gray-300">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900">Pemohon</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Unit</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Jumlah</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Status</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Tanggal</th>
                                <th className="px-3 py-3.5 text-left text-sm font-semibold text-gray-900">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200 bg-white">
                            {data.map((item) => (
                                <tr key={item.id} className="hover:bg-gray-50">
                                    <td className="whitespace-nowrap py-4 pl-4 pr-3">
                                        <div>
                                            <div className="font-medium text-gray-900">{item.name}</div>
                                            <div className="text-sm text-gray-500">NIK: {item.nik}</div>
                                        </div>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">{item.unit}</td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm font-semibold text-indigo-600">
                                        {formatCurrency(item.jumlah_pembiayaan)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg border text-xs font-semibold ${getStatusColor(item.status)}`}>
                                            {getStatusIcon(item.status)}
                                            {item.status}
                                        </span>
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm text-gray-500">
                                        {formatDate(item.updated_at)}
                                    </td>
                                    <td className="whitespace-nowrap px-3 py-4 text-sm">
                                        <button
                                            onClick={() => handleViewDetail(item.id)}
                                            className="text-indigo-600 hover:text-indigo-900 font-medium flex items-center gap-1"
                                        >
                                            <FileText className="w-4 h-4" />
                                            Detail
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );

    return isMobile ? <MobileView /> : <DesktopView />;
}
