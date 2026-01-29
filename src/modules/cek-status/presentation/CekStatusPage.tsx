'use client';

import React, { useState } from 'react';
import { Search, CreditCard, Calendar, FileText, CheckCircle2, Circle, XCircle, Clock, Info } from 'lucide-react';
import { CekStatusRepositoryImpl } from '../data/CekStatusRepositoryImpl';
import { PengajuanStatusResult, StatusHistory } from '../core/StatusEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const repository = new CekStatusRepositoryImpl();

export const CekStatusPage = () => {
    const [nik, setNik] = useState('');
    const [results, setResults] = useState<PengajuanStatusResult[]>([]);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nik.trim()) return;

        try {
            showLoading('Mencari status pengajuan...');
            const data = await repository.checkStatusByNik(nik);
            setResults(data);
            setHasSearched(true);
            hideLoading();
        } catch (err: any) {
            hideLoading();
            setResults([]);
            setHasSearched(true);
            showError(handleError(err, 'Gagal mencari data'));
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div>
                <h1 className="text-2xl font-bold text-slate-900">Pengecekan Status Pengajuan</h1>
                <p className="text-slate-500">Pantau proses pengajuan Anda secara realtime menggunakan NIK.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Search Card */}
                <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                    <h2 className="text-lg font-bold text-slate-900 mb-4">Masukkan Identitas</h2>
                    <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                <CreditCard className="h-5 w-5 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                value={nik}
                                onChange={(e) => setNik(e.target.value)}
                                className="block w-full pl-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 py-3 text-slate-900"
                                placeholder="Masukkan NIK Pemohon"
                                autoFocus
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={!nik}
                            className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                        >
                            Cek Status
                        </button>
                    </form>
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 rounded-2xl border border-blue-100 p-6">
                    <div className="flex items-center gap-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg text-blue-600">
                            <Info className="h-5 w-5" />
                        </div>
                        <h3 className="font-bold text-blue-900">Informasi</h3>
                    </div>
                    <p className="text-sm text-blue-800/80 leading-relaxed">
                        Anda dapat memantau setiap tahapan pengajuan mulai dari verifikasi berkas, analisa kredit, hingga pencairan dana.
                        <br /><br />
                        Pastikan NIK yang dimasukkan sesuai dengan KTP pemohon.
                    </p>
                </div>
            </div>

            {/* Results */}
            {hasSearched && (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                    <div className="flex items-center gap-4 py-2 mb-4">
                        <div className="h-px flex-1 bg-slate-200"></div>
                        <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">
                            {results.length > 0 ? `Ditemukan ${results.length} Pengajuan` : 'Tidak Ditemukan'}
                        </span>
                        <div className="h-px flex-1 bg-slate-200"></div>
                    </div>

                    {results.length > 0 ? (
                        <div className="grid grid-cols-1 gap-6">
                            {results.map((item) => (
                                <StatusCard key={item.id} data={item} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                            <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                                <Search className="h-8 w-8 text-slate-300" />
                            </div>
                            <h3 className="text-lg font-bold text-slate-900">Data Tidak Ditemukan</h3>
                            <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                                Tidak ada pengajuan aktif yang terkait dengan NIK <strong className="text-slate-700">{nik}</strong>.
                            </p>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const StatusCard = ({ data }: { data: PengajuanStatusResult }) => {
    const money = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
            {/* Card Header */}
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                    <div className="h-10 w-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-indigo-600 font-bold">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900">{data.nama_lengkap}</h3>
                        <p className="text-xs text-slate-500">{data.jenis_pembiayaan}</p>
                    </div>
                </div>
                <div className="text-right">
                    <p className="text-xs text-slate-500 mb-0.5">Plafond Pengajuan</p>
                    <p className="text-lg font-bold text-slate-900">{money(data.jumlah_pembiayaan)}</p>
                </div>
            </div>

            <div className="p-6 grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Details Column */}
                <div className="lg:col-span-1 space-y-4">
                    <div>
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Detail Pengajuan</p>
                        <ul className="space-y-3">
                            <li className="flex justify-between text-sm">
                                <span className="text-slate-500">Tanggal Pengajuan</span>
                                <span className="font-medium text-slate-900">{new Date(data.tanggal_pengajuan).toLocaleDateString('id-ID')}</span>
                            </li>
                            <li className="flex justify-between text-sm">
                                <span className="text-slate-500">Status Terakhir</span>
                                <span className={`font-bold px-2 py-0.5 rounded-full text-xs ${getStatusColor(data.status_terakhir)}`}>
                                    {data.status_terakhir}
                                </span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Timeline Column */}
                <div className="lg:col-span-2">
                    <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-4">Riwayat Status</p>
                    <div className="relative pl-4 border-l-2 border-slate-100 space-y-8">
                        {data.history.map((hist, idx) => (
                            <div key={idx} className="relative pl-6">
                                {/* Dot Indicator */}
                                <div className={`absolute -left-[21px] top-1.5 h-4 w-4 rounded-full border-2 ${hist.is_completed ? 'bg-indigo-600 border-indigo-100 ring-4 ring-white' : 'bg-white border-slate-300'} flex items-center justify-center`}>
                                    {hist.is_completed && <div className="h-1.5 w-1.5 bg-white rounded-full"></div>}
                                </div>

                                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-1">
                                    <h4 className={`text-sm font-bold ${hist.is_completed ? 'text-slate-900' : 'text-slate-400'}`}>
                                        {hist.status}
                                    </h4>
                                    {hist.date && <span className="text-xs text-slate-400 font-medium">{new Date(hist.date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>}
                                </div>

                                <p className="text-sm text-slate-500 mt-1">{hist.description}</p>
                                {hist.actor && (
                                    <span className="inline-block mt-2 text-xs px-2 py-1 bg-slate-50 text-slate-500 rounded border border-slate-200">
                                        Oleh: {hist.actor}
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Disetujui': return 'bg-emerald-100 text-emerald-700';
        case 'Ditolak': return 'bg-rose-100 text-rose-700';
        case 'Proses Persetujuan': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};
