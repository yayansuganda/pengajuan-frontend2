'use client';

import React, { useEffect, useState, useMemo, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { FileText, Activity, CheckCircle, XCircle, Wallet, Truck, Flag, AlertCircle, ChevronRight, Edit2, FileUp } from 'lucide-react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { usePengajuan } from '@/modules/pengajuan/presentation/usePengajuan';
import {
    decryptFrontingData,
    storeFrontingUser,
    getFrontingUser,
    isFrontingSessionValid,
    type FrontingUserData
} from '@/modules/fronting/core/frontingAuth';
import { AuthRepositoryImpl } from '@/modules/auth/data/AuthRepositoryImpl';
import { PengajuanRepositoryImpl } from '@/modules/pengajuan/data/PengajuanRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';

function FrontingPageContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user } = useAuth();
    const [frontingUser, setFrontingUser] = useState<FrontingUserData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [isAutoLoggingIn, setIsAutoLoggingIn] = useState(false);
    const [isLoggedIn, setIsLoggedIn] = useState(false);
    const [pengajuanList, setPengajuanList] = useState<any[]>([]);
    const [loadingPengajuan, setLoadingPengajuan] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const [hasError, setHasError] = useState(false);

    const authRepository = new AuthRepositoryImpl();
    const pengajuanRepository = new PengajuanRepositoryImpl();

    // Function to trigger refresh from outside (can be called when new pengajuan created)
    const refreshPengajuanData = () => {
        console.log('[FrontingPage] Manual refresh triggered');
        setRefreshTrigger(prev => prev + 1);
    };

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate stats
    const stats = useMemo(() => {
        const calculateSum = (items: typeof pengajuanList) => items.reduce((sum, item) => sum + (Number(item.jumlah_pembiayaan) || 0), 0);

        const approved = pengajuanList.filter(item => ['Disetujui', 'Menunggu Verifikasi Admin Unit', 'Menunggu Pencairan'].includes(item.status));
        const pending = pengajuanList.filter(item => ['Pending', 'Revisi', 'Menunggu Approval Manager'].includes(item.status));
        const rejected = pengajuanList.filter(item => item.status === 'Ditolak');
        const disbursed = pengajuanList.filter(item => item.status === 'Dicairkan');
        const menungguPencairan = pengajuanList.filter(item => item.status === 'Menunggu Pencairan');
        const completed = pengajuanList.filter(item => item.status === 'Selesai');

        return {
            total: { count: pengajuanList.length, amount: calculateSum(pengajuanList) },
            approved: { count: approved.length, amount: calculateSum(approved) },
            pending: { count: pending.length, amount: calculateSum(pending) },
            rejected: { count: rejected.length, amount: calculateSum(rejected) },
            disbursed: { count: disbursed.length, amount: calculateSum(disbursed) },
            menungguPencairan: { count: menungguPencairan.length, amount: calculateSum(menungguPencairan) },
            completed: { count: completed.length, amount: calculateSum(completed) },
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
            name: 'Pending / Proses',
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
            name: 'Dicairkan',
            value: stats.disbursed.count.toString(),
            amount: formatCurrency(stats.disbursed.amount),
            icon: Wallet,
            gradient: 'from-teal-500 to-green-500',
        },
        {
            name: 'Menunggu Pencairan',
            value: stats.menungguPencairan.count.toString(),
            amount: formatCurrency(stats.menungguPencairan.amount),
            icon: Truck,
            gradient: 'from-indigo-500 to-blue-500',
        },
        {
            name: 'Selesai',
            value: stats.completed.count.toString(),
            amount: formatCurrency(stats.completed.amount),
            icon: Flag,
            gradient: 'from-cyan-500 to-teal-500',
        },
    ];

    // Helper function to redirect back to Flutter app
    const backToHome = () => {
        try {
            console.log('[FrontingPage] Redirecting back to Flutter app...');
            // Call Flutter webview handler
            if (typeof window !== 'undefined' && (window as any).flutter_inappwebview) {
                (window as any).flutter_inappwebview.callHandler('BackToHome', 'back-to-home');
            } else {
                console.warn('[FrontingPage] Flutter webview not available, cannot redirect');
            }
        } catch (error) {
            console.error('[FrontingPage] Error calling Flutter handler:', error);
            alert(error);
        }
    };

    // Auto-login function for Petugas Pos
    const autoLoginPetugasPos = async () => {
        try {
            console.log('[FrontingPage] Starting auto-login for Petugas Pos...');
            setIsAutoLoggingIn(true);

            const username = 'usr_a9F3KxQ2ZL8M7WcR4E6dY0TnJH5U1PVBsOimA';
            const password = 'P9Z7XH0fQ5JkC2B8M4dYxWnR3E1U6SAVTLmOiKe';

            const loginResponse = await authRepository.login(username, password);

            if (loginResponse.token) {
                console.log('[FrontingPage] ✅ Auto-login successful!');
                console.log('[FrontingPage] User:', loginResponse.user);
                // Token and user already stored by authRepository.login()
                setIsLoggedIn(true); // Update state to trigger re-render
                return true;
            } else {
                console.error('[FrontingPage] ❌ Auto-login failed: No token received');
                return false;
            }
        } catch (error: any) {
            console.error('[FrontingPage] ❌ Auto-login error:', error);
            // Don't block the fronting page if auto-login fails
            return false;
        } finally {
            setIsAutoLoggingIn(false);
        }
    };

    // Fetch pengajuan data with filter for Petugas Pos
    // NIPPOS diambil dari localStorage (fronting_user) yang sudah di-decrypt
    useEffect(() => {
        const fetchPengajuanData = async () => {
            // Only fetch if user is logged in
            if (!isLoggedIn || !user) {
                console.log('[FrontingPage] Waiting for user login...');
                return;
            }
            
            // Log current user role for debugging
            console.log('[FrontingPage] 👤 Current user role:', user.role);
            console.log('[FrontingPage] 👤 Current user ID:', user.id);
            console.log('[FrontingPage] 👤 Current user unit:', user.unit || '(no unit)');

            // IMPORTANT: Ambil NIPPOS dari localStorage (fronting_user yang sudah di-decrypt)
            // Ini adalah source of truth untuk data petugas POS
            const storedUser = getFrontingUser();
            if (!storedUser) {
                console.log('[FrontingPage] ❌ No fronting_user data in localStorage');
                return;
            }

            if (!storedUser.nippos) {
                console.log('[FrontingPage] ❌ NIPPOS not found in fronting_user data');
                console.log('[FrontingPage] fronting_user data:', storedUser);
                return;
            }

            try {
                setLoadingPengajuan(true);
                console.log('[FrontingPage] 📊 ========== FETCHING PENGAJUAN ==========');
                console.log('[FrontingPage] NIPPOS from localStorage:', storedUser.nippos);
                console.log('[FrontingPage] Petugas Name:', storedUser.name);
                console.log('[FrontingPage] Kantor:', storedUser.kcu_name || storedUser.kc_name);
                console.log('[FrontingPage] User Role:', user.role);
                console.log('[FrontingPage] Filter object:', { petugas_nippos: storedUser.nippos });
                
                // Fetch dengan filter petugas_nippos dari localStorage
                const data = await pengajuanRepository.getPengajuanList({
                    petugas_nippos: storedUser.nippos // Ambil dari localStorage
                });
                
                console.log('[FrontingPage] ✅ Raw response data:', data);
                console.log('[FrontingPage] ✅ Pengajuan count:', data.length);
                
                // IMPORTANT: Verify that returned data actually has the correct NIPPOS
                if (data.length > 0) {
                    console.log('[FrontingPage] 📋 Sample data (first 3 items):');
                    data.slice(0, 3).forEach((item: any, idx: number) => {
                        console.log(`  [${idx + 1}] ID: ${item.id?.substring(0, 8)}...`);
                        console.log(`      Name: ${item.name || item.borrower_name}`);
                        console.log(`      NIPPOS: ${item.petugas_nippos || '(NULL - no NIPPOS!)'}`);
                        console.log(`      Expected: ${storedUser.nippos}`);
                        console.log(`      Match: ${item.petugas_nippos === storedUser.nippos ? '✅' : '❌ MISMATCH!'}`);
                    });
                    
                    // Count how many items actually match the NIPPOS
                    const matchCount = data.filter((item: any) => item.petugas_nippos === storedUser.nippos).length;
                    const nullCount = data.filter((item: any) => !item.petugas_nippos).length;
                    
                    console.log('[FrontingPage] 📊 Filter Verification:');
                    console.log(`  Total items: ${data.length}`);
                    console.log(`  Items with matching NIPPOS: ${matchCount}`);
                    console.log(`  Items with NULL NIPPOS: ${nullCount}`);
                    console.log(`  Items with different NIPPOS: ${data.length - matchCount - nullCount}`);
                    
                    if (matchCount !== data.length) {
                        console.error('[FrontingPage] ❌❌❌ FILTER NOT WORKING! ❌❌❌');
                        console.error('[FrontingPage] Backend returned data that does NOT match the filter!');
                        console.error('[FrontingPage] Expected NIPPOS:', storedUser.nippos);
                        console.error('[FrontingPage] This means backend filter is not applied correctly.');
                    } else {
                        console.log('[FrontingPage] ✅ All data matches the NIPPOS filter!');
                    }
                }
                
                setPengajuanList(Array.isArray(data) ? data : []);
                console.log('[FrontingPage] ========== FETCH COMPLETE ==========');
            } catch (err: any) {
                console.error('[FrontingPage] ❌ Error fetching pengajuan:', err);
                console.error('[FrontingPage] Error response:', err.response);
                setPengajuanList([]);
            } finally {
                setLoadingPengajuan(false);
            }
        };

        fetchPengajuanData();
    }, [isLoggedIn, user, refreshTrigger]); // Tambahkan refreshTrigger untuk manual refresh

    // DECRYPTION LOGIC - OPTIMIZED: Show page immediately after decrypt, auto-login in background
    useEffect(() => {
        const handleDecryption = async () => {
            try {
                console.log('[FrontingPage] ========== STARTING FRONTING PAGE ==========');
                console.log('[FrontingPage] URL:', window?.location?.href);
                console.log('[FrontingPage] Has searchParams:', !!searchParams);

                // FIRST: Check localStorage (simple check, no validation)
                const storedUser = getFrontingUser();
                if (storedUser) {
                    console.log('[FrontingPage] ✅ Found data in localStorage');
                    setFrontingUser(storedUser);
                    setIsLoading(false); // Show page immediately
                    
                    // Auto-login in background (non-blocking)
                    const token = localStorage.getItem('token');
                    if (!token) {
                        console.log('[FrontingPage] No backend auth token, attempting auto-login in background...');
                        autoLoginPetugasPos(); // Don't await - run in background
                    } else {
                        console.log('[FrontingPage] ✅ Backend auth token found, user already logged in');
                        setIsLoggedIn(true); // Set state if already logged in
                    }
                    
                    return;
                }

                // SECOND: No localStorage? Check for encrypted data parameter
                const encryptedData = searchParams?.get('data');

                if (!encryptedData) {
                    console.log('[FrontingPage] ⚠️ No data in localStorage and no encrypted parameter');
                    console.log('[FrontingPage] User mengakses halaman fronting tanpa data');
                    console.log('[FrontingPage] Expected URL: /fronting?data=ENCRYPTED_DATA');
                    console.log('[FrontingPage] Actual URL:', window.location.href);
                    setIsLoading(false);
                    setFrontingUser(null); // Explicitly set null to trigger "No Data" screen
                    // Don't set error, let it fall through to "No user state" screen
                    return;
                }

                console.log('[FrontingPage] ✓ Got encrypted data: ' + encryptedData.substring(0, 50) + '...');
                console.log('[FrontingPage] Data length: ' + encryptedData.length + ' chars');

                // Decrypt
                console.log('[FrontingPage] Decrypting...');
                const userData = await decryptFrontingData(encryptedData);

                if (userData) {
                    console.log('[FrontingPage] ✅ Decryption successful!');
                    console.log('[FrontingPage] User: ' + userData.name);

                    // Save to localStorage (NO VALIDATION)
                    storeFrontingUser(userData);
                    setFrontingUser(userData);
                    
                    // Show page immediately - don't wait for auto-login
                    setIsLoading(false);
                    
                    // Clean URL immediately (non-blocking)
                    router.replace('/fronting');
                    
                    // AUTO-LOGIN in background (non-blocking)
                    console.log('[FrontingPage] Attempting auto-login in background...');
                    autoLoginPetugasPos().then(loginSuccess => {
                        if (loginSuccess) {
                            console.log('[FrontingPage] ✅ Auto-login completed, user now authenticated');
                            console.log('[FrontingPage] ✅ User dapat mengakses semua fitur dengan role Petugas Pos');
                        } else {
                            console.log('[FrontingPage] ⚠️ Auto-login failed, but fronting page still accessible');
                            console.log('[FrontingPage] ℹ️ Pastikan user Petugas Pos sudah dibuat di menu Users:');
                            console.log('[FrontingPage] ℹ️ - Username: usr_a9F3KxQ2ZL8M7WcR4E6dY0TnJH5U1PVBsOimA');
                            console.log('[FrontingPage] ℹ️ - Role: Petugas Pos');
                        }
                    });
                } else {
                    console.log('[FrontingPage] ❌ Decryption failed');
                    setError('Decryption failed. Redirecting back...');
                    setIsLoading(false);

                    // Redirect back to Flutter app after 2 seconds
                    setTimeout(() => {
                        backToHome();
                    }, 2000);
                }

            } catch (err: any) {
                console.log('[FrontingPage] ❌ Error: ' + err.message);
                setError(err.message + '. Redirecting back...');
                setIsLoading(false);

                // Redirect back to Flutter app after 2 seconds
                setTimeout(() => {
                    backToHome();
                }, 2000);
            }
        };

        // Wrap everything in try-catch to prevent blank page
        try {
            handleDecryption();
        } catch (err: any) {
            console.error('[FrontingPage] ❌ CRITICAL ERROR in useEffect:', err);
            setHasError(true);
            setError('Critical error: ' + (err?.message || 'Unknown error'));
            setIsLoading(false);
        }
    }, [searchParams, router]);

    // Critical error state - shown before any other check
    if (hasError && !isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">💥</div>
                            <h1 className="text-2xl font-bold text-red-900 mb-3">Application Error</h1>
                            <p className="text-slate-600 text-sm">
                                Terjadi kesalahan saat memuat halaman.
                            </p>
                        </div>

                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
                            <p className="text-xs font-semibold text-red-900 mb-2">Error Message:</p>
                            <p className="text-xs text-red-800 font-mono break-all">{error}</p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Muat Ulang
                            </button>
                            <button
                                onClick={() => {
                                    console.error('[FrontingPage] Full Error:', error);
                                    console.log('[FrontingPage] Current URL:', window.location.href);
                                    alert('Lihat console (F12) untuk detail error');
                                }}
                                className="px-6 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                            >
                                Debug Info
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Loading state - only show during decryption, not during auto-login
    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
                <div className="text-center">
                    <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                    <p className="text-slate-600 font-medium">Memverifikasi dan mendekripsi data...</p>
                    <p className="text-slate-500 text-sm mt-2">Mohon tunggu sebentar...</p>
                </div>
            </div>
        );
    }

    // Helper function to redirect back to Flutter app
    const backToHomeHandler = () => {
        try {
            console.log('[FrontingPage] Manual redirect back to Flutter app...');
            // Call Flutter webview handler
            if (typeof window !== 'undefined' && (window as any).flutter_inappwebview) {
                (window as any).flutter_inappwebview.callHandler('BackToHome', 'back-to-home');
            } else {
                console.warn('[FrontingPage] Flutter webview not available');
                alert('Flutter webview not available. Please close this window manually.');
            }
        } catch (error) {
            console.error('[FrontingPage] Error calling Flutter handler:', error);
            alert('Error: ' + error);
        }
    };

    // Error state
    if (error) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-red-100 to-red-200 flex items-center justify-center p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8 text-center">
                        <div className="text-6xl mb-4">❌</div>
                        <h1 className="text-2xl font-bold text-red-900 mb-3">Decryption Failed</h1>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                            <p className="text-red-900 font-semibold text-sm mb-2">Error:</p>
                            <p className="text-red-700 text-sm font-mono break-all">{error}</p>
                        </div>
                        <p className="text-slate-600 text-sm mb-4">
                            Redirecting back to home...
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={backToHomeHandler}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Back to Home
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="px-6 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
                            >
                                Try Again
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // No user state
    if (!frontingUser) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4">
                <div className="max-w-2xl mx-auto">
                    <div className="bg-white rounded-2xl shadow-xl p-8">
                        <div className="text-center mb-6">
                            <div className="text-6xl mb-4">🔒</div>
                            <h1 className="text-2xl font-bold text-slate-900 mb-3">Akses Tidak Valid</h1>
                            <p className="text-slate-600 text-sm">
                                Halaman ini hanya dapat diakses melalui aplikasi mobile dengan data terenkripsi.
                            </p>
                        </div>

                        <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                            <div className="flex items-start gap-3">
                                <span className="text-2xl">⚠️</span>
                                <div className="flex-1">
                                    <p className="text-sm font-semibold text-amber-900 mb-2">Cara Akses yang Benar:</p>
                                    <ol className="text-xs text-amber-800 space-y-1 list-decimal list-inside">
                                        <li>Buka aplikasi mobile (Flutter)</li>
                                        <li>Login dengan akun Petugas Pos</li>
                                        <li>Akses menu Fronting dari dalam aplikasi</li>
                                        <li>Data akan otomatis terenkripsi dan dikirim ke halaman web ini</li>
                                    </ol>
                                </div>
                            </div>
                        </div>

                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                            <p className="text-xs font-semibold text-blue-900 mb-1">💡 Info Teknis:</p>
                            <p className="text-xs text-blue-800">
                                Halaman ini memerlukan parameter <code className="bg-blue-100 px-1 rounded">?data=ENCRYPTED_DATA</code> yang berisi data user terenkripsi.
                            </p>
                        </div>

                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={backToHomeHandler}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-semibold hover:bg-blue-700 transition-colors"
                            >
                                Kembali ke Aplikasi
                            </button>
                            <button
                                onClick={() => {
                                    console.log('[FrontingPage] Current URL:', window.location.href);
                                    console.log('[FrontingPage] localStorage fronting_user:', localStorage.getItem('fronting_user'));
                                    console.log('[FrontingPage] localStorage token:', localStorage.getItem('token'));
                                    alert('Lihat console (F12) untuk informasi debug');
                                }}
                                className="px-6 py-2 bg-slate-600 text-white rounded-lg font-semibold hover:bg-slate-700 transition-colors"
                            >
                                Debug Info
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    // Main Dashboard - TAMPILAN CANTIK DARI FRONTINGPAGE YANG LAMA
    return (
        <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
            <div className="min-h-screen relative">
                {/* Fixed Background Image */}
                <div className="fixed inset-0 z-0">
                    <img
                        src="/images/loan_header_bg.png"
                        alt="Background"
                        className="w-full h-full object-cover"
                    />
                    <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[2px]"></div>
                </div>

                {/* Content */}
                <div className="pt-6 px-4 pb-6 relative z-10">
                    {/* Welcome Card */}
                    <div className="mb-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-5 shadow-lg">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Portal Fronting</p>
                                <h1 className="text-xl font-bold text-white">
                                    {frontingUser.name} 👋
                                </h1>
                            </div>
                            <div className="flex flex-col gap-1.5">
                                <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                                    <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                    <span className="text-[10px] font-bold text-emerald-300">AUTHENTICATED</span>
                                </div>
                                {isAutoLoggingIn && (
                                    <div className="inline-flex items-center gap-1.5 bg-amber-500/20 px-2.5 py-1 rounded-full border border-amber-400/30 animate-pulse">
                                        <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-spin"></div>
                                        <span className="text-[10px] font-bold text-amber-300">LOGGING IN...</span>
                                    </div>
                                )}
                                {!isAutoLoggingIn && isLoggedIn && (
                                    <div className="inline-flex items-center gap-1.5 bg-blue-500/20 px-2.5 py-1 rounded-full border border-blue-400/30">
                                        <span className="text-[10px] font-bold text-blue-300">✓ LOGGED IN</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    {/* Info: Data Filter by NIPPOS */}
                    {isLoggedIn && frontingUser?.nippos && (
                        <div className="mb-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-xl p-3 shadow-md">
                            <div className="flex items-center gap-2 text-white">
                                <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                                <p className="text-xs font-semibold">
                                    Data ter-filter untuk NIPPOS: {frontingUser.nippos}
                                </p>
                            </div>
                        </div>
                    )}

                    {/* Loading indicator saat fetch pengajuan */}
                    {loadingPengajuan && (
                        <div className="mb-4 bg-white/90 backdrop-blur-sm rounded-xl p-4 shadow-sm border border-white">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                <p className="text-sm font-medium text-slate-700">Memuat data pengajuan...</p>
                            </div>
                        </div>
                    )}

                    {/* Stats Grid - Dashboard Style */}
                    <div className="mb-4">
                        {/* Header dengan info filter */}
                        <div className="mb-3">
                            <div className="flex items-center justify-between mb-2">
                                <h2 className="text-sm font-bold text-slate-800">Statistik Pengajuan</h2>
                                {isLoggedIn && !loadingPengajuan && (
                                    <button 
                                        onClick={refreshPengajuanData}
                                        className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                                    >
                                        <span>🔄</span> Refresh
                                    </button>
                                )}
                            </div>
                        </div>

                        {!loadingPengajuan && pengajuanList.length === 0 && isLoggedIn && (
                            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-3 text-center">
                                <p className="text-sm text-amber-800 font-medium">📭 Belum ada pengajuan</p>
                            </div>
                        )}

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

                    {/* Revisi Items - Show items needing revision by petugas-pos */}
                    {!loadingPengajuan && pengajuanList.filter(item => item.status === 'Revisi').length > 0 && (
                        <div className="mb-4">
                            <div className="bg-rose-50 rounded-2xl p-4 border border-rose-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-3">
                                    <div className="p-1.5 bg-rose-100 rounded-full animate-pulse">
                                        <Edit2 className="w-4 h-4 text-rose-600" />
                                    </div>
                                    <h2 className="text-sm font-bold text-rose-900">
                                        Perlu Direvisi ({pengajuanList.filter(item => item.status === 'Revisi').length})
                                    </h2>
                                </div>
                                <div className="space-y-2">
                                    {pengajuanList.filter(item => item.status === 'Revisi').map((item: any) => (
                                        <div
                                            key={item.id}
                                            onClick={() => router.push(`/fronting/detail/${item.id}`)}
                                            className="bg-white rounded-xl p-3 border border-rose-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-xs font-bold text-slate-800 truncate">{item.nama_lengkap}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-rose-100 text-rose-700 whitespace-nowrap border border-rose-200">Revisi</span>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                        <Activity className="w-3 h-3" />
                                                        <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <Edit2 className="w-3 h-3 text-rose-500" />
                                                        <span className="text-rose-600 font-semibold">Perbaiki Data</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-rose-400 shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Disetujui Manager - Perlu Upload Dokumen */}
                    {!loadingPengajuan && pengajuanList.filter(item => item.status === 'Disetujui').length > 0 && (
                        <div className="mb-4">
                            <div className="bg-amber-50 rounded-2xl p-4 border border-amber-200 shadow-sm">
                                <div className="flex items-center gap-2 mb-2">
                                    <div className="p-1.5 bg-amber-100 rounded-full animate-pulse">
                                        <FileUp className="w-4 h-4 text-amber-600" />
                                    </div>
                                    <h2 className="text-sm font-bold text-amber-900">
                                        ✅ Disetujui Manager — Perlu Upload Dokumen ({pengajuanList.filter(item => item.status === 'Disetujui').length})
                                    </h2>
                                </div>
                                <p className="text-[10px] text-amber-700 bg-amber-100 rounded-lg px-3 py-2 mb-3">
                                    Pengajuan berikut telah <strong>disetujui oleh Manager</strong>. Segera lengkapi upload dokumen persetujuan untuk melanjutkan ke proses selanjutnya.
                                </p>
                                <div className="space-y-2">
                                    {pengajuanList.filter(item => item.status === 'Disetujui').map((item: any) => (
                                        <div
                                            key={item.id}
                                            onClick={() => router.push(`/fronting/detail/${item.id}`)}
                                            className="bg-white rounded-xl p-3 border border-amber-200 shadow-sm active:scale-[0.98] transition-transform cursor-pointer"
                                        >
                                            <div className="flex items-center justify-between gap-3">
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center justify-between gap-2 mb-1">
                                                        <span className="text-xs font-bold text-slate-800 truncate">{item.nama_lengkap}</span>
                                                        <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap border border-emerald-200">✅ Disetujui</span>
                                                    </div>
                                                    <p className="text-[9px] text-slate-500 font-medium mb-1">{item.unit}</p>
                                                    <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                        <Activity className="w-3 h-3" />
                                                        <span>{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                                        <span>•</span>
                                                        <FileUp className="w-3 h-3 text-amber-500" />
                                                        <span className="text-amber-600 font-semibold">Upload Dokumen</span>
                                                    </div>
                                                </div>
                                                <ChevronRight className="w-4 h-4 text-amber-400 shrink-0" />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Dicairkan Items - Show disbursement info */}
                    {!loadingPengajuan && pengajuanList.filter(item => item.status === 'Dicairkan').length > 0 && (
                        <div className="mb-4">
                            <h2 className="text-sm font-bold text-slate-800 mb-2 flex items-center gap-1.5">
                                <span className="w-2 h-2 rounded-full bg-teal-500 inline-block"></span>
                                Dana Telah Dicairkan
                            </h2>
                            <div className="space-y-2">
                                {pengajuanList.filter(item => item.status === 'Dicairkan').map((item: any) => (
                                    <div
                                        key={item.id}
                                        onClick={() => router.push(`/fronting/detail/${item.id}`)}
                                        className="bg-gradient-to-r from-teal-50 to-emerald-50 border border-teal-200 rounded-xl p-3 cursor-pointer active:scale-[0.98] transition-transform shadow-sm"
                                    >
                                        <div className="flex items-center justify-between mb-1.5">
                                            <span className="text-xs font-bold text-teal-700 bg-teal-100 px-2 py-0.5 rounded-full border border-teal-200">✓ Dicairkan</span>
                                            <span className="text-xs text-slate-500">{new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                        </div>
                                        <p className="text-sm font-bold text-slate-900 mb-0.5">{item.nama_lengkap}</p>
                                        <div className="flex items-center justify-between">
                                            <span className="text-xs text-slate-500">Pencairan Dana:</span>
                                            <span className="text-sm font-bold text-teal-700">
                                                {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.jumlah_pembiayaan)}
                                            </span>
                                        </div>
                                        {item.nominal_terima && (
                                            <div className="flex items-center justify-between mt-0.5">
                                                <span className="text-xs text-slate-500">Nominal Diterima:</span>
                                                <span className="text-xs font-semibold text-emerald-700">
                                                    {new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(item.nominal_terima)}
                                                </span>
                                            </div>
                                        )}
                                        <p className="text-[10px] text-teal-600 mt-1.5 font-medium">Tap untuk lihat detail & bukti transfer →</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

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

                </div>
            </div>
        </MobileLayoutWrapper>
    );
}

export default function FrontingPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-slate-50">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-600">Loading...</p>
                </div>
            </div>
        }>
            <FrontingPageContent />
        </Suspense>
    );
}
