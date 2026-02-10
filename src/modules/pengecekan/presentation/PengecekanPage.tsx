'use client';

import React, { useState } from 'react';
import { Search, User, CreditCard, Calendar, MapPin, Wallet, Building, AlertCircle, Info, CheckCircle } from 'lucide-react';
import { PengecekanRepositoryImpl } from '../data/PengecekanRepositoryImpl';
import { Pensiunan } from '../core/PensiunanEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new PengecekanRepositoryImpl();

// --- Helpers ---
const d = (val: any) => val || '-';

const formatMoney = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value || 0);

// --- Components ---

interface PengecekanTemplateProps {
    nopen: string;
    setNopen: (val: string) => void;
    handleSearch: (e: React.FormEvent) => void;
    result: Pensiunan | null;

    hasSearched: boolean;
    forceVisible?: boolean;
}

const MobileView = ({ nopen, setNopen, handleSearch, result, hasSearched, forceVisible }: PengecekanTemplateProps) => (
    <MobileLayoutWrapper forceVisible={forceVisible} moduleName={forceVisible ? 'fronting' : 'default'}>
        <div className="pt-6 px-4 pb-24">
            {/* Header & Search */}
            <div className="mb-6">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Pengecekan Data</h1>

                {/* Search Card */}
                <div className="bg-white rounded-2xl shadow-lg shadow-slate-900/5 p-5 border border-slate-100">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                        <input
                            type="text"
                            value={nopen}
                            onChange={(e) => setNopen(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            placeholder="Masukkan Nopen..."
                        />
                    </div>
                    <button
                        onClick={(e) => handleSearch(e)}
                        disabled={!nopen}
                        className="w-full mt-3 bg-indigo-600 text-white font-bold py-3 rounded-xl shadow-md shadow-indigo-200 disabled:opacity-50 disabled:shadow-none hover:bg-indigo-700 transition-all active:scale-[0.98]"
                    >
                        Cek Data
                    </button>
                </div>
            </div>

            {/* Results */}
            {hasSearched ? (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    {result ? (
                        <>
                            {/* Profile Card Mobile */}
                            <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                                {/* Decorative bg */}
                                <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>
                                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-400/10 rounded-full blur-2xl translate-y-1/2 -translate-x-1/2"></div>

                                <div className="relative z-10">
                                    <div className="flex items-center gap-4 mb-4">
                                        <div className="h-14 w-14 rounded-full bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-lg">
                                            <User className="h-7 w-7" />
                                        </div>
                                        <div>
                                            <h2 className="text-lg font-bold leading-tight">{result.nama_lengkap}</h2>
                                            <p className="text-indigo-200 text-sm font-medium">{result.nopen}</p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 text-sm bg-white/5 rounded-xl p-3 border border-white/10">
                                        <div>
                                            <p className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Status</p>
                                            <div className="flex items-center gap-1.5">
                                                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                <p className="font-semibold text-emerald-100">{d(result.status_keaktifan)}</p>
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-indigo-300 text-[10px] uppercase tracking-wider mb-0.5">Kantor Bayar</p>
                                            <p className="font-semibold text-white truncate">{d(result.kantor_bayar)}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Money Cards Mobile */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Gaji Bersih</p>
                                    <p className="text-base font-bold text-emerald-600 truncate">{formatMoney(result.gaji_bersih)}</p>
                                </div>
                                <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-100">
                                    <p className="text-[10px] uppercase tracking-wider text-slate-500 mb-1">Potongan</p>
                                    <p className="text-base font-bold text-rose-600 truncate">{formatMoney(result.potongan)}</p>
                                </div>
                            </div>

                            {/* Details */}
                            <div className="bg-white rounded-3xl shadow-sm border border-slate-100 p-5">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="p-1.5 bg-indigo-50 rounded-lg">
                                        <Info className="w-4 h-4 text-indigo-600" />
                                    </div>
                                    <h3 className="font-bold text-slate-800 text-sm">Informasi Detail</h3>
                                </div>
                                <div className="space-y-4">
                                    <div className="bg-indigo-50 rounded-xl p-3 border border-indigo-100">
                                        <p className="text-[10px] uppercase tracking-wider text-indigo-600 font-semibold mb-2">Data Pensiun</p>
                                        <div className="space-y-2">
                                            <InfoRowMobile label="Jenis Pensiun" value={d(result.jenis_pensiun)} />
                                            <InfoRowMobile label="Jenis Dapem" value={d(result.jenis_dapem)} />
                                            <InfoRowMobile label="Mitra" value={d(result.mitra)} />
                                            <InfoRowMobile label="Periode" value={d(result.bulan_dapem)} />
                                        </div>
                                    </div>

                                    <div className="bg-emerald-50 rounded-xl p-3 border border-emerald-100">
                                        <p className="text-[10px] uppercase tracking-wider text-emerald-600 font-semibold mb-2">Kantor & Lokasi</p>
                                        <div className="space-y-2">
                                            <InfoRowMobile label="Kantor Bayar" value={d(result.kantor_bayar)} />
                                            <InfoRowMobile label="Kode Kantor" value={d(result.kode_kantor)} />
                                            <InfoRowMobile label="Kode KPRK" value={d(result.kode_kprk)} />
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 rounded-xl p-3 border border-amber-100">
                                        <p className="text-[10px] uppercase tracking-wider text-amber-600 font-semibold mb-2">Rekening Bank</p>
                                        <div className="space-y-2">
                                            <InfoRowMobile label="Bank" value={d(result.nama_bank)} />
                                            <InfoRowMobile label="No. Rekening" value={d(result.no_rekening)} />
                                        </div>
                                    </div>

                                    <div className="bg-slate-50 rounded-xl p-3 border border-slate-100">
                                        <p className="text-[10px] uppercase tracking-wider text-slate-600 font-semibold mb-2">Status & Kode</p>
                                        <div className="space-y-2">
                                            <InfoRowMobile label="Status Keaktifan" value={d(result.status_keaktifan)} />
                                            <InfoRowMobile label="Kode Status" value={d(result.status_dapem)} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                            <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                                <Search className="h-6 w-6 text-slate-300" />
                            </div>
                            <h3 className="text-base font-bold text-slate-900">Tidak Ditemukan</h3>
                            <p className="text-xs text-slate-500 mt-1 px-8">
                                Data dengan Nopen <strong className="text-slate-700">{nopen}</strong> tidak tersedia.
                            </p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-4">
                    <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -translate-y-1/2 translate-x-1/2"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-4">
                                <div className="p-2 bg-white/20 backdrop-blur-sm rounded-xl">
                                    <Info className="w-5 h-5 text-white" />
                                </div>
                                <h3 className="font-bold text-lg">Informasi Layanan</h3>
                            </div>
                            <p className="text-indigo-100 text-sm leading-relaxed mb-5">
                                Fitur ini memudahkan Anda untuk memverifikasi data pensiunan secara real-time dari core system. Gunakan NOPEN untuk melihat:
                            </p>
                            <div className="space-y-2.5">
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Status Keaktifan Peserta</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Rincian Gaji & Potongan</span>
                                </div>
                                <div className="flex items-center gap-3 bg-white/10 rounded-xl px-4 py-3 border border-white/5">
                                    <CheckCircle className="w-4 h-4 text-emerald-300 shrink-0" />
                                    <span className="text-xs font-semibold text-white">Data Rekening Bank</span>
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
                                <span>Pastikan NOPEN yang dimasukkan terdiri dari angka valid (tanpa spasi/karakter lain).</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                <span>Data yang ditampilkan adalah data terkini yang terdaftar di sistem.</span>
                            </li>
                            <li className="flex gap-3 text-sm text-slate-600">
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-300 mt-2 shrink-0"></div>
                                <span>Hubungi IT Support jika Anda mengalami kendala pencarian data.</span>
                            </li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    </MobileLayoutWrapper>
);

const DesktopView = ({ nopen, setNopen, handleSearch, result, hasSearched }: PengecekanTemplateProps) => (
    <div className="space-y-6">
        {/* Header Section */}
        <div>
            <h1 className="text-2xl font-bold text-slate-900">Pengecekan Data</h1>
            <p className="text-slate-500">Cek validitas data nasabah pensiunan dan rincian gaji terbaru.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Search Card */}
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">Cari Data Pensiunan</h2>
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                            <Search className="h-5 w-5 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            value={nopen}
                            onChange={(e) => setNopen(e.target.value)}
                            className="block w-full pl-11 rounded-xl border-slate-200 focus:border-indigo-500 focus:ring-indigo-500 py-3 text-slate-900"
                            placeholder="Masukkan Nopen (Contoh: 12345678)"
                            autoFocus
                        />
                    </div>
                    <button
                        type="submit"
                        disabled={!nopen}
                        className="px-6 py-3 bg-indigo-600 text-white font-bold rounded-xl hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors shrink-0"
                    >
                        Cek Data
                    </button>
                </form>
            </div>

            {/* Info Card */}
            <div className="bg-indigo-50 rounded-2xl border border-indigo-100 p-6">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-indigo-100 rounded-lg text-indigo-600">
                        <Info className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold text-indigo-900">Tentang Fitur Ini</h3>
                </div>
                <p className="text-sm text-indigo-800/80 leading-relaxed">
                    Fitur ini digunakan untuk memverifikasi data nasabah pensiunan berdasarkan Nopen (Nomor Pensiun).
                    <br /><br />
                    Data yang ditampilkan meliputi informasi pribadi, status keaktifan, dan rincian gaji (netto) yang diterima saat ini.
                </p>
            </div>
        </div>

        {/* Result Display */}
        {hasSearched && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                {result ? (
                    <div className="space-y-6">
                        {/* Divider Title */}
                        <div className="flex items-center gap-4 py-2">
                            <div className="h-px flex-1 bg-slate-200"></div>
                            <span className="text-sm font-medium text-slate-400 uppercase tracking-wider">Hasil Pencarian</span>
                            <div className="h-px flex-1 bg-slate-200"></div>
                        </div>

                        {/* Profile Card */}
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            <div className="bg-gradient-to-br from-slate-900 to-indigo-950 p-6 sm:p-8 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-5">
                                        <div className="h-20 w-20 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center border border-white/20 text-white shadow-xl">
                                            <User className="h-10 w-10" />
                                        </div>
                                        <div>
                                            <h2 className="text-2xl font-bold text-white mb-2">{result.nama_lengkap}</h2>
                                            <div className="flex flex-wrap items-center gap-3">
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 text-indigo-100 border border-white/10 text-sm">
                                                    <CreditCard className="h-3.5 w-3.5" />
                                                    <span>{result.nopen}</span>
                                                </span>
                                                <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-sm font-semibold">
                                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400"></div>
                                                    {d(result.status_keaktifan)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-6 sm:p-8">
                                <div className="space-y-6">
                                    {/* Data Pensiun Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Wallet className="h-4 w-4 text-indigo-600" />
                                            Data Pensiun
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-4">
                                            <InfoItem label="Jenis Pensiun" value={d(result.jenis_pensiun)} icon={<Wallet className="h-4 w-4" />} />
                                            <InfoItem label="Jenis Dapem" value={d(result.jenis_dapem)} icon={<Wallet className="h-4 w-4" />} />
                                            <InfoItem label="Mitra" value={d(result.mitra)} icon={<Building className="h-4 w-4" />} />
                                            <InfoItem label="Periode" value={d(result.bulan_dapem)} icon={<Calendar className="h-4 w-4" />} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-200"></div>

                                    {/* Kantor & Lokasi Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <Building className="h-4 w-4 text-emerald-600" />
                                            Kantor & Lokasi
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-4">
                                            <InfoItem label="Kantor Bayar" value={d(result.kantor_bayar)} icon={<Building className="h-4 w-4" />} />
                                            <InfoItem label="Kode Kantor" value={d(result.kode_kantor)} icon={<Building className="h-4 w-4" />} />
                                            <InfoItem label="Kode KPRK" value={d(result.kode_kprk)} icon={<Building className="h-4 w-4" />} />
                                        </div>
                                    </div>

                                    <div className="h-px bg-slate-200"></div>

                                    {/* Status Section */}
                                    <div>
                                        <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                                            <AlertCircle className="h-4 w-4 text-amber-600" />
                                            Status & Kode
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                                            <InfoItem label="Status Keaktifan" value={d(result.status_keaktifan)} icon={<AlertCircle className="h-4 w-4" />} />
                                            <InfoItem label="Kode Status" value={d(result.status_dapem)} icon={<AlertCircle className="h-4 w-4" />} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Financial Info */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <MoneyCard label="Gaji Pokok" value={result.gaji_pokok} type="neutral" />
                            <MoneyCard label="Potongan" value={result.potongan} type="minus" />
                            <MoneyCard label="Gaji Bersih" value={result.gaji_bersih} type="plus" />
                        </div>

                        {/* Bank Account Info */}
                        <div className="bg-indigo-50 rounded-xl p-5 border border-indigo-100 flex items-start gap-4">
                            <div className="p-2 bg-indigo-100 rounded-lg shrink-0">
                                <AlertCircle className="h-6 w-6 text-indigo-600" />
                            </div>
                            <div>
                                <h4 className="text-sm font-bold text-indigo-900 mb-1">Informasi Rekening</h4>
                                <p className="text-sm text-indigo-700 leading-relaxed">
                                    Penyaluran dana pensiun dilakukan melalui bank <strong>{d(result.nama_bank)}</strong> dengan nomor rekening <strong>{d(result.no_rekening)}</strong>.
                                    Pastikan data rekening sesuai dengan buku tabungan penerima.
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-slate-50 mb-4">
                            <Search className="h-8 w-8 text-slate-300" />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Data Tidak Ditemukan</h3>
                        <p className="text-slate-500 mt-2 max-w-sm mx-auto">
                            Kami tidak dapat menemukan data pensiunan dengan Nopen <strong className="text-slate-700">{nopen}</strong>. Mohon periksa kembali nomor yang dimasukkan.
                        </p>
                    </div>
                )}
            </div>
        )}
    </div>
);

// --- Main Page Component ---

// --- Main Page Component ---
interface PengecekanPageProps {
    viewMode?: 'mobile' | 'desktop' | 'responsive';
    forceVisible?: boolean;
}

export const PengecekanPage: React.FC<PengecekanPageProps> = ({ viewMode = 'responsive', forceVisible = false }) => {
    const [nopen, setNopen] = useState('');
    const [result, setResult] = useState<Pensiunan | null>(null);
    const [hasSearched, setHasSearched] = useState(false);

    const handleSearch = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!nopen.trim()) return;

        try {
            showLoading('Mencari data pensiunan...');
            const data = await repository.checkPensiunan(nopen);
            setResult(data);
            setHasSearched(true);
            hideLoading();
        } catch (err: any) {
            hideLoading();
            setResult(null);
            setHasSearched(true);
            showError(handleError(err, 'Data pensiunan tidak ditemukan'));
        }
    };

    const isMobileMode = viewMode === 'mobile';

    return (
        <>
            {/* Mobile View */}
            <div className={isMobileMode ? '' : 'md:hidden'}>
                <MobileView
                    nopen={nopen}
                    setNopen={setNopen}
                    handleSearch={handleSearch}
                    result={result}
                    hasSearched={hasSearched}
                    forceVisible={isMobileMode}
                />
            </div>

            {/* Desktop View */}
            {!isMobileMode && (
                <div className="hidden md:block">
                    <DesktopView
                        nopen={nopen}
                        setNopen={setNopen}
                        handleSearch={handleSearch}
                        result={result}
                        hasSearched={hasSearched}
                    />
                </div>
            )}
        </>
    );
};

// --- Sub Components ---

const InfoItem = ({ label, value, icon, wide }: any) => (
    <div className={wide ? 'md:col-span-2 lg:col-span-3' : ''}>
        <div className="flex items-center gap-2 text-slate-500 mb-1.5">
            <div className="p-1 rounded bg-slate-100 text-slate-500">
                {icon}
            </div>
            <span className="text-xs font-semibold uppercase tracking-wider">{label}</span>
        </div>
        <p className="text-base font-semibold text-slate-900 pl-8">{value}</p>
    </div>
);

const InfoRowMobile = ({ label, value }: { label: string, value: string }) => (
    <div className="flex justify-between items-start gap-3">
        <span className="text-xs text-slate-500 font-medium shrink-0 pt-0.5">{label}</span>
        <span className="text-sm text-slate-800 font-semibold text-right">{value}</span>
    </div>
);

const MoneyCard = ({ label, value, type }: { label: string, value: number, type: 'plus' | 'minus' | 'neutral' }) => {
    const money = formatMoney(value);

    const styles = {
        plus: { bg: 'bg-emerald-50', border: 'border-emerald-100', text: 'text-emerald-700' },
        minus: { bg: 'bg-rose-50', border: 'border-rose-100', text: 'text-rose-700' },
        neutral: { bg: 'bg-white', border: 'border-slate-200', text: 'text-slate-900' }
    };

    const style = styles[type];

    return (
        <div className={`rounded-xl p-6 border ${style.bg} ${style.border} shadow-sm`}>
            <p className="text-sm font-medium text-slate-500 mb-1">{label}</p>
            <p className={`text-2xl font-bold ${style.text}`}>{money}</p>
        </div>
    );
};
