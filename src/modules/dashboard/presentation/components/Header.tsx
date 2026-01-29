'use client';

import React from 'react';
import { usePathname } from 'next/navigation';
import { User, LogOut, Bell, Search, Menu } from 'lucide-react';

interface HeaderProps {
    user: {
        name: string;
        role: string;
    } | null;
    onLogout: () => void;
    onMenuClick: () => void;
}

export const Header: React.FC<HeaderProps> = ({ user, onLogout, onMenuClick }) => {
    const pathname = usePathname();

    // Generate breadcrumbs or page title
    const getPageTitle = () => {
        const path = pathname.split('/').filter(Boolean);
        if (path.length === 0) return 'Dashboard';

        // Check if last segment looks like a UUID (contains dashes and is long)
        const lastSegment = path[path.length - 1];
        const isUUID = lastSegment.includes('-') && lastSegment.length > 20;

        if (isUUID && path.length > 1) {
            // Replace UUID with 'Detail' for cleaner display
            const parentPath = path[path.length - 2];
            return parentPath.charAt(0).toUpperCase() + parentPath.slice(1) + ' / Detail';
        }

        return path.map(p => p.charAt(0).toUpperCase() + p.slice(1).replace(/-/g, ' ')).join(' / ');
    };

    return (
        <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-gray-200/50 transition-all duration-300">
            <div className="flex h-16 items-center justify-between px-6 py-4">
                {/* Left Side: Mobile Menu & Title */}
                <div className="flex items-center gap-4">
                    <button
                        onClick={onMenuClick}
                        className="lg:hidden p-2 -ml-2 text-gray-500 hover:text-gray-700 rounded-md"
                    >
                        <Menu className="h-6 w-6" />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold text-gray-900 tracking-tight">
                            {pathname === '/dashboard' ? 'Overview' : getPageTitle().split(' / ').pop()}
                        </h1>
                        <p className="hidden md:block text-xs text-gray-500 font-medium">
                            {getPageTitle().split(' / ').length > 1 ? getPageTitle() : 'Welcome back!'}
                        </p>
                    </div>
                </div>

                {/* Right Side: Actions & Profile */}
                <div className="flex items-center gap-4">
                    {/* Search Bar (Optional) */}
                    <div className="hidden md:flex items-center relative">
                        <Search className="absolute left-3 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Search..."
                            className="h-9 w-64 rounded-full border border-gray-200 bg-gray-50 pl-9 pr-4 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                    </div>

                    <div className="h-6 w-px bg-gray-200 mx-1 hidden md:block"></div>

                    {/* Notifications */}
                    <button className="relative p-2 text-gray-400 hover:text-indigo-600 transition-colors rounded-full hover:bg-gray-100">
                        <Bell className="h-5 w-5" />
                        <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                    </button>

                    {/* User Dropdown */}
                    <div className="flex items-center gap-3 pl-2">
                        <div className="hidden md:flex flex-col items-end">
                            <span className="text-sm font-semibold text-gray-900">
                                {user?.name || 'User'}
                            </span>
                            <span className="text-xs text-indigo-600 font-medium px-2 py-0.5 bg-indigo-50 rounded-full">
                                {user?.role || 'Role'}
                            </span>
                        </div>

                        <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-indigo-500 to-violet-500 flex items-center justify-center text-white shadow-md ring-2 ring-white">
                            <User className="h-5 w-5" />
                        </div>

                        <button
                            onClick={onLogout}
                            className="ml-2 p-2 text-gray-400 hover:text-red-600 transition-colors rounded-full hover:bg-red-50"
                            title="Logout"
                        >
                            <LogOut className="h-5 w-5" />
                        </button>
                    </div>
                </div>
            </div>
        </header>
    );
};
