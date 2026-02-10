'use client';

import React, { useState } from 'react';
import { Search, CreditCard, Calendar, FileText, CheckCircle, Info, AlertCircle, Clock, ChevronRight } from 'lucide-react';
import { CekStatusRepositoryImpl } from '../data/CekStatusRepositoryImpl';
import { PengajuanStatusResult } from '../core/StatusEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new CekStatusRepositoryImpl();

// --- Helpers ---
const money = (val: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val);

const getStatusColor = (status: string) => {
    switch (status) {
        case 'Disetujui': return 'bg-emerald-100 text-emerald-700';
        case 'Ditolak': return 'bg-rose-100 text-rose-700';
        case 'Proses Persetujuan': return 'bg-blue-100 text-blue-700';
        default: return 'bg-slate-100 text-slate-700';
    }
};

// --- Components ---

interface CekStatusTemplateProps {
    nik: string;
    setNik: (val: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    results: PengajuanStatusResult[];

    hasSearched: boolean;
    forceVisible?: boolean;
}

const MobileView = ({ nik, setNik, handleSearch, results, hasSearched, forceVisible }: CekStatusTemplateProps) => (
    <MobileLayoutWrapper forceVisible={forceVisible} moduleName={forceVisible ? 'fronting' : 'default'}>
        <div className="pt-6 px-4 pb-24">
            {/* Header & Search */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Cek Status Pengajuan</h1>

                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 p-5 border border-slate-100">
                    <div className="relative">
                        <CreditCard className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={nik}
                            onChange={(e) => setNik(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Masukkan NIK Pemohon..."
                        />
                    </div>
                    <button
                        onClick={(e) => handleSearch(e)}
                        disabled={!nik}
                        className="w-full mt-3 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        Cek Status
                    </button>
                </div>
            </div>

            {/* Content Area */}
            {hasSearched ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    {results.length > 0 ? (
                        <>
                            <div className="flex items-center justify-between px-1">
                                <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Hasil Pencarian</span>
                                <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-md">{results.length} Pengajuan</span>
                            </div>

                            {results.map((item) => (
                                <MobileStatusCard key={item.id} data={item} />
                            ))}
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                                <Search className="h-6 w-6 text-slate-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-500 mt-1 px-8">
                                Tidak ada pengajuan aktif yang terkait dengan NIK <strong className="text-slate-700">{nik}</strong>.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                /* Empty State / Default Content */
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    <div className="bg-gradient-to-br from-blue-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Clock className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Pantau Pengajuan</h3>
                            </div>
                            <p className="text-blue-100 text-sm leading-relaxed mb-5">
                                Pantau proses pengajuan Anda secara realtime mulai dari verifikasi hingga pencairan dana. Gunakan NIK untuk melihat:
                            </p>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Posisi Dokumen Terkini</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Riwayat Persetujuan</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Status Pencairan Dana</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-amber-50 rounded-xl text-amber-600">
                                <AlertCircle className="w-5 h-5" />
                            </div>
                            <h3 className="font-bold text-slate-800">Catatan Penting</h3>
                        </div>
                        <ul className="space-y-4">
                            <li className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                <span>Pastikan NIK yang dimasukkan sesuai dengan KTP pemohon pengajuan.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                <span>Status diperbarui secara realtime sesuai proses di kantor cabang.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    </MobileLayoutWrapper>
);

const MobileStatusCard = ({ data }: { data: PengajuanStatusResult }) => {
    return (
        <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden">
            {/* Header Gradient */}
            <div className="bg-slate-50 px-5 py-3 border-b border-slate-100 flex justify-between items-center">
                <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{data.jenis_pembiayaan}</span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${getStatusColor(data.status_terakhir)}`}>
                    {data.status_terakhir}
                </span>
            </div>

            <div className="p-5">
                <div className="flex items-center gap-4 mb-4">
                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 border border-indigo-100 shadow-sm shrink-0">
                        <FileText className="h-5 w-5" />
                    </div>
                    <div>
                        <h3 className="font-bold text-slate-900 leading-tight mb-0.5">{data.nama_lengkap}</h3>
                        <p className="text-xs text-slate-500">{new Date(data.tanggal_pengajuan).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
                    </div>
                </div>

                <div className="mb-4">
                    <p className="text-xs text-slate-400 mb-1">Jumlah Pengajuan</p>
                    <p className="text-xl font-bold text-indigo-600 tracking-tight">{money(data.jumlah_pembiayaan)}</p>
                </div>

                {/* Latest History Item Preview */}
                <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                    <p className="text-[10px] text-slate-500 font-semibold mb-2 uppercase tracking-wide flex items-center gap-1.5">
                        <Clock className="w-3 h-3" />
                        Aktivitas Terakhir
                    </p>
                    {data.history.length > 0 ? (
                        <div className="flex gap-3">
                            <div className="relative pt-1 pl-1">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 ring-4 ring-emerald-50"></div>
                            </div>
                            <div>
                                <p className="text-sm font-semibold text-slate-800 leading-tight">{data.history[0].status}</p>
                                <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{data.history[0].description}</p>
                                <p className="text-[10px] text-slate-400 mt-1.5">{new Date(data.history[0].date).toLocaleString('id-ID')}</p>
                            </div>
                        </div>
                    ) : (
                        <p className="text-xs text-slate-400 italic">Belum ada riwayat aktivitas.</p>
                    )}
                </div>
            </div>
        </div>
    );
};

const DesktopView = ({ nik, setNik, handleSearch, results, hasSearched }: CekStatusTemplateProps) => (
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
                            <DesktopStatusCard key={item.id} data={item} />
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

const DesktopStatusCard = ({ data }: { data: PengajuanStatusResult }) => {
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
                    <p className="text-xs text-slate-500 mb-0.5">Jumlah Pengajuan</p>
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

// --- Main Page Component ---

// --- Main Page Component ---
interface CekStatusPageProps {
    viewMode?: 'mobile' | 'desktop' | 'responsive';
    forceVisible?: boolean;
}

export const CekStatusPage: React.FC<CekStatusPageProps> = ({ viewMode = 'responsive', forceVisible = false }) => {
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

    const isMobileMode = viewMode === 'mobile';

    return (
        <>
            {/* Mobile View */}
            <div className={isMobileMode ? '' : 'md:hidden'}>
                <MobileView
                    nik={nik}
                    setNik={setNik}
                    handleSearch={handleSearch}
                    results={results}
                    hasSearched={hasSearched}
                    forceVisible={isMobileMode}
                />
            </div>

            {/* Desktop View */}
            {!isMobileMode && (
                <div className="hidden md:block">
                    <DesktopView
                        nik={nik}
                        setNik={setNik}
                        handleSearch={handleSearch}
                        results={results}
                        hasSearched={hasSearched}
                    />
                </div>
            )}
        </>
    );
};
