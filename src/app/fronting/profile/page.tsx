'use client';

import React, { useState, useEffect } from 'react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { User, Mail, Phone, Building2, MapPin, CreditCard, Calendar, Info, LogOut } from 'lucide-react';
import { getFrontingUser, type FrontingUserData } from '@/modules/fronting/core/frontingAuth';
import { useRouter } from 'next/navigation';

export default function ProfilePage() {
    const router = useRouter();
    const [frontingUser, setFrontingUser] = useState<FrontingUserData | null>(null);

    useEffect(() => {
        const userData = getFrontingUser();
        setFrontingUser(userData);
    }, []);

    const handleBackToPospay = () => {
        if (confirm('Apakah Anda yakin ingin kembali ke Pospay?')) {
            // Logout: Clear all localStorage
            localStorage.removeItem('fronting_user');
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            
            console.log('[Profile] Logging out and redirecting to Pospay...');
            
            // Redirect back to Flutter app (Pospay)
            if (typeof window !== 'undefined' && (window as any).flutter_inappwebview) {
                (window as any).flutter_inappwebview.callHandler('BackToHome', 'logout');
                console.log('[Profile] ✓ Flutter handler called: BackToHome');
            } else {
                // Fallback jika tidak di Flutter webview
                console.warn('[Profile] Flutter webview not available, redirecting to login');
                router.push('/auth/login');
            }
        }
    };

    if (!frontingUser) {
        return (
            <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
                <div className="pt-6 px-4 pb-24">
                    <div className="text-center py-12">
                        <User className="w-16 h-16 text-slate-300 mx-auto mb-4" />
                        <p className="text-slate-500">Data tidak tersedia</p>
                        <p className="text-xs text-slate-400 mt-2">Silakan akses dari menu fronting</p>
                    </div>
                </div>
            </MobileLayoutWrapper>
        );
    }

    return (
        <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
            <div className="pt-6 px-4 pb-24">
                {/* Header */}
                <div className="mb-6">
                    <h1 className="text-xl font-bold text-slate-800 mb-2">Profil Petugas</h1>
                    <p className="text-sm text-slate-500">Informasi data petugas dari POS Indonesia</p>
                </div>

                {/* Profile Card */}
                <div className="bg-gradient-to-br from-indigo-600 to-violet-600 rounded-2xl p-6 mb-4 shadow-lg">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-16 h-16 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
                            <User className="w-8 h-8 text-white" />
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-white">{frontingUser.name}</h2>
                            <p className="text-sm text-indigo-100">Petugas Pos</p>
                        </div>
                    </div>
                    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-3">
                        <div className="flex items-center gap-2">
                            <CreditCard className="w-4 h-4 text-white" />
                            <span className="text-xs text-indigo-100">NIPPOS</span>
                        </div>
                        <p className="text-base font-bold text-white mt-1">{frontingUser.nippos}</p>
                    </div>
                </div>

                {/* Detail Information - Show ALL data from localStorage */}
                <div className="space-y-3 mb-6">
                    {Object.entries(frontingUser)
                        .filter(([key]) => key !== 'timestamp') // Only hide timestamp (technical field)
                        .sort(([keyA], [keyB]) => {
                            // Sort order: important fields first
                            const order = ['nippos', 'name', 'account_no', 'phone', 'kcu_name', 'kcu_code', 'kc_name', 'kc_code', 'kcp_name', 'kcp_code', 'role'];
                            const indexA = order.indexOf(keyA);
                            const indexB = order.indexOf(keyB);
                            if (indexA === -1 && indexB === -1) return 0;
                            if (indexA === -1) return 1;
                            if (indexB === -1) return -1;
                            return indexA - indexB;
                        })
                        .map(([key, value]) => {
                            // Determine icon and color based on key
                            let icon = Info;
                            let gradient = 'from-slate-500 to-slate-600';
                            let label = key.toUpperCase();
                            let isLink = false;
                            
                            // Show all fields, even if empty
                            const displayValue = value === null || value === undefined || value === '' ? '-' : String(value);

                            // Customize based on field name
                            if (key === 'name') {
                                icon = User;
                                gradient = 'from-indigo-500 to-violet-500';
                                label = 'Nama';
                            } else if (key === 'nippos') {
                                icon = CreditCard;
                                gradient = 'from-blue-500 to-cyan-500';
                                label = 'NIPPOS';
                            } else if (key === 'account_no') {
                                icon = CreditCard;
                                gradient = 'from-blue-500 to-cyan-500';
                                label = 'Nomor Rekening';
                            } else if (key === 'phone') {
                                icon = Phone;
                                gradient = 'from-emerald-500 to-teal-500';
                                label = 'Nomor Telepon';
                                isLink = true;
                            } else if (key === 'kcu_name') {
                                icon = Building2;
                                gradient = 'from-violet-500 to-purple-500';
                                label = 'Kantor Cabang Utama (KCU)';
                            } else if (key === 'kcu_code') {
                                icon = Building2;
                                gradient = 'from-violet-500 to-purple-500';
                                label = 'Kode KCU';
                            } else if (key === 'kc_name') {
                                icon = MapPin;
                                gradient = 'from-amber-500 to-orange-500';
                                label = 'Kantor Cabang (KC)';
                            } else if (key === 'kc_code') {
                                icon = MapPin;
                                gradient = 'from-amber-500 to-orange-500';
                                label = 'Kode KC';
                            } else if (key === 'kcp_name') {
                                icon = MapPin;
                                gradient = 'from-rose-500 to-pink-500';
                                label = 'Kantor Cabang Pembantu (KCP)';
                            } else if (key === 'kcp_code') {
                                icon = MapPin;
                                gradient = 'from-rose-500 to-pink-500';
                                label = 'Kode KCP';
                            } else if (key === 'role') {
                                icon = User;
                                gradient = 'from-indigo-500 to-purple-500';
                                label = 'Role';
                            }

                            const IconComponent = icon;

                            return (
                                <div key={key} className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100">
                                    <div className="flex items-start gap-3">
                                        <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${gradient} flex items-center justify-center shrink-0`}>
                                            <IconComponent className="w-5 h-5 text-white" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h3 className="text-xs text-slate-500 mb-1">{label}</h3>
                                            {isLink && key === 'phone' ? (
                                                <a 
                                                    href={`tel:${displayValue}`} 
                                                    className="text-sm font-bold text-emerald-600 hover:text-emerald-700 transition-colors break-all"
                                                >
                                                    {displayValue}
                                                </a>
                                            ) : (
                                                <p className="text-sm font-bold text-slate-800 break-all">{displayValue}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                </div>

                {/* Back to Pospay Button */}
                <button
                    onClick={handleBackToPospay}
                    className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-semibold py-4 px-6 rounded-2xl shadow-lg transition-all flex items-center justify-center gap-2"
                >
                    <LogOut className="w-5 h-5" />
                    Kembali ke Pospay
                </button>

                {/* Info */}
                <div className="mt-4 bg-blue-50 rounded-xl p-4 border border-blue-100">
                    <div className="flex items-start gap-2">
                        <Info className="w-5 h-5 text-blue-600 shrink-0 mt-0.5" />
                        <div>
                            <p className="text-xs text-blue-900 font-medium mb-1">Informasi</p>
                            <p className="text-xs text-blue-700 leading-relaxed">
                                Data ini diambil dari sistem POS Indonesia dan di-decrypt secara otomatis saat Anda mengakses halaman fronting.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </MobileLayoutWrapper>
    );
}
