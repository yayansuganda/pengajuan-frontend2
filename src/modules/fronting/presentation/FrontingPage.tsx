'use client';

import React, { useMemo, useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { FileText, Activity, CheckCircle, XCircle, Wallet, Truck, Flag, FileUp } from 'lucide-react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { usePengajuan } from '@/modules/pengajuan/presentation/usePengajuan';
import {
    decryptFrontingData,
    isValidPOSOfficer,
    storeFrontingUser,
    getFrontingUser,
    isFrontingSessionValid,
    type FrontingUserData
} from '@/modules/fronting/core/frontingAuth';

export const FrontingPage = () => {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [frontingUser, setFrontingUser] = useState<FrontingUserData | null>(null);
    const [isAuthChecking, setIsAuthChecking] = useState(true);
    const [decryptError, setDecryptError] = useState<string>('');
    const [decryptedRawText, setDecryptedRawText] = useState<string>('');

    // Try to get pengajuan data, but handle cases where auth is not available
    let pengajuanList: any[] = [];
    try {
        const pengajuanHook = usePengajuan();
        pengajuanList = pengajuanHook?.pengajuanList || [];
    } catch (error) {
        // If usePengajuan throws (no auth context), use empty array
        console.log('[FrontingPage] usePengajuan not available, using empty array');
        pengajuanList = [];
    }

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    const normalizeStatus = (status?: string) => (status || '').trim().toLowerCase();

    // Calculate stats
    const stats = useMemo(() => {
        const calculateSum = (items: typeof pengajuanList) => items.reduce((sum, item) => sum + (Number(item.jumlah_pembiayaan) || 0), 0);

        const disetujui = pengajuanList.filter(item => normalizeStatus(item.status) === 'disetujui');
        const pending = pengajuanList.filter(item => normalizeStatus(item.status) === 'pending');
        const ditolak = pengajuanList.filter(item => normalizeStatus(item.status) === 'ditolak');
        const pencairan = pengajuanList.filter(item => ['menunggu pencairan', 'dicairkan'].includes(normalizeStatus(item.status)));
        const verifikasiAdminUnit = pengajuanList.filter(item => normalizeStatus(item.status) === 'menunggu verifikasi admin unit');
        const berkasDikirim = pengajuanList.filter(item => normalizeStatus(item.status) === 'menunggu verifikasi akhir');
        const selesai = pengajuanList.filter(item => normalizeStatus(item.status) === 'selesai');
        const belumSelesai = pengajuanList.filter(item => normalizeStatus(item.status) !== 'selesai');

        return {
            total: { count: belumSelesai.length, amount: calculateSum(belumSelesai) },
            approved: { count: disetujui.length, amount: calculateSum(disetujui) },
            pending: { count: pending.length, amount: calculateSum(pending) },
            rejected: { count: ditolak.length, amount: calculateSum(ditolak) },
            disbursed: { count: pencairan.length, amount: calculateSum(pencairan) },
            verifikasiAdminUnit: { count: verifikasiAdminUnit.length, amount: calculateSum(verifikasiAdminUnit) },
            berkasDikirim: { count: berkasDikirim.length, amount: calculateSum(berkasDikirim) },
            completed: { count: selesai.length, amount: calculateSum(selesai) },
        };
    }, [pengajuanList]);

    const statsDisplay = [
        {
            name: 'Total Pengajuan',
            value: stats.total.count.toString(),
            amount: formatCurrency(stats.total.amount),
            icon: FileText,
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Disetujui',
            value: stats.approved.count.toString(),
            amount: formatCurrency(stats.approved.amount),
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            name: 'Pending',
            value: stats.pending.count.toString(),
            amount: formatCurrency(stats.pending.amount),
            icon: Activity,
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            name: 'Ditolak',
            value: stats.rejected.count.toString(),
            amount: formatCurrency(stats.rejected.amount),
            icon: XCircle,
            gradient: 'from-rose-500 to-pink-500',
        },
        {
            name: 'Pencairan',
            value: stats.disbursed.count.toString(),
            amount: formatCurrency(stats.disbursed.amount),
            icon: Wallet,
            gradient: 'from-violet-500 to-purple-500',
        },
        {
            name: 'Verifikasi Admin Unit',
            value: stats.verifikasiAdminUnit.count.toString(),
            amount: formatCurrency(stats.verifikasiAdminUnit.amount),
            icon: Truck,
            gradient: 'from-indigo-500 to-blue-500',
        },
        {
            name: 'Berkas Dikirim',
            value: stats.berkasDikirim.count.toString(),
            amount: formatCurrency(stats.berkasDikirim.amount),
            icon: Flag,
            gradient: 'from-fuchsia-500 to-pink-500',
        },
        {
            name: 'Selesai',
            value: stats.completed.count.toString(),
            amount: formatCurrency(stats.completed.amount),
            icon: Flag,
            gradient: 'from-cyan-500 to-teal-500',
        },
    ];

    // Authentication check - USING EXACT LOGIC FROM test-decrypt (YANG BERHASIL!)
    useEffect(() => {
        const checkAuth = async () => {
            try {
                console.log('[FrontingPage] Starting authentication check...');

                // EXACT sama seperti test-decrypt
                const encryptedData = searchParams?.get('data');

                if (!encryptedData) {
                    console.log('[FrontingPage] No data parameter, checking localStorage...');
                    const storedUser = getFrontingUser();

                    if (storedUser && isFrontingSessionValid()) {
                        console.log('[FrontingPage] ✅ Valid stored session');
                        setFrontingUser(storedUser);
                        setIsAuthChecking(false);
                    } else {
                        console.log('[FrontingPage] ⚠️ No valid session');
                        setIsAuthChecking(false);
                        setDecryptError('No encrypted data provided');
                    }
                    return;
                }

                console.log('[FrontingPage] ✓ Got encrypted data: ' + encryptedData.substring(0, 50) + '...');
                console.log('[FrontingPage] Data length: ' + encryptedData.length + ' chars');

                // Call decrypt - EXACT sama seperti test-decrypt
                console.log('[FrontingPage] Calling decryptFrontingData (async)...');
                const userData = await decryptFrontingData(encryptedData);

                if (userData) {
                    console.log('[FrontingPage] ✅ Decryption successful!');
                    console.log('[FrontingPage] User: ' + userData.name);
                    console.log('[FrontingPage] NIPPOS: ' + userData.nippos);
                    console.log('[FrontingPage] Account: ' + userData.account_no);

                    // Store and display (NO VALIDATION)
                    storeFrontingUser(userData);
                    setFrontingUser(userData);
                    setIsAuthChecking(false);
                    setDecryptError('');

                    // Clean URL
                    setTimeout(() => {
                        console.log('[FrontingPage] Cleaning URL...');
                        router.replace('/fronting');
                    }, 100);
                } else {
                    console.log('[FrontingPage] ❌ Decryption returned null');
                    setDecryptError('Decryption failed - returned null. Check browser console for details.');
                    setIsAuthChecking(false);
                }

            } catch (error: any) {
                console.log('[FrontingPage] ❌ Error: ' + error.message);
                console.log('[FrontingPage] Stack: ' + error.stack);
                setDecryptError(error.message);
                setIsAuthChecking(false);
            }
        };

        checkAuth();
    }, [searchParams, router]);

    // Show loading while checking auth
    if (isAuthChecking) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center max-w-md mx-auto px-4">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium mb-2">Memverifikasi akses dan mendekripsi data...</p>
                    {decryptError && (
                        <div className="mt-4 bg-red-50 border border-red-200 rounded-lg p-3 text-left">
                            <p className="text-red-900 font-semibold text-sm mb-1">⚠️ Error:</p>
                            <p className="text-red-700 text-xs">{decryptError}</p>
                            <p className="text-red-600 text-xs mt-2">Check browser console (F12) for details</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // If decryption failed but not checking anymore, show error state
    if (!frontingUser && decryptError) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center p-4">
                <div className="text-center max-w-4xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-900 mb-3">Decryption Failed</h1>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-left mb-4">
                            <p className="text-red-900 font-semibold text-sm mb-2">Error Details:</p>
                            <p className="text-red-700 text-sm font-mono break-all">{decryptError}</p>
                        </div>

                        {/* Special message for JSON parse errors */}
                        {decryptError.includes('JSON') && (
                            <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4 text-left mb-4">
                                <p className="text-yellow-900 font-semibold text-sm mb-2">🔍 JSON Parse Error Detected</p>
                                <p className="text-yellow-800 text-xs mb-2">
                                    Good news: Decryption succeeded! But the output is not valid JSON.
                                </p>
                                <p className="text-yellow-700 text-xs font-semibold">
                                    Check console (F12) and look for: "===== FULL DECRYPTED TEXT ====="
                                </p>
                            </div>
                        )}

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <p className="text-blue-900 font-semibold text-sm mb-2">📋 How to Debug:</p>
                            <ol className="text-left text-blue-800 text-xs space-y-1 list-decimal list-inside">
                                <li>Press <kbd className="px-2 py-1 bg-blue-200 rounded font-mono text-xs">F12</kbd> to open Developer Tools</li>
                                <li>Go to <strong>Console</strong> tab</li>
                                <li>Look for logs starting with <code className="bg-blue-200 px-1 rounded">[frontingAuth]</code></li>
                                <li>Find <code className="bg-blue-200 px-1 rounded">===== FULL DECRYPTED TEXT =====</code></li>
                                <li>Copy the full decrypted text and share it</li>
                            </ol>
                        </div>

                        <p className="text-slate-600 text-sm mb-4">
                            The console contains detailed step-by-step decryption logs
                        </p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                        >
                            Try Again
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // If no user and no error, show no data state
    if (!frontingUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <div className="text-center max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-6xl mb-4">🔒</div>
                        <h1 className="text-2xl font-bold text-slate-900 mb-3">No Data Available</h1>
                        <p className="text-slate-600 text-sm mb-4">
                            Please access this page with a valid encrypted data parameter
                        </p>
                        <p className="text-slate-500 text-xs font-mono">
                            URL format: /fronting/?data=ENCRYPTED_DATA
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
            {/* Full Page Gradient Background */}
            <div className="min-h-screen relative">
                {/* Fixed Background Image */}
                <div className="fixed inset-0 z-0">
                    <img
                        src="/images/loan_header_bg.png"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    {/* Light Overlay to ensure content readability */}
                    <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[2px]"></div>
                </div>

                {/* Content */}
                <div className="pt-6 px-4 pb-6 relative z-10">
                    {/* Success Banner - Show decrypted data */}
                    <div className="mb-4 bg-gradient-to-r from-green-600 to-emerald-600 rounded-2xl p-4 shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="text-3xl">✅</div>
                            <div className="flex-1">
                                <p className="text-white font-bold text-sm mb-1">Decryption Successful!</p>
                                <p className="text-green-100 text-xs">Data berhasil didekripsi dan ditampilkan di dashboard</p>
                            </div>
                        </div>
                    </div>

                    {/* Welcome Card */}
                    <div className="mb-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Portal Fronting</p>
                                <h1 className="text-xl font-bold text-white">
                                    {frontingUser?.name || 'Petugas POS'} 👋
                                </h1>
                            </div>
                            <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                                <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                <span className="text-[10px] font-bold text-emerald-300">POS</span>
                            </div>
                        </div>
                        {/* User Details */}
                        <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-700">
                            <div>
                                <p className="text-[9px] text-slate-500 mb-0.5">NIPPOS</p>
                                <p className="text-xs font-semibold text-slate-300">{frontingUser?.nippos || '-'}</p>
                            </div>
                            <div>
                                <p className="text-[9px] text-slate-500 mb-0.5">No. Rekening</p>
                                <p className="text-xs font-semibold text-slate-300">{frontingUser?.account_no || '-'}</p>
                            </div>
                            <div className="col-span-2">
                                <p className="text-[9px] text-slate-500 mb-0.5">Kantor</p>
                                <p className="text-xs font-semibold text-slate-300">{frontingUser?.kcu_name || frontingUser?.kc_name || '-'}</p>
                            </div>
                        </div>
                    </div>

                    {/* Stats Grid - Dashboard Style */}
                    <div className="mb-4">
                        <div className="grid grid-cols-2 gap-2.5">
                            {statsDisplay.map((stat, idx) => {
                                const Icon = stat.icon;
                                return (
                                    <div
                                        key={idx}
                                        className="bg-white/90 backdrop-blur-sm rounded-xl p-3 shadow-sm border border-white hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-center gap-2.5">
                                            <div className={`w-9 h-9 rounded-lg bg-gradient-to-br ${stat.gradient} flex items-center justify-center shadow-md shrink-0`}>
                                                <Icon className="w-4 h-4 text-white" strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xl font-bold text-slate-900 leading-none mb-0.5">{stat.value}</p>
                                                <p className="text-[10px] font-bold text-slate-500 mb-0.5">{stat.amount}</p>
                                                <p className="text-[10px] font-semibold text-slate-600 truncate">{stat.name}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Decrypted Data Card - DEBUGGING */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white mb-4">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-800 mb-2 flex items-center gap-2">
                                <span>🔓</span>
                                <span>Decrypted User Data (Raw JSON)</span>
                            </h3>
                            <div className="bg-slate-900 rounded-lg p-3 overflow-x-auto">
                                <pre className="text-xs text-green-400 font-mono">
                                    {JSON.stringify(frontingUser, null, 2)}
                                </pre>
                            </div>
                        </div>
                    </div>

                    {/* Info Card */}
                    <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white">
                        <div className="space-y-2">
                            <h3 className="text-xs font-bold text-slate-800 mb-2">Informasi Layanan</h3>
                            <div className="space-y-2">
                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 shrink-0"></div>
                                    <p className="leading-relaxed">Layanan pengajuan dan pengecekan pembiayaan untuk pensiunan</p>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-1.5 shrink-0"></div>
                                    <p className="leading-relaxed">Proses verifikasi data dan monitoring status realtime</p>
                                </div>
                                <div className="flex items-start gap-2 text-xs text-slate-600">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0"></div>
                                    <p className="leading-relaxed">Akses dashboard untuk analisis dan statistik lengkap</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Info */}
                    <div className="mt-8 text-center">
                        <p className="text-[10px] text-slate-400/80 font-medium">
                            &copy; 2026 PT. BPRS HIK Cibitung<br />
                            Mobile Fronting System v2.4.0
                        </p>
                    </div>
                </div>
            </div>
        </MobileLayoutWrapper>
    );
};

// Export with Suspense wrapper to avoid useSearchParams error
export default function FrontingPageWrapper() {
    console.log('[FrontingPageWrapper] Component mounted');

    return (
        <Suspense fallback={
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Memuat halaman...</p>
                    <p className="text-slate-500 text-sm mt-2">Loading Suspense...</p>
                </div>
            </div>
        }>
            <FrontingPage />
        </Suspense>
    );
}
