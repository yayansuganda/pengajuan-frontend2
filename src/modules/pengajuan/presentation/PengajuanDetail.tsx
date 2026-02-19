'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
    ArrowLeft, User, UserCheck, MapPin, Briefcase, Calendar, FileText, MessageCircle, Phone,
    CreditCard, Upload, XCircle, CheckCircle, Clock,
    Wallet, Landmark, FolderOpen, Banknote, Camera, Receipt, Eye, ExternalLink,
    Home, Plus, LayoutGrid, Calculator
} from 'lucide-react';
import { Pengajuan } from '../core/PengajuanEntity';
import { PengajuanRepositoryImpl } from '../data/PengajuanRepositoryImpl';
import { MobileLayoutWrapper } from './components/MobileLayoutWrapper';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import axios from 'axios';
import { showLoading, hideLoading, showSuccess, showError, showConfirm } from '@/shared/utils/sweetAlert';
import Swal from 'sweetalert2';
import { handleError } from '@/shared/utils/errorHandler';

const pengajuanRepository = new PengajuanRepositoryImpl();

// Subcomponents
const SummaryCard: React.FC<{ icon: React.ReactNode; label: string; value: string; accent?: boolean }> = ({ icon, label, value, accent }) => (
    <div className={`rounded-xl p-4 ${accent ? 'bg-gradient-to-br from-indigo-600 to-violet-600 text-white' : 'bg-white border border-slate-200'}`}>
        <div className={`inline-flex p-2 rounded-lg mb-2 ${accent ? 'bg-white/20 text-white' : 'bg-slate-100 text-indigo-600'}`}>
            {icon}
        </div>
        <p className={`text-xs mb-0.5 ${accent ? 'text-indigo-100' : 'text-slate-500'}`}>{label}</p>
        <p className={`text-lg font-bold ${accent ? 'text-white' : 'text-slate-900'}`}>{value}</p>
    </div>
);

