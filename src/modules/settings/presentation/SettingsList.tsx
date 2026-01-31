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
    <div className="px-4 sm:px-6 lg:px-8">
        {isLoading ? (
            <div className="flex items-center justify-center h-64">
                <div className="text-center"><div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div><p className="mt-4 text-sm text-gray-500">Memuat pengaturan...</p></div>
            </div>
        ) : (
            <>
                <div className="mb-6">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="bg-indigo-100 p-2 rounded-lg"><SettingsIcon className="h-6 w-6 text-indigo-600" /></div>
                        <div><h1 className="text-2xl font-semibold text-gray-900">Pengaturan Perhitungan</h1><p className="text-sm text-gray-600">Konfigurasi parameter untuk perhitungan pembiayaan</p></div>
                    </div>
                </div>

                <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex gap-3"><Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" /><div className="flex-1"><h3 className="text-sm font-medium text-blue-900">Informasi</h3><p className="mt-1 text-sm text-blue-700">Pengaturan ini akan digunakan untuk semua perhitungan pembiayaan di sistem. Pastikan nilai yang dimasukkan sudah sesuai sebelum menyimpan.</p></div></div>
                </div>

                <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4"><h2 className="text-base font-semibold text-gray-900">Parameter Perhitungan</h2><p className="mt-1 text-sm text-gray-600">Atur nilai-nilai yang akan digunakan dalam perhitungan pembiayaan</p></div>
                    <form onSubmit={handleSubmit} className="p-6">
                        <div className="space-y-6">
                            <div>
                                <label htmlFor="batas_usia" className="block text-sm font-medium text-gray-900 mb-2">Batas Usia Perhitungan Lunas <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type="number" id="batas_usia" required min="1" max="150" value={formData.batas_usia_perhitungan_lunas} onChange={(e) => setFormData({ ...formData, batas_usia_perhitungan_lunas: parseInt(e.target.value) || 0 })} className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: 90" />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-gray-500 font-medium">Tahun</span></div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Batas usia maksimal yang digunakan untuk menghitung jangka waktu pelunasan pembiayaan</p>
                            </div>
                            <div>
                                <label htmlFor="jasa_perbulan" className="block text-sm font-medium text-gray-900 mb-2">Jasa Perbulan <span className="text-red-500">*</span></label>
                                <div className="relative">
                                    <input type="number" id="jasa_perbulan" required min="0" max="100" step="0.01" value={formData.jasa_perbulan} onChange={(e) => setFormData({ ...formData, jasa_perbulan: parseFloat(e.target.value) || 0 })} className="w-full px-4 py-3 pr-12 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" placeholder="Contoh: 2.00" />
                                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none"><span className="text-gray-500 font-medium">%</span></div>
                                </div>
                                <p className="mt-2 text-sm text-gray-500">Persentase jasa yang dikenakan per bulan terhadap pembiayaan (0-100%)</p>
                            </div>
                            <div>
                                <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">Catatan / Keterangan</label>
                                <textarea id="description" rows={4} value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none" placeholder="Tambahkan catatan atau keterangan terkait pengaturan ini..." />
                                <p className="mt-2 text-sm text-gray-500">Catatan ini bersifat opsional dan hanya untuk referensi internal</p>
                            </div>
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                                <div className="flex gap-3"><AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" /><div className="flex-1"><h3 className="text-sm font-medium text-amber-900">Perhatian</h3><p className="mt-1 text-sm text-amber-700">Perubahan pengaturan ini akan mempengaruhi seluruh perhitungan pembiayaan baru. Pastikan nilai yang dimasukkan sudah benar sebelum menyimpan.</p></div></div>
                            </div>
                        </div>
                        <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                            <button type="button" onClick={() => router.push('/dashboard')} className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">Batal</button>
                            <button type="submit" className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"><Save className="h-4 w-4" /> Simpan Pengaturan</button>
                        </div>
                    </form>
                </div>

                {activeSetting && (
                    <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                        <h3 className="text-sm font-medium text-gray-900 mb-3">Pengaturan Saat Ini</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200">
                                <div className="bg-indigo-100 p-2 rounded-lg"><SettingsIcon className="h-5 w-5 text-indigo-600" /></div>
                                <div><p className="text-xs text-gray-500">Batas Usia</p><p className="text-lg font-semibold text-gray-900">{activeSetting.batas_usia_perhitungan_lunas} Tahun</p></div>
                            </div>
                            <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200">
                                <div className="bg-indigo-100 p-2 rounded-lg"><SettingsIcon className="h-5 w-5 text-indigo-600" /></div>
                                <div><p className="text-xs text-gray-500">Jasa Perbulan</p><p className="text-lg font-semibold text-gray-900">{activeSetting.jasa_perbulan}%</p></div>
                            </div>
                        </div>
                        <p className="mt-3 text-xs text-gray-500">Terakhir diperbarui: {new Date(activeSetting.updated_at).toLocaleString('id-ID', { day: '2-digit', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                    </div>
                )}
            </>
        )}
    </div>
);

// --- Main Container ---
export const SettingsList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [activeSetting, setActiveSetting] = useState<Setting | null>(null);
    const [formData, setFormData] = useState({ batas_usia_perhitungan_lunas: 90, jasa_perbulan: 2.00, description: '' });
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
            setFormData({ batas_usia_perhitungan_lunas: active.batas_usia_perhitungan_lunas, jasa_perbulan: active.jasa_perbulan, description: active.description || '' });
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
