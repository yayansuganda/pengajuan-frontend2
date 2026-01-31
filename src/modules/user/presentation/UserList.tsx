'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, X, Save, Eye, EyeOff, Users, Shield, Building2 } from 'lucide-react';
import { User, CreateUserDTO, UpdateUserDTO } from '../core/UserEntity';
import { UserRepositoryImpl } from '../data/UserRepositoryImpl';
import { UnitRepositoryImpl } from '@/modules/unit/data/UnitRepositoryImpl';
import { Unit } from '@/modules/unit/core/UnitEntity';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
// Mobile Layout
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const userRepository = new UserRepositoryImpl();
const unitRepository = new UnitRepositoryImpl();

const ROLES = [
    { value: 'officer', label: 'Officer' },
    { value: 'verifier', label: 'Verifier' },
    { value: 'manager', label: 'Manager' },
    { value: 'juru-buku', label: 'Juru Buku' },
    { value: 'admin-unit', label: 'Admin Unit' },
    { value: 'admin-pusat', label: 'Admin Pusat' },
    { value: 'super-admin', label: 'Super Admin' },
];

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case 'super-admin': return 'bg-purple-100 text-purple-800';
        case 'admin-pusat': return 'bg-indigo-100 text-indigo-800';
        case 'admin-unit': return 'bg-blue-100 text-blue-800';
        case 'manager': return 'bg-green-100 text-green-800';
        case 'verifier': return 'bg-yellow-100 text-yellow-800';
        case 'juru-buku': return 'bg-orange-100 text-orange-800';
        case 'officer': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// Interface
interface ListViewProps {
    users: User[];
    units: Unit[];
    search: string;
    setSearch: (val: string) => void;
    roleFilter: string;
    setRoleFilter: (val: string) => void;
    openCreateModal: () => void;
    openEditModal: (user: User) => void;
    handleDelete: (id: number) => void;
    page: number;
    setPage: (p: number) => void;
    total: number;
    limit: number;
    totalPages: number;
    handleSearch: (e: React.FormEvent) => void;
}

