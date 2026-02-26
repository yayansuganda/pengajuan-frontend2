'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, X, Save, Eye, EyeOff, Users, Shield, Building2, MapPin } from 'lucide-react';
import { User, CreateUserDTO, UpdateUserDTO } from '../core/UserEntity';
import { UserRepositoryImpl } from '../data/UserRepositoryImpl';
import { UnitRepositoryImpl } from '@/modules/unit/data/UnitRepositoryImpl';
import { Unit } from '@/modules/unit/core/UnitEntity';
import { RekonsiliasiDashboardRepository } from '@/modules/rekonsiliasi/data/RekonsiliasiDashboardRepository';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';

const userRepository = new UserRepositoryImpl();
const unitRepository = new UnitRepositoryImpl();
const rekonsiliasiRepo = new RekonsiliasiDashboardRepository();

// Roles for Manunggal Makmur tab
const ROLES_MM = [
    { value: 'officer', label: 'Officer' },
    { value: 'verifier', label: 'Verifier' },
    { value: 'manager', label: 'Manager' },
    { value: 'juru-buku', label: 'Juru Buku' },
    { value: 'admin-unit', label: 'Admin Unit' },
    { value: 'admin-pusat', label: 'Admin Pusat' },
    { value: 'super-admin', label: 'Super Admin' },
];

// Roles for POS tab
const ROLES_POS = [
    { value: 'petugas-pos', label: 'Petugas Pos' },
    { value: 'admin-pos', label: 'Admin Pos' },
    { value: 'regional-pos', label: 'Regional Pos' },
    { value: 'kcu-pos', label: 'KCU Pos' },
    { value: 'kc-pos', label: 'KC Pos' },
];

const ALL_ROLES = [...ROLES_MM, ...ROLES_POS];

const POS_HIERARCHY_ROLES = ['regional-pos', 'kcu-pos', 'kc-pos'];
const POS_TAB_ROLES = ['petugas-pos', 'admin-pos', 'regional-pos', 'kcu-pos', 'kc-pos'];

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case 'super-admin': return 'bg-purple-100 text-purple-800';
        case 'admin-pusat': return 'bg-indigo-100 text-indigo-800';
        case 'admin-pos': return 'bg-teal-100 text-teal-800';
        case 'admin-unit': return 'bg-blue-100 text-blue-800';
        case 'manager': return 'bg-green-100 text-green-800';
        case 'verifier': return 'bg-yellow-100 text-yellow-800';
        case 'juru-buku': return 'bg-orange-100 text-orange-800';
        case 'petugas-pos': return 'bg-cyan-100 text-cyan-800';
        case 'regional-pos': return 'bg-rose-100 text-rose-800';
        case 'kcu-pos': return 'bg-amber-100 text-amber-800';
        case 'kc-pos': return 'bg-lime-100 text-lime-800';
        case 'officer': return 'bg-gray-100 text-gray-800';
        default: return 'bg-gray-100 text-gray-800';
    }
};

