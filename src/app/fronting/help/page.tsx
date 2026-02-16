'use client';

import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { Book } from 'lucide-react';

export default function HelpPage() {
    return (
        <MobileLayoutWrapper showBackground={true} moduleName="fronting" forceVisible={true}>
            <div className="min-h-screen pb-24">
                <div className="relative z-10 pt-10 px-4">
                    {/* Header */}
                    <div className="mb-6">
                        <div className="flex items-center gap-3 mb-2">
                            <div className="w-12 h-12 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                                <Book className="w-6 h-6 text-white" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Pertanyaan Umum</h1>
                                <p className="text-sm text-slate-600">FAQ</p>
                            </div>
                        </div>
                    </div>

                    {/* FAQ Section */}
                    <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
                        <div className="space-y-3">
                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="font-medium text-sm text-slate-900">Bagaimana cara mengajukan pembiayaan?</span>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 px-3 py-2 text-sm text-slate-600 leading-relaxed">
                                    Klik menu "Pengajuan" → "Buat Baru", lalu isi formulir dengan lengkap dan upload dokumen yang diperlukan.
                                </div>
                            </details>

                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="font-medium text-sm text-slate-900">Berapa lama proses verifikasi?</span>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 px-3 py-2 text-sm text-slate-600 leading-relaxed">
                                    Proses verifikasi membutuhkan waktu 1-3 hari kerja setelah semua dokumen lengkap.
                                </div>
                            </details>

                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="font-medium text-sm text-slate-900">Dokumen apa saja yang diperlukan?</span>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 px-3 py-2 text-sm text-slate-600 leading-relaxed">
                                    KTP, Slip Gaji, Foto diri, dan dokumen pendukung lainnya sesuai jenis pembiayaan yang diajukan.
                                </div>
                            </details>

                            <details className="group">
                                <summary className="flex items-center justify-between cursor-pointer list-none p-3 bg-slate-50 rounded-lg hover:bg-slate-100 transition-colors">
                                    <span className="font-medium text-sm text-slate-900">Bagaimana cara melihat status pengajuan?</span>
                                    <span className="text-slate-400 group-open:rotate-180 transition-transform">▼</span>
                                </summary>
                                <div className="mt-2 px-3 py-2 text-sm text-slate-600 leading-relaxed">
                                    Buka menu "Pengajuan" untuk melihat semua status pengajuan Anda secara realtime.
                                </div>
                            </details>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayoutWrapper>
    );
}
