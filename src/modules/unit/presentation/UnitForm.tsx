'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { Unit, CreateUnitDTO, UpdateUnitDTO } from '../core/UnitEntity';
import { UnitRepositoryImpl } from '../data/UnitRepositoryImpl';
import { showLoading, hideLoading, showSuccess, showError } from '@/shared/utils/sweetAlert';

const unitRepository = new UnitRepositoryImpl();

interface UnitFormProps {
    unitId?: number;
}

export const UnitForm: React.FC<UnitFormProps> = ({ unitId }) => {
    const router = useRouter();
    const [loading, setLoading] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const [formData, setFormData] = useState({
        code: '',
        name: '',
        description: '',
        address: '',
        phone: '',
        is_active: true,
    });

    useEffect(() => {
        if (unitId) {
            fetchUnit();
        }
    }, [unitId]);

    const fetchUnit = async () => {
        try {
            showLoading('Memuat data unit...');
            setLoading(true);
            const unit = await unitRepository.getById(unitId!);
            setFormData({
                code: unit.code,
                name: unit.name,
                description: unit.description || '',
                address: unit.address || '',
                phone: unit.phone || '',
                is_active: unit.is_active,
            });
            hideLoading();
        } catch (error: any) {
            hideLoading();
            showError(error.message || 'Gagal memuat data unit');
            router.push('/unit');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.code.trim()) {
            showError('Kode unit harus diisi');
            return;
        }
        if (!formData.name.trim()) {
            showError('Nama unit harus diisi');
            return;
        }

        try {
            showLoading(unitId ? 'Mengupdate unit...' : 'Menambahkan unit...');
            setSubmitting(true);

            if (unitId) {
                // Update
                await unitRepository.update(unitId, formData as UpdateUnitDTO);
                hideLoading();
                await showSuccess('Unit berhasil diupdate');
            } else {
                // Create
                await unitRepository.create(formData as CreateUnitDTO);
                hideLoading();
                await showSuccess('Unit berhasil ditambahkan');
            }

            router.push('/unit');
        } catch (error: any) {
            hideLoading();
            showError(error.message || 'Gagal menyimpan data unit');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Header */}
                <div className="mb-8">
                    <button
                        onClick={() => router.push('/unit')}
                        className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 mb-4"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Kembali ke Daftar Unit
                    </button>
                    <h1 className="text-3xl font-bold text-gray-900">
                        {unitId ? 'Edit Unit' : 'Tambah Unit Baru'}
                    </h1>
                    <p className="mt-2 text-sm text-gray-600">
                        {unitId ? 'Perbarui informasi unit' : 'Tambahkan unit baru ke sistem'}
                    </p>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6">
                    <div className="space-y-6">
                        {/* Code */}
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-gray-700">
                                Kode Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="code"
                                required
                                value={formData.code}
                                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: UNIT-A"
                            />
                            <p className="mt-1 text-xs text-gray-500">Kode unik untuk unit ini</p>
                        </div>

                        {/* Name */}
                        <div>
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nama Unit <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="name"
                                required
                                value={formData.name}
                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: Unit Cabang Jakarta"
                            />
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                                Deskripsi
                            </label>
                            <textarea
                                id="description"
                                rows={3}
                                value={formData.description}
                                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Deskripsi singkat tentang unit ini..."
                            />
                        </div>

                        {/* Address */}
                        <div>
                            <label htmlFor="address" className="block text-sm font-medium text-gray-700">
                                Alamat
                            </label>
                            <textarea
                                id="address"
                                rows={2}
                                value={formData.address}
                                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Alamat lengkap unit..."
                            />
                        </div>

                        {/* Phone */}
                        <div>
                            <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
                                Telepon
                            </label>
                            <input
                                type="tel"
                                id="phone"
                                value={formData.phone}
                                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                                placeholder="Contoh: 021-12345678"
                            />
                        </div>

                        {/* Is Active */}
                        <div className="flex items-center">
                            <input
                                type="checkbox"
                                id="is_active"
                                checked={formData.is_active}
                                onChange={(e) => setFormData({ ...formData, is_active: e.target.checked })}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <label htmlFor="is_active" className="ml-2 block text-sm text-gray-700">
                                Unit Aktif
                            </label>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="mt-6 flex items-center justify-end gap-4">
                        <button
                            type="button"
                            onClick={() => router.push('/unit')}
                            className="rounded-md bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={submitting}
                            className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 disabled:bg-gray-300 disabled:cursor-not-allowed"
                        >
                            <Save className="h-4 w-4" />
                            {submitting ? 'Menyimpan...' : 'Simpan'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
