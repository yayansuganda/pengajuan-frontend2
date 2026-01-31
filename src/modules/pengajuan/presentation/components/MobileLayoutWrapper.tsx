import React, { useState } from 'react';
import { Home, FileText, Search, Settings, X, Users, Building2, Briefcase, CreditCard, Percent, Calendar, MapPin, CheckCircle, Plus } from 'lucide-react';
import Link from 'next/link';

interface MobileLayoutWrapperProps {
    children: React.ReactNode;
    showBackground?: boolean;
}

export const MobileLayoutWrapper: React.FC<MobileLayoutWrapperProps> = ({ children, showBackground = true }) => {
    const [showSettingsMenu, setShowSettingsMenu] = useState(false);
    const [showPengecekanMenu, setShowPengecekanMenu] = useState(false);

    const settingsMenuItems = [
        { icon: Building2, label: 'Unit', href: '/unit' },
        { icon: Users, label: 'User', href: '/users' },
        { icon: Briefcase, label: 'Jenis Pelayanan', href: '/data-master/jenis-pelayanan' },
        { icon: CreditCard, label: 'Jenis Pembiayaan', href: '/data-master/jenis-pembiayaan' },
        { icon: Percent, label: 'Potongan', href: '/data-master/potongan' },
        { icon: Calendar, label: 'Potongan Jangka Waktu', href: '/data-master/potongan-jangka-waktu' },
        { icon: Settings, label: 'Settings', href: '/data-master/settings' },
    ];

    const pengecekanMenuItems = [
        { icon: MapPin, label: 'Pengecekan POS', href: '/pengecekan' },
        { icon: CheckCircle, label: 'Pengecekan Status', href: '/cek-status' },
    ];

    // Handler to open Settings menu and close Pengecekan menu
    const handleSettingsClick = () => {
        setShowSettingsMenu(!showSettingsMenu);
        setShowPengecekanMenu(false);
    };

    // Handler to open Pengecekan menu and close Settings menu
    const handlePengecekanClick = () => {
        setShowPengecekanMenu(!showPengecekanMenu);
        setShowSettingsMenu(false);
    };

    return (
        <>
            {/* Mobile Layout */}
            <div className="md:hidden min-h-screen bg-slate-100 pb-28">
                {showBackground && (
                    <div className="fixed top-0 left-0 right-0 h-[30vh] z-0 overflow-hidden rounded-b-3xl">
                        <img
                            src="/images/loan_header_bg.png"
                            alt="Loan Background"
                            className="w-full h-full object-cover object-center"
                        />
                    </div>
                )}

                {/* Content */}
                <div className={`relative ${showBackground ? 'z-10' : ''}`}>
                    {children}
                </div>

                {/* Settings Submenu Overlay */}
                {showSettingsMenu && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setShowSettingsMenu(false)}
                    >
                        <div
                            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-slate-700 to-slate-900 px-4 py-3 flex items-center justify-between">
                                    <h3 className="text-white font-bold text-sm">Menu Settings</h3>
                                    <button
                                        onClick={() => setShowSettingsMenu(false)}
                                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <div className="max-h-[60vh] overflow-y-auto">
                                    <div className="grid grid-cols-2 gap-2 p-3">
                                        {settingsMenuItems.map((item, idx) => {
                                            const Icon = item.icon;
                                            return (
                                                <Link
                                                    key={idx}
                                                    href={item.href}
                                                    onClick={() => setShowSettingsMenu(false)}
                                                    className="flex flex-col items-center gap-2 p-3 rounded-xl bg-slate-50 hover:bg-slate-100 active:bg-slate-200 transition-colors border border-slate-200"
                                                >
                                                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-800 flex items-center justify-center">
                                                        <Icon className="w-5 h-5 text-white" />
                                                    </div>
                                                    <span className="text-[10px] font-medium text-slate-700 text-center leading-tight">
                                                        {item.label}
                                                    </span>
                                                </Link>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Pengecekan Submenu Overlay */}
                {showPengecekanMenu && (
                    <div
                        className="fixed inset-0 bg-black/50 z-40 backdrop-blur-sm"
                        onClick={() => setShowPengecekanMenu(false)}
                    >
                        <div
                            className="absolute bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm"
                            onClick={(e) => e.stopPropagation()}
                        >
                            <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
                                {/* Header */}
                                <div className="bg-gradient-to-r from-blue-600 to-cyan-600 px-4 py-3 flex items-center justify-between">
                                    <h3 className="text-white font-bold text-sm">Menu Pengecekan</h3>
                                    <button
                                        onClick={() => setShowPengecekanMenu(false)}
                                        className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center hover:bg-white/30 transition-colors"
                                    >
                                        <X className="w-4 h-4 text-white" />
                                    </button>
                                </div>

                                {/* Menu Items */}
                                <div className="p-4 space-y-2">
                                    {pengecekanMenuItems.map((item, idx) => {
                                        const Icon = item.icon;
                                        return (
                                            <Link
                                                key={idx}
                                                href={item.href}
                                                onClick={() => setShowPengecekanMenu(false)}
                                                className="flex items-center gap-3 p-4 rounded-xl bg-gradient-to-r from-blue-50 to-cyan-50 hover:from-blue-100 hover:to-cyan-100 active:from-blue-200 active:to-cyan-200 transition-colors border border-blue-200"
                                            >
                                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center shrink-0">
                                                    <Icon className="w-6 h-6 text-white" />
                                                </div>
                                                <span className="text-sm font-semibold text-slate-700">
                                                    {item.label}
                                                </span>
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {/* Floating Bottom Navigation */}
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50">
                    <div className="bg-slate-900 rounded-full px-2 py-1.5 flex items-center gap-1 shadow-2xl shadow-slate-900/40">
                        {/* 1. Pengajuan */}
                        <Link
                            href="/pengajuan"
                            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <FileText className="w-5 h-5" />
                        </Link>

                        {/* 2. Pengecekan - Opens Submenu */}
                        <button
                            onClick={handlePengecekanClick}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${showPengecekanMenu
                                ? 'bg-white/20 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Search className="w-5 h-5" />
                        </button>

                        {/* 3. Dashboard - Center FAB */}
                        <Link href="/dashboard" className="-mt-5 mx-1">
                            <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center shadow-lg shadow-emerald-600/40 border-4 border-white hover:scale-105 active:scale-95 transition-transform">
                                <Home className="w-6 h-6 text-white" strokeWidth={2.5} />
                            </div>
                        </Link>

                        {/* 4. Settings - Opens Submenu */}
                        <button
                            onClick={handleSettingsClick}
                            className={`w-11 h-11 rounded-full flex items-center justify-center transition-colors ${showSettingsMenu
                                ? 'bg-white/20 text-white'
                                : 'text-slate-400 hover:text-white hover:bg-white/10'
                                }`}
                        >
                            <Settings className="w-5 h-5" />
                        </button>

                        {/* 5. Profile */}
                        <Link
                            href="/profile"
                            className="w-11 h-11 rounded-full flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                        >
                            <Users className="w-5 h-5" />
                        </Link>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Show children as is */}
            <div className="hidden md:block">
                {children}
            </div>
        </>
    );
};
