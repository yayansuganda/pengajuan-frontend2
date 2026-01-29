'use client';

import React from 'react';
import Link from 'next/link';
import { FileText, Search, Activity, LayoutGrid, ArrowRight } from 'lucide-react';

export const FrontingPage = () => {
    // Reordered menus: Dashboard is now first
    const menus = [
        {
            title: 'Dashboard Utama',
            desc: 'Akses dashboard lengkap untuk manajemen dan monitoring.',
            href: '/dashboard',
            icon: LayoutGrid,
            gradient: 'from-orange-500 to-amber-500',
            shadow: 'shadow-orange-500/25',
            bg: 'bg-orange-50'
        },
        {
            title: 'Pengajuan Baru',
            desc: 'Buat pengajuan pembiayaan baru untuk nasabah pensiunan.',
            href: '/fronting/pengajuan',
            icon: FileText,
            gradient: 'from-indigo-600 to-violet-600',
            shadow: 'shadow-indigo-500/25',
            bg: 'bg-indigo-50'
        },
        {
            title: 'Pengecekan Data',
            desc: 'Verifikasi validitas data nasabah dan rincian gaji.',
            href: '/fronting/pengecekan',
            icon: Search,
            gradient: 'from-emerald-500 to-teal-500',
            shadow: 'shadow-emerald-500/25',
            bg: 'bg-emerald-50'
        },
        {
            title: 'Cek Status',
            desc: 'Pantau status progress pengajuan secara realtime.',
            href: '/fronting/cek-status',
            icon: Activity,
            gradient: 'from-blue-500 to-cyan-500',
            shadow: 'shadow-blue-500/25',
            bg: 'bg-blue-50'
        }
    ];

    return (
        <div className="min-h-screen bg-slate-50 relative overflow-hidden flex flex-col items-center justify-center p-6 sm:p-8">
            {/* Premium Animated Background */}
            <div className="absolute inset-0 bg-slate-50">
                <div className="absolute top-0 inset-x-0 h-[500px] bg-gradient-to-b from-slate-900 to-slate-800 rounded-b-[3rem] shadow-2xl overflow-hidden">
                    <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/20 rounded-full blur-[100px] mix-blend-overlay"></div>
                    <div className="absolute top-[-10%] right-[-20%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[80px] mix-blend-overlay"></div>
                </div>
            </div>

            <div className="relative z-10 w-full max-w-md flex-1 flex flex-col justify-center">

                {/* Brand Header */}
                <div className="text-center mb-10 pt-8 text-white">
                    <div className="inline-flex items-center justify-center h-20 w-20 bg-white/5 backdrop-blur-xl rounded-2xl border border-white/10 shadow-2xl mb-6 ring-1 ring-white/20">
                        <span className="text-4xl font-black bg-clip-text text-transparent bg-gradient-to-br from-white to-slate-400">M</span>
                    </div>
                    <h1 className="text-3xl font-bold tracking-tight mb-2">Portal Layanan</h1>
                    <p className="text-slate-400 text-sm font-medium uppercase tracking-widest">Mobile Fronting System</p>
                </div>

                {/* Premium Cards Grid */}
                <div className="space-y-4">
                    {menus.map((menu, idx) => {
                        const Icon = menu.icon;
                        return (
                            <Link
                                key={idx}
                                href={menu.href}
                                className="group relative block"
                            >
                                <div className="relative bg-white rounded-2xl p-5 shadow-sm border border-slate-100 transition-all duration-300 ease-out hover:-translate-y-1 hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] hover:border-indigo-100 overflow-hidden isolate">

                                    {/* Hover Glow Effect */}
                                    <div className={`absolute -right-16 -top-16 w-32 h-32 bg-gradient-to-br ${menu.gradient} opacity-0 group-hover:opacity-10 blur-2xl transition-opacity duration-500`}></div>

                                    <div className="flex items-center gap-5">
                                        {/* Icon Container */}
                                        <div className={`h-16 w-16 shrink-0 rounded-2xl bg-gradient-to-br ${menu.gradient} ${menu.shadow} flex items-center justify-center text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3`}>
                                            <Icon className="h-8 w-8" />
                                        </div>

                                        <div className="flex-1 min-w-0 py-1">
                                            <h3 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1 flex items-center gap-2">
                                                {menu.title}
                                            </h3>
                                            <p className="text-sm text-slate-500 leading-snug group-hover:text-slate-600 transition-colors line-clamp-2">
                                                {menu.desc}
                                            </p>
                                        </div>

                                        {/* Arrow Action */}
                                        <div className="h-8 w-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-indigo-600 group-hover:text-white transition-all duration-300 transform group-hover:translate-x-1">
                                            <ArrowRight className="h-4 w-4" />
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>

                {/* Footer */}
                <div className="mt-auto py-8 text-center">
                    <p className="text-xs text-slate-400 font-medium opacity-60">
                        &copy; 2026 PT. Bank Dashboard System<br />
                        Version 2.4.0 (Stable)
                    </p>
                </div>
            </div>
        </div>
    );
};
