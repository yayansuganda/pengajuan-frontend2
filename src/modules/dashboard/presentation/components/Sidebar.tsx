'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Image from 'next/image';
import {
    LayoutDashboard,
    FileText,
    Database,
    ChevronDown,
    Building2,
    Users,
    Briefcase,
    CreditCard,
    ChevronRight,
    Search,
    Activity,
    Smartphone,
    MinusCircle,
    Settings
} from 'lucide-react';

interface SidebarProps {
    userRole?: string;
    isOpen: boolean;
    onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ userRole, isOpen, onClose }) => {
    const pathname = usePathname();
    const [isDataMasterOpen, setIsDataMasterOpen] = useState(
        pathname.startsWith('/unit') ||
        pathname.startsWith('/users') ||
        pathname.startsWith('/data-master') ||
        pathname.startsWith('/settings')
    );

    const navigation = [
        { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
        { name: 'Pengajuan', href: '/pengajuan', icon: FileText },
        { name: 'Pengecekan', href: '/pengecekan', icon: Search },
        { name: 'Cek Status', href: '/cek-status', icon: Activity },
        { name: 'Fronting', href: '/fronting', icon: Smartphone },
    ];

    const dataMasterMenus = [
        { name: 'Unit', href: '/unit', icon: Building2 },
        { name: 'User', href: '/users', icon: Users },
        { name: 'Jenis Pelayanan', href: '/data-master/jenis-pelayanan', icon: Briefcase },
        { name: 'Jenis Pembiayaan', href: '/data-master/jenis-pembiayaan', icon: CreditCard },
        { name: 'Potongan', href: '/data-master/potongan', icon: MinusCircle },
        { name: 'Potongan Jangka Waktu', href: '/data-master/potongan-jangka-waktu', icon: Database },
        { name: 'Settings', href: '/data-master/settings', icon: Settings },
    ];

    const isActive = (path: string) => {
        // Exact match untuk menghindari false positive
        // Contoh: /data-master/potongan tidak boleh match dengan /data-master/potongan-jangka-waktu
        return pathname === path;
    };

    // Auto-close on mobile when route matches (Link clicked)
    const handleLinkClick = () => {
        // Only close if we are on a small screen
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <>
            {/* Mobile Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden transition-opacity"
                    onClick={onClose}
                />
            )}

            {/* Sidebar Container */}
            <aside
                className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 border-r border-slate-800 shadow-xl transition-transform duration-300 ease-in-out lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
                    }`}
            >
                {/* Logo Section */}
                <div className="flex h-16 items-center justify-center px-6 bg-slate-950/50 border-b border-slate-800">
                    <div className="relative w-full h-12">
                        <Image
                            src="/images/logo-mm2.png"
                            alt="MM Pengajuan Logo"
                            fill
                            className="object-contain"
                            priority
                        />
                    </div>
                </div>

                {/* Navigation Section */}
                <nav className="flex-1 space-y-1 px-3 py-6 overflow-y-auto max-h-[calc(100vh-4rem)]">
                    <div className="px-3 mb-2">
                        <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                            Menu Utama
                        </p>
                    </div>

                    {navigation.map((item) => {
                        const active = isActive(item.href);
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={handleLinkClick}
                                className={`group flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${active
                                    ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-600/20'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <Icon className={`h-5 w-5 ${active ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'}`} />
                                {item.name}
                            </Link>
                        );
                    })}

                    {/* Data Master Section - Super Admin Only */}
                    {userRole === 'super-admin' && (
                        <div className="mt-8">
                            <div className="px-3 mb-2">
                                <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                                    Administrator
                                </p>
                            </div>

                            <button
                                onClick={() => setIsDataMasterOpen(!isDataMasterOpen)}
                                className={`w-full group flex items-center justify-between px-3 py-2.5 text-sm font-medium rounded-lg transition-all duration-200 ${isDataMasterOpen
                                    ? 'text-slate-200 bg-slate-800/50'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <Database className="h-5 w-5 text-slate-500" />
                                    <span>Data Master</span>
                                </div>
                                <ChevronRight
                                    className={`h-4 w-4 text-slate-500 transition-transform duration-200 ${isDataMasterOpen ? 'rotate-90' : ''
                                        }`}
                                />
                            </button>

                            {isDataMasterOpen && (
                                <div className="mt-1 space-y-1 pl-3">
                                    {dataMasterMenus.map((submenu) => {
                                        const active = isActive(submenu.href);
                                        const SubIcon = submenu.icon;
                                        return (
                                            <Link
                                                key={submenu.name}
                                                href={submenu.href}
                                                onClick={handleLinkClick}
                                                className={`group flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${active
                                                    ? 'text-indigo-400 bg-indigo-600/5'
                                                    : 'text-slate-400 hover:text-slate-200'
                                                    }`}
                                            >
                                                <div className="flex items-center justify-center w-5">
                                                    <div className={`h-1.5 w-1.5 rounded-full transition-colors ${active ? 'bg-indigo-400' : 'bg-slate-600 group-hover:bg-slate-400'}`} />
                                                </div>
                                                {submenu.name}
                                            </Link>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    )}
                </nav>

                {/* User Profile Summary (Bottom) */}
                <div className="p-4 border-t border-slate-800 absolute bottom-0 w-full bg-slate-900">
                    <div className="bg-slate-800/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-xs text-slate-400 text-center">
                            &copy; 2026 SIAPIMM
                        </p>
                    </div>
                </div>
            </aside>
        </>
    );
};
