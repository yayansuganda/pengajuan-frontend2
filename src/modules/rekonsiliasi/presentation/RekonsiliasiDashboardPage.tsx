'use client';

import React, { useMemo } from 'react';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { useRekonsiliasiDashboard } from './useRekonsiliasiDashboard';
import {
    BarChart3,
    TrendingUp,
    Building2,
    RefreshCw,
    Calendar,
    DollarSign,
    CheckCircle2,
    Clock,
    XCircle,
    FileCheck,
    ArrowUpRight,
    ArrowDownRight,
    Loader2,
    AlertCircle,
    ChevronRight,
    PieChart as PieChartIcon,
    Activity,
    Wallet,
    FileText,
    Send,
} from 'lucide-react';
import {
    AreaChart, Area,
    BarChart, Bar,
    PieChart, Pie, Cell,
    RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
    ResponsiveContainer,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';

// ===== Constants =====
const STATUS_COLORS: Record<string, { bg: string; text: string; ring: string; dot: string; hex: string }> = {
    'Pending':                        { bg: 'bg-amber-50',   text: 'text-amber-700',   ring: 'ring-amber-200',   dot: 'bg-amber-400',   hex: '#f59e0b' },
    'Revisi':                         { bg: 'bg-orange-50',  text: 'text-orange-700',  ring: 'ring-orange-200',  dot: 'bg-orange-400',  hex: '#f97316' },
    'Menunggu Approval Manager':      { bg: 'bg-blue-50',    text: 'text-blue-700',    ring: 'ring-blue-200',    dot: 'bg-blue-400',    hex: '#3b82f6' },
    'Menunggu Verifikasi Admin Unit': { bg: 'bg-indigo-50',  text: 'text-indigo-700',  ring: 'ring-indigo-200',  dot: 'bg-indigo-400',  hex: '#6366f1' },
    'Menunggu Pencairan':             { bg: 'bg-purple-50',  text: 'text-purple-700',  ring: 'ring-purple-200',  dot: 'bg-purple-400',  hex: '#a855f7' },
    'Disetujui':                      { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-400', hex: '#10b981' },
    'Dicairkan':                      { bg: 'bg-green-50',   text: 'text-green-700',   ring: 'ring-green-200',   dot: 'bg-green-500',   hex: '#22c55e' },
    'Ditolak':                        { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200',     dot: 'bg-red-400',     hex: '#ef4444' },
    'Selesai':                        { bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'ring-teal-200',    dot: 'bg-teal-400',    hex: '#14b8a6' },
    // Legacy statuses (backward-compatible)
    'Approved':                       { bg: 'bg-emerald-50', text: 'text-emerald-700', ring: 'ring-emerald-200', dot: 'bg-emerald-400', hex: '#10b981' },
    'Rejected':                       { bg: 'bg-red-50',     text: 'text-red-700',     ring: 'ring-red-200',     dot: 'bg-red-400',     hex: '#ef4444' },
    'Lunas':                          { bg: 'bg-cyan-50',    text: 'text-cyan-700',    ring: 'ring-cyan-200',    dot: 'bg-cyan-400',    hex: '#06b6d4' },
    'Completed':                      { bg: 'bg-teal-50',    text: 'text-teal-700',    ring: 'ring-teal-200',    dot: 'bg-teal-400',    hex: '#14b8a6' },
};

const STATUS_ICONS: Record<string, React.ReactNode> = {
    'Pending': <Clock className="h-3.5 w-3.5" />,
    'Revisi': <AlertCircle className="h-3.5 w-3.5" />,
    'Menunggu Approval Manager': <Clock className="h-3.5 w-3.5" />,
    'Menunggu Verifikasi Admin Unit': <FileCheck className="h-3.5 w-3.5" />,
    'Menunggu Pencairan': <DollarSign className="h-3.5 w-3.5" />,
    'Disetujui': <CheckCircle2 className="h-3.5 w-3.5" />,
    'Dicairkan': <CheckCircle2 className="h-3.5 w-3.5" />,
    'Ditolak': <XCircle className="h-3.5 w-3.5" />,
    'Selesai': <CheckCircle2 className="h-3.5 w-3.5" />,
    'Approved': <CheckCircle2 className="h-3.5 w-3.5" />,
    'Rejected': <XCircle className="h-3.5 w-3.5" />,
    'Lunas': <CheckCircle2 className="h-3.5 w-3.5" />,
    'Completed': <CheckCircle2 className="h-3.5 w-3.5" />,
};

const getStatusColor = (status: string) =>
    STATUS_COLORS[status] || { bg: 'bg-slate-50', text: 'text-slate-700', ring: 'ring-slate-200', dot: 'bg-slate-400', hex: '#94a3b8' };

const formatCurrency = (value: number) => {
    if (value >= 1_000_000_000) return `Rp ${(value / 1_000_000_000).toFixed(1)}M`;
    if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1)}Jt`;
    if (value >= 1_000) return `Rp ${(value / 1_000).toFixed(0)}Rb`;
    return `Rp ${value.toLocaleString('id-ID')}`;
};

const formatFullCurrency = (value: number) =>
    new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(value);

const formatMonthLabel = (monthStr: string) => {
    const [year, month] = monthStr.split('-');
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'];
    return `${months[parseInt(month) - 1]} '${year.slice(2)}`;
};

// Custom tooltip for recharts
const ChartTooltip = ({ active, payload, label }: any) => {
    if (!active || !payload?.length) return null;
    return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-2.5 text-xs">
            <p className="font-semibold text-slate-800 mb-1">{label}</p>
            {payload.map((entry: any, i: number) => (
                <div key={i} className="flex items-center gap-2 py-0.5">
                    <span className="h-2 w-2 rounded-full shrink-0" style={{ background: entry.color }} />
                    <span className="text-slate-600">{entry.name}:</span>
                    <span className="font-semibold text-slate-900">
                        {typeof entry.value === 'number' && entry.name?.includes('Nominal')
                            ? `${entry.value.toFixed(1)} Jt`
                            : entry.value}
                    </span>
                </div>
            ))}
        </div>
    );
};

