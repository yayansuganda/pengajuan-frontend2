'use client';

import React, { useState } from 'react';
import { Search, User, CreditCard, Calendar, MapPin, Wallet, Building, AlertCircle, Info } from 'lucide-react';
import { PengecekanRepositoryImpl } from '../data/PengecekanRepositoryImpl';
import { Pensiunan } from '../core/PensiunanEntity';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const repository = new PengecekanRepositoryImpl();

export const PengecekanPage = () => {
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

    const d = (val: any) => val || '-';

    return (
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
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-8">
                                        <InfoItem label="Tanggal Lahir" value={d(result.tanggal_lahir)} icon={<Calendar className="h-4 w-4" />} />
                                        <InfoItem label="Jenis Kelamin" value={d(result.jenis_kelamin)} icon={<User className="h-4 w-4" />} />
                                        <InfoItem label="Jenis Pensiun" value={d(result.jenis_pensiun)} icon={<Wallet className="h-4 w-4" />} />
                                        <InfoItem label="Kantor Bayar" value={d(result.kantor_bayar)} icon={<Building className="h-4 w-4" />} />
                                        <InfoItem label="Alamat" value={d(result.alamat)} icon={<MapPin className="h-4 w-4" />} wide />
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
};

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

const MoneyCard = ({ label, value, type }: { label: string, value: number, type: 'plus' | 'minus' | 'neutral' }) => {
    const money = new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

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
