'use client';

import Link from 'next/link';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { useDashboard } from '@/modules/dashboard/presentation/useDashboard';
import { TrendingUp, Users, FileText, CheckCircle, XCircle, ArrowRight, Activity, Calendar } from 'lucide-react';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function DashboardPage() {
    const { user } = useAuth();
    const { stats, loading } = useDashboard();

    // Loading handled by SweetAlert in useDashboard hook

    const statsDisplay = [
        {
            name: 'Total Pengajuan',
            value: stats?.total?.toString() || '0',
            icon: FileText,
            color: 'blue',
            trend: '+12% from last month'
        },
        {
            name: 'Disetujui',
            value: stats?.approved?.toString() || '0',
            icon: CheckCircle,
            color: 'emerald',
            trend: '+5% from last month'
        },
        {
            name: 'Pending',
            value: stats?.pending?.toString() || '0',
            icon: Activity,
            color: 'amber',
            trend: 'Requires attention'
        },
        {
            name: 'Ditolak',
            value: stats?.rejected?.toString() || '0',
            icon: XCircle,
            color: 'rose',
            trend: '-2% from last month'
        },
    ];

    const quickActions = [
        {
            title: 'Buat Pengajuan Baru',
            desc: 'Mulai proses pengajuan baru Anda di sini.',
            icon: FileText,
            href: '/pengajuan/create',
            color: 'bg-indigo-500'
        },
        {
            title: 'Lihat Laporan',
            desc: 'Pantau status dan riwayat pengajuan.',
            icon: Calendar,
            href: '/reports',
            color: 'bg-violet-500'
        },
        {
            title: 'Analisis Data',
            desc: 'Insight mendalam tentang performa unit.',
            icon: TrendingUp,
            href: '/analytics',
            color: 'bg-fuchsia-500'
        }
    ];

    return (
        <div className="space-y-8">
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

            {/* Stats Grid */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <Activity className="h-5 w-5 text-indigo-500" />
                    Overview Statistik
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {statsDisplay.map((stat, index) => {
                        const Icon = stat.icon;
                        const colorClasses: Record<string, string> = {
                            blue: 'bg-blue-50 text-blue-600',
                            emerald: 'bg-emerald-50 text-emerald-600',
                            amber: 'bg-amber-50 text-amber-600',
                            rose: 'bg-rose-50 text-rose-600',
                        };

                        return (
                            <div
                                key={stat.name}
                                className="group bg-white rounded-2xl p-6 shadow-sm border border-slate-100 hover:shadow-xl hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300"
                            >
                                <div className="flex items-center justify-between mb-4">
                                    <div className={`p-3 rounded-xl ${colorClasses[stat.color]}`}>
                                        <Icon className="h-6 w-6" />
                                    </div>
                                    <span className="text-xs font-medium text-slate-400 bg-slate-50 px-2 py-1 rounded-full">
                                        30 Days
                                    </span>
                                </div>
                                <div>
                                    <p className="text-3xl font-bold text-gray-900 mb-1">{stat.value}</p>
                                    <p className="text-sm font-medium text-slate-500">{stat.name}</p>
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>

            {/* Quick Actions */}
            <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                    <TrendingUp className="h-5 w-5 text-indigo-500" />
                    Aksi Cepat
                </h3>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                    {quickActions.map((action, index) => {
                        const Icon = action.icon;
                        return (
                            <Link
                                href={action.href}
                                key={action.title}
                                className="group relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm border border-slate-100 transition-all duration-300 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 block"
                            >
                                <div className="relative z-10 flex flex-col h-full justify-between">
                                    <div>
                                        <div className={`inline-flex p-3 rounded-xl ${action.color} text-white mb-4 shadow-lg shadow-indigo-500/20`}>
                                            <Icon className="h-6 w-6" />
                                        </div>
                                        <h4 className="text-xl font-bold text-gray-900 mb-2">{action.title}</h4>
                                        <p className="text-slate-500 text-sm leading-relaxed">{action.desc}</p>
                                    </div>
                                    <div className="mt-6 flex items-center text-sm font-semibold text-indigo-600 group-hover:text-indigo-700">
                                        Mulai Sekarang <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                                    </div>
                                </div>
                                <div className="absolute top-0 right-0 -mt-8 -mr-8 h-32 w-32 rounded-full bg-slate-50 transition-all duration-500 group-hover:scale-150 group-hover:bg-indigo-50/30"></div>
                            </Link>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