const PieTooltip = ({ active, payload }: any) => {
    if (!active || !payload?.length) return null;
    const d = payload[0];
    return (
        <div className="bg-white/95 backdrop-blur-sm border border-slate-200 rounded-lg shadow-lg p-2.5 text-xs">
            <p className="font-semibold text-slate-800">{d.name}</p>
            <p className="text-slate-600 mt-0.5">{d.value} pengajuan ({((d.value / d.payload.total) * 100).toFixed(1)}%)</p>
            <p className="text-slate-500">{formatCurrency(d.payload.amount)}</p>
        </div>
    );
};

// ===== Section Card =====
const SectionCard: React.FC<{
    title: string; subtitle?: string; icon: React.ReactNode; iconBg: string; children: React.ReactNode; className?: string;
}> = ({ title, subtitle, icon, iconBg, children, className = '' }) => (
    <div className={`bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
        <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-100">
            <h2 className="text-xs font-semibold text-slate-900 flex items-center gap-2">
                <div className={`h-5 w-5 rounded flex items-center justify-center ${iconBg}`}>{icon}</div>
                {title}
            </h2>
            {subtitle && <span className="text-[10px] text-slate-400">{subtitle}</span>}
        </div>
        {children}
    </div>
);

// ===== Main Component =====
export const RekonsiliasiDashboardPage: React.FC = () => {
    const { user } = useAuth();
    const { stats, loading, dateFrom, dateTo, setDateFrom, setDateTo, refresh } = useRekonsiliasiDashboard();

    React.useEffect(() => {
        if (user && user.role !== 'super-admin' && user.role !== 'admin-pos') {
            window.location.href = '/dashboard';
        }
    }, [user]);

    // ===== Derived: Helper to get count+amount from by_status =====
    const getStatusData = (statusNames: string[]) => {
        if (!stats) return { count: 0, amount: 0 };
        return (stats.by_status || [])
            .filter(s => statusNames.map(n => n.toLowerCase()).includes(s.status.toLowerCase()))
            .reduce((acc, s) => ({ count: acc.count + s.count, amount: acc.amount + s.amount }), { count: 0, amount: 0 });
    };

    const kpiTotal = useMemo(() => ({ count: stats?.total_pos || 0, amount: stats?.total_amount || 0 }), [stats]);
    const kpiDisetujui = useMemo(() => getStatusData(['Disetujui', 'Approved']), [stats]);
    const kpiPending = useMemo(() => getStatusData(['Pending', 'Revisi', 'Menunggu Approval Manager']), [stats]);
    const kpiDitolak = useMemo(() => getStatusData(['Ditolak', 'Rejected']), [stats]);
    const kpiPencairan = useMemo(() => getStatusData(['Menunggu Pencairan', 'Dicairkan']), [stats]);
    const kpiVerifAdmin = useMemo(() => getStatusData(['Menunggu Verifikasi Admin Unit']), [stats]);
    const kpiSelesai = useMemo(() => getStatusData(['Selesai', 'Lunas', 'Completed']), [stats]);

    // ===== Derived =====
    const approvalRate = useMemo(() => {
        if (!stats || stats.total_pos === 0) return 0;
        const tot = (stats.by_status || []).filter(s => ['Disetujui', 'Dicairkan', 'Selesai', 'Approved', 'Lunas', 'Completed'].includes(s.status)).reduce((a, s) => a + s.count, 0);
        return Math.round((tot / stats.total_pos) * 100);
    }, [stats]);

    const disbursementRate = useMemo(() => {
        if (!stats || stats.total_pos === 0) return 0;
        return Math.round((stats.total_dicairkan / stats.total_pos) * 100);
    }, [stats]);

    const pieData = useMemo(() => {
        if (!stats) return [];
        return (stats.by_status || []).map(s => ({
            name: s.status, value: s.count, amount: s.amount, total: stats.total_pos, color: getStatusColor(s.status).hex,
        }));
    }, [stats]);

    const monthlyChartData = useMemo(() => {
        if (!stats) return [];
        return (stats.by_month || []).slice(-12).map(m => ({
            month: formatMonthLabel(m.month),
            'Total': m.count, 'Dicairkan': m.dicairkan, 'Disetujui': m.disetujui, 'Dalam Proses': m.pending, 'Ditolak': m.ditolak, 'Selesai': m.selesai,
        }));
    }, [stats]);

    const monthlyAmountData = useMemo(() => {
        if (!stats) return [];
        return (stats.by_month || []).slice(-12).map(m => ({
            month: formatMonthLabel(m.month),
            'Nominal Masuk': Math.round(m.amount / 1_000_000 * 10) / 10,
            'Nominal Dicairkan': Math.round(m.amount_dicairkan / 1_000_000 * 10) / 10,
        }));
    }, [stats]);

    const regionalBarData = useMemo(() => {
        if (!stats?.by_regional_status) return [];
        return stats.by_regional_status.slice(0, 10).map(r => ({
            regional: r.regional.length > 20 ? r.regional.slice(0, 20) + '…' : r.regional,
            'Dicairkan': r.dicairkan, 'Disetujui': r.disetujui, 'Dalam Proses': r.proses, 'Ditolak': r.ditolak, 'Selesai': r.selesai,
        }));
    }, [stats]);

    const radarData = useMemo(() => {
        if (!stats?.by_regional_status) return [];
        return stats.by_regional_status.slice(0, 6).map(r => {
            const sr = r.total > 0 ? Math.round(((r.dicairkan + r.disetujui + r.selesai) / r.total) * 100) : 0;
            const rr = r.total > 0 ? Math.round((r.ditolak / r.total) * 100) : 0;
            const pr = r.total > 0 ? Math.round((r.proses / r.total) * 100) : 0;
            return { name: r.regional.length > 14 ? r.regional.slice(0, 14) + '…' : r.regional, 'Success Rate': sr, 'Reject Rate': rr, 'Proses Rate': pr };
        });
    }, [stats]);

    const maxStatusCount = useMemo(() => stats ? Math.max(...(stats.by_status || []).map(s => s.count), 1) : 1, [stats]);
    const maxRegionalCount = useMemo(() => stats ? Math.max(...(stats.by_regional || []).map(r => r.count), 1) : 1, [stats]);

    if (loading && !stats) {
        return (
            <div className="flex items-center justify-center min-h-[60vh]">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
                    <p className="text-sm text-slate-500">Memuat dashboard rekonsiliasi...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-4 pb-6">
            {/* ===== Header ===== */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                    <h1 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                        <BarChart3 className="h-5 w-5 text-indigo-600" />
                        Dashboard Rekonsiliasi POS
                    </h1>
                    <p className="text-xs text-slate-500 mt-0.5">Monitoring & analitik data pengajuan melalui kantor POS</p>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 shadow-sm">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        <input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)}
                            className="text-xs border-none outline-none bg-transparent text-slate-700 w-28" />
                        <span className="text-slate-300">—</span>
                        <input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)}
                            className="text-xs border-none outline-none bg-transparent text-slate-700 w-28" />
                    </div>
                    <button onClick={refresh} disabled={loading}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 text-white text-xs font-medium rounded-lg hover:bg-indigo-700 transition-colors shadow-sm disabled:opacity-50">
                        <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
                        Refresh
                    </button>
                </div>
            </div>

            {/* ===== KPI Cards (sesuai status project) ===== */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-7 gap-3">
                <KPICard label="Total Pengajuan" value={kpiTotal.count.toLocaleString('id-ID')} sub={formatCurrency(kpiTotal.amount)}
                    icon={<FileText className="h-3 w-3 text-blue-600" />} iconBg="bg-blue-100" />
                <KPICard label="Disetujui" value={kpiDisetujui.count.toLocaleString('id-ID')} sub={formatCurrency(kpiDisetujui.amount)}
                    icon={<CheckCircle2 className="h-3 w-3 text-emerald-600" />} iconBg="bg-emerald-100" valueColor="text-emerald-600" />
                <KPICard label="Pending" value={kpiPending.count.toLocaleString('id-ID')} sub={formatCurrency(kpiPending.amount)}
                    icon={<TrendingUp className="h-3 w-3 text-orange-600" />} iconBg="bg-orange-100" valueColor="text-orange-600" />
                <KPICard label="Ditolak" value={kpiDitolak.count.toLocaleString('id-ID')} sub={formatCurrency(kpiDitolak.amount)}
                    icon={<XCircle className="h-3 w-3 text-red-600" />} iconBg="bg-red-100" valueColor="text-red-600" />
                <KPICard label="Pencairan" value={kpiPencairan.count.toLocaleString('id-ID')} sub={formatCurrency(kpiPencairan.amount)}
                    icon={<Wallet className="h-3 w-3 text-purple-600" />} iconBg="bg-purple-100" valueColor="text-purple-600" />
                <KPICard label="Verifikasi Admin Unit" value={kpiVerifAdmin.count.toLocaleString('id-ID')} sub={formatCurrency(kpiVerifAdmin.amount)}
                    icon={<Send className="h-3 w-3 text-indigo-600" />} iconBg="bg-indigo-100" valueColor="text-indigo-600" />
                <KPICard label="Selesai" value={kpiSelesai.count.toLocaleString('id-ID')} sub={formatCurrency(kpiSelesai.amount)}
                    icon={<FileCheck className="h-3 w-3 text-teal-600" />} iconBg="bg-teal-100" valueColor="text-teal-600" />
            </div>

            {/* ===== ROW 1: Donut + Status List ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <SectionCard title="Komposisi Status" subtitle={`${pieData.length} status`}
                    icon={<PieChartIcon className="h-3 w-3 text-indigo-600" />} iconBg="bg-indigo-100" className="lg:col-span-2">
                    <div className="p-3">
                        {pieData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={230}>
                                <PieChart>
                                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={48} outerRadius={82} paddingAngle={2} dataKey="value" stroke="none">
                                        {pieData.map((e, i) => <Cell key={i} fill={e.color} className="hover:opacity-80 transition-opacity cursor-pointer" />)}
                                    </Pie>
                                    <Tooltip content={<PieTooltip />} />
                                    <Legend layout="vertical" align="right" verticalAlign="middle" iconSize={7} iconType="circle"
                                        formatter={(v: string) => <span className="text-[10px] text-slate-600">{v}</span>}
                                        wrapperStyle={{ fontSize: '10px', lineHeight: '16px' }} />
                                </PieChart>
                            </ResponsiveContainer>
                        ) : <EmptyState height={230} />}
                    </div>
                </SectionCard>

                <SectionCard title="Distribusi Status" subtitle={`${stats?.by_status.length || 0} status`}
                    icon={<BarChart3 className="h-3 w-3 text-indigo-600" />} iconBg="bg-indigo-100" className="lg:col-span-3">
                    <div className="p-3 space-y-1 max-h-65.5 overflow-y-auto">
                        {stats?.by_status.map((item) => {
                            const color = getStatusColor(item.status);
                            const pct = stats.total_pos > 0 ? ((item.count / stats.total_pos) * 100).toFixed(1) : '0';
                            const barW = (item.count / maxStatusCount) * 100;
                            return (
                                <div key={item.status} className={`relative rounded-lg p-2 ${color.bg} ring-1 ${color.ring} hover:ring-2 transition-all`}>
                                    <div className="absolute inset-0 rounded-lg opacity-[.12] transition-all duration-500"
                                        style={{ width: `${barW}%`, background: `linear-gradient(90deg, ${color.hex}44, transparent)` }} />
                                    <div className="relative flex items-center justify-between">
                                        <div className="flex items-center gap-2 min-w-0">
                                            <span className={`${color.text} shrink-0`}>{STATUS_ICONS[item.status] || <FileCheck className="h-3.5 w-3.5" />}</span>
                                            <span className={`text-xs font-medium ${color.text} truncate`}>{item.status}</span>
                                        </div>
                                        <div className="flex items-center gap-2 shrink-0">
                                            <span className="text-[10px] text-slate-500 hidden sm:inline">{formatCurrency(item.amount)}</span>
                                            <span className="text-[10px] text-slate-400">{pct}%</span>
                                            <span className={`text-sm font-bold ${color.text} min-w-6 text-right`}>{item.count}</span>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                        {!stats?.by_status?.length && <EmptyState />}
                    </div>
                </SectionCard>
            </div>

            {/* ===== ROW 2: Tren Bulanan (Area) + Nominal Bulanan (Bar) ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
                <SectionCard title="Tren Pengajuan Bulanan" subtitle="12 bulan terakhir"
                    icon={<Activity className="h-3 w-3 text-emerald-600" />} iconBg="bg-emerald-100">
                    <div className="p-3">
                        {monthlyChartData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={280}>
                                <AreaChart data={monthlyChartData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <defs>
                                        <linearGradient id="gTotal" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gCair" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gTolak" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#ef4444" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gSelesai" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#14b8a6" stopOpacity={0.15} />
                                            <stop offset="95%" stopColor="#14b8a6" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gSetujui" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#10b981" stopOpacity={0.12} />
                                            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                                        </linearGradient>
                                        <linearGradient id="gProses" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.1} />
                                            <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    <Area type="monotone" dataKey="Total" stroke="#6366f1" strokeWidth={2} fill="url(#gTotal)" />
                                    <Area type="monotone" dataKey="Dalam Proses" stroke="#f59e0b" strokeWidth={1.5} fill="url(#gProses)" />
                                    <Area type="monotone" dataKey="Disetujui" stroke="#10b981" strokeWidth={1.5} fill="url(#gSetujui)" />
                                    <Area type="monotone" dataKey="Dicairkan" stroke="#22c55e" strokeWidth={2} fill="url(#gCair)" />
                                    <Area type="monotone" dataKey="Selesai" stroke="#14b8a6" strokeWidth={1.5} fill="url(#gSelesai)" />
                                    <Area type="monotone" dataKey="Ditolak" stroke="#ef4444" strokeWidth={1.5} fill="url(#gTolak)" strokeDasharray="4 4" />
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : <EmptyState height={240} text="Belum ada data bulanan" />}
                    </div>
                </SectionCard>

                <SectionCard title="Nominal Bulanan (Juta Rp)" subtitle="masuk vs dicairkan"
                    icon={<DollarSign className="h-3 w-3 text-blue-600" />} iconBg="bg-blue-100">
                    <div className="p-3">
                        {monthlyAmountData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <BarChart data={monthlyAmountData} margin={{ top: 5, right: 5, left: -20, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                    <XAxis dataKey="month" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="Nominal Masuk" fill="#6366f1" radius={[3, 3, 0, 0]} barSize={14} />
                                    <Bar dataKey="Nominal Dicairkan" fill="#22c55e" radius={[3, 3, 0, 0]} barSize={14} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState height={240} />}
                    </div>
                </SectionCard>
            </div>

            {/* ===== ROW 3: Regional Stacked Bar + Radar ===== */}
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                <SectionCard title="Performa Regional (Top 10)" subtitle="berdasarkan status"
                    icon={<Building2 className="h-3 w-3 text-blue-600" />} iconBg="bg-blue-100" className="lg:col-span-3">
                    <div className="p-3">
                        {regionalBarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={Math.max(250, regionalBarData.length * 30)}>
                                <BarChart data={regionalBarData} layout="vertical" margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                                    <XAxis type="number" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
                                    <YAxis type="category" dataKey="regional" width={120} tick={{ fontSize: 9, fill: '#64748b' }} axisLine={false} tickLine={false} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                    <Bar dataKey="Dicairkan" stackId="s" fill="#22c55e" barSize={16} />
                                    <Bar dataKey="Disetujui" stackId="s" fill="#10b981" barSize={16} />
                                    <Bar dataKey="Selesai" stackId="s" fill="#14b8a6" barSize={16} />
                                    <Bar dataKey="Dalam Proses" stackId="s" fill="#f59e0b" barSize={16} />
                                    <Bar dataKey="Ditolak" stackId="s" fill="#ef4444" radius={[0, 3, 3, 0]} barSize={16} />
                                </BarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState height={250} text="Belum ada data regional" />}
                    </div>
                </SectionCard>

                <SectionCard title="Radar Performa" subtitle="top 6 regional"
                    icon={<TrendingUp className="h-3 w-3 text-purple-600" />} iconBg="bg-purple-100" className="lg:col-span-2">
                    <div className="p-3">
                        {radarData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={270}>
                                <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={80}>
                                    <PolarGrid stroke="#e2e8f0" />
                                    <PolarAngleAxis dataKey="name" tick={{ fontSize: 9, fill: '#64748b' }} />
                                    <PolarRadiusAxis tick={{ fontSize: 8, fill: '#94a3b8' }} domain={[0, 100]} />
                                    <Tooltip content={<ChartTooltip />} />
                                    <Radar name="Success Rate" dataKey="Success Rate" stroke="#22c55e" fill="#22c55e" fillOpacity={0.15} strokeWidth={2} />
                                    <Radar name="Proses Rate" dataKey="Proses Rate" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.08} strokeWidth={1.5} />
                                    <Radar name="Reject Rate" dataKey="Reject Rate" stroke="#ef4444" fill="#ef4444" fillOpacity={0.1} strokeWidth={1.5} strokeDasharray="4 4" />
                                    <Legend iconSize={7} iconType="circle" wrapperStyle={{ fontSize: '10px' }} />
                                </RadarChart>
                            </ResponsiveContainer>
                        ) : <EmptyState height={270} />}
                    </div>
                </SectionCard>
            </div>

            {/* ===== ROW 4: Regional Card Grid ===== */}
            <SectionCard title="Detail Semua Regional POS" subtitle={`${stats?.by_regional.length || 0} regional`}
                icon={<Building2 className="h-3 w-3 text-blue-600" />} iconBg="bg-blue-100">
                <div className="p-3">
                    {stats?.by_regional && stats.by_regional.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-2">
                            {stats.by_regional.map((item, idx) => {
                                const barW = (item.count / maxRegionalCount) * 100;
                                const t3 = idx < 3;
                                return (
                                    <div key={`${item.regional}-${item.kcu_name}`}
                                        className={`relative overflow-hidden rounded-lg border p-2.5 transition-all hover:shadow-sm ${t3 ? 'border-indigo-200 bg-indigo-50/30' : 'border-slate-150 bg-slate-50/50'}`}>
                                        <div className={`absolute bottom-0 left-0 h-0.5 transition-all duration-700 ${t3 ? 'bg-indigo-400' : 'bg-slate-300'}`} style={{ width: `${barW}%` }} />
                                        <div className="flex items-start justify-between gap-2">
                                            <div className="min-w-0 flex-1">
                                                <div className="flex items-center gap-1.5">
                                                    {t3 && <span className="shrink-0 h-4 w-4 rounded-full bg-indigo-600 text-white text-[9px] font-bold flex items-center justify-center">{idx + 1}</span>}
                                                    <p className="text-xs font-semibold text-slate-900 truncate">{item.regional || 'Tidak Diketahui'}</p>
                                                </div>
                                                {item.kcu_name && (
                                                    <p className="text-[10px] text-slate-500 mt-0.5 truncate flex items-center gap-1">
                                                        <ChevronRight className="h-2.5 w-2.5" /> KCU: {item.kcu_name}
                                                    </p>
                                                )}
                                            </div>
                                            <div className="text-right shrink-0">
                                                <p className={`text-sm font-bold ${t3 ? 'text-indigo-600' : 'text-slate-700'}`}>{item.count}</p>
                                                <p className="text-[9px] text-slate-400">{formatCurrency(item.amount)}</p>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : <EmptyState text="Belum ada data regional" />}
                </div>
                {stats?.by_regional && stats.by_regional.length > 0 && (
                    <div className="px-4 py-2 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
                        <span className="text-[10px] text-slate-500">
                            Total: <strong className="text-slate-700">{stats.by_regional.reduce((s, r) => s + r.count, 0).toLocaleString('id-ID')}</strong> pengajuan
                            {' '}di <strong className="text-slate-700">{stats.by_regional.length}</strong> regional
                        </span>
                        <span className="text-[10px] text-slate-500">{formatFullCurrency(stats.by_regional.reduce((s, r) => s + r.amount, 0))}</span>
                    </div>
                )}
            </SectionCard>

            {/* ===== ROW 5: Pipeline ===== */}
            {stats?.by_status && stats.by_status.length > 0 && (
                <SectionCard title="Pipeline Status" icon={<TrendingUp className="h-3 w-3 text-purple-600" />} iconBg="bg-purple-100">
                    <div className="p-3">
                        <div className="flex items-center gap-1 overflow-x-auto pb-1">
                            {stats.by_status.map((item, idx) => {
                                const color = getStatusColor(item.status);
                                const wPct = stats.total_pos > 0 ? Math.max((item.count / stats.total_pos) * 100, 8) : 0;
                                return (
                                    <React.Fragment key={item.status}>
                                        <div className={`shrink-0 ${color.bg} rounded-lg px-2.5 py-1.5 ring-1 ${color.ring} text-center min-w-16 transition-all hover:scale-105`}
                                            style={{ flex: `${wPct} 0 0%` }}>
                                            <p className={`text-base font-bold ${color.text}`}>{item.count}</p>
                                            <p className={`text-[8px] ${color.text} opacity-80 leading-tight mt-0.5`}>{item.status}</p>
                                        </div>
                                        {idx < stats.by_status.length - 1 && <ChevronRight className="h-3.5 w-3.5 text-slate-300 shrink-0" />}
                                    </React.Fragment>
                                );
                            })}
                        </div>
                    </div>
                </SectionCard>
            )}
        </div>
    );
};

// ===== Sub-components =====
const KPICard: React.FC<{ label: string; value: string; sub: string; icon: React.ReactNode; iconBg: string; valueColor?: string }> = ({
    label, value, sub, icon, iconBg, valueColor = 'text-slate-900',
}) => (
    <div className="bg-white rounded-xl border border-slate-200 p-3 shadow-sm hover:shadow-md transition-shadow">
        <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">{label}</span>
            <div className={`h-6 w-6 rounded-lg ${iconBg} flex items-center justify-center`}>{icon}</div>
        </div>
        <p className={`text-xl font-bold ${valueColor}`}>{value}</p>
        <p className="text-[10px] text-slate-500 mt-0.5 truncate">{sub}</p>
    </div>
);

const EmptyState: React.FC<{ height?: number; text?: string }> = ({ height = 200, text = 'Belum ada data' }) => (
    <div className={`flex items-center justify-center text-slate-400 text-xs`} style={{ height }}>
        {text}
    </div>
);
