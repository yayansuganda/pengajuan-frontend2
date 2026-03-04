'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search, Edit, Trash2, X, Save, Eye, EyeOff, Users, Shield, Building2, MapPin, ChevronRight, ChevronDown, UserCheck, Network } from 'lucide-react';
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

const ROLES_MM = [
    { value: 'officer', label: 'Officer' },
    { value: 'verifier', label: 'Verifier' },
    { value: 'manager', label: 'Manager' },
    { value: 'juru-buku', label: 'Juru Buku' },
    { value: 'admin-unit', label: 'Admin Unit' },
    { value: 'admin-pusat', label: 'Admin Pusat' },
    { value: 'super-admin', label: 'Super Admin' },
];

const ROLES_POS = [
    { value: 'petugas-pos', label: 'Petugas Pos' },
    { value: 'admin-pos', label: 'Admin Pos' },
    { value: 'regional-pos', label: 'Regional Pos' },
    { value: 'kcu-pos', label: 'KCU Pos' },
    { value: 'kc-pos', label: 'KC Pos' },
];

const ALL_ROLES = [...ROLES_MM, ...ROLES_POS];
const POS_HIERARCHY_ROLES = ['regional-pos', 'kcu-pos', 'kc-pos'];
const MM_ROLE_VALUES = ROLES_MM.map(r => r.value).join(',');
const POS_ROLE_VALUES = ROLES_POS.map(r => r.value).join(',');