const TabBtn: React.FC<{ active: boolean; onClick: () => void; icon: React.ReactNode; label: string }> = ({ active, onClick, icon, label }) => (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3.5 text-sm font-medium transition-all ${active ? 'text-indigo-600 bg-indigo-50/50 border-b-2 border-indigo-600' : 'text-slate-500 hover:text-slate-700 hover:bg-slate-50'}`}>
        {icon}
        {label}
    </button>
);

const Section: React.FC<{ title: string; icon: React.ReactNode; children: React.ReactNode }> = ({ title, icon, children }) => (
    <div>
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-slate-100">
            {icon}
            <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-4">
            {children}
        </div>
    </div>
);

const Field: React.FC<{ label: string; value: React.ReactNode; wide?: boolean; highlight?: boolean }> = ({ label, value, wide, highlight }) => (
    <div className={wide ? 'col-span-2 sm:col-span-3 lg:col-span-4' : 'col-span-1'}>
        <dt className="text-xs text-slate-500 mb-0.5">{label}</dt>
        <dd className={`text-sm ${highlight ? 'font-semibold text-indigo-600' : 'text-slate-900'}`}>{value}</dd>
    </div>
);

const DocCard: React.FC<{ title: string; desc: string; url?: string; action?: React.ReactNode }> = ({ title, desc, url, action }) => (
    <div className="bg-slate-50 rounded-xl border border-slate-200 overflow-hidden">
        <div className="aspect-[4/3] bg-white relative">
            {url ? (
                <a href={url} target="_blank" className="block w-full h-full group">
                    <img src={url} alt={title} className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                        <span className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1.5 px-3 py-1.5 bg-white/90 rounded-full text-xs font-medium text-slate-900">
                            <ExternalLink className="h-3 w-3" /> Lihat
                        </span>
                    </div>
                </a>
            ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100">
                    <FileText className="h-8 w-8 mb-1.5 opacity-40" />
                    <span className="text-xs">Belum ada</span>
                </div>
            )}
        </div>
        <div className="p-3">
            <div className="flex items-start justify-between gap-2">
                <div>
                    <h4 className="text-sm font-semibold text-slate-900">{title}</h4>
                    <p className="text-xs text-slate-500">{desc}</p>
                </div>
                {action}
            </div>
        </div>
    </div>
);

interface PengajuanDetailProps {
    id: string;
}

export const PengajuanDetail: React.FC<PengajuanDetailProps> = ({ id }) => {
    const router = useRouter();
    const { user } = useAuth();
    const [pengajuan, setPengajuan] = useState<Pengajuan | null>(null);
    const [borrowerPhotos, setBorrowerPhotos] = useState<string[]>([]);
    const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
    const [activeTab, setActiveTab] = useState<'detail' | 'dokumen'>('detail');
    const [activeDocTab, setActiveDocTab] = useState<'pengajuan' | 'persetujuan'>('pengajuan');
    const [proofForm, setProofForm] = useState({ notes: '', file: null as File | null });
    const [uploadTarget, setUploadTarget] = useState<'disbursement' | 'shipping' | null>(null);

    // State for approval documents upload (Officer)
    const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
    const [approvalDocs, setApprovalDocs] = useState({
        pengajuan_permohonan_url: '',
        dokumen_akad_url: '',
        flagging_url: '',
        surat_pernyataan_beda_url: '',
        disbursement_proof_url: '',
        shipping_receipt_url: ''
    });

    const [previewDoc, setPreviewDoc] = useState<{ url: string; type: 'image' | 'pdf' } | null>(null);

    useEffect(() => {
        fetchData();
    }, [id]);

    const fetchData = async () => {
        try {
            showLoading('Memuat data...');
            const data = await pengajuanRepository.getPengajuanDetail(id);
            setPengajuan(data);

            // Initialize approval docs state
            setApprovalDocs({
                pengajuan_permohonan_url: data.pengajuan_permohonan_url || '',
                dokumen_akad_url: data.dokumen_akad_url || '',
                flagging_url: data.flagging_url || '',
                surat_pernyataan_beda_url: data.surat_pernyataan_beda_url || '',
                disbursement_proof_url: data.disbursement_proof_url || '',
                shipping_receipt_url: data.shipping_receipt_url || ''
            });

            if (data.borrower_photos) {
                try {
                    const photos = JSON.parse(data.borrower_photos);
                    if (Array.isArray(photos)) setBorrowerPhotos(photos);
                } catch { setBorrowerPhotos([]); }
            }
            hideLoading();
        } catch (err: any) {
            hideLoading();
            showError(handleError(err, 'Gagal memuat data'));
        }
    };

    const handleUploadProof = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!pengajuan || !uploadTarget) return;
        try {
            showLoading('Mengupload...');
            let fileUrl = '';
            if (uploadTarget === 'disbursement') fileUrl = pengajuan.disbursement_proof_url || '';
            if (uploadTarget === 'shipping') fileUrl = pengajuan.shipping_receipt_url || '';

            if (proofForm.file) {
                const formData = new FormData();
                formData.append('file', proofForm.file);
                const token = localStorage.getItem('token');
                const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                    headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
                });
                fileUrl = res.data.url;
            }

            const updateData: any = {};
            if (uploadTarget === 'disbursement') updateData.disbursement_proof_url = fileUrl;
            if (uploadTarget === 'shipping') updateData.shipping_receipt_url = fileUrl;

            // Also update notes if needed, but notes field on Loan is general. Maybe append? or ignore for now.
            // Requirement didn't specify notes for these proofs explicitly, but good to have.
            // I'll skip notes update for now to keep it simple, or add a specific note field later.

            await pengajuanRepository.updatePengajuan(pengajuan.id, updateData);
            await fetchData();
            hideLoading();
            setIsUploadModalOpen(false);
            setProofForm({ notes: '', file: null });
            setUploadTarget(null);
            showSuccess('Berhasil diupload!');
        } catch (err: any) {
            hideLoading();
            showError(handleError(err, 'Gagal upload'));
        }
    };

    const openPreview = (url: string, isPdf: boolean = false) => {
        const type = isPdf || url.toLowerCase().includes('.pdf') ? 'pdf' : 'image';
        setPreviewDoc({ url, type });
    };

    const handleApprovalDocUpload = async (docType: 'pengajuan_permohonan_url' | 'dokumen_akad_url' | 'flagging_url' | 'surat_pernyataan_beda_url' | 'disbursement_proof_url' | 'shipping_receipt_url', file: File) => {
        if (!pengajuan) return;
        try {
            setUploadingDoc(docType);
            showLoading('Mengupload dokumen...');

            const formData = new FormData();
            formData.append('file', file);
            const token = localStorage.getItem('token');
            const res = await axios.post(`${process.env.NEXT_PUBLIC_API_URL}/upload`, formData, {
                headers: { 'Content-Type': 'multipart/form-data', 'Authorization': `Bearer ${token}` }
            });

            const fileUrl = res.data.url;
            const updateData: any = {};
            updateData[docType] = fileUrl;

            // Use PATCH endpoint for partial document update
            await axios.patch(`${process.env.NEXT_PUBLIC_API_URL}/loans/${id}/documents`, updateData, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            setApprovalDocs(prev => ({ ...prev, [docType]: fileUrl }));
            await fetchData();

            hideLoading();
            showSuccess('Dokumen berhasil diupload!');
        } catch (err: any) {
            hideLoading();
            showError(handleError(err, 'Gagal upload dokumen'));
        } finally {
            setUploadingDoc(null);
        }
    };

    const isAllApprovalDocsUploaded = () => {
        return approvalDocs.pengajuan_permohonan_url && approvalDocs.dokumen_akad_url && approvalDocs.flagging_url && approvalDocs.surat_pernyataan_beda_url;
    };

    const d = (val: any) => (val === undefined || val === null || val === '') ? '-' : String(val);
    const money = (val: number | undefined) => val ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(val) : '-';

    const handleUpdateStatus = async (newStatus: string, confirmationText: string) => {
        // Handle Rejection with Reason
        if (newStatus === 'Ditolak') {
            const { value: text } = await Swal.fire({
                title: 'Konfirmasi Penolakan',
                input: 'textarea',
                inputLabel: 'Alasan Penolakan',
                inputPlaceholder: 'Tuliskan alasan penolakan...',
                inputAttributes: { 'aria-label': 'Tuliskan alasan penolakan' },
                showCancelButton: true,
                confirmButtonColor: '#e11d48',
                confirmButtonText: 'Tolak Pengajuan',
                cancelButtonText: 'Batal',
                inputValidator: (value) => {
                    if (!value) {
                        return 'Alasan penolakan wajib diisi!'
                    }
                }
            });

            if (text) {
                try {
                    showLoading('Memproses...');
                    await pengajuanRepository.updateStatus(id, newStatus, text);
                    await fetchData();
                    hideLoading();
                    showSuccess('Pengajuan berhasil ditolak');
                } catch (err: any) {
                    hideLoading();
                    showError(handleError(err, 'Gagal menolak pengajuan'));
                }
            }
            return;
        }

        // Standard Status Update
        const confirmed = await showConfirm(confirmationText, 'Ya, Lanjutkan', 'Batal', 'Konfirmasi');
        if (confirmed) {
            try {
                showLoading('Memproses...');
                await pengajuanRepository.updateStatus(id, newStatus);
                await fetchData();
                hideLoading();
                showSuccess('Status berhasil diperbarui!');
            } catch (err: any) {
                hideLoading();
                showError(handleError(err, 'Gagal memperbarui status'));
            }
        }
    };

    const handleContact = (phone: string, name: string) => {
        Swal.fire({
            title: 'Hubungi Petugas',
            text: `Pilih metode untuk menghubungi ${name}`,
            icon: 'question',
            showCancelButton: true,
            showDenyButton: true,
            confirmButtonText: 'WhatsApp',
            denyButtonText: 'Telepon Seluler',
            cancelButtonText: 'Batal',
            confirmButtonColor: '#25D366',
            denyButtonColor: '#3b82f6',
            reverseButtons: true
        }).then((result) => {
            if (result.isConfirmed) {
                const cleanPhone = phone.replace(/^0/, '62').replace(/\D/g, '');
                window.open(`https://wa.me/${cleanPhone}`, '_blank');
            } else if (result.isDenied) {
                window.open(`tel:${phone}`, '_self');
            }
        });
    };

    if (!pengajuan) return null;

    const statusConfig: Record<string, { color: string; bg: string; icon: React.ReactNode }> = {
        'Disetujui': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
        'Ditolak': { color: 'text-rose-700', bg: 'bg-rose-50 border-rose-200', icon: <XCircle className="h-4 w-4 text-rose-500" /> },
        'Approved': { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', icon: <CheckCircle className="h-4 w-4 text-emerald-500" /> },
        'Menunggu Approval Manager': { color: 'text-blue-700', bg: 'bg-blue-50 border-blue-200', icon: <Clock className="h-4 w-4 text-blue-500" /> },
        'Menunggu Verifikasi Admin Unit': { color: 'text-purple-700', bg: 'bg-purple-50 border-purple-200', icon: <Clock className="h-4 w-4 text-purple-500" /> },
        'Menunggu Pencairan': { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', icon: <Clock className="h-4 w-4 text-orange-500" /> },
        'Dicairkan': { color: 'text-teal-700', bg: 'bg-teal-50 border-teal-200', icon: <Wallet className="h-4 w-4 text-teal-500" /> },
        'Selesai': { color: 'text-indigo-700', bg: 'bg-indigo-50 border-indigo-200', icon: <CheckCircle className="h-4 w-4 text-indigo-500" /> },
        'Pending': { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', icon: <Clock className="h-4 w-4 text-amber-500" /> },
    };
    const status = statusConfig[pengajuan.status] || { color: 'text-slate-700', bg: 'bg-slate-50 border-slate-200', icon: <Clock className="h-4 w-4 text-slate-500" /> };

    // Documents uploaded during initial application
    const baseDocs = [
        { title: 'KTP Pemohon', desc: 'Kartu Tanda Penduduk', url: pengajuan.ktp_url },
        { title: 'KARIP / Buku ASABRI', desc: 'Kartu Pensiun', url: pengajuan.karip_buku_asabri_url },
        { title: 'Slip Gaji Terakhir', desc: 'Bukti Pendapatan', url: pengajuan.slip_gaji_url },
        { title: 'SK Pensiun', desc: 'Surat Keputusan Pensiun', url: pengajuan.sk_pensiun_url },
    ];

    // Handle Borrower Photos (Multiple)
    const photoDocs: typeof baseDocs = [];
    if (pengajuan.borrower_photos) {
        try {
            const photos = JSON.parse(pengajuan.borrower_photos);
            if (Array.isArray(photos)) {
                photos.forEach((url: string, idx: number) => {
                    photoDocs.push({
                        title: `Foto Pemohon ${idx + 1}`,
                        desc: 'Dokumentasi',
                        url: url
                    });
                });
            } else if (typeof pengajuan.borrower_photos === 'string' && (pengajuan.borrower_photos as string).startsWith('http')) {
                photoDocs.push({ title: 'Foto Pemohon', desc: 'Dokumentasi', url: pengajuan.borrower_photos });
            }
        } catch (e) {
            // Fallback
            if (typeof pengajuan.borrower_photos === 'string' && (pengajuan.borrower_photos as string).length > 5) {
                photoDocs.push({ title: 'Foto Pemohon', desc: 'Dokumentasi', url: pengajuan.borrower_photos });
            }
        }
    }

    const dokumenPengajuan = [...baseDocs, ...photoDocs];

    // Documents uploaded after approval
    const dokumenPersetujuan = [
        { title: 'Pengajuan Permohonan', desc: 'Formulir Permohonan', url: pengajuan.pengajuan_permohonan_url, key: 'pengajuan_permohonan_url' },
        { title: 'Dokumen Akad', desc: 'Surat Perjanjian', url: pengajuan.dokumen_akad_url, key: 'dokumen_akad_url' },
        { title: 'Flagging', desc: 'Dokumen Flagging', url: pengajuan.flagging_url, key: 'flagging_url' },
        { title: 'Surat Pernyataan Beda Penerima', desc: 'Pernyataan Ahli Waris', url: pengajuan.surat_pernyataan_beda_url, key: 'surat_pernyataan_beda_url' },
        { title: 'Bukti Transfer', desc: 'Bukti Pencairan Dana', url: pengajuan.disbursement_proof_url, key: 'disbursement_proof_url', uploadInfo: { type: 'disbursement', label: 'Bukti Transfer' } },
        { title: 'Resi Pengiriman Berkas', desc: 'Bukti Pengiriman Fisik', url: pengajuan.shipping_receipt_url, key: 'shipping_receipt_url', uploadInfo: { type: 'shipping', label: 'Resi Pengiriman' } },
    ];

    // Check if user is Petugas Pos or Admin Pos to use fronting navigation
    const isPetugasPos = user?.role === 'petugas-pos' || user?.role === 'admin-pos';

    return (
        <MobileLayoutWrapper showBackground={true} moduleName={isPetugasPos ? 'fronting' : 'default'}>
            {/* Mobile Layout */}
            <div className="md:hidden">
                {/* Content */}
                <div className="relative z-10 pt-10 px-4">
                    {/* Header Info */}
                    <div className="mb-5 px-2">
                        <div className="flex items-center justify-between mb-3">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-xs font-medium ${status.bg} ${status.color}`}>
                                {status.icon}
                                <span>{pengajuan.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-700 text-xs font-medium rounded-full border border-emerald-200 transition-all">
                                    <ArrowLeft className="h-3.5 w-3.5" />
                                </button>
                                {pengajuan.status === 'Pending' && (user?.role === 'officer' || user?.role === 'super-admin') && (
                                    <Link href={`/pengajuan/${pengajuan.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-indigo-100 text-indigo-700 text-xs font-medium rounded-full border border-indigo-200 transition-all">
                                        Edit
                                    </Link>
                                )}
                            </div>
                        </div>
                        <h1 className="text-emerald-900 text-xl font-bold mb-1">{pengajuan.nama_lengkap}</h1>
                        <p className="text-emerald-700 text-xs">{pengajuan.nik}</p>
                    </div>

                    {/* Rejection Reason Alert - Mobile */}
                    {pengajuan.status === 'Ditolak' && pengajuan.reject_reason && (
                        <div className="mb-5 px-2 animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="bg-gradient-to-r from-rose-50 to-rose-100 border-2 border-rose-400 rounded-xl p-5 shadow-lg">
                                <div className="flex items-start gap-3">
                                    <div className="flex-shrink-0 mt-0.5">
                                        <div className="w-8 h-8 bg-rose-500 rounded-full flex items-center justify-center">
                                            <XCircle className="w-5 h-5 text-white" />
                                        </div>
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="text-base font-bold text-rose-900 mb-2 flex items-center gap-2">
                                            ⚠️ Alasan Penolakan
                                        </h3>
                                        <div className="bg-white/60 rounded-lg p-3 border border-rose-200">
                                            <p className="text-sm text-rose-900 leading-relaxed font-medium">{pengajuan.reject_reason}</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 p-5">
                        {/* Financial Summary - Compact */}
                        <div className="grid grid-cols-2 gap-2 mb-5">
                            <div className="bg-indigo-50 rounded-xl p-3">
                                <p className="text-[9px] text-indigo-600 font-semibold uppercase mb-0.5">Jumlah Pengajuan</p>
                                <p className="text-sm font-bold text-indigo-700">{money(pengajuan.jumlah_pembiayaan)}</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[9px] text-slate-600 font-semibold uppercase mb-0.5">Jangka Waktu</p>
                                <p className="text-sm font-bold text-slate-700">{d(pengajuan.jangka_waktu)} Bln</p>
                            </div>
                            <div className="bg-slate-50 rounded-xl p-3">
                                <p className="text-[9px] text-slate-600 font-semibold uppercase mb-0.5">Angsuran</p>
                                <p className="text-sm font-bold text-slate-700">{money(pengajuan.besar_angsuran)}</p>
                            </div>
                            <div className="bg-emerald-50 rounded-xl p-3">
                                <p className="text-[9px] text-emerald-600 font-semibold uppercase mb-0.5">Diterima</p>
                                <p className="text-sm font-bold text-emerald-700">{money(pengajuan.nominal_terima)}</p>
                            </div>
                        </div>

                        {/* Tab Navigation - Compact */}
                        <div className="flex gap-2 p-1 bg-slate-100 rounded-xl mb-4">
                            <button onClick={() => setActiveTab('detail')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'detail' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>
                                Detail
                            </button>
                            <button onClick={() => setActiveTab('dokumen')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeTab === 'dokumen' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>
                                Dokumen
                            </button>
                        </div>

                        {/* Tab Content */}
                        {activeTab === 'detail' && (
                            <div className="space-y-4 text-sm">
                                {/* Personal Info */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <User className="h-3.5 w-3.5 text-indigo-600" /> Informasi Pribadi
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Nama Lengkap</span>
                                            <span className="font-medium text-slate-900">{pengajuan.nama_lengkap}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">NIK</span>
                                            <span className="font-medium text-slate-900">{pengajuan.nik}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jenis Kelamin</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.jenis_kelamin)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Tempat, Tanggal Lahir</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.tempat_lahir)}, {pengajuan.tanggal_lahir ? new Date(pengajuan.tanggal_lahir).toLocaleDateString('id-ID') : '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Usia</span>
                                            <span className="font-medium text-slate-900">{pengajuan.usia ? `${Math.floor(pengajuan.usia / 12)} Tahun${pengajuan.usia % 12 ? ` ${pengajuan.usia % 12} Bulan` : ''}` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">No. Telepon</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.nomor_telephone)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Nama Ibu Kandung</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.nama_ibu_kandung)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Pendidikan Terakhir</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.pendidikan_terakhir)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Address */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <MapPin className="h-3.5 w-3.5 text-emerald-600" /> Alamat
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500 block mb-0.5">Alamat Lengkap</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.alamat)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">RT / RW</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.rt)} / {d(pengajuan.rw)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kelurahan</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kelurahan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kecamatan</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kecamatan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kabupaten / Kota</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kabupaten)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Provinsi</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.provinsi)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kode Pos</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kode_pos)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Pension Data */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <Briefcase className="h-3.5 w-3.5 text-blue-600" /> Data Pensiun
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Nopen</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.nopen)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jenis Pensiun</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.jenis_pensiun)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kantor Bayar</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kantor_bayar)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Nama Bank</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.nama_bank)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">No. Rekening</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.no_rekening)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">No. Giro Pos</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.nomor_rekening_giro_pos)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Financial Data */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <Wallet className="h-3.5 w-3.5 text-teal-600" /> Data Keuangan
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jenis Dapem</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.jenis_dapem)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Bulan Dapem</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.bulan_dapem)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Status Dapem</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.status_dapem)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Gaji Bersih</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.gaji_bersih)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Gaji Tersedia</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.gaji_tersedia)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Loan Detail */}
                                <div>
                                    <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                        <FileText className="h-3.5 w-3.5 text-violet-600" /> Detail Pengajuan
                                    </h3>
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jenis Pelayanan</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.jenis_pelayanan?.name)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jenis Pembiayaan</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.jenis_pembiayaan?.name)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Kategori Pembiayaan</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kategori_pembiayaan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Maks. Jangka Waktu</span>
                                            <span className="font-medium text-slate-900">{pengajuan.maksimal_jangka_waktu_usia ? `${pengajuan.maksimal_jangka_waktu_usia} Tahun` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jangka Waktu</span>
                                            <span className="font-medium text-slate-900">{pengajuan.jangka_waktu ? `${pengajuan.jangka_waktu} Bulan` : '-'}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Maksimal Plafond</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.maksimal_pembiayaan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Jumlah Diajukan</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.jumlah_pembiayaan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Besar Angsuran</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.besar_angsuran)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Total Potongan</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.total_potongan)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Nominal Diterima</span>
                                            <span className="font-medium text-slate-900">{money(pengajuan.nominal_terima)}</span>
                                        </div>
                                        <div className="flex justify-between py-1.5 border-b border-slate-50">
                                            <span className="text-slate-500">Petugas Kantor Pos</span>
                                            <span className="font-medium text-slate-900">{d(pengajuan.kantor_pos_petugas)}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Data Petugas POS - Mobile */}
                                {pengajuan.petugas_nippos && (
                                    <div>
                                        <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                            <UserCheck className="h-3.5 w-3.5 text-indigo-600" /> Data Petugas POS
                                        </h3>
                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">NIPPOS</span>
                                                <span className="font-medium text-slate-900">{d(pengajuan.petugas_nippos)}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">Nama Petugas</span>
                                                <span className="font-medium text-slate-900">{d(pengajuan.petugas_name)}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">No. Handphone</span>
                                                <span className="font-medium text-slate-900">
                                                    {pengajuan.petugas_phone ? (
                                                        <button
                                                            onClick={() => handleContact(pengajuan.petugas_phone!, d(pengajuan.petugas_name))}
                                                            className="text-indigo-600 hover:text-indigo-800 inline-flex items-center gap-1"
                                                        >
                                                            {pengajuan.petugas_phone}
                                                            <div className="flex items-center gap-0.5 ml-1 bg-indigo-50 rounded-full px-1.5 py-0.5 border border-indigo-100">
                                                                <MessageCircle className="h-3 w-3 text-emerald-500" />
                                                                <span className="text-[10px] text-slate-300">|</span>
                                                                <Phone className="h-3 w-3 text-blue-500" />
                                                            </div>
                                                        </button>
                                                    ) : '-'}
                                                </span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">Unit KCU</span>
                                                <span className="font-medium text-slate-900">{pengajuan.petugas_kcu_code ? `${pengajuan.petugas_kcu_code} - ${pengajuan.petugas_kcu_name || ''}` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">Unit KC</span>
                                                <span className="font-medium text-slate-900">{pengajuan.petugas_kc_code ? `${pengajuan.petugas_kc_code} - ${pengajuan.petugas_kc_name || ''}` : '-'}</span>
                                            </div>
                                            <div className="flex justify-between py-1.5 border-b border-slate-50">
                                                <span className="text-slate-500">Unit KCP</span>
                                                <span className="font-medium text-slate-900">{pengajuan.petugas_kcp_code ? `${pengajuan.petugas_kcp_code} - ${pengajuan.petugas_kcp_name || ''}` : '-'}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Potongan Detail - Compact */}
                                {(() => {
                                    if (!pengajuan.potongan_detail) return null;
                                    try {
                                        const details = JSON.parse(pengajuan.potongan_detail);
                                        if (!Array.isArray(details) || details.length === 0) return null;

                                        return (
                                            <div>
                                                <h3 className="text-xs font-bold text-slate-900 mb-2 flex items-center gap-1.5">
                                                    <Calculator className="h-3.5 w-3.5 text-rose-600" /> Rincian Potongan
                                                </h3>
                                                <div className="space-y-2 text-xs">
                                                    {details.map((item: any, idx: number) => {
                                                        const label = item.nama;
                                                        return (
                                                            <div key={idx} className="flex justify-between py-1.5 border-b border-slate-50">
                                                                <span className="text-slate-500">{label}</span>
                                                                <span className="font-medium text-slate-900">{money(item.nilai)}</span>
                                                            </div>
                                                        );
                                                    })}
                                                </div>
                                            </div>
                                        );
                                    } catch (e) { return null; }
                                })()}
                            </div>
                        )}

                        {activeTab === 'dokumen' && (
                            <div className="space-y-3">
                                {/* Document Tabs */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                    <button onClick={() => setActiveDocTab('pengajuan')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeDocTab === 'pengajuan' ? 'bg-white text-indigo-600 shadow-sm' : 'text-slate-600'}`}>
                                        Pengajuan
                                    </button>
                                    <button onClick={() => setActiveDocTab('persetujuan')} className={`flex-1 px-3 py-2 text-xs font-medium rounded-lg transition-all ${activeDocTab === 'persetujuan' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-600'}`}>
                                        Persetujuan
                                    </button>
                                </div>

                                {/* Documents Grid */}
                                <div className="grid grid-cols-2 gap-2">
                                    {activeDocTab === 'pengajuan' ? (
                                        dokumenPengajuan.map((doc, idx) => (
                                            <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                                                <div className="aspect-square bg-white relative">
                                                    {doc.url ? (
                                                        <div onClick={() => openPreview(doc.url!)} className="block w-full h-full cursor-pointer">
                                                            <img src={doc.url} alt={doc.title} className="w-full h-full object-cover" />
                                                        </div>
                                                    ) : (
                                                        <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100">
                                                            <FileText className="h-6 w-6 mb-1 opacity-40" />
                                                            <span className="text-[10px]">Belum ada</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="p-2">
                                                    <h4 className="text-[10px] font-semibold text-slate-900 truncate">{doc.title}</h4>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        // Dokumen Persetujuan - with upload logic for multiple roles
                                        dokumenPersetujuan.map((doc, idx) => {
                                            const docKey = doc.key as 'dokumen_akad_url' | 'flagging_url' | 'surat_pernyataan_beda_url' | 'pengajuan_permohonan_url' | 'disbursement_proof_url' | 'shipping_receipt_url';
                                            const hasDoc = approvalDocs[docKey as keyof typeof approvalDocs] || doc.url;
                                            const isUploading = uploadingDoc === docKey;

                                            // Determine who can upload what
                                            let canUpload = false;

                                            // Officer: Upload Approval Docs when Disetujui
                                            if (user?.role === 'officer' && pengajuan.status === 'Disetujui') {
                                                canUpload = ['pengajuan_permohonan_url', 'dokumen_akad_url', 'flagging_url', 'surat_pernyataan_beda_url'].includes(docKey);
                                            }

                                            // Admin Unit: Upload Logic REMOVED (Verification Only)

                                            // Admin Pusat: Upload Disbursement Proof when Menunggu Pencairan
                                            if (user?.role === 'admin-pusat' && pengajuan.status === 'Menunggu Pencairan') {
                                                canUpload = docKey === 'disbursement_proof_url';
                                            }

                                            // Officer: Upload Shipping Receipt when Dicairkan
                                            if (user?.role === 'officer' && pengajuan.status === 'Dicairkan') {
                                                canUpload = docKey === 'shipping_receipt_url';
                                            }

                                            // PDF documents: Pengajuan Permohonan, Dokumen Akad, Flagging, Surat Pernyataan Beda
                                            const isPdfDoc = ['pengajuan_permohonan_url', 'dokumen_akad_url', 'flagging_url', 'surat_pernyataan_beda_url'].includes(docKey);
                                            const acceptType = isPdfDoc ? 'application/pdf' : 'image/*';

                                            // Template URLs (you can replace these with actual template URLs)
                                            const templateUrls: Record<string, string> = {
                                                'pengajuan_permohonan_url': '/templates/template-pengajuan-permohonan.pdf',
                                                'dokumen_akad_url': '/templates/template-dokumen-akad.pdf',
                                                'flagging_url': '/templates/template-flagging.pdf',
                                                'surat_pernyataan_beda_url': '/templates/template-surat-pernyataan-beda.pdf'
                                            };

                                            return (
                                                <div key={idx} className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200">
                                                    <div className="aspect-square bg-white relative">
                                                        {hasDoc ? (
                                                            <div onClick={() => openPreview(hasDoc, isPdfDoc)} className="block w-full h-full cursor-pointer">
                                                                {isPdfDoc ? (
                                                                    <div className="flex flex-col items-center justify-center h-full text-indigo-600">
                                                                        <FileText className="h-12 w-12 mb-2" />
                                                                        <span className="text-xs font-medium">PDF Preview</span>
                                                                    </div>
                                                                ) : (
                                                                    <img src={hasDoc} alt={doc.title} className="w-full h-full object-cover" />
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center justify-center h-full text-slate-400 bg-slate-100">
                                                                <FileText className="h-6 w-6 mb-1 opacity-40" />
                                                                <span className="text-[10px]">Belum ada</span>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div className="p-2 space-y-1">
                                                        <h4 className="text-[10px] font-semibold text-slate-900 truncate">{doc.title}</h4>

                                                        {/* Download Template Button for PDF docs */}
                                                        {isPdfDoc && templateUrls[docKey] && (
                                                            <a
                                                                href={templateUrls[docKey]}
                                                                download
                                                                className="block w-full text-center py-1.5 text-[10px] font-medium rounded-lg bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
                                                            >
                                                                📥 Download Template
                                                            </a>
                                                        )}

                                                        {/* Upload Button */}
                                                        {canUpload && (
                                                            <label className={`block w-full text-center py-1.5 text-[10px] font-medium rounded-lg cursor-pointer transition-colors ${isUploading ? 'bg-slate-300 text-slate-500' :
                                                                hasDoc ? 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200' :
                                                                    'bg-indigo-100 text-indigo-700 hover:bg-indigo-200'
                                                                }`}>
                                                                {isUploading ? 'Uploading...' : hasDoc ? 'Ganti' : 'Upload'}
                                                                <input
                                                                    type="file"
                                                                    accept={acceptType}
                                                                    className="hidden"
                                                                    disabled={isUploading}
                                                                    onChange={(e) => {
                                                                        const file = e.target.files?.[0];
                                                                        if (file) handleApprovalDocUpload(docKey, file);
                                                                    }}
                                                                />
                                                            </label>
                                                        )}
                                                    </div>
                                                </div>
                                            );
                                        })
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Action Buttons Section - Inside Card */}
                    <div className="px-4 pb-6 mt-6">
                        <div className="flex items-center gap-2 justify-center">
                            {user?.role === 'verifier' && pengajuan.status === 'Pending' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus('Ditolak', 'Tolak pengajuan ini?')}
                                        className="flex-1 px-4 py-3 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('Menunggu Approval Manager', 'Kirim ke Manager?')}
                                        className="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                                    >
                                        Verifikasi
                                    </button>
                                </>
                            )}
                            {user?.role === 'manager' && pengajuan.status === 'Menunggu Approval Manager' && (
                                <>
                                    <button
                                        onClick={() => handleUpdateStatus('Ditolak', 'Tolak?')}
                                        className="flex-1 px-4 py-3 bg-rose-600 text-white text-sm font-medium rounded-xl hover:bg-rose-700 transition-colors shadow-lg"
                                    >
                                        Tolak
                                    </button>
                                    <button
                                        onClick={() => handleUpdateStatus('Disetujui', 'Setujui?')}
                                        className="flex-1 px-4 py-3 bg-emerald-600 text-white text-sm font-medium rounded-xl hover:bg-emerald-700 transition-colors shadow-lg"
                                    >
                                        Setujui
                                    </button>
                                </>
                            )}
                            {user?.role === 'officer' && pengajuan.status === 'Disetujui' && isAllApprovalDocsUploaded() && (
                                <button
                                    onClick={() => handleUpdateStatus('Menunggu Verifikasi Admin Unit', 'Kirim Admin Unit?')}
                                    className="flex-1 px-4 py-3 bg-purple-600 text-white text-sm font-medium rounded-xl hover:bg-purple-700 transition-colors shadow-lg"
                                >
                                    Kirim ke Admin Unit
                                </button>
                            )}
                            {user?.role === 'admin-unit' && pengajuan.status === 'Menunggu Verifikasi Admin Unit' && (
                                <button
                                    onClick={() => handleUpdateStatus('Menunggu Pencairan', 'Kirim Pusat?')}
                                    className="flex-1 px-4 py-3 bg-orange-600 text-white text-sm font-medium rounded-xl hover:bg-orange-700 transition-colors shadow-lg"
                                >
                                    Verifikasi
                                </button>
                            )}
                            {user?.role === 'admin-pusat' && pengajuan.status === 'Menunggu Pencairan' && approvalDocs.disbursement_proof_url && (
                                <button
                                    onClick={() => handleUpdateStatus('Dicairkan', 'Cairkan?')}
                                    className="flex-1 px-4 py-3 bg-teal-600 text-white text-sm font-medium rounded-xl hover:bg-teal-700 transition-colors shadow-lg"
                                >
                                    Cairkan
                                </button>
                            )}
                            {user?.role === 'officer' && pengajuan.status === 'Dicairkan' && approvalDocs.shipping_receipt_url && (
                                <button
                                    onClick={() => handleUpdateStatus('Selesai', 'Selesaikan?')}
                                    className="flex-1 px-4 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors shadow-lg"
                                >
                                    Selesaikan
                                </button>
                            )}
                        </div>

                        {/* Info Message for Officer */}
                        {user?.role === 'officer' && pengajuan.status === 'Disetujui' && !isAllApprovalDocsUploaded() && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 text-center">
                                    📄 Upload semua dokumen persetujuan untuk melanjutkan ke Admin Unit
                                </p>
                            </div>
                        )}

                        {/* Info Message for Officer - Shipping Receipt */}
                        {user?.role === 'officer' && pengajuan.status === 'Dicairkan' && !approvalDocs.shipping_receipt_url && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 text-center">
                                    🚚 Upload resi pengiriman berkas fisik untuk menyelesaikan pengajuan
                                </p>
                            </div>
                        )}



                        {/* Info Message for Admin Pusat */}
                        {user?.role === 'admin-pusat' && pengajuan.status === 'Menunggu Pencairan' && !approvalDocs.disbursement_proof_url && (
                            <div className="mt-3 p-3 bg-amber-50 border border-amber-200 rounded-xl">
                                <p className="text-xs text-amber-800 text-center">
                                    💸 Upload bukti transfer pencairan untuk menyelesaikan proses
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div >

            {/* Desktop Layout - Original Design */}
            < div className="hidden md:block max-w-5xl mx-auto space-y-6 pb-24" >
                {/* Hero Header */}
                < div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-900 p-6 text-white" >
                    <div className="absolute top-0 right-0 w-72 h-72 bg-indigo-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2"></div>

                    <div className="relative z-10">
                        <div className="flex items-center justify-between gap-4 mb-3">
                            <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-sm font-medium ${status.bg} ${status.color}`}>
                                {status.icon}
                                <span>{pengajuan.status}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <button onClick={() => router.back()} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 transition-all">
                                    <ArrowLeft className="h-4 w-4" /> Kembali
                                </button>
                                {pengajuan.status === 'Pending' && (user?.role === 'officer' || user?.role === 'super-admin') && (
                                    <Link href={`/pengajuan/${pengajuan.id}/edit`} className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white/10 hover:bg-white/20 backdrop-blur-sm text-white text-sm font-medium rounded-full border border-white/20 transition-all">
                                        Edit
                                    </Link>
                                )}
                                {user?.role === 'verifier' && pengajuan.status === 'Pending' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus('Ditolak', 'Tolak pengajuan ini?')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-full transition-all">
                                            Tolak
                                        </button>
                                        <button onClick={() => handleUpdateStatus('Menunggu Approval Manager', 'Kirim data ke Manager?')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-all">
                                            Verifikasi
                                        </button>
                                    </>
                                )}
                                {user?.role === 'manager' && pengajuan.status === 'Menunggu Approval Manager' && (
                                    <>
                                        <button onClick={() => handleUpdateStatus('Ditolak', 'Tolak Pengajuan?')} className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white text-sm font-medium rounded-full transition-all">
                                            Tolak
                                        </button>
                                        <button onClick={() => handleUpdateStatus('Disetujui', 'Setujui Pengajuan?')} className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium rounded-full transition-all">
                                            Setujui
                                        </button>
                                    </>
                                )}
                                {user?.role === 'officer' && pengajuan.status === 'Disetujui' && (
                                    <button onClick={() => handleUpdateStatus('Menunggu Verifikasi Admin Unit', 'Pastikan semua dokumen persetujuan sudah diupload. Kirim ke Admin Unit?')} className="px-3 py-1.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-full transition-all">
                                        Kirim ke Admin Unit
                                    </button>
                                )}
                                {user?.role === 'admin-unit' && pengajuan.status === 'Menunggu Verifikasi Admin Unit' && (
                                    <button onClick={() => handleUpdateStatus('Menunggu Pencairan', 'Verifikasi selesai? Kirim ke Admin Pusat?')} className="px-3 py-1.5 bg-orange-600 hover:bg-orange-700 text-white text-sm font-medium rounded-full transition-all">
                                        Verifikasi & Kirim
                                    </button>
                                )}
                                {user?.role === 'admin-pusat' && pengajuan.status === 'Menunggu Pencairan' && (
                                    <button onClick={() => handleUpdateStatus('Dicairkan', 'Konfirmasi pencairan?')} className="px-3 py-1.5 bg-teal-600 hover:bg-teal-700 text-white text-sm font-medium rounded-full transition-all">
                                        Konfirmasi Pencairan
                                    </button>
                                )}
                                {user?.role === 'officer' && pengajuan.status === 'Dicairkan' && (
                                    <button onClick={() => handleUpdateStatus('Selesai', 'Pastikan resi pengiriman berkas sudah diupload. Selesaikan pengajuan?')} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-full transition-all">
                                        Selesai
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="space-y-2">
                            <h1 className="text-2xl sm:text-3xl font-bold">{pengajuan.nama_lengkap}</h1>
                            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-white/70 text-sm">
                                <span className="flex items-center gap-1.5"><CreditCard className="h-3.5 w-3.5" /> {pengajuan.nik}</span>
                                <span className="flex items-center gap-1.5"><Calendar className="h-3.5 w-3.5" /> {new Date(pengajuan.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                            </div>
                        </div>
                    </div>
                </div >

                {/* Rejection Reason Alert - Desktop */}
                {
                    pengajuan.status === 'Ditolak' && pengajuan.reject_reason && (
                        <div className="bg-gradient-to-r from-rose-50 to-rose-100 border-2 border-rose-400 rounded-2xl p-6 shadow-lg animate-in fade-in slide-in-from-top-4 duration-500">
                            <div className="flex items-start gap-5">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-rose-500 rounded-full flex items-center justify-center shadow-lg">
                                        <XCircle className="w-8 h-8 text-white" />
                                    </div>
                                </div>
                                <div className="flex-1">
                                    <h3 className="text-xl font-bold text-rose-900 mb-3 flex items-center gap-2">
                                        ⚠️ Alasan Penolakan
                                    </h3>
                                    <div className="bg-white/70 rounded-xl p-4 border-2 border-rose-300">
                                        <p className="text-base text-rose-900 leading-relaxed font-medium">{pengajuan.reject_reason}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* Financial Summary */}
                < div className="grid grid-cols-2 lg:grid-cols-4 gap-3" >
                    <SummaryCard icon={<Banknote className="h-4 w-4" />} label="Plafond" value={money(pengajuan.jumlah_pembiayaan)} accent />
                    <SummaryCard icon={<Calendar className="h-4 w-4" />} label="Tenor" value={`${d(pengajuan.jangka_waktu)} Bulan`} />
                    <SummaryCard icon={<Receipt className="h-4 w-4" />} label="Angsuran" value={money(pengajuan.besar_angsuran)} />
                    <SummaryCard icon={<Wallet className="h-4 w-4" />} label="Diterima" value={money(pengajuan.nominal_terima)} />
                </div >

                {/* Tab Navigation */}
                < div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden" >
                    <div className="flex border-b border-slate-100">
                        <TabBtn active={activeTab === 'detail'} onClick={() => setActiveTab('detail')} icon={<User className="h-4 w-4" />} label="Data Lengkap" />
                        <TabBtn active={activeTab === 'dokumen'} onClick={() => setActiveTab('dokumen')} icon={<FolderOpen className="h-4 w-4" />} label="Dokumen" />
                    </div>

                    <div className="p-5 sm:p-6">
                        {activeTab === 'detail' && (
                            <div className="space-y-8">
                                {/* Personal Info */}
                                <Section title="Informasi Pribadi" icon={<User className="h-5 w-5 text-indigo-600" />}>
                                    <Field label="Nama Lengkap" value={pengajuan.nama_lengkap} />
                                    <Field label="NIK" value={pengajuan.nik} />
                                    <Field label="Jenis Kelamin" value={d(pengajuan.jenis_kelamin)} />
                                    <Field label="Tempat Lahir" value={d(pengajuan.tempat_lahir)} />
                                    <Field label="Tanggal Lahir" value={pengajuan.tanggal_lahir ? new Date(pengajuan.tanggal_lahir).toLocaleDateString('id-ID') : '-'} />
                                    <Field label="Usia" value={pengajuan.usia ? `${pengajuan.usia} Tahun` : '-'} />
                                    <Field label="No. Telepon" value={d(pengajuan.nomor_telephone)} />
                                    <Field label="Nama Ibu Kandung" value={d(pengajuan.nama_ibu_kandung)} />
                                    <Field label="Pendidikan Terakhir" value={d(pengajuan.pendidikan_terakhir)} />
                                </Section>

                                {/* Address */}
                                <Section title="Alamat" icon={<MapPin className="h-5 w-5 text-emerald-600" />}>
                                    <Field label="Alamat Lengkap" value={d(pengajuan.alamat)} wide />
                                    <Field label="RT / RW" value={`${d(pengajuan.rt)} / ${d(pengajuan.rw)}`} />
                                    <Field label="Kelurahan" value={d(pengajuan.kelurahan)} />
                                    <Field label="Kecamatan" value={d(pengajuan.kecamatan)} />
                                    <Field label="Kabupaten" value={d(pengajuan.kabupaten)} />
                                    <Field label="Provinsi" value={d(pengajuan.provinsi)} />
                                    <Field label="Kode Pos" value={d(pengajuan.kode_pos)} />
                                </Section>

                                {/* Pension */}
                                <Section title="Data Pensiun" icon={<Briefcase className="h-5 w-5 text-amber-600" />}>
                                    <Field label="Nomor Pensiun (Nopen)" value={d(pengajuan.nopen)} />
                                    <Field label="Jenis Pensiun" value={d(pengajuan.jenis_pensiun)} />
                                    <Field label="Kantor Bayar" value={d(pengajuan.kantor_bayar)} />
                                    <Field label="Nama Bank" value={d(pengajuan.nama_bank)} />
                                    <Field label="No. Rekening Bank" value={d(pengajuan.no_rekening)} />
                                    <Field label="No. Giro Pos" value={d(pengajuan.nomor_rekening_giro_pos)} />
                                </Section>

                                {/* Financial */}
                                <Section title="Data Keuangan" icon={<Wallet className="h-5 w-5 text-teal-600" />}>
                                    <Field label="Gaji Bersih" value={money(pengajuan.gaji_bersih)} />
                                    <Field label="Gaji Tersedia" value={money(pengajuan.gaji_tersedia)} />
                                    <Field label="Jenis Dapem" value={d(pengajuan.jenis_dapem)} />
                                    <Field label="Bulan Dapem" value={d(pengajuan.bulan_dapem)} />
                                    <Field label="Status Dapem" value={d(pengajuan.status_dapem)} />
                                </Section>

                                {/* Loan Details */}
                                <Section title="Detail Pengajuan" icon={<FileText className="h-5 w-5 text-violet-600" />}>
                                    <Field label="Jenis Pelayanan" value={d(pengajuan.jenis_pelayanan?.name)} highlight />
                                    <Field label="Jenis Pembiayaan" value={d(pengajuan.jenis_pembiayaan?.name)} highlight />
                                    <Field label="Kategori Pembiayaan" value={d(pengajuan.kategori_pembiayaan)} />
                                    <Field label="Maks. Jangka Waktu" value={pengajuan.maksimal_jangka_waktu_usia ? `${pengajuan.maksimal_jangka_waktu_usia} Tahun` : '-'} />
                                    <Field label="Jangka Waktu" value={pengajuan.jangka_waktu ? `${pengajuan.jangka_waktu} Bulan` : '-'} />
                                    <Field label="Maksimal Plafond" value={money(pengajuan.maksimal_pembiayaan)} />
                                    <Field label="Jumlah Diajukan" value={money(pengajuan.jumlah_pembiayaan)} />
                                    <Field label="Besar Angsuran" value={money(pengajuan.besar_angsuran)} />
                                    <Field label="Total Potongan" value={money(pengajuan.total_potongan)} />
                                    <Field label="Nominal Diterima" value={money(pengajuan.nominal_terima)} />
                                    <Field label="Petugas Kantor Pos" value={d(pengajuan.kantor_pos_petugas)} />
                                </Section>

                                {/* Data Petugas POS - Section */}
                                {pengajuan.petugas_nippos && (
                                    <Section title="Data Petugas POS" icon={<UserCheck className="h-5 w-5 text-indigo-600" />}>
                                        <Field label="NIPPOS" value={d(pengajuan.petugas_nippos)} />
                                        <Field label="Nama Petugas" value={d(pengajuan.petugas_name)} />
                                        <Field label="No. Handphone" value={
                                            pengajuan.petugas_phone ? (
                                                <button
                                                    onClick={() => handleContact(pengajuan.petugas_phone!, d(pengajuan.petugas_name))}
                                                    className="text-indigo-600 hover:text-indigo-800 hover:underline inline-flex items-center gap-1"
                                                >
                                                    {pengajuan.petugas_phone}
                                                    <div className="flex items-center gap-0.5 ml-1 bg-indigo-50 rounded-full px-1.5 py-0.5 border border-indigo-100">
                                                        <MessageCircle className="h-3 w-3 text-emerald-500" />
                                                        <span className="text-[10px] text-slate-300">|</span>
                                                        <Phone className="h-3 w-3 text-blue-500" />
                                                    </div>
                                                </button>
                                            ) : '-'
                                        } />
                                        <Field label="Unit KCU" value={pengajuan.petugas_kcu_code ? `${pengajuan.petugas_kcu_code} - ${pengajuan.petugas_kcu_name || ''}` : '-'} />
                                        <Field label="Unit KC" value={pengajuan.petugas_kc_code ? `${pengajuan.petugas_kc_code} - ${pengajuan.petugas_kc_name || ''}` : '-'} />
                                        <Field label="Unit KCP" value={pengajuan.petugas_kcp_code ? `${pengajuan.petugas_kcp_code} - ${pengajuan.petugas_kcp_name || ''}` : '-'} />
                                    </Section>
                                )}

                                {/* Potongan Detail - Section */}
                                {(() => {
                                    if (!pengajuan.potongan_detail) return null;
                                    try {
                                        const details = JSON.parse(pengajuan.potongan_detail);
                                        if (!Array.isArray(details) || details.length === 0) return null;

                                        return (
                                            <Section title="Rincian Potongan" icon={<Calculator className="h-5 w-5 text-rose-600" />}>
                                                {details.map((item: any, idx: number) => {
                                                    const label = item.kategori === 'persentase'
                                                        ? `${item.nama} (${item.persentase_nominal}%)`
                                                        : item.nama;
                                                    return (
                                                        <Field
                                                            key={idx}
                                                            label={label}
                                                            value={money(item.nilai)}
                                                        />
                                                    );
                                                })}
                                            </Section>
                                        );
                                    } catch (e) { return null; }
                                })()}

                                {/* Notes & Rejection Reason */}
                                {(pengajuan.notes || pengajuan.reject_reason) && (
                                    <div className="space-y-4">
                                        {pengajuan.reject_reason && (
                                            <div className="p-5 bg-gradient-to-r from-rose-50 to-rose-100 rounded-xl border-2 border-rose-400 shadow-md">
                                                <div className="flex items-start gap-3">
                                                    <div className="flex-shrink-0 mt-0.5">
                                                        <div className="w-7 h-7 bg-rose-500 rounded-full flex items-center justify-center">
                                                            <XCircle className="w-4 h-4 text-white" />
                                                        </div>
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm font-bold text-rose-900 mb-2">⚠️ Alasan Penolakan</p>
                                                        <div className="bg-white/60 rounded-lg p-3 border border-rose-200">
                                                            <p className="text-sm text-rose-900 leading-relaxed font-medium">{pengajuan.reject_reason}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                        {pengajuan.notes && (
                                            <div className="p-4 bg-amber-50 rounded-xl border border-amber-200">
                                                <p className="text-sm font-semibold text-amber-800 mb-1">📝 Catatan</p>
                                                <p className="text-sm text-amber-700">{pengajuan.notes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'dokumen' && (
                            <div className="space-y-6">
                                {/* Sub-tabs for Documents */}
                                <div className="flex gap-2 p-1 bg-slate-100 rounded-xl">
                                    <button
                                        onClick={() => setActiveDocTab('pengajuan')}
                                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeDocTab === 'pengajuan'
                                            ? 'bg-white text-indigo-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <Upload className="h-4 w-4" />
                                            <span>Dokumen Pengajuan</span>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setActiveDocTab('persetujuan')}
                                        className={`flex-1 px-4 py-2.5 text-sm font-medium rounded-lg transition-all ${activeDocTab === 'persetujuan'
                                            ? 'bg-white text-emerald-600 shadow-sm'
                                            : 'text-slate-600 hover:text-slate-900'
                                            }`}
                                    >
                                        <div className="flex items-center justify-center gap-2">
                                            <CheckCircle className="h-4 w-4" />
                                            <span>Dokumen Persetujuan</span>
                                        </div>
                                    </button>
                                </div>

                                {/* Tab Content */}
                                {activeDocTab === 'pengajuan' && (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-2 p-4 bg-blue-50 rounded-xl border border-blue-100">
                                            <FileText className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-blue-900">Dokumen Pengajuan</p>
                                                <p className="text-xs text-blue-700 mt-0.5">Dokumen yang diupload saat pengajuan awal</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {dokumenPengajuan.map((doc, idx) => (
                                                <DocCard
                                                    key={idx}
                                                    title={doc.title}
                                                    desc={doc.desc}
                                                    url={doc.url}
                                                />
                                            ))}
                                        </div>

                                        {/* Borrower Photos */}
                                        <div className="pt-4 border-t border-slate-100">
                                            <div className="flex items-center gap-2 mb-4">
                                                <Camera className="h-5 w-5 text-slate-400" />
                                                <div>
                                                    <h4 className="text-sm font-semibold text-slate-900">Foto Nasabah</h4>
                                                    <p className="text-xs text-slate-500">Dokumentasi foto pemohon</p>
                                                </div>
                                            </div>

                                            {borrowerPhotos.length > 0 ? (
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    {borrowerPhotos.map((photo, i) => (
                                                        <a key={i} href={photo} target="_blank" className="group relative aspect-square rounded-xl overflow-hidden border border-slate-200 hover:shadow-lg transition-all">
                                                            <img src={photo} alt={`Foto ${i + 1}`} className="w-full h-full object-cover" />
                                                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors flex items-center justify-center">
                                                                <Eye className="h-5 w-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
                                                            </div>
                                                        </a>
                                                    ))}
                                                </div>
                                            ) : (
                                                <div className="flex flex-col items-center justify-center py-10 text-slate-400 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                                                    <Camera className="h-10 w-10 mb-2 opacity-40" />
                                                    <span className="text-sm">Belum ada foto</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {activeDocTab === 'persetujuan' && (
                                    <div className="space-y-6">
                                        <div className="flex items-start gap-2 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                                            <CheckCircle className="h-5 w-5 text-emerald-600 mt-0.5 flex-shrink-0" />
                                            <div>
                                                <p className="text-sm font-medium text-emerald-900">Dokumen Persetujuan</p>
                                                <p className="text-xs text-emerald-700 mt-0.5">Dokumen yang diupload setelah pengajuan disetujui</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                            {dokumenPersetujuan.map((doc, idx) => (
                                                <DocCard
                                                    key={idx}
                                                    title={doc.title}
                                                    desc={doc.desc}
                                                    url={doc.url}
                                                    action={
                                                        doc.uploadInfo && ((doc.uploadInfo.type === 'disbursement' && (user?.role === 'admin-pusat' || user?.role === 'super-admin')) || (doc.uploadInfo.type === 'shipping' && (user?.role === 'officer' || user?.role === 'super-admin'))) ? (
                                                            <button onClick={() => { setUploadTarget(doc.uploadInfo!.type as any); setIsUploadModalOpen(true); }} className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1">
                                                                <Upload className="h-3 w-3" /> {doc.url ? 'Update' : 'Upload'}
                                                            </button>
                                                        ) : null
                                                    }
                                                />
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div >

                {/* Upload Modal */}
                {
                    isUploadModalOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
                            <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
                                <h3 className="text-lg font-bold text-slate-900 mb-1">Upload Bukti Transfer</h3>
                                <p className="text-sm text-slate-500 mb-5">Upload gambar bukti pencairan dana</p>
                                <form onSubmit={handleUploadProof} className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">File Gambar</label>
                                        <input type="file" accept="image/*" onChange={(e) => setProofForm({ ...proofForm, file: e.target.files?.[0] || null })} className="block w-full text-sm text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-indigo-50 file:text-indigo-700 hover:file:bg-indigo-100" />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-slate-700 mb-1.5">Catatan</label>
                                        <textarea rows={3} className="block w-full rounded-xl border-slate-200 text-sm focus:border-indigo-500 focus:ring-indigo-500" value={proofForm.notes} onChange={(e) => setProofForm({ ...proofForm, notes: e.target.value })} placeholder="Catatan tambahan..." />
                                    </div>
                                    <div className="flex gap-3 pt-2">
                                        <button type="button" onClick={() => setIsUploadModalOpen(false)} className="flex-1 px-4 py-2.5 text-sm font-medium text-slate-700 bg-slate-100 rounded-xl hover:bg-slate-200 transition-colors">Batal</button>
                                        <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-medium text-white bg-indigo-600 rounded-xl hover:bg-indigo-700 transition-colors">Upload</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )
                }
            </div >
            {/* Image/PDF Preview Modal */}
            {
                previewDoc && (
                    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm" onClick={() => setPreviewDoc(null)}>
                        <div className="relative w-full max-w-lg bg-white rounded-2xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200" onClick={e => e.stopPropagation()}>
                            <div className="flex items-center justify-between p-4 border-b">
                                <h3 className="text-sm font-bold text-slate-900">Preview Dokumen</h3>
                                <button onClick={() => setPreviewDoc(null)} className="p-1 hover:bg-slate-100 rounded-full">
                                    <XCircle className="w-6 h-6 text-slate-500" />
                                </button>
                            </div>
                            <div className="p-4 bg-slate-100 flex items-center justify-center min-h-[300px]">
                                {previewDoc.type === 'pdf' ? (
                                    <object
                                        data={previewDoc.url}
                                        type="application/pdf"
                                        className="w-full h-[60vh] rounded-lg bg-white shadow-sm border border-slate-200"
                                    >
                                        <div className="flex flex-col items-center justify-center h-full p-6 text-center bg-slate-50">
                                            <FileText className="w-12 h-12 text-slate-400 mb-3" />
                                            <p className="text-sm text-slate-600 mb-3">Gagal memuat preview.</p>
                                            <a href={previewDoc.url} target="_blank" download className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-sm font-medium">
                                                Download PDF
                                            </a>
                                        </div>
                                    </object>
                                ) : (
                                    <img src={previewDoc.url} alt="Preview" className="max-w-full max-h-[60vh] object-contain rounded-lg shadow-sm" />
                                )}
                            </div>

                        </div>
                    </div>
                )
            }
        </MobileLayoutWrapper >
    );
};


