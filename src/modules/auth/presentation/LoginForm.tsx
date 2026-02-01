import React, { useState } from 'react';
import { useAuth } from './useAuth';
import { User, Lock, ArrowRight, Sparkles, Shield, Zap } from 'lucide-react';
import { showLoading, hideLoading, showError } from '@/shared/utils/sweetAlert';
import Image from 'next/image';

export const LoginForm: React.FC = () => {
    const { login } = useAuth();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [focusedField, setFocusedField] = useState<string | null>(null);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        showLoading('Sedang masuk...');
        try {
            await login(username, password);
            hideLoading();
        } catch (err) {
            hideLoading();
            showError('Username atau password salah', 'Login Gagal');
        }
    };

    return (
        <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
            {/* Animated Background */}
            <div className="absolute inset-0">
                {/* Gradient Orbs */}
                <div className="absolute top-0 -left-4 w-96 h-96 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob"></div>
                <div className="absolute top-0 -right-4 w-96 h-96 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-2000"></div>
                <div className="absolute -bottom-8 left-20 w-96 h-96 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-blob animation-delay-4000"></div>

                {/* Grid Pattern */}
                <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI2MCIgaGVpZ2h0PSI2MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAxMCAwIEwgMCAwIDAgMTAiIGZpbGw9Im5vbmUiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS1vcGFjaXR5PSIwLjAzIiBzdHJva2Utd2lkdGg9IjEiLz48L3BhdHRlcm4+PC9kZWZzPjxyZWN0IHdpZHRoPSIxMDAlIiBoZWlnaHQ9IjEwMCUiIGZpbGw9InVybCgjZ3JpZCkiLz48L3N2Zz4=')] opacity-40"></div>

                {/* Floating Particles */}
                <div className="absolute top-1/4 left-1/4 w-2 h-2 bg-cyan-400 rounded-full animate-float"></div>
                <div className="absolute top-1/3 right-1/3 w-1 h-1 bg-purple-400 rounded-full animate-float animation-delay-1000"></div>
                <div className="absolute bottom-1/4 right-1/4 w-2 h-2 bg-pink-400 rounded-full animate-float animation-delay-2000"></div>
                <div className="absolute top-2/3 left-1/3 w-1 h-1 bg-blue-400 rounded-full animate-float animation-delay-3000"></div>
            </div>

            {/* Main Content */}
            <div className="relative z-10 flex min-h-screen items-center justify-center p-4">
                <div className="w-full max-w-6xl">
                    <div className="grid lg:grid-cols-2 gap-8 items-center">
                        {/* Left Side - Branding */}
                        <div className="hidden lg:block space-y-8 text-white">
                            {/* Logo & Title */}
                            <div className="space-y-4">
                                <div className="inline-flex items-center gap-3 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20">
                                    <Sparkles className="w-5 h-5 text-cyan-400" />
                                    <span className="text-sm font-medium">Sistem Pengajuan Peminjaman</span>
                                </div>
                                <h1 className="text-5xl font-bold leading-tight">
                                    Kelola Pengajuan
                                    <br />
                                    <span className="bg-gradient-to-r from-cyan-400 via-blue-400 to-purple-400 bg-clip-text text-transparent">
                                        Dengan Mudah
                                    </span>
                                </h1>
                                <p className="text-lg text-gray-300 max-w-md">
                                    Platform modern untuk mengelola pengajuan peminjaman dengan cepat, aman, dan efisien.
                                </p>
                            </div>

                            {/* Features */}
                            <div className="space-y-4">
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-500 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/30 group-hover:scale-110 transition-transform">
                                        <Zap className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Proses Super Cepat</h3>
                                        <p className="text-sm text-gray-400">Pengajuan diproses dalam hitungan menit</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 group cursor-default">
                                    <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl flex items-center justify-center shadow-lg shadow-purple-500/30 group-hover:scale-110 transition-transform">
                                        <Shield className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-lg">Keamanan Terjamin</h3>
                                        <p className="text-sm text-gray-400">Data Anda dilindungi dengan enkripsi tingkat tinggi</p>
                                    </div>
                                </div>
                            </div>

                            {/* Stats */}
                            <div className="grid grid-cols-3 gap-4 pt-8">
                                <div className="text-center">
                                    <div className="text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">1000+</div>
                                    <div className="text-sm text-gray-400 mt-1">Pengajuan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">98%</div>
                                    <div className="text-sm text-gray-400 mt-1">Kepuasan</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-400 to-cyan-400 bg-clip-text text-transparent">24/7</div>
                                    <div className="text-sm text-gray-400 mt-1">Support</div>
                                </div>
                            </div>
                        </div>

                        {/* Right Side - Login Form */}
                        <div className="w-full max-w-md mx-auto">
                            {/* Glassmorphism Card */}
                            <div className="relative group">
                                {/* Glow Effect */}
                                <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 via-purple-500 to-pink-500 rounded-3xl blur opacity-20 group-hover:opacity-30 transition duration-1000"></div>

                                {/* Card */}
                                <div className="relative bg-white/10 backdrop-blur-xl rounded-3xl p-8 border border-white/20 shadow-2xl">
                                    {/* Header with Logo */}
                                    <div className="mb-8 text-center">
                                        {/* Logo */}
                                        <div className="flex justify-center mb-6">
                                            <div className="relative w-48 h-48">
                                                <Image
                                                    src="/images/logo-mm1.png"
                                                    alt="Logo"
                                                    fill
                                                    className="object-contain"
                                                    priority
                                                />
                                            </div>
                                        </div>
                                        {/* Subtitle */}
                                        <p className="text-gray-300 text-center">
                                            Masuk untuk melanjutkan ke dashboard
                                        </p>
                                    </div>

                                    {/* Form */}
                                    <form onSubmit={handleSubmit} className="space-y-6">
                                        {/* Username Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="username" className="block text-sm font-medium text-gray-200">
                                                Username
                                            </label>
                                            <div className="relative">
                                                <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors ${focusedField === 'username' ? 'text-cyan-400' : 'text-gray-400'
                                                    }`}>
                                                    <User className="w-5 h-5" />
                                                </div>
                                                <input
                                                    id="username"
                                                    type="text"
                                                    required
                                                    value={username}
                                                    onChange={(e) => setUsername(e.target.value)}
                                                    onFocus={() => setFocusedField('username')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:bg-white/10"
                                                    placeholder="Masukkan username"
                                                />
                                            </div>
                                        </div>

                                        {/* Password Field */}
                                        <div className="space-y-2">
                                            <label htmlFor="password" className="block text-sm font-medium text-gray-200">
                                                Password
                                            </label>
                                            <div className="relative">
                                                <div className={`absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none transition-colors ${focusedField === 'password' ? 'text-cyan-400' : 'text-gray-400'
                                                    }`}>
                                                    <Lock className="w-5 h-5" />
                                                </div>
                                                <input
                                                    id="password"
                                                    type="password"
                                                    required
                                                    value={password}
                                                    onChange={(e) => setPassword(e.target.value)}
                                                    onFocus={() => setFocusedField('password')}
                                                    onBlur={() => setFocusedField(null)}
                                                    className="w-full pl-12 pr-4 py-3.5 bg-white/5 border border-white/10 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all duration-200 hover:bg-white/10"
                                                    placeholder="••••••••"
                                                />
                                            </div>
                                        </div>

                                        {/* Submit Button */}
                                        <button
                                            type="submit"
                                            className="group relative w-full py-4 px-6 bg-gradient-to-r from-cyan-500 via-blue-500 to-purple-500 text-white font-semibold rounded-xl shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50 hover:scale-[1.02] active:scale-[0.98] transition-all duration-200 overflow-hidden"
                                        >
                                            {/* Button Shine Effect */}
                                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent translate-x-[-200%] group-hover:translate-x-[200%] transition-transform duration-1000"></div>

                                            <span className="relative flex items-center justify-center gap-2">
                                                Masuk Sekarang
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </span>
                                        </button>
                                    </form>

                                    {/* Footer */}
                                    <div className="mt-8 pt-6 border-t border-white/10">
                                        <p className="text-center text-sm text-gray-400">
                                            🔒 Dilindungi dengan enkripsi end-to-end
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Help Text */}
                            <div className="mt-6 text-center">
                                <p className="text-sm text-gray-400">
                                    Butuh bantuan? <span className="text-cyan-400 hover:text-cyan-300 cursor-pointer transition-colors">Hubungi Support</span>
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Custom Animations */}
            <style jsx>{`
                @keyframes blob {
                    0%, 100% { transform: translate(0, 0) scale(1); }
                    25% { transform: translate(20px, -20px) scale(1.1); }
                    50% { transform: translate(-20px, 20px) scale(0.9); }
                    75% { transform: translate(20px, 10px) scale(1.05); }
                }
                @keyframes float {
                    0%, 100% { transform: translateY(0px); opacity: 0.5; }
                    50% { transform: translateY(-20px); opacity: 1; }
                }
                @keyframes shake {
                    0%, 100% { transform: translateX(0); }
                    10%, 30%, 50%, 70%, 90% { transform: translateX(-5px); }
                    20%, 40%, 60%, 80% { transform: translateX(5px); }
                }
                .animate-blob {
                    animation: blob 7s infinite;
                }
                .animate-float {
                    animation: float 3s ease-in-out infinite;
                }
                .animate-shake {
                    animation: shake 0.5s;
                }
                .animation-delay-1000 {
                    animation-delay: 1s;
                }
                .animation-delay-2000 {
                    animation-delay: 2s;
                }
                .animation-delay-3000 {
                    animation-delay: 3s;
                }
                .animation-delay-4000 {
                    animation-delay: 4s;
                }
            `}</style>
        </div>
    );
};