const getRoleBadgeColor = (role: string) => {
    switch (role) {
        case 'super-admin': return 'bg-purple-100 text-purple-800 border-purple-200';
        case 'admin-pusat': return 'bg-indigo-100 text-indigo-800 border-indigo-200';
        case 'admin-pos': return 'bg-teal-100 text-teal-800 border-teal-200';
        case 'admin-unit': return 'bg-blue-100 text-blue-800 border-blue-200';
        case 'manager': return 'bg-green-100 text-green-800 border-green-200';
        case 'verifier': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
        case 'juru-buku': return 'bg-orange-100 text-orange-800 border-orange-200';
        case 'petugas-pos': return 'bg-cyan-100 text-cyan-800 border-cyan-200';
        case 'regional-pos': return 'bg-rose-100 text-rose-800 border-rose-200';
        case 'kcu-pos': return 'bg-amber-100 text-amber-800 border-amber-200';
        case 'kc-pos': return 'bg-lime-100 text-lime-800 border-lime-200';
        case 'officer': return 'bg-gray-100 text-gray-800 border-gray-200';
        default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
};

const getRoleLabel = (role: string) => ALL_ROLES.find(r => r.value === role)?.label || role;

interface PosKantorOption { kode: string; nama: string; }

interface TreeNode {
    key: string;
    label: string;
    kode: string;
    level: 'regional' | 'kcu' | 'kc';
    users: User[];
    children: TreeNode[];
}

function buildPosTree(users: User[]): { tree: TreeNode[]; ungrouped: User[] } {
    const regionalsMap = new Map<string, TreeNode>();
    const ungrouped: User[] = [];

    for (const u of users) {
        if (!u.regional_kode && !u.kcu_kode && !u.kc_kode) {
            ungrouped.push(u);
            continue;
        }

        const rKey = u.regional_kode || '_no_regional';
        const rLabel = u.regional_nama || u.regional_kode || 'Tanpa Regional';
        if (!regionalsMap.has(rKey)) {
            regionalsMap.set(rKey, { key: rKey, label: rLabel, kode: rKey, level: 'regional', users: [], children: [] });
        }
        const rNode = regionalsMap.get(rKey)!;

        if (!u.kcu_kode) {
            rNode.users.push(u);
            continue;
        }

        const kKey = u.kcu_kode;
        const kLabel = u.kcu_nama || u.kcu_kode;
        let kcuNode = rNode.children.find(c => c.kode === kKey);
        if (!kcuNode) {
            kcuNode = { key: `${rKey}-${kKey}`, label: kLabel, kode: kKey, level: 'kcu', users: [], children: [] };
            rNode.children.push(kcuNode);
        }

        if (!u.kc_kode) {
            kcuNode.users.push(u);
            continue;
        }

        const kcKey = u.kc_kode;
        const kcLabel = u.kc_nama || u.kc_kode;
        let kcNode = kcuNode.children.find(c => c.kode === kcKey);
        if (!kcNode) {
            kcNode = { key: `${rKey}-${kKey}-${kcKey}`, label: kcLabel, kode: kcKey, level: 'kc', users: [], children: [] };
            kcuNode.children.push(kcNode);
        }
        kcNode.users.push(u);
    }

    const tree = Array.from(regionalsMap.values()).sort((a, b) => a.label.localeCompare(b.label));
    for (const r of tree) {
        r.children.sort((a, b) => a.label.localeCompare(b.label));
        for (const k of r.children) {
            k.children.sort((a, b) => a.label.localeCompare(b.label));
        }
    }

    return { tree, ungrouped };
}

function countTreeUsers(node: TreeNode): number {
    let count = node.users.length;
    for (const child of node.children) count += countTreeUsers(child);
    return count;
}

// --- Pagination Component ---
const Pagination: React.FC<{
    page: number;
    totalPages: number;
    total: number;
    limit: number;
    onPageChange: (p: number) => void;
}> = ({ page, totalPages, total, limit, onPageChange }) => {
    if (totalPages <= 1) return null;

    const maxVisible = 5;
    let startPage = Math.max(1, page - Math.floor(maxVisible / 2));
    const endPage = Math.min(totalPages, startPage + maxVisible - 1);
    if (endPage - startPage + 1 < maxVisible) {
        startPage = Math.max(1, endPage - maxVisible + 1);
    }
    const pages = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);

    return (
        <div className="flex items-center justify-between px-5 py-3.5 border-t border-slate-100 bg-slate-50/50">
            <p className="text-xs text-slate-500">
                <span className="font-semibold text-slate-700">{(page - 1) * limit + 1}</span>
                {' - '}
                <span className="font-semibold text-slate-700">{Math.min(page * limit, total)}</span>
                {' dari '}
                <span className="font-semibold text-slate-700">{total}</span>
            </p>
            <div className="flex items-center gap-1">
                <button
                    onClick={() => onPageChange(page - 1)}
                    disabled={page === 1}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Prev
                </button>
                {startPage > 1 && (
                    <>
                        <button onClick={() => onPageChange(1)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors">1</button>
                        {startPage > 2 && <span className="px-1 text-slate-400">...</span>}
                    </>
                )}
                {pages.map((p) => (
                    <button
                        key={p}
                        onClick={() => onPageChange(p)}
                        className={`px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors ${
                            p === page
                                ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                                : 'border-slate-200 text-slate-600 hover:bg-white'
                        }`}
                    >
                        {p}
                    </button>
                ))}
                {endPage < totalPages && (
                    <>
                        {endPage < totalPages - 1 && <span className="px-1 text-slate-400">...</span>}
                        <button onClick={() => onPageChange(totalPages)} className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white transition-colors">{totalPages}</button>
                    </>
                )}
                <button
                    onClick={() => onPageChange(page + 1)}
                    disabled={page === totalPages}
                    className="px-2.5 py-1.5 text-xs font-medium rounded-lg border border-slate-200 text-slate-600 hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                    Next
                </button>
            </div>
        </div>
    );
};

// --- Tree Node Component ---
const TreeBranch: React.FC<{
    node: TreeNode;
    depth: number;
    expandedKeys: Set<string>;
    toggleExpand: (key: string) => void;
    onEdit: (u: User) => void;
    onDelete: (id: number) => void;
}> = ({ node, depth, expandedKeys, toggleExpand, onEdit, onDelete }) => {
    const isExpanded = expandedKeys.has(node.key);
    const userCount = countTreeUsers(node);

    const levelStyles = {
        regional: { bg: 'bg-indigo-50', border: 'border-indigo-200', text: 'text-indigo-800', icon: '📍', badgeBg: 'bg-indigo-600' },
        kcu: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: '🏢', badgeBg: 'bg-blue-600' },
        kc: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: '🏠', badgeBg: 'bg-emerald-600' },
    };
    const style = levelStyles[node.level];

    return (
        <div className={depth > 0 ? 'ml-6 border-l-2 border-slate-100' : ''}>
            <button
                onClick={() => toggleExpand(node.key)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 ${style.bg} ${style.border} border rounded-lg mb-1.5 hover:shadow-sm transition-all group`}
            >
                <span className="text-slate-400 group-hover:text-slate-600 transition-colors">
                    {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                </span>
                <span className="text-base">{style.icon}</span>
                <span className={`text-sm font-bold ${style.text}`}>{node.label}</span>
                <span className="text-[10px] text-slate-500 font-mono">({node.kode})</span>
                <span className={`ml-auto text-[10px] font-bold text-white ${style.badgeBg} rounded-full px-2 py-0.5`}>
                    {userCount} user{userCount !== 1 ? 's' : ''}
                </span>
            </button>

            {isExpanded && (
                <div className={depth > 0 ? 'pl-3' : 'pl-1'}>
                    {node.users.length > 0 && (
                        <div className="mb-2 space-y-1 pl-6">
                            {node.users.map((u) => (
                                <div key={u.id} className="flex items-center gap-3 px-3 py-2 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors group/row">
                                    <div className="h-7 w-7 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-[11px] font-bold text-slate-600 shrink-0">
                                        {u.name.charAt(0).toUpperCase()}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <span className="text-sm font-semibold text-slate-800">{u.name}</span>
                                        <span className="text-xs text-slate-400 ml-2">@{u.username}</span>
                                    </div>
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(u.role)}`}>
                                        {getRoleLabel(u.role)}
                                    </span>
                                    <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                        <button onClick={(e) => { e.stopPropagation(); onEdit(u); }} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                        <button onClick={(e) => { e.stopPropagation(); onDelete(u.id); }} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                    {node.children.map((child) => (
                        <TreeBranch
                            key={child.key}
                            node={child}
                            depth={depth + 1}
                            expandedKeys={expandedKeys}
                            toggleExpand={toggleExpand}
                            onEdit={onEdit}
                            onDelete={onDelete}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

// --- Main Component ---
export const UserList: React.FC = () => {
    const router = useRouter();
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'mm' | 'pos'>('mm');

    // Independent state per tab
    const [mmUsers, setMmUsers] = useState<User[]>([]);
    const [mmSearch, setMmSearch] = useState('');
    const [mmRoleFilter, setMmRoleFilter] = useState('');
    const [mmPage, setMmPage] = useState(1);
    const [mmTotal, setMmTotal] = useState(0);
    const [mmLimit] = useState(10);
    const [mmLoading, setMmLoading] = useState(false);

    const [posUsers, setPosUsers] = useState<User[]>([]);
    const [posSearch, setPosSearch] = useState('');
    const [posRoleFilter, setPosRoleFilter] = useState('');
    const [posPage, setPosPage] = useState(1);
    const [posTotal, setPosTotal] = useState(0);
    const [posLimit] = useState(15);
    const [posLoading, setPosLoading] = useState(false);

    // POS tree expanded state
    const [expandedKeys, setExpandedKeys] = useState<Set<string>>(new Set());

    const [units, setUnits] = useState<Unit[]>([]);

    // Modal states
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [showPassword, setShowPassword] = useState(false);
    const [formData, setFormData] = useState({
        username: '', password: '', name: '', role: '', unit: '', unit_id: '',
        regional_kode: '', kcu_kode: '', kc_kode: ''
    });

    const [regionalOptions, setRegionalOptions] = useState<PosKantorOption[]>([]);
    const [kcuOptions, setKcuOptions] = useState<PosKantorOption[]>([]);
    const [kcOptions, setKcOptions] = useState<PosKantorOption[]>([]);

    // --- Data fetching ---
    const fetchMmUsers = useCallback(async () => {
        try {
            setMmLoading(true);
            const roleParam = mmRoleFilter || MM_ROLE_VALUES;
            const response = await userRepository.getAll(mmSearch, roleParam, mmPage, mmLimit);
            setMmUsers(response.data);
            setMmTotal(response.total);
        } catch (error: unknown) {
            showError(handleError(error, 'Gagal memuat data user'));
        } finally {
            setMmLoading(false);
        }
    }, [mmSearch, mmRoleFilter, mmPage, mmLimit]);

    const fetchPosUsers = useCallback(async () => {
        try {
            setPosLoading(true);
            const roleParam = posRoleFilter || POS_ROLE_VALUES;
            const response = await userRepository.getAll(posSearch, roleParam, posPage, posLimit);
            setPosUsers(response.data);
            setPosTotal(response.total);
        } catch (error: unknown) {
            showError(handleError(error, 'Gagal memuat data user POS'));
        } finally {
            setPosLoading(false);
        }
    }, [posSearch, posRoleFilter, posPage, posLimit]);

    useEffect(() => {
        if (user && user.role !== 'super-admin') { router.push('/dashboard'); return; }
        fetchUnits();
        fetchRegionalOptions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [user]);

    useEffect(() => { fetchMmUsers(); }, [fetchMmUsers]);
    useEffect(() => { fetchPosUsers(); }, [fetchPosUsers]);

    // Debounce MM search
    useEffect(() => {
        const timer = setTimeout(() => { setMmPage(1); }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mmSearch]);

    // Debounce POS search
    useEffect(() => {
        const timer = setTimeout(() => { setPosPage(1); }, 400);
        return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [posSearch]);

    const fetchUnits = async () => {
        try {
            const response = await unitRepository.getAll('', 1, 100);
            setUnits(response.data.filter(unit => unit.is_active));
        } catch { /* silently fail */ }
    };

    const fetchRegionalOptions = async () => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions();
            if (options?.regional_options) setRegionalOptions(options.regional_options);
        } catch { /* silently fail */ }
    };

    const fetchKcuByRegional = async (regionalKode: string) => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions(regionalKode);
            if (options?.kcu_options) setKcuOptions(options.kcu_options);
        } catch { setKcuOptions([]); }
    };

    const fetchKcByKcu = async (regionalKode: string, kcuKode: string) => {
        try {
            const options = await rekonsiliasiRepo.getFilterOptions(regionalKode, kcuKode);
            if (options?.kc_options) setKcOptions(options.kc_options);
        } catch { setKcOptions([]); }
    };

    // POS Tree
    const posTree = useMemo(() => buildPosTree(posUsers), [posUsers]);

    const toggleExpand = (key: string) => {
        setExpandedKeys(prev => {
            const next = new Set(prev);
            if (next.has(key)) next.delete(key);
            else next.add(key);
            return next;
        });
    };

    const expandAll = () => {
        const allKeys = new Set<string>();
        const collect = (nodes: TreeNode[]) => {
            for (const n of nodes) {
                allKeys.add(n.key);
                collect(n.children);
            }
        };
        collect(posTree.tree);
        setExpandedKeys(allKeys);
    };

    const collapseAll = () => setExpandedKeys(new Set());

    // --- Form handlers ---
    const handleRoleChange = (newRole: string) => {
        const isPosHierarchy = POS_HIERARCHY_ROLES.includes(newRole);
        setFormData(prev => ({
            ...prev, role: newRole,
            unit: isPosHierarchy ? '' : prev.unit,
            unit_id: isPosHierarchy ? '' : prev.unit_id,
            regional_kode: isPosHierarchy ? prev.regional_kode : '',
            kcu_kode: isPosHierarchy ? '' : '',
            kc_kode: isPosHierarchy ? '' : '',
        }));
        if (isPosHierarchy) { setKcuOptions([]); setKcOptions([]); }
    };

    const handleRegionalChange = (value: string) => {
        setFormData(prev => ({ ...prev, regional_kode: value, kcu_kode: '', kc_kode: '' }));
        setKcuOptions([]); setKcOptions([]);
        if (value) fetchKcuByRegional(value);
    };

    const handleKcuChange = (value: string) => {
        setFormData(prev => ({ ...prev, kcu_kode: value, kc_kode: '' }));
        setKcOptions([]);
        if (value && formData.regional_kode) fetchKcByKcu(formData.regional_kode, value);
    };

    const handleDelete = async (id: number) => {
        const confirmed = await showConfirm('Apakah Anda yakin ingin menghapus user ini?');
        if (!confirmed) return;
        try {
            showLoading('Menghapus user...');
            await userRepository.delete(id);
            hideLoading();
            await showSuccess('User berhasil dihapus');
            if (activeTab === 'mm') fetchMmUsers();
            else fetchPosUsers();
        } catch (error: unknown) { hideLoading(); showError(handleError(error, 'Gagal menghapus user')); }
    };

    const openCreateModal = () => {
        setEditingUser(null);
        setFormData({ username: '', password: '', name: '', role: '', unit: '', unit_id: '', regional_kode: '', kcu_kode: '', kc_kode: '' });
        setShowPassword(false);
        setKcuOptions([]); setKcOptions([]);
        setIsModalOpen(true);
    };

    const openEditModal = async (u: User) => {
        setEditingUser(u);
        setFormData({
            username: u.username, password: '', name: u.name, role: u.role,
            unit: u.unit, unit_id: u.unit_id || '',
            regional_kode: u.regional_kode || '', kcu_kode: u.kcu_kode || '', kc_kode: u.kc_kode || ''
        });
        setShowPassword(false);
        if (POS_HIERARCHY_ROLES.includes(u.role)) {
            if (u.regional_kode) {
                await fetchKcuByRegional(u.regional_kode);
                if (u.kcu_kode) await fetchKcByKcu(u.regional_kode, u.kcu_kode);
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
        if (formData.role === 'regional-pos' && !formData.regional_kode) { showError('Regional harus dipilih untuk role Regional Pos'); return; }
        if (formData.role === 'kcu-pos' && (!formData.regional_kode || !formData.kcu_kode)) { showError('Regional dan KCU harus dipilih untuk role KCU Pos'); return; }
        if (formData.role === 'kc-pos' && (!formData.regional_kode || !formData.kcu_kode || !formData.kc_kode)) { showError('Regional, KCU, dan KC harus dipilih untuk role KC Pos'); return; }

        try {
            showLoading(editingUser ? 'Mengupdate user...' : 'Menambahkan user...');
            if (editingUser) {
                const updateData: UpdateUserDTO = {
                    username: formData.username, name: formData.name, role: formData.role,
                    unit: formData.unit, unit_id: formData.unit_id,
                    regional_kode: formData.regional_kode, kcu_kode: formData.kcu_kode, kc_kode: formData.kc_kode
                };
                if (formData.password) updateData.password = formData.password;
                await userRepository.update(editingUser.id, updateData);
                hideLoading(); await showSuccess('User berhasil diupdate');
            } else {
                await userRepository.create(formData as CreateUserDTO);
                hideLoading(); await showSuccess('User berhasil ditambahkan');
            }
            closeModal();
            fetchMmUsers();
            fetchPosUsers();
        } catch (error: unknown) { hideLoading(); showError(handleError(error, 'Gagal menyimpan data user')); }
    };

    const mmTotalPages = Math.ceil(mmTotal / mmLimit);
    const posTotalPages = Math.ceil(posTotal / posLimit);

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
                        <h1 className="text-xl font-bold text-slate-800 mb-4">Manajemen User</h1>

                        <div className="flex bg-slate-100 rounded-xl p-1 mb-4">
                            <button onClick={() => setActiveTab('mm')}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'mm' ? 'bg-white text-indigo-700 shadow-sm' : 'text-slate-500'}`}>
                                Manunggal Makmur
                            </button>
                            <button onClick={() => setActiveTab('pos')}
                                className={`flex-1 py-2.5 px-3 rounded-lg text-xs font-bold transition-all ${activeTab === 'pos' ? 'bg-white text-orange-700 shadow-sm' : 'text-slate-500'}`}>
                                User POS
                            </button>
                        </div>

                        <div className="relative mb-3">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <input
                                type="text"
                                value={activeTab === 'mm' ? mmSearch : posSearch}
                                onChange={(e) => activeTab === 'mm' ? setMmSearch(e.target.value) : setPosSearch(e.target.value)}
                                placeholder="Cari user..."
                                className="w-full pl-10 pr-4 py-3 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-indigo-500 shadow-sm"
                            />
                        </div>

                        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-hide">
                            <button onClick={() => activeTab === 'mm' ? setMmRoleFilter('') : setPosRoleFilter('')}
                                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                    (activeTab === 'mm' ? mmRoleFilter : posRoleFilter) === '' ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                                }`}>
                                Semua
                            </button>
                            {(activeTab === 'mm' ? ROLES_MM : ROLES_POS).map((role) => (
                                <button key={role.value}
                                    onClick={() => {
                                        if (activeTab === 'mm') { setMmRoleFilter(role.value); setMmPage(1); }
                                        else { setPosRoleFilter(role.value); setPosPage(1); }
                                    }}
                                    className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-semibold border transition-colors ${
                                        (activeTab === 'mm' ? mmRoleFilter : posRoleFilter) === role.value ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-white text-slate-600 border-slate-200'
                                    }`}>
                                    {role.label}
                                </button>
                            ))}
                        </div>

                        {/* Mobile Cards */}
                        <div className="space-y-3">
                            {(activeTab === 'mm' ? mmUsers : posUsers).length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
                                    <Users className="h-6 w-6 text-slate-300 mx-auto mb-3" />
                                    <p className="text-slate-500 text-sm">Tidak ada user ditemukan</p>
                                </div>
                            ) : (
                                (activeTab === 'mm' ? mmUsers : posUsers).map((item) => (
                                    <div key={item.id} className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm">
                                        <div className="flex items-start justify-between gap-3 mb-3">
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
                                            <span className={`px-2 py-1 rounded-md font-semibold flex items-center gap-1 ${getRoleBadgeColor(item.role)}`}>
                                                <Shield className="w-3 h-3" />{getRoleLabel(item.role)}
                                            </span>
                                            {item.unit && <span className="px-2 py-1 bg-slate-100 text-slate-600 rounded-md font-medium flex items-center gap-1"><Building2 className="w-3 h-3" />{item.unit}</span>}
                                            {item.regional_nama && <span className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-md font-medium flex items-center gap-1"><MapPin className="w-3 h-3" />{item.regional_nama}</span>}
                                            {item.kcu_nama && <span className="px-2 py-1 bg-blue-50 text-blue-600 rounded-md font-medium flex items-center gap-1"><Building2 className="w-3 h-3" />{item.kcu_nama}</span>}
                                            {item.kc_nama && <span className="px-2 py-1 bg-green-50 text-green-600 rounded-md font-medium flex items-center gap-1"><Building2 className="w-3 h-3" />{item.kc_nama}</span>}
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>

                        {/* Mobile Pagination */}
                        {activeTab === 'mm' ? (
                            mmTotalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <button onClick={() => setMmPage(Math.max(1, mmPage - 1))} disabled={mmPage === 1} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40">Prev</button>
                                    <span className="px-4 py-2 text-sm text-slate-600">{mmPage} / {mmTotalPages}</span>
                                    <button onClick={() => setMmPage(Math.min(mmTotalPages, mmPage + 1))} disabled={mmPage === mmTotalPages} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40">Next</button>
                                </div>
                            )
                        ) : (
                            posTotalPages > 1 && (
                                <div className="flex justify-center gap-2 mt-4">
                                    <button onClick={() => setPosPage(Math.max(1, posPage - 1))} disabled={posPage === 1} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40">Prev</button>
                                    <span className="px-4 py-2 text-sm text-slate-600">{posPage} / {posTotalPages}</span>
                                    <button onClick={() => setPosPage(Math.min(posTotalPages, posPage + 1))} disabled={posPage === posTotalPages} className="px-4 py-2 rounded-lg border text-sm font-medium disabled:opacity-40">Next</button>
                                </div>
                            )
                        )}

                        <button onClick={openCreateModal}
                            className="fixed bottom-24 right-5 h-12 w-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full shadow-lg shadow-emerald-600/30 flex items-center justify-center text-white z-40 hover:scale-105 active:scale-95 transition-all">
                            <Plus className="w-6 h-6" />
                        </button>
                    </div>
                </MobileLayoutWrapper>
            </div>

            {/* Desktop View */}
            <div className="hidden md:block">
                <div className="max-w-7xl mx-auto px-6 lg:px-8 py-6">
                    {/* Header */}
                    <div className="flex items-center justify-between mb-6">
                        <div>
                            <h1 className="text-2xl font-bold text-slate-900 flex items-center gap-2.5">
                                <div className="h-9 w-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                                    <Users className="h-5 w-5 text-white" />
                                </div>
                                User Management
                            </h1>
                            <p className="mt-1 text-sm text-slate-500">Kelola pengguna sistem dan hak akses mereka</p>
                        </div>
                        <button onClick={openCreateModal}
                            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-700 px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-200 hover:from-indigo-700 hover:to-indigo-800 active:scale-[0.98] transition-all">
                            <Plus className="h-4 w-4" /> Tambah User
                        </button>
                    </div>

                    {/* Tabs */}
                    <div className="flex gap-2 mb-6">
                        <button onClick={() => setActiveTab('mm')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                activeTab === 'mm'
                                    ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                            }`}>
                            <UserCheck className="h-4 w-4" />
                            User Manunggal Makmur
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'mm' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{mmTotal}</span>
                        </button>
                        <button onClick={() => setActiveTab('pos')}
                            className={`flex items-center gap-2 px-5 py-3 rounded-xl text-sm font-bold transition-all border-2 ${
                                activeTab === 'pos'
                                    ? 'bg-orange-50 text-orange-700 border-orange-200 shadow-sm'
                                    : 'bg-white text-slate-500 border-slate-200 hover:border-slate-300 hover:text-slate-700'
                            }`}>
                            <Network className="h-4 w-4" />
                            User POS
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${activeTab === 'pos' ? 'bg-orange-600 text-white' : 'bg-slate-100 text-slate-500'}`}>{posTotal}</span>
                        </button>
                    </div>

                    {/* ============ MM TAB ============ */}
                    {activeTab === 'mm' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari username atau nama..."
                                        value={mmSearch}
                                        onChange={(e) => setMmSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
                                    />
                                </div>
                                <select
                                    value={mmRoleFilter}
                                    onChange={(e) => { setMmRoleFilter(e.target.value); setMmPage(1); }}
                                    className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white"
                                >
                                    <option value="">Semua Role</option>
                                    {ROLES_MM.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>

                            {/* Table */}
                            <div className="overflow-x-auto">
                                <table className="w-full">
                                    <thead>
                                        <tr className="border-b border-slate-100">
                                            <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">User</th>
                                            <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Role</th>
                                            <th className="text-left text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3">Unit</th>
                                            <th className="text-right text-[11px] font-bold text-slate-500 uppercase tracking-wider px-5 py-3 w-28">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {mmLoading ? (
                                            <tr><td colSpan={4} className="px-5 py-16 text-center">
                                                <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                                                    <div className="h-4 w-4 border-2 border-indigo-300 border-t-transparent rounded-full animate-spin" />
                                                    Memuat data...
                                                </div>
                                            </td></tr>
                                        ) : mmUsers.length === 0 ? (
                                            <tr><td colSpan={4} className="px-5 py-16 text-center">
                                                <Users className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                                <p className="text-sm text-slate-400">Tidak ada user ditemukan</p>
                                            </td></tr>
                                        ) : (
                                            mmUsers.map((u, idx) => (
                                                <tr key={u.id} className={`border-b border-slate-50 hover:bg-indigo-50/30 transition-colors group ${idx % 2 === 0 ? 'bg-white' : 'bg-slate-25'}`}>
                                                    <td className="px-5 py-3.5">
                                                        <div className="flex items-center gap-3">
                                                            <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center text-sm font-bold text-indigo-600 shrink-0">
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div>
                                                                <p className="text-sm font-semibold text-slate-800">{u.name}</p>
                                                                <p className="text-xs text-slate-400">@{u.username}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <span className={`inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full border ${getRoleBadgeColor(u.role)}`}>
                                                            <Shield className="w-3 h-3" />{getRoleLabel(u.role)}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        {u.unit ? (
                                                            <span className="inline-flex items-center gap-1.5 text-xs text-slate-600 bg-slate-50 px-2.5 py-1 rounded-md border border-slate-100">
                                                                <Building2 className="w-3 h-3 text-slate-400" />{u.unit}
                                                            </span>
                                                        ) : (
                                                            <span className="text-xs text-slate-300">-</span>
                                                        )}
                                                    </td>
                                                    <td className="px-5 py-3.5 text-right">
                                                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                            <button onClick={() => openEditModal(u)} className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors" title="Edit">
                                                                <Edit className="h-4 w-4" />
                                                            </button>
                                                            <button onClick={() => handleDelete(u.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors" title="Hapus">
                                                                <Trash2 className="h-4 w-4" />
                                                            </button>
                                                        </div>
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>

                            <Pagination page={mmPage} totalPages={mmTotalPages} total={mmTotal} limit={mmLimit} onPageChange={setMmPage} />
                        </div>
                    )}

                    {/* ============ POS TAB ============ */}
                    {activeTab === 'pos' && (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                            {/* Toolbar */}
                            <div className="flex items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
                                <div className="relative flex-1 max-w-sm">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                    <input
                                        type="text"
                                        placeholder="Cari user POS..."
                                        value={posSearch}
                                        onChange={(e) => setPosSearch(e.target.value)}
                                        className="w-full pl-9 pr-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent bg-white"
                                    />
                                </div>
                                <div className="flex items-center gap-2">
                                    <select
                                        value={posRoleFilter}
                                        onChange={(e) => { setPosRoleFilter(e.target.value); setPosPage(1); }}
                                        className="px-3 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 bg-white"
                                    >
                                        <option value="">Semua Role</option>
                                        {ROLES_POS.map((r) => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                    <div className="h-6 w-px bg-slate-200" />
                                    <button onClick={expandAll} className="px-3 py-2 text-xs font-semibold text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors">
                                        Expand All
                                    </button>
                                    <button onClick={collapseAll} className="px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-50 rounded-lg transition-colors">
                                        Collapse All
                                    </button>
                                </div>
                            </div>

                            {/* Tree View */}
                            <div className="p-4">
                                {posLoading ? (
                                    <div className="flex items-center justify-center py-16">
                                        <div className="inline-flex items-center gap-2 text-sm text-slate-400">
                                            <div className="h-4 w-4 border-2 border-orange-300 border-t-transparent rounded-full animate-spin" />
                                            Memuat data...
                                        </div>
                                    </div>
                                ) : posUsers.length === 0 ? (
                                    <div className="text-center py-16">
                                        <Network className="h-8 w-8 text-slate-200 mx-auto mb-2" />
                                        <p className="text-sm text-slate-400">Tidak ada user POS ditemukan</p>
                                    </div>
                                ) : (
                                    <div className="space-y-2">
                                        {/* Tree nodes (regional -> kcu -> kc) */}
                                        {posTree.tree.map((regional) => (
                                            <TreeBranch
                                                key={regional.key}
                                                node={regional}
                                                depth={0}
                                                expandedKeys={expandedKeys}
                                                toggleExpand={toggleExpand}
                                                onEdit={openEditModal}
                                                onDelete={handleDelete}
                                            />
                                        ))}

                                        {/* Ungrouped users (petugas-pos, admin-pos without hierarchy) */}
                                        {posTree.ungrouped.length > 0 && (
                                            <div className="mt-4">
                                                <div className="flex items-center gap-2 mb-2 px-1">
                                                    <div className="h-px flex-1 bg-slate-200" />
                                                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">User Tanpa Hierarki</span>
                                                    <div className="h-px flex-1 bg-slate-200" />
                                                </div>
                                                <div className="space-y-1 pl-1">
                                                    {posTree.ungrouped.map((u) => (
                                                        <div key={u.id} className="flex items-center gap-3 px-4 py-2.5 bg-white border border-slate-100 rounded-lg hover:border-slate-200 transition-colors group/row">
                                                            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-orange-100 to-amber-100 flex items-center justify-center text-xs font-bold text-orange-600 shrink-0">
                                                                {u.name.charAt(0).toUpperCase()}
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <span className="text-sm font-semibold text-slate-800">{u.name}</span>
                                                                <span className="text-xs text-slate-400 ml-2">@{u.username}</span>
                                                            </div>
                                                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${getRoleBadgeColor(u.role)}`}>
                                                                {getRoleLabel(u.role)}
                                                            </span>
                                                            <div className="flex gap-1 opacity-0 group-hover/row:opacity-100 transition-opacity">
                                                                <button onClick={() => openEditModal(u)} className="p-1.5 text-indigo-500 hover:bg-indigo-50 rounded-md transition-colors"><Edit className="w-3.5 h-3.5" /></button>
                                                                <button onClick={() => handleDelete(u.id)} className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-md transition-colors"><Trash2 className="w-3.5 h-3.5" /></button>
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>

                            <Pagination page={posPage} totalPages={posTotalPages} total={posTotal} limit={posLimit} onPageChange={setPosPage} />
                        </div>
                    )}
                </div>
            </div>

            {/* Modal Create/Edit */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 overflow-y-auto">
                    <div className="flex min-h-screen items-center justify-center p-4">
                        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" onClick={closeModal} />
                        <div className="relative bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 bg-gray-50">
                                <h3 className="text-base font-bold text-gray-900">{editingUser ? 'Edit User' : 'Tambah User'}</h3>
                                <button onClick={closeModal} className="text-gray-400 hover:text-gray-500 bg-white rounded-full p-1 hover:bg-gray-100 transition-colors"><X className="h-5 w-5" /></button>
                            </div>
                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Nama Lengkap <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Username <span className="text-red-500">*</span></label>
                                        <input type="text" required value={formData.username} onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Role <span className="text-red-500">*</span></label>
                                        <select required value={formData.role} onChange={(e) => handleRoleChange(e.target.value)}
                                            className="w-full px-4 py-2.5 text-sm text-gray-900 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500">
                                            <option value="">Pilih role...</option>
                                            <optgroup label="Manunggal Makmur">
                                                {ROLES_MM.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                            </optgroup>
                                            <optgroup label="POS">
                                                {ROLES_POS.map((role) => <option key={role.value} value={role.value}>{role.label}</option>)}
                                            </optgroup>
                                        </select>
                                    </div>

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

                                    {showRegionalField && (
                                        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 space-y-3">
                                            <p className="text-xs font-bold text-orange-700 uppercase tracking-wide flex items-center gap-1.5">
                                                <MapPin className="h-3.5 w-3.5" /> Penempatan Kantor POS
                                            </p>
                                            <div>
                                                <label className="block text-xs font-semibold text-gray-700 mb-1">Regional <span className="text-red-500">*</span></label>
                                                <select value={formData.regional_kode} onChange={(e) => handleRegionalChange(e.target.value)}
                                                    className="w-full px-3 py-2 text-sm text-gray-900 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500">
                                                    <option value="">Pilih Regional...</option>
                                                    {regionalOptions.map((r) => <option key={r.kode} value={r.kode}>{r.kode} - {r.nama}</option>)}
                                                </select>
                                            </div>
                                            {showKcuField && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">KCU <span className="text-red-500">*</span></label>
                                                    <select value={formData.kcu_kode} onChange={(e) => handleKcuChange(e.target.value)}
                                                        disabled={!formData.regional_kode}
                                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${!formData.regional_kode ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                                                        <option value="">{!formData.regional_kode ? 'Pilih Regional dulu' : 'Pilih KCU...'}</option>
                                                        {kcuOptions.map((k) => <option key={k.kode} value={k.kode}>{k.kode} - {k.nama}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                            {showKcField && (
                                                <div>
                                                    <label className="block text-xs font-semibold text-gray-700 mb-1">KC <span className="text-red-500">*</span></label>
                                                    <select value={formData.kc_kode} onChange={(e) => setFormData({ ...formData, kc_kode: e.target.value })}
                                                        disabled={!formData.kcu_kode}
                                                        className={`w-full px-3 py-2 text-sm border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 ${!formData.kcu_kode ? 'bg-gray-100 text-gray-400 cursor-not-allowed border-gray-200' : 'text-gray-900 border-gray-300'}`}>
                                                        <option value="">{!formData.kcu_kode ? 'Pilih KCU dulu' : 'Pilih KC...'}</option>
                                                        {kcOptions.map((k) => <option key={k.kode} value={k.kode}>{k.kode} - {k.nama}</option>)}
                                                    </select>
                                                </div>
                                            )}
                                        </div>
                                    )}

                                    <div className="relative">
                                        <label className="block text-xs font-bold text-gray-700 mb-1.5 uppercase tracking-wide">Password {!editingUser && <span className="text-red-500">*</span>}</label>
                                        <input type={showPassword ? 'text' : 'password'} value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })}
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
