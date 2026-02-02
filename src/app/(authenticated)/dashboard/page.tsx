'use client';

import { useAuth } from '@/modules/auth/presentation/useAuth';
import { usePengajuan } from '@/modules/pengajuan/presentation/usePengajuan';
import { FileText, CheckCircle, XCircle, Activity, MapPin, Trophy, Medal, Award, Filter, Wallet, Truck, Flag, AlertCircle, ArrowRight, ChevronRight, FileUp } from 'lucide-react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const { user } = useAuth();
    const { pengajuanList } = usePengajuan();
    const router = useRouter();

    // Filter states
    const [selectedUnit, setSelectedUnit] = useState<string>('all');
    const [dateRange, setDateRange] = useState<string>('30');

    // Get unique units for filter
    const units = useMemo(() => {
        const uniqueUnits = new Set(pengajuanList.map(item => item.unit).filter(Boolean));
        return Array.from(uniqueUnits).sort();
    }, [pengajuanList]);

    // Filter pengajuan by date range and unit
    const filteredPengajuan = useMemo(() => {
        let filtered = [...pengajuanList];

        // Filter by unit
        if (selectedUnit !== 'all') {
            filtered = filtered.filter(item => item.unit === selectedUnit);
        }

        // Filter by date range
        if (dateRange !== 'all') {
            const days = parseInt(dateRange);
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - days);

            filtered = filtered.filter(item => {
                const itemDate = new Date(item.created_at);
                return itemDate >= cutoffDate;
            });
        }

        return filtered;
    }, [pengajuanList, selectedUnit, dateRange]);

    // Officer specific: Loans needing approval documents
    const approvalNeededLoans = useMemo(() => {
        if (user?.role !== 'officer') return [];
        return pengajuanList.filter(item => item.status === 'Disetujui');
    }, [pengajuanList, user]);

    // Officer specific: Loans needing shipping receipt (Status: Dicairkan)
    const shippingReceiptNeededLoans = useMemo(() => {
        if (user?.role !== 'officer') return [];
        return pengajuanList.filter(item => item.status === 'Dicairkan');
    }, [pengajuanList, user]);

    // Admin Unit specific: Loans needing verification
    const verificationNeededLoans = useMemo(() => {
        if (user?.role !== 'admin-unit') return [];
        return pengajuanList.filter(item => item.status === 'Menunggu Verifikasi Admin Unit');
    }, [pengajuanList, user]);

    // Admin Pusat specific: Loans needing disbursement
    const disbursementNeededLoans = useMemo(() => {
        if (user?.role !== 'admin-pusat') return [];
        return pengajuanList.filter(item => item.status === 'Menunggu Pencairan');
    }, [pengajuanList, user]);

    // Helper to format currency
    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    // Calculate filtered stats
    const filteredStats = useMemo(() => {
        const calculateSum = (items: typeof filteredPengajuan) => items.reduce((sum, item) => sum + (Number(item.jumlah_pembiayaan) || 0), 0);

        const approved = filteredPengajuan.filter(item => item.status === 'APPROVED');
        const pending = filteredPengajuan.filter(item => item.status === 'PENDING');
        const rejected = filteredPengajuan.filter(item => item.status === 'REJECTED');
        const pencairan = filteredPengajuan.filter(item => ['PENCAIRAN', 'DISBURSED'].includes(item.status?.toUpperCase()));
        const pengiriman = filteredPengajuan.filter(item => ['PROSES_PENGIRIMAN', 'ON_DELIVERY', 'DELIVERY'].includes(item.status?.toUpperCase()));
        const selesai = filteredPengajuan.filter(item => ['SELESAI', 'COMPLETED', 'DONE'].includes(item.status?.toUpperCase()));

        return {
            total: { count: filteredPengajuan.length, amount: calculateSum(filteredPengajuan) },
            approved: { count: approved.length, amount: calculateSum(approved) },
            pending: { count: pending.length, amount: calculateSum(pending) },
            rejected: { count: rejected.length, amount: calculateSum(rejected) },
            pencairan: { count: pencairan.length, amount: calculateSum(pencairan) },
            pengiriman: { count: pengiriman.length, amount: calculateSum(pengiriman) },
            selesai: { count: selesai.length, amount: calculateSum(selesai) },
        };
    }, [filteredPengajuan]);

    // Calculate top regions from filtered data
    const topRegions = useMemo(() => {
        const regionMap = new Map<string, number>();

        filteredPengajuan.forEach(item => {
            const region = item.unit || 'Unknown';
            regionMap.set(region, (regionMap.get(region) || 0) + 1);
        });

        const sorted = Array.from(regionMap.entries())
            .map(([name, count]) => ({ name, count }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10);

        return sorted;
    }, [filteredPengajuan]);

    const statsDisplay = [
        {
            name: 'Total Pengajuan',
            value: filteredStats.total.count.toString(),
            amount: formatCurrency(filteredStats.total.amount),
            icon: FileText,
            gradient: 'from-blue-500 to-cyan-500',
        },
        {
            name: 'Disetujui',
            value: filteredStats.approved.count.toString(),
            amount: formatCurrency(filteredStats.approved.amount),
            icon: CheckCircle,
            gradient: 'from-emerald-500 to-teal-500',
        },
        {
            name: 'Pending',
            value: filteredStats.pending.count.toString(),
            amount: formatCurrency(filteredStats.pending.amount),
            icon: Activity,
            gradient: 'from-amber-500 to-orange-500',
        },
        {
            name: 'Ditolak',
            value: filteredStats.rejected.count.toString(),
            amount: formatCurrency(filteredStats.rejected.amount),
            icon: XCircle,
            gradient: 'from-rose-500 to-pink-500',
        },
        {
            name: 'Pencairan',
            value: filteredStats.pencairan.count.toString(),
            amount: formatCurrency(filteredStats.pencairan.amount),
            icon: Wallet,
            gradient: 'from-violet-500 to-purple-500',
        },
        {
            name: 'Proses Pengiriman',
            value: filteredStats.pengiriman.count.toString(),
            amount: formatCurrency(filteredStats.pengiriman.amount),
            icon: Truck,
            gradient: 'from-indigo-500 to-blue-500',
        },
        {
            name: 'Selesai',
            value: filteredStats.selesai.count.toString(),
            amount: formatCurrency(filteredStats.selesai.amount),
            icon: Flag,
            gradient: 'from-sky-500 to-cyan-500',
        },
    ];

    const getRankIcon = (index: number) => {
        if (index === 0) return { icon: Trophy, color: 'text-yellow-500', bg: 'bg-yellow-50' };
        if (index === 1) return { icon: Medal, color: 'text-slate-400', bg: 'bg-slate-50' };
        if (index === 2) return { icon: Award, color: 'text-amber-600', bg: 'bg-amber-50' };
        return { icon: MapPin, color: 'text-slate-400', bg: 'bg-slate-50' };
    };

    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden">
                <MobileLayoutWrapper showBackground={false}>
                    {/* Full Page Gradient Background */}
                    <div className="min-h-screen relative">
                        {/* Fixed Background Image */}
                        <div className="fixed inset-0 z-0">
                            <img
                                src="/images/loan_header_bg.png"
                                alt="Dashboard Background"
                                className="w-full h-full object-cover opacity-100" // Opacity full, but we might want an overlay
                            />
                            {/* Light Overlay to ensure content readability */}
                            <div className="absolute inset-0 bg-slate-50/30 backdrop-blur-[2px]"></div>
                        </div>

                        {/* Content */}
                        <div className="pt-6 px-4 pb-6 relative z-10">
                            {/* Welcome Card */}
                            <div className="mb-4 bg-gradient-to-br from-slate-800 via-slate-900 to-slate-950 rounded-2xl p-5 shadow-lg">
                                <div className="flex items-center justify-between">
                                    <div>
                                        <p className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider mb-0.5">Dashboard</p>
                                        <h1 className="text-xl font-bold text-white">
                                            {user?.name?.split(' ')[0] || 'User'} 👋
                                        </h1>
                                    </div>
                                    <div className="inline-flex items-center gap-1.5 bg-emerald-500/20 px-2.5 py-1 rounded-full border border-emerald-400/30">
                                        <div className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse"></div>
                                        <span className="text-[10px] font-bold text-emerald-300">{user?.role}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="mb-4 bg-white/80 backdrop-blur-sm rounded-2xl p-4 shadow-sm border border-white">
                                <div className="flex items-center gap-2 mb-3">
                                    <Filter className="w-4 h-4 text-indigo-600" />
                                    <h3 className="text-xs font-bold text-slate-800">Filter Data</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-2">
                                    {/* Date Range Filter */}
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-600 mb-1 block">Periode</label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="7">7 Hari</option>
                                            <option value="30">30 Hari</option>
                                            <option value="60">60 Hari</option>
                                            <option value="90">90 Hari</option>
                                            <option value="all">Semua</option>
                                        </select>
                                    </div>

                                    {/* Unit Filter */}
                                    <div>
                                        <label className="text-[10px] font-semibold text-slate-600 mb-1 block">Unit</label>
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="w-full text-xs px-3 py-2 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                        >
                                            <option value="all">Semua Unit</option>
                                            {units.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid - Compact */}
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

                            {/* Alert/Action Section for Officer - Mobile */}
                            {user?.role === 'officer' && approvalNeededLoans.length > 0 && (
                                <div className="mb-4">
                                    <div className="bg-amber-50 rounded-2xl p-4 border border-amber-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-amber-100 rounded-full animate-pulse">
                                                <AlertCircle className="w-4 h-4 text-amber-600" />
                                            </div>
                                            <h3 className="text-xs font-bold text-amber-900">Perlu Upload Dokumen ({approvalNeededLoans.length})</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {approvalNeededLoans.slice(0, 3).map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(`/pengajuan/${item.id}`)}
                                                    className="bg-white rounded-xl p-3 border border-amber-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-800 truncate">{item.name}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-emerald-100 text-emerald-700 whitespace-nowrap">
                                                                        Disetujui
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 font-medium">{item.unit}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Activity className="w-3 h-3" />
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <FileUp className="w-3 h-3 text-amber-500" />
                                                                    <span className="text-amber-600 font-medium">Upload PDF</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-amber-400" />
                                                    </div>
                                                </div>
                                            ))}
                                            {approvalNeededLoans.length > 3 && (
                                                <button
                                                    onClick={() => router.push('/pengajuan')}
                                                    className="w-full py-2 text-[10px] font-bold text-amber-700 text-center hover:bg-amber-100 rounded-lg transition-colors"
                                                >
                                                    Lihat {approvalNeededLoans.length - 3} lainnya...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alert/Action Section for Officer - Shipping Receipt Needed */}
                            {user?.role === 'officer' && shippingReceiptNeededLoans.length > 0 && (
                                <div className="mb-4">
                                    <div className="bg-indigo-50 rounded-2xl p-4 border border-indigo-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-indigo-100 rounded-full animate-pulse">
                                                <Truck className="w-4 h-4 text-indigo-600" />
                                            </div>
                                            <h3 className="text-xs font-bold text-indigo-900">Perlu Upload Resi ({shippingReceiptNeededLoans.length})</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {shippingReceiptNeededLoans.slice(0, 3).map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(`/pengajuan/${item.id}`)}
                                                    className="bg-white rounded-xl p-3 border border-indigo-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-800 truncate">{item.name}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-teal-100 text-teal-700 whitespace-nowrap">
                                                                        Dicairkan
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 font-medium">{item.unit}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Activity className="w-3 h-3" />
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Truck className="w-3 h-3 text-indigo-500" />
                                                                    <span className="text-indigo-600 font-medium">Upload Resi</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-indigo-400" />
                                                    </div>
                                                </div>
                                            ))}
                                            {shippingReceiptNeededLoans.length > 3 && (
                                                <button
                                                    onClick={() => router.push('/pengajuan')}
                                                    className="w-full py-2 text-[10px] font-bold text-indigo-700 text-center hover:bg-indigo-100 rounded-lg transition-colors"
                                                >
                                                    Lihat {shippingReceiptNeededLoans.length - 3} lainnya...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alert/Action Section for Admin Unit - Mobile */}
                            {user?.role === 'admin-unit' && verificationNeededLoans.length > 0 && (
                                <div className="mb-4">
                                    <div className="bg-orange-50 rounded-2xl p-4 border border-orange-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-orange-100 rounded-full animate-pulse">
                                                <AlertCircle className="w-4 h-4 text-orange-600" />
                                            </div>
                                            <h3 className="text-xs font-bold text-orange-900">Perlu Verifikasi ({verificationNeededLoans.length})</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {verificationNeededLoans.slice(0, 3).map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(`/pengajuan/${item.id}`)}
                                                    className="bg-white rounded-xl p-3 border border-orange-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-800 truncate">{item.name}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-amber-100 text-amber-700 whitespace-nowrap">
                                                                        Menunggu Verifikasi
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 font-medium">{item.unit}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Activity className="w-3 h-3" />
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <CheckCircle className="w-3 h-3 text-orange-500" />
                                                                    <span className="text-orange-600 font-medium">Verifikasi</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-orange-400" />
                                                    </div>
                                                </div>
                                            ))}
                                            {verificationNeededLoans.length > 3 && (
                                                <button
                                                    onClick={() => router.push('/pengajuan')}
                                                    className="w-full py-2 text-[10px] font-bold text-orange-700 text-center hover:bg-orange-100 rounded-lg transition-colors"
                                                >
                                                    Lihat {verificationNeededLoans.length - 3} lainnya...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Alert/Action Section for Admin Pusat - Mobile */}
                            {user?.role === 'admin-pusat' && disbursementNeededLoans.length > 0 && (
                                <div className="mb-4">
                                    <div className="bg-purple-50 rounded-2xl p-4 border border-purple-100 shadow-sm">
                                        <div className="flex items-center gap-2 mb-3">
                                            <div className="p-1.5 bg-purple-100 rounded-full animate-pulse">
                                                <Wallet className="w-4 h-4 text-purple-600" />
                                            </div>
                                            <h3 className="text-xs font-bold text-purple-900">Perlu Pencairan ({disbursementNeededLoans.length})</h3>
                                        </div>
                                        <div className="space-y-2">
                                            {disbursementNeededLoans.slice(0, 3).map((item, idx) => (
                                                <div
                                                    key={item.id}
                                                    onClick={() => router.push(`/pengajuan/${item.id}`)}
                                                    className="bg-white rounded-xl p-3 border border-purple-200 shadow-sm active:scale-[0.98] transition-all cursor-pointer"
                                                >
                                                    <div className="flex items-center justify-between gap-3">
                                                        <div className="flex-1 min-w-0">
                                                            <div className="mb-1">
                                                                <div className="flex items-center justify-between gap-2">
                                                                    <span className="text-[10px] font-bold text-slate-800 truncate">{item.name}</span>
                                                                    <span className="px-1.5 py-0.5 rounded text-[8px] font-bold bg-orange-100 text-orange-700 whitespace-nowrap">
                                                                        Menunggu Pencairan
                                                                    </span>
                                                                </div>
                                                                <p className="text-[9px] text-slate-500 font-medium">{item.unit}</p>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                                <div className="flex items-center gap-1">
                                                                    <Activity className="w-3 h-3" />
                                                                    {new Date(item.created_at).toLocaleDateString()}
                                                                </div>
                                                                <span>•</span>
                                                                <div className="flex items-center gap-1">
                                                                    <Wallet className="w-3 h-3 text-purple-500" />
                                                                    <span className="text-purple-600 font-medium">Proses Pencairan</span>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <ChevronRight className="w-4 h-4 text-purple-400" />
                                                    </div>
                                                </div>
                                            ))}
                                            {disbursementNeededLoans.length > 3 && (
                                                <button
                                                    onClick={() => router.push('/pengajuan')}
                                                    className="w-full py-2 text-[10px] font-bold text-purple-700 text-center hover:bg-purple-100 rounded-lg transition-colors"
                                                >
                                                    Lihat {disbursementNeededLoans.length - 3} lainnya...
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Top Regions */}
                            <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg p-4 border border-white">
                                <div className="flex items-center justify-between mb-3">
                                    <h2 className="text-xs font-bold text-slate-800 flex items-center gap-2">
                                        <Trophy className="w-4 h-4 text-amber-500" />
                                        Top 10 Wilayah
                                    </h2>
                                </div>

                                {topRegions.length === 0 ? (
                                    <div className="text-center py-6">
                                        <MapPin className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                                        <p className="text-xs text-slate-400">Belum ada data</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {topRegions.map((region, idx) => {
                                            const rankInfo = getRankIcon(idx);
                                            const RankIcon = rankInfo.icon;
                                            const percentage = ((region.count / (filteredStats.total.count || 1)) * 100).toFixed(1);

                                            return (
                                                <div
                                                    key={idx}
                                                    className="bg-gradient-to-r from-slate-50 to-white rounded-lg p-2.5 border border-slate-200 hover:border-indigo-300 transition-all"
                                                >
                                                    <div className="flex items-center gap-2.5">
                                                        {/* Rank Badge */}
                                                        <div className={`w-7 h-7 ${rankInfo.bg} rounded-lg flex items-center justify-center shrink-0`}>
                                                            {idx < 3 ? (
                                                                <RankIcon className={`w-3.5 h-3.5 ${rankInfo.color}`} />
                                                            ) : (
                                                                <span className="text-[10px] font-bold text-slate-600">#{idx + 1}</span>
                                                            )}
                                                        </div>

                                                        {/* Region Info */}
                                                        <div className="flex-1 min-w-0">
                                                            <div className="flex items-center justify-between mb-1">
                                                                <p className="text-[11px] font-bold text-slate-900 truncate">{region.name}</p>
                                                                <div className="flex items-center gap-1.5">
                                                                    <span className="text-xs font-bold text-indigo-600">{region.count}</span>
                                                                    <span className="text-[9px] text-slate-400">({percentage}%)</span>
                                                                </div>
                                                            </div>

                                                            {/* Progress Bar */}
                                                            <div className="w-full bg-slate-100 rounded-full h-1 overflow-hidden">
                                                                <div
                                                                    className={`h-full rounded-full transition-all duration-500 ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                                                        idx === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                                                                            idx === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                                                                'bg-gradient-to-r from-indigo-500 to-blue-500'
                                                                        }`}
                                                                    style={{ width: `${percentage}%` }}
                                                                ></div>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </MobileLayoutWrapper>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="min-h-screen -m-8 relative">
                    {/* Fixed Background Image */}
                    <div className="absolute inset-0 z-0">
                        <img
                            src="/images/loan_header_bg.png"
                            alt="Dashboard Background"
                            className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-slate-50/50 backdrop-blur-[2px]"></div>
                    </div>

                    <div className="relative z-10 p-8">
                        <div className="space-y-6">
                            {/* Welcome Banner */}
                            <div className="relative overflow-hidden rounded-3xl bg-slate-900 shadow-2xl ring-1 ring-white/10">
                                <div className="absolute top-0 right-0 -mt-20 -mr-20 h-96 w-96 rounded-full bg-indigo-500/20 blur-3xl"></div>
                                <div className="absolute bottom-0 left-0 -mb-20 -ml-20 h-96 w-96 rounded-full bg-violet-500/20 blur-3xl"></div>

                                <div className="relative px-8 py-10 sm:px-12 sm:py-12">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
                                        <div className="space-y-4 max-w-2xl">
                                            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                                                Selamat Datang, <span className="text-indigo-400">{user?.name}</span>!
                                            </h2>
                                            <p className="text-lg text-slate-300 leading-relaxed">
                                                Anda login sebagai <span className="font-semibold text-white px-3 py-1 rounded-full bg-slate-800 border border-slate-700 mx-1 text-sm uppercase tracking-wide">{user?.role}</span>.
                                                Pantau aktivitas pengajuan dan kelola data unit Anda dengan mudah melalui dashboard ini.
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Filters */}
                            <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white">
                                <div className="flex items-center gap-3 mb-4">
                                    <Filter className="w-5 h-5 text-indigo-600" />
                                    <h3 className="text-sm font-bold text-slate-800">Filter Data</h3>
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    {/* Date Range Filter */}
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Periode Waktu</label>
                                        <select
                                            value={dateRange}
                                            onChange={(e) => setDateRange(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        >
                                            <option value="7">7 Hari Terakhir</option>
                                            <option value="30">30 Hari Terakhir</option>
                                            <option value="60">60 Hari Terakhir</option>
                                            <option value="90">90 Hari Terakhir</option>
                                            <option value="all">Semua Waktu</option>
                                        </select>
                                    </div>

                                    {/* Unit Filter */}
                                    <div>
                                        <label className="text-sm font-semibold text-slate-700 mb-2 block">Unit/Wilayah</label>
                                        <select
                                            value={selectedUnit}
                                            onChange={(e) => setSelectedUnit(e.target.value)}
                                            className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white focus:ring-2 focus:ring-indigo-500 focus:border-transparent text-sm"
                                        >
                                            <option value="all">Semua Unit</option>
                                            {units.map(unit => (
                                                <option key={unit} value={unit}>{unit}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Stats Grid */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Activity className="h-5 w-5 text-indigo-500" />
                                    Overview Statistik
                                </h3>
                                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                                    {statsDisplay.map((stat) => {
                                        const Icon = stat.icon;

                                        return (
                                            <div
                                                key={stat.name}
                                                className="bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-sm border border-white hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                                            >
                                                <div className="flex items-center gap-4">
                                                    <div className={`p-3 rounded-xl bg-gradient-to-br ${stat.gradient} shadow-lg`}>
                                                        <Icon className="h-6 w-6 text-white" />
                                                    </div>
                                                    <div>
                                                        <p className="text-3xl font-bold text-gray-900 leading-tight">{stat.value}</p>
                                                        <p className="text-xs font-bold text-slate-500 mb-1">{stat.amount}</p>
                                                        <p className="text-sm font-medium text-slate-600">{stat.name}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Top Regions - Desktop */}
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                    <Trophy className="h-5 w-5 text-amber-500" />
                                    Top 10 Wilayah Berdasarkan Jumlah Pengajuan
                                </h3>
                                <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-sm border border-white overflow-hidden">
                                    <div className="overflow-x-auto">
                                        <table className="min-w-full divide-y divide-slate-200">
                                            <thead className="bg-slate-50">
                                                <tr>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Rank</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Wilayah</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Jumlah</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Persentase</th>
                                                    <th className="px-6 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider">Progress</th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-white divide-y divide-slate-200">
                                                {topRegions.map((region, idx) => {
                                                    const rankInfo = getRankIcon(idx);
                                                    const RankIcon = rankInfo.icon;
                                                    const percentage = ((region.count / (filteredStats.total.count || 1)) * 100).toFixed(1);

                                                    return (
                                                        <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="flex items-center gap-2">
                                                                    {idx < 3 ? (
                                                                        <RankIcon className={`w-5 h-5 ${rankInfo.color}`} />
                                                                    ) : (
                                                                        <span className="text-sm font-bold text-slate-600">#{idx + 1}</span>
                                                                    )}
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm font-semibold text-slate-900">{region.name}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm font-bold text-indigo-600">{region.count}</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <span className="text-sm text-slate-600">{percentage}%</span>
                                                            </td>
                                                            <td className="px-6 py-4 whitespace-nowrap">
                                                                <div className="w-32 bg-slate-100 rounded-full h-2 overflow-hidden">
                                                                    <div
                                                                        className={`h-full rounded-full ${idx === 0 ? 'bg-gradient-to-r from-yellow-400 to-amber-500' :
                                                                            idx === 1 ? 'bg-gradient-to-r from-slate-300 to-slate-400' :
                                                                                idx === 2 ? 'bg-gradient-to-r from-amber-500 to-orange-500' :
                                                                                    'bg-gradient-to-r from-indigo-500 to-blue-500'
                                                                            }`}
                                                                        style={{ width: `${percentage}%` }}
                                                                    ></div>
                                                                </div>
                                                            </td>
                                                        </tr>
                                                    );
                                                })}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