// --- Mobile View ---
const MobileView = ({
    users, search, setSearch, roleFilter, setRoleFilter, openCreateModal, openEditModal, handleDelete
}: ListViewProps) => (
    <MobileLayoutWrapper>
        <div className="pt-6 px-4 pb-24">
            <div className="mb-5">
                <h1 className="text-xl font-bold text-slate-800 mb-4">Manajemen User</h1>
                <div className="flex gap-2 mb-3">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <input
                            type="text"
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            placeholder="Cari user..."
                            className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
                        />
                    </div>
                </div>
                {/* Role Filter - Horizontal Scroll */}
                <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                    <button
                        onClick={() => setRoleFilter('')}
                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${roleFilter === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                    >
                        Semua
                    </button>
                    {ROLES.map((role) => (
                        <button
                            key={role.value}
                            onClick={() => setRoleFilter(role.value)}
                            className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${roleFilter === role.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}
                        >
                            {role.label}
                        </button>
                    ))}
                </div>
            </div>

            <div className="space-y-3">
                {users.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                            <Users className="h-6 w-6 text-slate-300" />
                        </div>
                        <p className="text-slate-500 text-sm">Tidak ada user ditemukan</p>
                    </div>
                ) : (
                    users.map((item) => (
                        <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                                <div className="flex items-center gap-3">
                                    <div className="h-10 w-10 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold">
                                        {item.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-slate-800">{item.name}</h3>
                                        <p className="text-xs text-slate-500">@{item.username}</p>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={() => openEditModal(item)} className="p-2 bg-slate-50 text-slate-600 rounded-lg border border-slate-100"><Edit className="w-4 h-4" /></button>
                                    <button onClick={() => handleDelete(item.id)} className="p-2 bg-rose-50 text-rose-600 rounded-lg border border-rose-100"><Trash2 className="w-4 h-4" /></button>
                                </div>
                            </div>

                            <div className="flex flex-wrap gap-2 text-xs pt-3 border-t border-slate-50">
                                <div className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 ${getRoleBadgeColor(item.role)}`}>
                                    <Shield className="w-3 h-3" />
                                    {ROLES.find(r => r.value === item.role)?.label || item.role}
                                </div>
                                {item.unit && (
                                    <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium flex items-center gap-1">
                                        <Building2 className="w-3 h-3" />
                                        {item.unit}
                                    </div>
                                )}
                            </div>
                        </div>
                    ))
                )}
            </div>

            <button
                onClick={openCreateModal}
                className="fixed bottom-24 right-5 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-all"
            >
                <Plus className="w-6 h-6" />
            </button>
        </div>
    </MobileLayoutWrapper>
);

// --- Desktop View ---
const DesktopView = ({
    users, search, setSearch, roleFilter, setRoleFilter, openCreateModal, openEditModal, handleDelete,
    page, setPage, total, limit, totalPages, handleSearch
}: ListViewProps) => (
    <div className="px-4 sm:px-6 lg:px-8">
        <div className="sm:flex sm:items-center mb-6">
            <div className="sm:flex-auto">
                <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                <p className="mt-2 text-sm text-gray-700">Kelola pengguna sistem dan hak akses mereka</p>
            </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
            <div className="flex flex-col sm:flex-row gap-4 justify-between">
                <form onSubmit={handleSearch} className="flex-1 max-w-md">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                            type="text"
                            placeholder="Cari username atau nama..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="pl-9 w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        />
                    </div>
                </form>
                <div className="flex gap-2">
                    <select
                        value={roleFilter}
                        onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                        className="px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="">Semua Role</option>
                        {ROLES.map((role) => (
                            <option key={role.value} value={role.value}>{role.label}</option>
                        ))}
                    </select>
                    <button onClick={openCreateModal} className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500">
                        <Plus className="h-5 w-5" /> Tambah User
                    </button>
                </div>
            </div>
        </div>

        <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Username</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nama</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Unit</th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.length === 0 ? (
                            <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data user</td></tr>
                        ) : (
                            users.map((user) => (
                                <tr key={user.id} className="hover:bg-gray-50">
                                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{user.username}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{user.name}</td>
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                                            {ROLES.find(r => r.value === user.role)?.label || user.role}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-sm text-gray-500">{user.unit || '-'}</td>
                                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                        <button onClick={() => openEditModal(user)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="h-4 w-4 inline" /></button>
                                        <button onClick={() => handleDelete(user.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4 inline" /></button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {/* Pagination Desktop */}
            {totalPages > 1 && (
                <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
                    <div className="flex-1 flex justify-between sm:hidden">
                        <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page === 1} className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Previous</button>
                        <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50">Next</button>
                    </div>
                    <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                        <div>
                            <p className="text-sm text-gray-700">
                                Menampilkan <span className="font-medium">{(page - 1) * limit + 1}</span> sampai <span className="font-medium">{Math.min(page * limit, total)}</span> dari <span className="font-medium">{total}</span> hasil
                            </p>
                        </div>
                        <div>
                            <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                                    <button key={p} onClick={() => setPage(p)} className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${p === page ? 'z-10 bg-indigo-50 border-indigo-500 text-indigo-600' : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'}`}>{p}</button>
                                ))}
                            </nav>
                        </div>
                    </div>
                </div>
            )}
        </div>
    </div>
);