// POS kantor data types
interface PosKantorOption {
    kode: string;
    nama: string;
}

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
    const [activeTab, setActiveTab] = useState<'mm' | 'pos'>('mm');

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', role: '', unit: '', unit_id: '',
        regional_kode: '', kcu_kode: '', kc_kode: ''
    });

    // POS kantor options for cascading dropdown
    const [regionalOptions, setRegionalOptions] = useState<PosKantorOption[]>([]);
    const [kcuOptions, setKcuOptions] = useState<PosKantorOption[]>([]);
    const [kcOptions, setKcOptions] = useState<PosKantorOption[]>([]);

    // Filtered users based on active tab
    const filteredUsers = useMemo(() => {
        if (activeTab === 'pos') {
            return users.filter(u => POS_TAB_ROLES.includes(u.role));
        }
        return users.filter(u => !POS_TAB_ROLES.includes(u.role));
    }, [users, activeTab]);

    const currentRoles = activeTab === 'mm' ? ROLES_MM : ROLES_POS;

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
        fetchUsers();
        fetchUnits();
        fetchRegionalOptions();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [page, roleFilter, user]);

    // Debounce search
    useEffect(() => {
        const timer = setTimeout(() => {
            if (page === 1) fetchUsers();
            else setPage(1);
        }, 500);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    // Reset page when switching tabs
    useEffect(() => {
        setPage(1);
        setRoleFilter('');
        setSearch('');
    }, [activeTab]);

    const fetchUsers = async () => {
        try {
            showLoading('Memuat data user...');
            const response = await userRepository.getAll(search, roleFilter, page, limit);
            setUsers(response.data);
            setTotal(response.total);
            hideLoading();
        } catch (error: unknown) {
            hideLoading();
            showError(handleError(error, 'Gagal memuat data user'));
        }
    };

    const fetchUnits = async () => {
        try {
            const response = await unitRepository.getAll('', 1, 100);
            setUnits(response.data.filter(unit => unit.is_active));
        } catch (error: unknown) { console.error('Failed to fetch units:', error); }
    };

    // Fetch POS hierarchy options (kode+nama pairs from backend)
    const fetchRegionalOptions = async () => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions();
            if (options?.regional_options) {
                setRegionalOptions(options.regional_options);
            }
        } catch { /* silently fail */ }
    };

    const fetchKcuByRegional = async (regionalKode: string) => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions(regionalKode);
            if (options?.kcu_options) {
                setKcuOptions(options.kcu_options);
            }
        } catch { setKcuOptions([]); }
    };

    const fetchKcByKcu = async (regionalKode: string, kcuKode: string) => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions(regionalKode, kcuKode);
            if (options?.kc_options) {
                setKcOptions(options.kc_options);
            }
        } catch { setKcOptions([]); }
    };

    // Handle role change in form
    const handleRoleChange = (newRole: string) => {
        const isPosHierarchy = POS_HIERARCHY_ROLES.includes(newRole);
        setFormData(prev => ({
            ...prev,
            role: newRole,
            // Clear unit if POS hierarchy
            unit: isPosHierarchy ? '' : prev.unit,
            unit_id: isPosHierarchy ? '' : prev.unit_id,
            // Clear POS fields if not POS hierarchy
            regional_kode: isPosHierarchy ? prev.regional_kode : '',
            kcu_kode: isPosHierarchy ? '' : '',
            kc_kode: isPosHierarchy ? '' : '',
        }));
        if (isPosHierarchy) {
            setKcuOptions([]);
            setKcOptions([]);
        }
    };

    // Handle regional change in form
    const handleRegionalChange = (value: string) => {
        setFormData(prev => ({ ...prev, regional_kode: value, kcu_kode: '', kc_kode: '' }));
        setKcuOptions([]);
        setKcOptions([]);
        if (value) {
            fetchKcuByRegional(value);
        }
    };

    // Handle KCU change in form
    const handleKcuChange = (value: string) => {
        setFormData(prev => ({ ...prev, kcu_kode: value, kc_kode: '' }));
        setKcOptions([]);
        if (value && formData.regional_kode) {
            fetchKcByKcu(formData.regional_kode, value);
        }
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
        } catch (error: unknown) { hideLoading(); showError(handleError(error, 'Gagal menghapus user')); }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        // Set default role based on active tab
        const defaultRole = activeTab === 'pos' ? '' : '';
        setFormData({ username: '', password: '', name: '', role: defaultRole, unit: '', unit_id: '', regional_kode: '', kcu_kode: '', kc_kode: '' });
        setShowPassword(false);
        setKcuOptions([]);
        setKcOptions([]);
        setIsModalOpen(true);
    };

    const openEditModal = async (user: User) => {
        setEditingUser(user);
        setFormData({
            username: user.username, password: '', name: user.name, role: user.role,
            unit: user.unit, unit_id: user.unit_id || '',
            regional_kode: user.regional_kode || '', kcu_kode: user.kcu_kode || '', kc_kode: user.kc_kode || ''
        });
        setShowPassword(false);

        // Pre-load cascading options if POS hierarchy role
        if (POS_HIERARCHY_ROLES.includes(user.role)) {
            if (user.regional_kode) {
                await fetchKcuByRegional(user.regional_kode);
                if (user.kcu_kode) {
                    await fetchKcByKcu(user.regional_kode, user.kcu_kode);
                }
            }
        }
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setEditingUser(null);
        setFormData({ username: '', password: '', name: '', role: '', unit: '', unit_id: '', regional_kode: '', kcu_kode: '', kc_kode: '' });
        setShowPassword(false);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!formData.username.trim()) { showError('Username harus diisi'); return; }
        if (!formData.name.trim()) { showError('Nama harus diisi'); return; }
        if (!formData.role) { showError('Role harus dipilih'); return; }
        if (!editingUser && !formData.password) { showError('Password harus diisi untuk user baru'); return; }

        // Validate POS hierarchy
        if (formData.role === 'regional-pos' && !formData.regional_kode) {
            showError('Regional harus dipilih untuk role Regional Pos'); return;
        }
        if (formData.role === 'kcu-pos' && (!formData.regional_kode || !formData.kcu_kode)) {
            showError('Regional dan KCU harus dipilih untuk role KCU Pos'); return;
        }
        if (formData.role === 'kc-pos' && (!formData.regional_kode || !formData.kcu_kode || !formData.kc_kode)) {
            showError('Regional, KCU, dan KC harus dipilih untuk role KC Pos'); return;
        }

        try {
            showLoading(editingUser ? 'Mengupdate user...' : 'Menambahkan user...');
            if (editingUser) {
                const updateData: UpdateUserDTO = {
                    username: formData.username, name: formData.name, role: formData.role,
                    unit: formData.unit, unit_id: formData.unit_id,
                    regional_kode: formData.regional_kode, kcu_kode: formData.kcu_kode, kc_kode: formData.kc_kode
                };
                if (formData.password) { updateData.password = formData.password; }
                await userRepository.update(editingUser.id, updateData);
                hideLoading(); await showSuccess('User berhasil diupdate');
            } else {
                await userRepository.create(formData as CreateUserDTO);
                hideLoading(); await showSuccess('User berhasil ditambahkan');
            }
            closeModal();
            fetchUsers();
        } catch (error: unknown) { hideLoading(); showError(handleError(error, 'Gagal menyimpan data user')); }
    };

    const totalPages = Math.ceil(total / limit);
    const isPosHierarchyRole = POS_HIERARCHY_ROLES.includes(formData.role);
    const showUnitField = !isPosHierarchyRole;
    const showRegionalField = isPosHierarchyRole;
    const showKcuField = formData.role === 'kcu-pos' || formData.role === 'kc-pos';
    const showKcField = formData.role === 'kc-pos';

    return (
        <>
            {/* Mobile View */}
            <div className="md:hidden">
                <MobileLayoutWrapper>
                    <div className="pt-6 px-4 pb-24">
                        <div className="mb-5">
                            <h1 className="text-xl font-bold text-slate-800 mb-4">Manajemen User</h1>

                            {/* Tabs Mobile */}
                            <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                                <button
                                    onClick={() => setActiveTab('mm')}
                                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'mm' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}
                                >
                                    Manunggal Makmur
                                </button>
                                <button
                                    onClick={() => setActiveTab('pos')}
                                    className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'pos' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500'}`}
                                >
                                    User POS
                                </button>
                            </div>

                            <div className="flex gap-2 mb-3">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari user..."
                                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm" />
                                </div>
                            </div>
                            <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                                <button onClick={() => setRoleFilter('')}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${roleFilter === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                    Semua
                                </button>
                                {currentRoles.map((role) => (
                                    <button key={role.value} onClick={() => setRoleFilter(role.value)}
                                        className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${roleFilter === role.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'}`}>
                                        {role.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="space-y-3">
                            {filteredUsers.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-slate-50 mb-3">
                                        <Users className="h-6 w-6 text-slate-300" />
                                    </div>
                                    <p className="text-slate-500 text-sm">Tidak ada user ditemukan</p>
                                </div>
                            ) : (
                                filteredUsers.map((item) => (
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
                                                {ALL_ROLES.find(r => r.value === item.role)?.label || item.role}
                                            </div>
                                            {item.unit && (
                                                <div className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />{item.unit}
                                                </div>
                                            )}
                                            {item.regional_kode && (
                                                <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium flex items-center gap-1">
                                                    <MapPin className="w-3 h-3" />{item.regional_nama || item.regional_kode}
                                                </div>
                                            )}
                                            {item.kcu_kode && (
                                                <div className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />{item.kcu_nama || item.kcu_kode}
                                                </div>
                                            )}
                                            {item.kc_kode && (
                                                <div className="px-2 py-1 bg-green-50 text-green-600 rounded-md font-medium flex items-center gap-1">
                                                    <Building2 className="w-3 h-3" />{item.kc_nama || item.kc_kode}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        <button onClick={openCreateModal}
                            className="fixed bottom-24 right-5 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </MobileLayoutWrapper>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="px-4 sm:px-6 lg:px-8">
                    <div className="sm:flex sm:items-center mb-6">
                        <div className="sm:flex-auto">
                            <h1 className="text-2xl font-semibold text-gray-900">User Management</h1>
                            <p className="mt-2 text-sm text-gray-700">Kelola pengguna sistem dan hak akses mereka</p>
                        </div>
                    </div>

                    {/* Tabs Desktop */}
                    <div className="flex bg-slate-100 rounded-xl p-1 mb-6 max-w-md">
                        <button
                            onClick={() => setActiveTab('mm')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'mm' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            👥 User Manunggal Makmur
                        </button>
                        <button
                            onClick={() => setActiveTab('pos')}
                            className={`flex-1 py-2.5 px-4 rounded-lg text-sm font-bold transition-all ${activeTab === 'pos' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                        >
                            📮 User POS
                        </button>
                    </div>

                    <div className="bg-white shadow-sm ring-1 ring-gray-900/5 rounded-xl p-6 mb-6">
                        <div className="flex flex-col sm:flex-row gap-4 justify-between">
                            <form onSubmit={handleSearch} className="flex-1 max-w-md">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input type="text" placeholder="Cari username atau nama..." value={search} onChange={(e) => setSearch(e.target.value)}
                                        className="pl-9 w-full px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent" />
                                </div>
                            </form>
                            <div className="flex gap-2">
                                <select value={roleFilter} onChange={(e) => { setRoleFilter(e.target.value); setPage(1); }}
                                    className="px-3 py-1.5 text-sm text-gray-900 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                    <option value="">Semua Role</option>
                                    {currentRoles.map((role) => (
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
                                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                            {activeTab === 'pos' ? 'Kantor POS' : 'Unit'}
                                        </th>
                                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody className="bg-white divide-y divide-gray-200">
                                    {filteredUsers.length === 0 ? (
                                        <tr><td colSpan={5} className="px-6 py-12 text-center text-gray-500">Tidak ada data user</td></tr>
                                    ) : (
                                        filteredUsers.map((u) => (
                                            <tr key={u.id} className="hover:bg-gray-50">
                                                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{u.username}</td>
                                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{u.name}</td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`inline-flex items-center rounded-full px-2 py-1 text-xs font-medium ${getRoleBadgeColor(u.role)}`}>
                                                        {ALL_ROLES.find(r => r.value === u.role)?.label || u.role}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-sm text-gray-500">
                                                    {POS_HIERARCHY_ROLES.includes(u.role) ? (
                                                        <div className="flex flex-col gap-0.5">
                                                            {u.regional_kode && <span className="text-indigo-600 font-medium text-xs">📍 {u.regional_nama || u.regional_kode}</span>}
                                                            {u.kcu_kode && <span className="text-blue-600 font-medium text-xs">🏢 {u.kcu_nama || u.kcu_kode}</span>}
                                                            {u.kc_kode && <span className="text-green-600 font-medium text-xs">🏠 {u.kc_nama || u.kc_kode}</span>}
                                                        </div>
                                                    ) : (
                                                        u.unit || '-'
                                                    )}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                    <button onClick={() => openEditModal(u)} className="text-indigo-600 hover:text-indigo-900 mr-4"><Edit className="h-4 w-4 inline" /></button>
                                                    <button onClick={() => handleDelete(u.id)} className="text-red-600 hover:text-red-900"><Trash2 className="h-4 w-4 inline" /></button>
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
            </div>

            {/* Modal Create/Edit */}
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
                                    {/* Nama */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    {/* Username */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Username <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    {/* Role */}
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Role <span className="text-red-500">*</span></label>
                                        <select required value={formData.role} onChange={(e) => handleRoleChange(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Pilih role...</option>
                                            {ALL_ROLES.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                        </select>
                                    </div>

                                    {/* Unit Field - hidden for POS hierarchy roles */}
                                    {showUnitField && (
                                        <div>
                                            <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Unit</label>
                                            <select value={formData.unit_id} onChange={(e) => {
                                                const selectedUnit = units.find(u => u.id.toString() === e.target.value);
                                                setFormData({ ...formData, unit_id: e.target.value, unit: selectedUnit ? selectedUnit.name : '' });
                                            }} className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                                <option value="">Pilih unit...</option>
                                                {units.map((unit) => <option key={unit.id} value={unit.id}>{unit.code} - {unit.name}</option>)}
                                            </select>
                                        </div>
                                    )}

                                    {/* POS Hierarchy Fields */}
                                    {showRegionalField && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                                            <p className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" /> Penempatan Kantor POS
                                            </p>

                                            {/* Regional Dropdown */}
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Regional <span className="text-red-500">*</span></label>
                                                <select value={formData.regional_kode} onChange={(e) => handleRegionalChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="">Pilih Regional...</option>
                                                    {regionalOptions.map((r) => <option key={r.kode} value={r.kode}>{r.kode} - {r.nama}</option>)}
                                                </select>
                                            </div>

                                            {/* KCU Dropdown - cascading */}
                                            {showKcuField && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">KCU <span className="text-red-500">*</span></label>
                                                    <select value={formData.kcu_kode} onChange={(e) => handleKcuChange(e.target.value)}
                                                        disabled={!formData.regional_kode}
                                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${!formData.regional_kode ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                                                        <option value="">{!formData.regional_kode ? '← Pilih Regional dulu' : 'Pilih KCU...'}</option>
                                                        {kcuOptions.map((k) => <option key={k.kode} value={k.kode}>{k.kode} - {k.nama}</option>)}
                                                    </select>
                                                </div>
                                            )}

                                            {/* KC Dropdown - cascading */}
                                            {showKcField && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">KC <span className="text-red-500">*</span></label>
                                                    <select value={formData.kc_kode} onChange={(e) => setFormData({ ...formData, kc_kode: e.target.value })}
                                                        disabled={!formData.kcu_kode}
                                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${!formData.kcu_kode ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                                                        <option value="">{!formData.kcu_kode ? '← Pilih KCU dulu' : 'Pilih KC...'}</option>
                                                        {kcOptions.map((k) => <option key={k.kode} value={k.kode}>{k.kode} - {k.nama}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password {!editingUser && <span className="text-red-500">*</span>}</label>
                                        <input type={showPassword ? "text" : "password"} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 pr-10" />
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
