'use client';

import React from 'react';
import Link from 'next/link';
import { usePengajuan } from './usePengajuan';
import { Plus, Search, Filter, FileText, ChevronRight, Calendar, User, CreditCard, Clock, Banknote } from 'lucide-react';

export const PengajuanList: React.FC = () => {
    const { pengajuanList, loading, error } = usePengajuan();

    const formatMoney = (amount: number) => {
        return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'short',
            year: 'numeric'
        });
    };

    const getDisbursementBadge = (item: any) => {
        if (item.status !== 'Disetujui') return null;

        // Check if disbursement exists and is not null/empty object
        if (!item.disbursement || !item.disbursement.id) {
            return (
                <span className="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium bg-slate-100 text-slate-600 ring-1 ring-inset ring-slate-500/10">
                    Belum Cair
                </span>
            );
        }

        const status = item.disbursement.status;
        const styles: Record<string, string> = {
            'Pending': 'bg-amber-50 text-amber-700 ring-amber-600/20',
            'Diproses': 'bg-blue-50 text-blue-700 ring-blue-600/20',
            'Selesai': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'Ditolak': 'bg-rose-50 text-rose-700 ring-rose-600/20',
        };

        const badgeClass = styles[status] || 'bg-slate-100 text-slate-700 ring-slate-600/20';

        return (
            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ring-1 ring-inset ${badgeClass}`}>
                {status === 'Selesai' ? 'Sudah Cair' : status}
            </span>
        );
    };

    const getStatusBadge = (status: string) => {
        const styles: Record<string, string> = {
            'Disetujui': 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
            'Ditolak': 'bg-rose-50 text-rose-700 ring-rose-600/20',
            'Proses Persetujuan': 'bg-blue-50 text-blue-700 ring-blue-600/20',
            'Pending': 'bg-amber-50 text-amber-700 ring-amber-600/20'
        };

        const badgeClass = styles[status] || 'bg-slate-50 text-slate-700 ring-slate-600/20';

        return (
            <span className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass}`}>
                {status}
            </span>
        );
    };

    return (
        <div className="space-y-6 pb-20 md:pb-0">
            {/* Header Actions */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-slate-200/60 sticky top-0 z-10">
                <div className="relative flex-grow w-full sm:w-auto max-w-md">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                        <Search className="h-4 w-4 text-slate-400" />
                    </div>
                    <input
                        type="text"
                        className="block w-full rounded-lg border-slate-200 bg-slate-50 py-2.5 pl-10 text-slate-900 focus:bg-white focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 sm:text-sm transition-all duration-200"
                        placeholder="Cari nasabah..."
                    />
                </div>
                <div className="flex gap-3 w-full sm:w-auto">
                    <button className="flex items-center justify-center gap-2 rounded-lg bg-white px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm border border-slate-200 hover:bg-slate-50 transition-colors">
                        <Filter className="h-4 w-4" />
                        <span className="hidden sm:inline">Filter</span>
                    </button>
                    <Link
                        href="/pengajuan/create"
                        className="flex-1 sm:flex-none inline-flex items-center justify-center gap-2 rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-indigo-200 hover:bg-indigo-700 hover:shadow-md transition-all duration-200 active:scale-95"
                    >
                        <Plus className="h-4 w-4" />
                        Buat Baru
                    </Link>
                </div>
            </div>

            {/* Content List - Mobile Friendly Cards */}
            {pengajuanList.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-center bg-white rounded-xl border border-dashed border-slate-300">
                    <div className="rounded-full bg-slate-50 p-6 mb-4 ring-1 ring-slate-100">
                        <FileText className="h-10 w-10 text-slate-400" />
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900">Belum ada pengajuan</h3>
                    <p className="mt-2 text-sm text-slate-500 max-w-sm">Mulai dengan membuat pengajuan baru untuk nasabah Anda.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {pengajuanList.map((item) => (
                        <Link href={`/pengajuan/${item.id}`} key={item.id} className="block group">
                            <div className="bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-200 h-full relative cursor-pointer active:scale-[0.98]">
                                {/* Header Card */}
                                <div className="flex justify-between items-start mb-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-100 to-slate-100 flex items-center justify-center text-indigo-600 font-bold border border-indigo-50">
                                            {(item.nama_lengkap || '?').charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-indigo-700 transition-colors">
                                                {item.nama_lengkap}
                                            </h3>
                                            <div className="flex items-center text-xs text-slate-500 mt-0.5">
                                                <CreditCard className="w-3 h-3 mr-1" />
                                                {item.nik}
                                            </div>
                                            <div className="flex flex-wrap gap-1.5 mt-2">
                                                {item.jenis_pelayanan?.name && (
                                                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-600/20">
                                                        {item.jenis_pelayanan.name}
                                                    </span>
                                                )}
                                                {item.jenis_pembiayaan?.name && (
                                                    <span className="inline-flex items-center rounded px-1.5 py-0.5 text-[10px] font-medium bg-purple-50 text-purple-700 ring-1 ring-inset ring-purple-600/20">
                                                        {item.jenis_pembiayaan.name}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        {getStatusBadge(item.status)}
                                    </div>
                                </div>

                                {/* Content Card */}
                                <div className="space-y-3">
                                    <div>
                                        <p className="text-xs text-slate-500 font-medium mb-1">Plafond Pengajuan</p>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-lg font-bold text-slate-900">
                                                {formatMoney(item.jumlah_pembiayaan)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between text-xs text-slate-600 pt-3 border-t border-slate-100">
                                        <div className="flex items-center gap-1.5 bg-slate-50 px-2 py-1 rounded">
                                            <Clock className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="font-medium">{item.jangka_waktu} Bulan</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span>{formatDate(item.created_at)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Arrow Indicator */}
                                <div className="absolute top-1/2 right-2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity -mr-2 group-hover:mr-0 hidden md:block">
                                    <ChevronRight className="w-5 h-5 text-indigo-400" />
                                </div>

                                {/* Disbursement Badge (Footer) */}
                                {item.status === 'Disetujui' && (
                                    <div className="mt-3 pt-2 text-right">
                                        {getDisbursementBadge(item)}
                                    </div>
                                )}
                            </div>
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};
