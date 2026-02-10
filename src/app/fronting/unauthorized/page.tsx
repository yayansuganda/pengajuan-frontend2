'use client';

import React from 'react';
import { XCircle, ShieldAlert } from 'lucide-react';

export default function UnauthorizedPage() {
    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                {/* Error Card */}
                <div className="bg-white rounded-2xl shadow-2xl p-8 text-center">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className="relative">
                            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
                                <ShieldAlert className="w-12 h-12 text-white" strokeWidth={2.5} />
                            </div>
                            <div className="absolute -top-2 -right-2 w-10 h-10 rounded-full bg-red-500 flex items-center justify-center shadow-lg animate-pulse">
                                <XCircle className="w-6 h-6 text-white" strokeWidth={3} />
                            </div>
                        </div>
                    </div>

                    {/* Title */}
                    <h1 className="text-2xl font-bold text-slate-900 mb-3">
                        Akses Ditolak
                    </h1>

                    {/* Message */}
                    <p className="text-slate-600 mb-6 leading-relaxed">
                        Maaf, Anda tidak diijinkan untuk mengakses menu fronting.
                        Halaman ini hanya dapat diakses oleh petugas POS yang terverifikasi.
                    </p>

                    {/* Additional Info */}
                    <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                        <p className="text-sm text-red-800 font-medium">
                            <strong>Alasan:</strong> Data autentikasi tidak valid atau Anda bukan petugas POS.
                        </p>
                    </div>

                    {/* Info */}
                    <div className="text-xs text-slate-500 space-y-1">
                        <p>Jika Anda merasa ini adalah kesalahan,</p>
                        <p>silakan hubungi administrator sistem.</p>
                    </div>

                    {/* Footer */}
                    <div className="mt-8 pt-6 border-t border-slate-200">
                        <p className="text-[10px] text-slate-400 font-medium">
                            &copy; 2026 PT. BPRS HIK Cibitung<br />
                            Mobile Fronting System v2.4.0
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
