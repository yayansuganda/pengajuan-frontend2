'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Shield, LogOut, Key, Settings, HelpCircle, ChevronRight, User as UserIcon, X, Save, Eye, EyeOff, Info } from 'lucide-react';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { showConfirm, showSuccess, showError, showLoading, hideLoading } from '@/shared/utils/sweetAlert';
import { UserRepositoryImpl } from '../data/UserRepositoryImpl';
import { UpdateUserDTO } from '../core/UserEntity';
import { handleError } from '@/shared/utils/errorHandler';

const userRepository = new UserRepositoryImpl();

export const ProfilePage: React.FC = () => {
    const { user, logout } = useAuth();
    const router = useRouter();

    // Modal States
    const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
    const [isChangePasswordOpen, setIsChangePasswordOpen] = useState(false);
    const [isHelpOpen, setIsHelpOpen] = useState(false);

    // Form States
    const [profileForm, setProfileForm] = useState({ name: '', username: '' });
    const [passwordForm, setPasswordForm] = useState({ newPassword: '', confirmPassword: '' });
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    useEffect(() => {
        if (user) {
            setProfileForm({
                name: user.name,
                username: user.username
            });
        }
    }, [user]);

    const handleLogout = async () => {
        const confirmed = await showConfirm(
            'Apakah Anda yakin ingin keluar aplikasi?',
            'Ya, Keluar',
            'Batal',
            'Konfirmasi Logout'
        );
        if (confirmed) {
            logout();
        }
    };

    const handleSaveProfile = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!profileForm.name.trim()) return showError('Nama harus diisi');
        if (!profileForm.username.trim()) return showError('Username harus diisi');

        try {
            showLoading('Menyimpan perubahan...');
            const updateData: UpdateUserDTO = {
                name: profileForm.name,
                username: profileForm.username,
                role: user.role, // Maintain role
            };

            await userRepository.update(Number(user.id), updateData);
            hideLoading();
            await showSuccess('Profil berhasil diperbarui. Silakan login ulang untuk melihat perubahan.');
            setIsEditProfileOpen(false);
            logout(); // Force logout to refresh session data if necessary, or just let them stay
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal memperbarui profil'));
        }
    };

    const handleSavePassword = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user) return;
        if (!passwordForm.newPassword) return showError('Password baru harus diisi');
        if (passwordForm.newPassword !== passwordForm.confirmPassword) return showError('Konfirmasi password tidak cocok');

        try {
            showLoading('Mengubah password...');
            const updateData: UpdateUserDTO = {
                password: passwordForm.newPassword,
                role: user.role // Required by DTO usually
            };

            await userRepository.update(Number(user.id), updateData);
            hideLoading();
            await showSuccess('Password berhasil diubah');
            setIsChangePasswordOpen(false);
            setPasswordForm({ newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal mengubah password'));
        }
    };

    if (!user) return null;

    const menuItems = [
        {
            label: 'Pengaturan Akun',
            icon: Settings,
            action: () => setIsEditProfileOpen(true),
            color: 'bg-indigo-50 text-indigo-600',
        },
        {
            label: 'Ubah Password',
            icon: Key,
            action: () => setIsChangePasswordOpen(true),
            color: 'bg-amber-50 text-amber-600',
        },
        {
            label: 'Bantuan',
            icon: HelpCircle,
            action: () => setIsHelpOpen(true),
            color: 'bg-emerald-50 text-emerald-600',
        }
    ];

    return (
        <MobileLayoutWrapper showBackground={false}>
            {/* Layer 1: Full Page Background (Same as PengajuanList) */}
            <div className="fixed inset-0 z-0 pointer-events-none">
                <img src="/images/loan_header_bg.png" alt="bg" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
            </div>

            {/* Layer 2: 30% Header Background (Same as PengajuanList) */}
            <div className="fixed top-0 left-0 right-0 h-[250px] z-0 overflow-hidden rounded-b-3xl pointer-events-none">
                <img src="/images/loan_header_bg.png" alt="header" className="w-full h-full object-cover object-center" />
            </div>

            <div className="relative z-10 pt-12 px-4 pb-24">
                {/* Profile Header */}
                <div className="flex flex-col items-center mb-8">
                    <div className="w-24 h-24 rounded-full bg-white p-1 shadow-xl mb-4 relative animate-in fade-in zoom-in duration-500">
                        <div className="w-full h-full rounded-full bg-slate-100 flex items-center justify-center overflow-hidden">
                            <span className="text-3xl font-bold text-slate-400">
                                {user.name.charAt(0).toUpperCase()}
                            </span>
                        </div>
                        <div className="absolute bottom-0 right-0 w-8 h-8 bg-emerald-500 rounded-full border-4 border-white flex items-center justify-center shadow-sm">
                            <Shield className="w-3 h-3 text-white" />
                        </div>
                    </div>

                    <h1 className="text-xl font-bold text-slate-800 text-center mb-1 drop-shadow-sm">
                        {user.name}
                    </h1>
                    <div className="flex items-center gap-2 bg-white/60 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/50 shadow-sm">
                        <UserIcon className="w-3 h-3 text-indigo-600" />
                        <span className="text-xs font-bold text-indigo-600 capitalize">
                            {user.role.replace('-', ' ')}
                        </span>
                    </div>
                </div>

                {/* Info Cards - REMOVED per request */}

                {/* Menu Section */}
                <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-2 space-y-2 mb-6">
                    {menuItems.map((item, index) => {
                        const Icon = item.icon;
                        return (
                            <button
                                key={index}
                                onClick={item.action}
                                className="w-full flex items-center gap-4 p-4 rounded-xl hover:bg-slate-50 active:scale-[0.98] transition-all group"
                            >
                                <div className={`w-12 h-12 rounded-xl ${item.color} flex items-center justify-center shrink-0 shadow-sm group-hover:shadow transition-all`}>
                                    <Icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1 text-left">
                                    <h3 className="text-sm font-bold text-slate-800">{item.label}</h3>
                                    <p className="text-[10px] text-slate-400 font-medium">Kelola {item.label.toLowerCase()}</p>
                                </div>
                                <div className="w-8 h-8 rounded-full bg-slate-50 flex items-center justify-center text-slate-300 group-hover:text-slate-500 transition-colors">
                                    <ChevronRight className="w-4 h-4" />
                                </div>
                            </button>
                        );
                    })}
                </div>

                {/* Logout Button */}
                <button
                    onClick={handleLogout}
                    className="w-full bg-white rounded-2xl shadow-sm border border-red-100 p-4 flex items-center gap-4 active:scale-[0.98] transition-all group"
                >
                    <div className="w-12 h-12 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0 shadow-sm group-hover:shadow transition-all">
                        <LogOut className="w-6 h-6" />
                    </div>
                    <div className="flex-1 text-left">
                        <h3 className="text-sm font-bold text-red-600">Keluar Aplikasi</h3>
                        <p className="text-[10px] text-red-300 font-medium">Akhiri sesi anda</p>
                    </div>
                </button>

                {/* Version */}
                <div className="mt-8 text-center space-y-1">
                    <p className="text-[10px] text-slate-400 font-medium tracking-wider">VERSI APLIKASI 1.0.0</p>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {isEditProfileOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsEditProfileOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h3 className="font-bold text-slate-800">Edit Profil</h3>
                            <button onClick={() => setIsEditProfileOpen(false)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSaveProfile} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 basic-label">Nama Lengkap</label>
                                <input
                                    type="text"
                                    value={profileForm.name}
                                    onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Masukkan nama lengkap"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5 basic-label">Username</label>
                                <input
                                    type="text"
                                    value={profileForm.username}
                                    onChange={(e) => setProfileForm({ ...profileForm, username: e.target.value })}
                                    className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                    placeholder="Masukkan username"
                                />
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Simpan Perubahan
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Change Password Modal */}
            {isChangePasswordOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsChangePasswordOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden">
                        <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-b border-gray-100">
                            <h3 className="font-bold text-slate-800">Ubah Password</h3>
                            <button onClick={() => setIsChangePasswordOpen(false)} className="p-1 rounded-full hover:bg-gray-200 transition-colors">
                                <X className="w-5 h-5 text-slate-500" />
                            </button>
                        </div>
                        <form onSubmit={handleSavePassword} className="p-6 space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Password Baru</label>
                                <div className="relative">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        value={passwordForm.newPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Min. 6 karakter"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">Konfirmasi Password</label>
                                <div className="relative">
                                    <input
                                        type={showConfirmPassword ? "text" : "password"}
                                        value={passwordForm.confirmPassword}
                                        onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                        className="w-full pl-4 pr-12 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm font-medium focus:bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none transition-all"
                                        placeholder="Ulangi password baru"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                                    >
                                        {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>
                            <div className="pt-2">
                                <button
                                    type="submit"
                                    className="w-full bg-indigo-600 text-white font-bold py-3.5 rounded-xl shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all flex items-center justify-center gap-2"
                                >
                                    <Save className="w-5 h-5" />
                                    Simpan Password
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Help Modal */}
            {isHelpOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" onClick={() => setIsHelpOpen(false)}></div>
                    <div className="relative w-full max-w-sm bg-white rounded-2xl shadow-xl transform transition-all animate-in zoom-in-95 duration-200 overflow-hidden max-h-[80vh] flex flex-col">
                        <div className="bg-emerald-50 px-6 py-4 flex items-center justify-between border-b border-emerald-100">
                            <div className="flex items-center gap-2">
                                <Info className="w-5 h-5 text-emerald-600" />
                                <h3 className="font-bold text-emerald-800">Bantuan</h3>
                            </div>
                            <button onClick={() => setIsHelpOpen(false)} className="p-1 rounded-full hover:bg-emerald-100 transition-colors">
                                <X className="w-5 h-5 text-emerald-600" />
                            </button>
                        </div>
                        <div className="p-6 overflow-y-auto">
                            <div className="prose prose-sm prose-slate">
                                <div className="space-y-4">
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-2">1. Manajemen Pengajuan</h4>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            Gunakan menu "Pengajuan" untuk melihat daftar pengajuan kredit. Klik tombol Tambah (+) untuk membuat pengajuan baru.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-2">2. Pengecekan Status</h4>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            Gunakan menu "Pengecekan" untuk melacak status persetujuan pengajuan dan posisi dokumen.
                                        </p>
                                    </div>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-100">
                                        <h4 className="font-bold text-slate-800 mb-2">3. Pengaturan Akun</h4>
                                        <p className="text-slate-600 text-xs leading-relaxed">
                                            Anda dapat mengubah nama profil dan password melalui halaman Profil ini. Pastikan data yang anda masukkan benar.
                                        </p>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-xl border border-amber-100">
                                        <h4 className="font-bold text-amber-800 mb-2">Butuh Bantuan Lebih?</h4>
                                        <p className="text-amber-700 text-xs leading-relaxed">
                                            Hubungi tim IT Support jika anda mengalami kendala teknis dalam penggunaan aplikasi ini.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="p-4 border-t border-slate-100 bg-slate-50">
                            <button
                                onClick={() => setIsHelpOpen(false)}
                                className="w-full bg-slate-200 text-slate-700 font-bold py-3 rounded-xl hover:bg-slate-300 transition-colors"
                            >
                                Tutup
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </MobileLayoutWrapper>
    );
};
