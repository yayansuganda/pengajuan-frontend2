'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Save, Settings as SettingsIcon, AlertCircle, Info } from 'lucide-react';
import { Setting, UpdateSettingDTO } from '../core/Entity';
import { SettingRepositoryImpl } from '../data/RepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';

const repository = new SettingRepositoryImpl();

export const SettingsList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [activeSetting, setActiveSetting] = useState<Setting | null>(null);
    const [formData, setFormData] = useState({
        batas_usia_perhitungan_lunas: 90,
        jasa_perbulan: 2.00,
        description: '',
    });
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Redirect if not super-admin
        if (user && user.role !== 'super-admin') {
            router.push('/dashboard');
            return;
        }
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
                description: active.description || '',
            });
            setIsLoading(false);
        } catch (error: any) {
            console.log('No active setting found, using default values');
            setIsLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (formData.batas_usia_perhitungan_lunas <= 0) {
            showError('Batas usia harus lebih dari 0');
            return;
        }

        if (formData.jasa_perbulan < 0 || formData.jasa_perbulan > 100) {
            showError('Jasa perbulan harus antara 0 dan 100');
            return;
        }

        try {
            showLoading('Menyimpan pengaturan...');

            if (activeSetting) {
                // Update existing setting
                await repository.update(activeSetting.id, formData as UpdateSettingDTO);
            } else {
                // Create new setting if none exists
                await repository.create(formData);
            }

            hideLoading();
            await showSuccess('Pengaturan berhasil disimpan');
            fetchActiveSetting();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal menyimpan pengaturan'));
        }
    };

    if (isLoading) {
        return (
            <div className="px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-64">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                        <p className="mt-4 text-sm text-gray-500">Memuat pengaturan...</p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="px-4 sm:px-6 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="bg-indigo-100 p-2 rounded-lg">
                        <SettingsIcon className="h-6 w-6 text-indigo-600" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-semibold text-gray-900">Pengaturan Perhitungan</h1>
                        <p className="text-sm text-gray-600">
                            Konfigurasi parameter untuk perhitungan pembiayaan
                        </p>
                    </div>
                </div>
            </div>

            {/* Info Alert */}
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                    <Info className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-blue-900">Informasi</h3>
                        <p className="mt-1 text-sm text-blue-700">
                            Pengaturan ini akan digunakan untuk semua perhitungan pembiayaan di sistem. 
                            Pastikan nilai yang dimasukkan sudah sesuai sebelum menyimpan.
                        </p>
                    </div>
                </div>
            </div>

            {/* Configuration Form Card */}
            <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
                <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                    <h2 className="text-base font-semibold text-gray-900">Parameter Perhitungan</h2>
                    <p className="mt-1 text-sm text-gray-600">
                        Atur nilai-nilai yang akan digunakan dalam perhitungan pembiayaan
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="p-6">
                    <div className="space-y-6">
                        {/* Batas Usia */}
                        <div>
                            <label htmlFor="batas_usia" className="block text-sm font-medium text-gray-900 mb-2">
                                Batas Usia Perhitungan Lunas <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="batas_usia"
                                    required
                                    min="1"
                                    max="150"
                                    value={formData.batas_usia_perhitungan_lunas}
                                    onChange={(e) => setFormData({ ...formData, batas_usia_perhitungan_lunas: parseInt(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Contoh: 90"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">Tahun</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Batas usia maksimal yang digunakan untuk menghitung jangka waktu pelunasan pembiayaan
                            </p>
                        </div>

                        {/* Jasa Perbulan */}
                        <div>
                            <label htmlFor="jasa_perbulan" className="block text-sm font-medium text-gray-900 mb-2">
                                Jasa Perbulan <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type="number"
                                    id="jasa_perbulan"
                                    required
                                    min="0"
                                    max="100"
                                    step="0.01"
                                    value={formData.jasa_perbulan}
                                    onChange={(e) => setFormData({ ...formData, jasa_perbulan: parseFloat(e.target.value) || 0 })}
                                    className="w-full px-4 py-3 pr-12 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                    placeholder="Contoh: 2.00"
                                />
                                <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none">
                                    <span className="text-gray-500 font-medium">%</span>
                                </div>
                            </div>
                            <p className="mt-2 text-sm text-gray-500">
                                Persentase jasa yang dikenakan per bulan terhadap pembiayaan (0-100%)
                            </p>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-900 mb-2">
                                Catatan / Keterangan
                            </label>
                            <textarea
                                id="description"
                                rows={4}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="w-full px-4 py-3 text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
                                placeholder="Tambahkan catatan atau keterangan terkait pengaturan ini..."
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Catatan ini bersifat opsional dan hanya untuk referensi internal
                            </p>
                        </div>

                        {/* Warning Alert */}
                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                            <div className="flex gap-3">
                                <AlertCircle className="h-5 w-5 text-amber-600 flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                    <h3 className="text-sm font-medium text-amber-900">Perhatian</h3>
                                    <p className="mt-1 text-sm text-amber-700">
                                        Perubahan pengaturan ini akan mempengaruhi seluruh perhitungan pembiayaan baru. 
                                        Pastikan nilai yang dimasukkan sudah benar sebelum menyimpan.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-8 flex items-center justify-end gap-3 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={() => router.push('/dashboard')}
                            className="rounded-lg bg-white px-4 py-2.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                        >
                            <Save className="h-4 w-4" />
                            Simpan Pengaturan
                        </button>
                    </div>
                </form>
            </div>

            {/* Current Values Display */}
            {activeSetting && (
                <div className="mt-6 bg-gray-50 rounded-lg p-5 border border-gray-200">
                    <h3 className="text-sm font-medium text-gray-900 mb-3">Pengaturan Saat Ini</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <SettingsIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Batas Usia</p>
                                <p className="text-lg font-semibold text-gray-900">{activeSetting.batas_usia_perhitungan_lunas} Tahun</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-3 bg-white rounded-lg p-4 border border-gray-200">
                            <div className="bg-indigo-100 p-2 rounded-lg">
                                <SettingsIcon className="h-5 w-5 text-indigo-600" />
                            </div>
                            <div>
                                <p className="text-xs text-gray-500">Jasa Perbulan</p>
                                <p className="text-lg font-semibold text-gray-900">{activeSetting.jasa_perbulan}%</p>
                            </div>
                        </div>
                    </div>
                    <p className="mt-3 text-xs text-gray-500">
                        Terakhir diperbarui: {new Date(activeSetting.updated_at).toLocaleString('id-ID', {
                            day: '2-digit',
                            month: 'long',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                        })}
                    </p>
                </div>
            )}
        </div>
    );
};
