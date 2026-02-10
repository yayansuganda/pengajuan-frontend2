'use client';

import React from 'react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { HelpCircle, Phone, Mail, MapPin, Clock, FileText, Info, AlertCircle } from 'lucide-react';

export default function HelpPage() {
    return (
        <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
            <div className="pt-6 px-4 pb-24">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Bantuan & Informasi</h1>
                    <p className="text-sm text-slate-500">Panduan dan kontak untuk layanan fronting</p>
                </div>

                {/* Contact Cards */}
                <div className="space-y-3 mb-6">
                    {/* Phone */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                <Phone className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Telepon</h3>
                                <p className="text-xs text-slate-500 mb-2">Hubungi kami untuk bantuan</p>
                                <a href="tel:+622188888888" className="text-sm font-semibold text-blue-600">+62 21 8888 8888</a>
                            </div>
                        </div>
                    </div>

                    {/* Email */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center shrink-0">
                                <Mail className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Email</h3>
                                <p className="text-xs text-slate-500 mb-2">Kirim pertanyaan Anda</p>
                                <a href="mailto:info@bprshik.co.id" className="text-sm font-semibold text-emerald-600">info@bprshik.co.id</a>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-amber-500 to-orange-500 flex items-center justify-center shrink-0">
                                <MapPin className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Alamat Kantor</h3>
                                <p className="text-xs text-slate-500 leading-relaxed">
                                    Jl. Raya Cibitung No. 123, Cibitung, Bekasi Utara, Jawa Barat 17520
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Operating Hours */}
                    <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                        <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center shrink-0">
                                <Clock className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex-1">
                                <h3 className="text-sm font-bold text-slate-800 mb-1">Jam Operasional</h3>
                                <div className="space-y-1 text-xs text-slate-600">
                                    <p>Senin - Jumat: 08:00 - 16:00</p>
                                    <p>Sabtu: 08:00 - 12:00</p>
                                    <p className="text-slate-400 italic">Minggu & Hari Libur: Tutup</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* FAQ Section */}
                <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 mb-6">
                    <div className="flex items-center gap-2 mb-4">
                        <Info className="w-5 h-5 text-indigo-600" />
                        <h2 className="text-sm font-bold text-slate-800">Pertanyaan Umum</h2>
                    </div>
                    <div className="space-y-3">
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Apa itu layanan fronting?</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Layanan fronting adalah layanan pengajuan dan verifikasi pembiayaan khusus untuk nasabah pensiunan.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Bagaimana cara mengajukan pembiayaan?</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Gunakan menu "Pengajuan" untuk membuat pengajuan baru, lengkapi data yang diperlukan, dan submit untuk diproses.
                            </p>
                        </div>
                        <div>
                            <h4 className="text-xs font-bold text-slate-800 mb-1">Berapa lama proses verifikasi?</h4>
                            <p className="text-xs text-slate-600 leading-relaxed">
                                Proses verifikasi biasanya memakan waktu 1-3 hari kerja tergantung kelengkapan dokumen.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Important Notes */}
                <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100">
                    <div className="flex items-start gap-2">
                        <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
                        <div>
                            <h3 className="text-xs font-bold text-amber-900 mb-2">Catatan Penting</h3>
                            <ul className="space-y-1.5 text-xs text-amber-800">
                                <li className="flex items-start gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Pastikan data yang dimasukkan akurat dan sesuai dokumen asli</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Simpan nomor referensi pengajuan untuk tracking status</span>
                                </li>
                                <li className="flex items-start gap-2">
                                    <span className="shrink-0">•</span>
                                    <span>Hubungi customer service jika ada kendala atau pertanyaan</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayoutWrapper>
    );
}
