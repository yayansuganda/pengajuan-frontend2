'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Settings as SettingsIcon, AlertCircle, Info, Calculator, Percent } from 'lucide-react';
import { Setting, UpdateSettingDTO } from '../core/Entity';
import { SettingRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const repository = new SettingRepositoryImpl();

// Interface
interface ViewProps {
    formData: any;
    setFormData: (val: any) => void;
    handleSubmit: (e: React.FormEvent) => void;
    activeSetting: Setting | null;
    isLoading: boolean;
    router: any;
}

// --- Mobile View ---
const MobileView = ({ formData, setFormData, handleSubmit, activeSetting, isLoading, router }: ViewProps) => (
    <MobileLayoutWrapper>
        <div className="pt-6 px-4 pb-24">
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800">Pengaturan</h1>
                <p className="text-sm text-slate-500">Konfigurasi parameter sistem</p>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-10"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div></div>
            ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Info Card */}
                    <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 flex gap-3 items-start">
                        <Info className="text-blue-600 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs text-blue-800 leading-relaxed">Pengaturan ini digunakan untuk seluruh perhitungan pembiayaan baru.</p>
                    </div>

                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <Calculator className="w-4 h-4 text-slate-400" /> Batas Usia Lunas
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="1"
                                    max="150"
                                    value={formData.batas_usia_perhitungan_lunas}
                                    onChange={(e) => setFormData({ ...formData, batas_usia_perhitungan_lunas: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">TAHUN</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <Percent className="w-4 h-4 text-slate-400" /> Jasa Perbulan
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.jasa_perbulan}
                                    onChange={(e) => setFormData({ ...formData, jasa_perbulan: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
                            </div>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide flex items-center gap-2">
                                <Percent className="w-4 h-4 text-slate-400" /> Fee Pelayanan Pos
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.fee_pelayanan_pos}
                                    onChange={(e) => setFormData({ ...formData, fee_pelayanan_pos: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-slate-800 font-semibold"
                                />
                                <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-bold text-slate-500">%</span>
                            </div>
                            <p className="mt-1 text-[10px] text-slate-400">Default: 3%</p>
                        </div>

                        <div>
                            <label className="block text-xs font-bold text-slate-700 mb-2 uppercase tracking-wide">Catatan</label>
                            <textarea
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                placeholder="Tambahkan catatan (opsional)..."
                            />
                        </div>
                    </div>

                    {/* Mobile: Limitasi Produk Card */}
                    <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-5">
                        <h3 className="text-sm font-bold text-slate-800 border-b border-slate-100 pb-2">Limitasi Produk</h3>

                        {/* Mikro */}
                        <div>
                            <h4 className="text-xs font-semibold text-emerald-600 mb-3 uppercase">Kategori Mikro</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Tenor</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.mikro_jangka_waktu}
                                            onChange={(e) => setFormData({ ...formData, mikro_jangka_waktu: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">BLN</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Plafond</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('id-ID').format(formData.mikro_maksimal_pembiayaan)}
                                            onChange={(e) => setFormData({ ...formData, mikro_maksimal_pembiayaan: parseInt(e.target.value.replace(/\./g, '')) || 0 })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">IDR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Makro */}
                        <div className="pt-4 border-t border-slate-100">
                            <h4 className="text-xs font-semibold text-blue-600 mb-3 uppercase">Kategori Makro</h4>
                            <div className="space-y-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Tenor</label>
                                    <div className="relative">
                                        <input
                                            type="number"
                                            value={formData.makro_jangka_waktu}
                                            onChange={(e) => setFormData({ ...formData, makro_jangka_waktu: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">BLN</span>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Plafond</label>
                                    <div className="relative">
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('id-ID').format(formData.makro_maksimal_pembiayaan)}
                                            onChange={(e) => setFormData({ ...formData, makro_maksimal_pembiayaan: parseInt(e.target.value.replace(/\./g, '')) || 0 })}
                                            className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                                        />
                                        <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500">IDR</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100 flex gap-3 items-start">
                        <AlertCircle className="text-amber-600 w-5 h-5 shrink-0 mt-0.5" />
                        <p className="text-xs text-amber-800 leading-relaxed">Perubahan akan langsung berefek pada sistem. Pastikan data benar.</p>
                    </div>

                    <button
                        type="submit"
                        className="w-full bg-indigo-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-indigo-200 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Save className="w-5 h-5" /> Simpan Pengaturan
                    </button>

                    {activeSetting && (
                        <p className="text-center text-[10px] text-slate-400 mt-4">
                            Terakhir diupdate: {new Date(activeSetting.updated_at).toLocaleDateString('id-ID')}
                        </p>
                    )}
                </form>
            )}
        </div>
    </MobileLayoutWrapper>
);

// --- Desktop View ---
const DesktopView = ({ formData, setFormData, handleSubmit, activeSetting, isLoading, router }: ViewProps) => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-12">
        {isLoading ? (
            <div className="flex flex-col items-center justify-center min-h-[400px]">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                <p className="text-gray-500 font-medium">Memuat pengaturan...</p>
            </div>
        ) : (
            <form onSubmit={handleSubmit} className="space-y-8">
                {/* Header */}
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-4">
                        <div className="bg-gradient-to-br from-indigo-500 to-violet-600 p-3 rounded-xl shadow-lg shadow-indigo-200">
                            <SettingsIcon className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Pengaturan Sistem</h1>
                            <p className="text-sm text-gray-500 mt-1">Konfigurasi parameter global dan limitasi produk</p>
                        </div>
                    </div>
                    {activeSetting && (
                        <div className="text-right">
                            <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-1">Terakhir Diperbarui</p>
                            <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                                {new Date(activeSetting.updated_at).toLocaleString('id-ID', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short'
                                })}
                            </span>
                        </div>
                    )}
                </div>

                {/* Info Card */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 flex gap-3 items-start relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-blue-100 rounded-full blur-3xl opacity-50 -mr-16 -mt-16"></div>
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5 relative z-10" />
                    <div className="relative z-10">
                        <h3 className="text-sm font-semibold text-blue-900">Informasi Penting</h3>
                        <p className="mt-1 text-sm text-blue-700 leading-relaxed">
                            Pengaturan ini bersifat global dan akan mempengaruhi seluruh perhitungan simulasi pembiayaan baru.
                            Pastikan nilai yang diinput sudah sesuai dengan kebijakan perusahaan.
                        </p>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Card 1: Pengaturan Umum */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-3">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <Calculator className="w-5 h-5 text-indigo-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Parameter Umum</h2>
                                <p className="text-xs text-gray-500">Konfigurasi dasar perhitungan</p>
                            </div>
                        </div>
                        <div className="p-6 space-y-6">
                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Batas Usia Pelunasan
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        required
                                        min="1"
                                        max="150"
                                        value={formData.batas_usia_perhitungan_lunas}
                                        onChange={(e) => setFormData({ ...formData, batas_usia_perhitungan_lunas: parseInt(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        placeholder="Contoh: 90"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">TAHUN</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Usia maksimal nasabah saat pembiayaan lunas</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Jasa Perbulan
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.jasa_perbulan}
                                        onChange={(e) => setFormData({ ...formData, jasa_perbulan: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        placeholder="Contoh: 2.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">%</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Persentase jasa charged per bulan</p>
                            </div>

                            <div>
                                <label className="block text-sm font-semibold text-gray-700 mb-2">
                                    Fee Pelayanan Pos
                                </label>
                                <div className="relative group">
                                    <input
                                        type="number"
                                        required
                                        min="0"
                                        max="100"
                                        step="0.01"
                                        value={formData.fee_pelayanan_pos}
                                        onChange={(e) => setFormData({ ...formData, fee_pelayanan_pos: parseFloat(e.target.value) || 0 })}
                                        className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        placeholder="Contoh: 3.00"
                                    />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                        <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">%</span>
                                    </div>
                                </div>
                                <p className="mt-2 text-xs text-gray-500">Persentase fee pelayanan untuk Petugas Pos (default: 3%)</p>
                            </div>
                        </div>
                    </div>

                    {/* Card 2: Limitasi Produk (Unified) */}
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden hover:shadow-md transition-shadow duration-300">
                        <div className="border-b border-gray-100 bg-gray-50/50 px-6 py-4 flex items-center gap-3">
                            <div className="bg-emerald-100 p-2 rounded-lg">
                                <SettingsIcon className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div>
                                <h2 className="text-base font-bold text-gray-900">Limitasi Produk</h2>
                                <p className="text-xs text-gray-500">Konfigurasi batasan untuk setiap kategori produk</p>
                            </div>
                        </div>

                        <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-8 relative">
                            {/* Vertical Divider for Desktop */}
                            <div className="hidden md:block absolute top-6 bottom-6 left-1/2 w-px bg-gray-100 -ml-px"></div>

                            {/* Section: Mikro */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kategori Mikro</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Maksimal Jangka Waktu
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.mikro_jangka_waktu}
                                            onChange={(e) => setFormData({ ...formData, mikro_jangka_waktu: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">BULAN</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Batas maksimal tenor untuk pembiayaan Mikro</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Maksimal Pembiayaan
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-gray-500">Rp</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('id-ID').format(formData.mikro_maksimal_pembiayaan)}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value.replace(/\./g, '')) || 0;
                                                setFormData({ ...formData, mikro_maksimal_pembiayaan: val });
                                            }}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Plafond maksimal untuk kategori Mikro</p>
                                </div>
                            </div>

                            {/* Section: Makro */}
                            <div className="space-y-6">
                                <div className="flex items-center gap-2 mb-4">
                                    <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                                    <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider">Kategori Makro</h3>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Maksimal Jangka Waktu
                                    </label>
                                    <div className="relative group">
                                        <input
                                            type="number"
                                            required
                                            min="0"
                                            value={formData.makro_jangka_waktu}
                                            onChange={(e) => setFormData({ ...formData, makro_jangka_waktu: parseInt(e.target.value) || 0 })}
                                            className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        />
                                        <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-gray-400 bg-gray-50 px-2 py-1 rounded">BULAN</span>
                                        </div>
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Batas maksimal tenor untuk pembiayaan Makro</p>
                                </div>

                                <div>
                                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                                        Maksimal Pembiayaan
                                    </label>
                                    <div className="relative group">
                                        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                            <span className="text-sm font-bold text-gray-500">Rp</span>
                                        </div>
                                        <input
                                            type="text"
                                            value={new Intl.NumberFormat('id-ID').format(formData.makro_maksimal_pembiayaan)}
                                            onChange={(e) => {
                                                const val = parseInt(e.target.value.replace(/\./g, '')) || 0;
                                                setFormData({ ...formData, makro_maksimal_pembiayaan: val });
                                            }}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all font-medium text-gray-900 group-hover:border-gray-300"
                                        />
                                    </div>
                                    <p className="mt-2 text-xs text-gray-500">Plafond maksimal untuk kategori Makro</p>
                                </div>
                            </div>
                        </div>
                    </div>


                </div>

                {/* Footer Actions */}
                <div className="flex items-center justify-end gap-4 pt-6 mt-4 border-t border-gray-200">
                    <button
                        type="button"
                        onClick={() => router.push('/dashboard')}
                        className="px-6 py-3 rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-100 hover:text-gray-900 transition-colors border border-transparent hover:border-gray-200"
                    >
                        Batal
                    </button>
                    <button
                        type="submit"
                        className="inline-flex items-center gap-2 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-bold shadow-lg shadow-indigo-200 hover:shadow-indigo-300 transform active:scale-95 transition-all"
                    >
                        <Save className="h-5 w-5" />
                        Simpan Perubahan
                    </button>
                </div>
            </form>
        )}
    </div>
);

// --- Main Container ---
export const SettingsList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [activeSetting, setActiveSetting] = useState<Setting | null>(null);
    const [formData, setFormData] = useState({
        batas_usia_perhitungan_lunas: 90,
        jasa_perbulan: 2.00,
        fee_pelayanan_pos: 3.00,
        mikro_jangka_waktu: 0,
        mikro_maksimal_pembiayaan: 0,
        makro_jangka_waktu: 0,
        makro_maksimal_pembiayaan: 0,
        description: ''
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
        fetchActiveSetting();
    }, [user]);

    const fetchActiveSetting = async () => {
        try {
            setIsLoading(true);
            const active = await repository.getActive();
            setActiveSetting(active);
            setFormData({
                batas_usia_perhitungan_lunas: active.batas_usia_perhitungan_lunas,
                jasa_perbulan: active.jasa_perbulan,
                fee_pelayanan_pos: active.fee_pelayanan_pos ?? 3.00,
                mikro_jangka_waktu: active.mikro_jangka_waktu || 0,
                mikro_maksimal_pembiayaan: active.mikro_maksimal_pembiayaan || 0,
                makro_jangka_waktu: active.makro_jangka_waktu || 0,
                makro_maksimal_pembiayaan: active.makro_maksimal_pembiayaan || 0,
                description: active.description || ''
            });
            setIsLoading(false);
        } catch (error: any) {
            console.log('No active setting found, using default values');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (formData.batas_usia_perhitungan_lunas <= 0) { showError('Batas usia harus lebih dari 0'); return; }
        if (formData.jasa_perbulan < 0 || formData.jasa_perbulan > 100) { showError('Jasa perbulan harus antara 0 dan 100'); return; }

        try {
            showLoading('Menyimpan pengaturan...');
            if (activeSetting) { await repository.update(activeSetting.id, formData as UpdateSettingDTO); }
            else { await repository.create(formData); }
            hideLoading();
            await showSuccess('Pengaturan berhasil disimpan');
            fetchActiveSetting();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal menyimpan pengaturan')); }
    };

    const viewProps = { formData, setFormData, handleSubmit, activeSetting, isLoading, router };

    return (
        <>
            <div className="md:hidden"><MobileView {...viewProps} /></div>
            <div className="hidden md:block"><DesktopView {...viewProps} /></div>
        </>
    );
};