// --- Main Container ---
export const UserList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [users, setUsers] = useState<User[]>([]);
    const [units, setUnits] = useState<Unit[]>([]);
    const [search, setSearch] = useState('');
    const [roleFilter, setRoleFilter] = useState('');
    const [page, setPage] = useState(1);
    const [total, setTotal] = useState(0);
    const [limit] = useState(10);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({ username: '', password: '', name: '', role: '', unit: '' });

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
        fetchUsers();
        fetchUnits();
    }, [page, roleFilter, user]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) fetchUsers();
            else setPage(1);
        }, 500);
        return () => clearTimeout(timer);
    }, [search]);

    const fetchUsers = async () => {
        try {
            showLoading('Memuat data user...');
            const response = await userRepository.getAll(search, roleFilter, page, limit);
            setUsers(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: any) {
            hideLoading();
            showError(handleError(error, 'Gagal memuat data user'));
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await unitRepository.getAll('', 1, 100);
            setUnits(response.data.filter(unit => unit.is_active));
        } catch (error: any) { console.error('Failed to fetch units:', error); }
    };

    const handleSearch = (e: React.FormEvent) => { e.preventDefault(); setPage(1); fetchUsers(); };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus user ini?');
        if (!confirmed) return;
        try {
            showLoading('Menghapus user...');
            await userRepository.delete(id);
            hideLoading();
            await showSuccess('User berhasil dihapus');
            fetchUsers();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal menghapus user')); }
    };

    const openCreateModal = () => { setEditingUser(null); setFormData({ username: '', password: '', name: '', role: '', unit: '' }); setShowPassword(false); setIsModalOpen(true); };
    const openEditModal = async (user: User) => { setEditingUser(user); setFormData({ username: user.username, password: '', name: user.name, role: user.role, unit: user.unit }); setShowPassword(false); setIsModalOpen(true); };
    const closeModal = () => { setIsModalOpen(false); setEditingUser(null); setFormData({ username: '', password: '', name: '', role: '', unit: '' }); setShowPassword(false); };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username.trim()) { showError('Username harus diisi'); return; }
        if (!formData.name.trim()) { showError('Nama harus diisi'); return; }
        if (!formData.role) { showError('Role harus dipilih'); return; }
        if (!editingUser && !formData.password) { showError('Password harus diisi untuk user baru'); return; }

        try {
            showLoading(editingUser ? 'Mengupdate user...' : 'Menambahkan user...');
            if (editingUser) {
                const updateData: UpdateUserDTO = { username: formData.username, name: formData.name, role: formData.role, unit: formData.unit };
                if (formData.password) { updateData.password = formData.password; }
                await userRepository.update(editingUser.id, updateData);
                hideLoading(); await showSuccess('User berhasil diupdate');
            } else {
                await userRepository.create(formData as CreateUserDTO);
                hideLoading(); await showSuccess('User berhasil ditambahkan');
            }
            closeModal();
            fetchUsers();
        } catch (error: any) { hideLoading(); showError(handleError(error, 'Gagal menyimpan data user')); }
    };

    const totalPages = Math.ceil(total / limit);
    const viewProps = { users, units, search, setSearch, roleFilter, setRoleFilter, openCreateModal, openEditModal, handleDelete, page, setPage, total, limit, totalPages, handleSearch };

    return (
        <>
            <div className="md:hidden"><MobileView {...viewProps} /></div>
            <div className="hidden md:block"><DesktopView {...viewProps} /></div>

            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal}></div>
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-base font-bold text-gray-900">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Username <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Role <span className="text-red-500">*</span></label>
                                        <select required value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Pilih role...</option>
                                            {ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                        </select>
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Unit</label>
                                        <select value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Pilih unit...</option>
                                            {units.map((unit) => <option key={unit.id} value={unit.name}>{unit.code} - {unit.name}</option>)}
                                        </select>
                                    </div>
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password</label>
                                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
                                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-[2.2rem] text-gray-400 hover:text-gray-600">
                                            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                        </button>
                                        {editingUser && <p className="text-xs text-gray-500 mt-1">Kosongkan jika tidak ingin mengubah password</p>}
                                    </div>
                                </div>
                                <div className="mt-8 flex items-center justify-end gap-3">
                                    <button type="button" onClick={closeModal} className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 active:scale-95 transition-all">Batal</button>
                                    <button type="submit" className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"><Save className="h-4 w-4" /> Simpan</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};
