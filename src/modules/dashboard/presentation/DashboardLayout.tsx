import React, { useEffect, useState } from 'react';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showConfirm } from '@/shared/utils/sweetAlert';
import { Sidebar } from './components/Sidebar';
import { Header } from './components/Header';
import { useRouter, usePathname } from 'next/navigation';

interface DashboardLayoutProps {
    children: React.ReactNode;
}

export const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
    const { user, logout, loading } = useAuth();
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const router = useRouter();
    const pathname = usePathname();

    useEffect(() => {
        if (loading) {
            showLoading('Memuat sesi...');
        } else {
            hideLoading();
        }
    }, [loading]);

    // Redirect admin-pos to /rekonsiliasi if trying to access other pages
    useEffect(() => {
        if (!loading && user && user.role === 'admin-pos') {
            if (pathname !== '/rekonsiliasi' && pathname !== '/profile') {
                router.push('/rekonsiliasi');
            }
        }
    }, [user, loading, pathname, router]);

    const handleLogout = async () => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin keluar?', 'Ya, Keluar', 'Batal', 'Konfirmasi Logout');
        if (confirmed) {
            logout();
        }
    };

    if (loading) {
        return null; // Or a loading spinner
    }

    if (!user) {
        return null; // Or redirect
    }

    return (
        <>
            {/* Mobile Layout - Full screen, no sidebar/header */}
            <div className="md:hidden min-h-screen bg-gray-50">
                {children}
            </div>

            {/* Desktop Layout - With sidebar and header */}
            <div className="hidden md:flex min-h-screen bg-gray-50 font-sans">
                {/* Sidebar Navigation */}
                <Sidebar
                    userRole={user.role}
                    isOpen={isSidebarOpen}
                    onClose={() => setIsSidebarOpen(false)}
                />

                {/* Main Content Area */}
                <div className="flex-1 lg:ml-64 flex flex-col min-h-screen transition-all duration-300">
                    {/* Top Header */}
                    <Header
                        user={user}
                        onLogout={handleLogout}
                        onMenuClick={() => setIsSidebarOpen(true)}
                    />

                    {/* Page Content */}
                    <main className="flex-1 p-6 lg:p-8 overflow-y-auto w-full">
                        <div className="w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
                            {children}
                        </div>
                    </main>
                </div>
            </div>
        </>
    );
};
