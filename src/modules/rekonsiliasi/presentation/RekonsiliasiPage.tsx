'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { PengajuanRepositoryImpl } from '@/modules/pengajuan/data/PengajuanRepositoryImpl';
import { Pengajuan } from '@/modules/pengajuan/core/PengajuanEntity';
import { showLoading, hideLoading, showError, showSuccess } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
import { Download, FileSpreadsheet, Search, RefreshCw, Filter, X, Calendar } from 'lucide-react';
import * as XLSX from 'xlsx';

const pengajuanRepo = new PengajuanRepositoryImpl();

export const RekonsiliasiPage: React.FC = () => {
    const { user } = useAuth();
    const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
    const [filteredList, setFilteredList] = useState<Pengajuan[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);

    // Daftar status untuk dropdown filter
    const STATUS_OPTIONS = [
        'Pending',
        'Revisi',
        'Menunggu Approval Manager',
        'Menunggu Verifikasi Admin Unit',
        'Menunggu Pencairan',
        'Dicairkan',
        'Disetujui',
        'Ditolak',
    ];

    // Hitung jumlah filter aktif
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (filterStatus) count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        return count;
    }, [searchQuery, filterStatus, dateFrom, dateTo]);

    const resetFilters = () => {
        setSearchQuery('');
        setFilterStatus('');
        setDateFrom('');
        setDateTo('');
    };

    // Add custom scrollbar styles
    useEffect(() => {
        const style = document.createElement('style');
        style.textContent = `
            .custom-scrollbar::-webkit-scrollbar {
                width: 10px;
                height: 10px;
            }
            .custom-scrollbar::-webkit-scrollbar-track {
                background: #f1f5f9;
                border-radius: 4px;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb {
                background: #cbd5e1;
                border-radius: 4px;
                border: 2px solid #f1f5f9;
            }
            .custom-scrollbar::-webkit-scrollbar-thumb:hover {
                background: #94a3b8;
            }
            .custom-scrollbar {
                scrollbar-width: thin;
                scrollbar-color: #cbd5e1 #f1f5f9;
            }
        `;
        document.head.appendChild(style);
        return () => {
            document.head.removeChild(style);
        };
    }, []);

    // Check access
    useEffect(() => {
        if (user && user.role !== 'super-admin' && user.role !== 'admin-pos') {
            window.location.href = '/dashboard';
        }
    }, [user]);

    // Fetch data
    const fetchData = async () => {
        try {
            setIsLoading(true);
            showLoading('Memuat data rekonsiliasi POS...');

            // Fetch all POS pengajuan
            const allData = await pengajuanRepo.getPengajuanList({
                limit: 9999, // Get all data
                page: 1,
            });

            // Filter hanya yang jenis pelayanan POS
            const posPengajuan = allData.filter(
                (item) => item.jenis_pelayanan?.name?.toUpperCase() === 'POS'
            );

            setPengajuanList(posPengajuan);
            setFilteredList(posPengajuan);
            setTotal(posPengajuan.length);
            hideLoading();
        } catch (err) {
            hideLoading();
            showError(handleError(err, 'Gagal memuat data rekonsiliasi'));
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    // Filter: search + status + range tanggal
    useEffect(() => {
        let filtered = pengajuanList;

        // Filter by search query
        if (searchQuery.trim()) {
            const query = searchQuery.toLowerCase();
            filtered = filtered.filter((item) =>
                item.nik?.toLowerCase().includes(query) ||
                item.nama_lengkap?.toLowerCase().includes(query) ||
                item.nopen?.toLowerCase().includes(query) ||
                item.petugas_nippos?.toLowerCase().includes(query) ||
                item.petugas_name?.toLowerCase().includes(query) ||
                item.status?.toLowerCase().includes(query)
            );
        }

        // Filter by status
        if (filterStatus) {
            filtered = filtered.filter((item) => item.status === filterStatus);
        }

        // Filter by date range (created_at)
        if (dateFrom) {
            const from = new Date(dateFrom);
            from.setHours(0, 0, 0, 0);
            filtered = filtered.filter((item) => {
                if (!item.created_at) return false;
                return new Date(item.created_at) >= from;
            });
        }
        if (dateTo) {
            const to = new Date(dateTo);
            to.setHours(23, 59, 59, 999);
            filtered = filtered.filter((item) => {
                if (!item.created_at) return false;
                return new Date(item.created_at) <= to;
            });
        }

        setFilteredList(filtered);
    }, [searchQuery, filterStatus, dateFrom, dateTo, pengajuanList]);

    // Export to Excel
    const handleExportExcel = () => {
        try {
            showLoading('Menyiapkan file Excel...');

            // Prepare data for Excel - semua kolom
            const excelData = filteredList.map((item, index) => ({
                'No': index + 1,
                'ID': item.id,
                'User ID': item.user_id,
                'User Name': item.user?.name || '-',
                'User Username': item.user?.username || '-',
                'User Role': item.user?.role || '-',
                'User Unit': item.user?.unit || '-',
                'Unit': item.unit || '-',
                'Status': item.status || '-',
                'Notes': item.notes || '-',
                'Reject Reason': item.reject_reason || '-',

                // Data Diri
                'NIK': item.nik || '-',
                'Nama Lengkap': item.nama_lengkap || '-',
                'Jenis Kelamin': item.jenis_kelamin || '-',
                'Tempat Lahir': item.tempat_lahir || '-',
                'Tanggal Lahir': item.tanggal_lahir || '-',
                'Usia': item.usia || '-',
                'Alamat': item.alamat || '-',
                'RT': item.rt || '-',
                'RW': item.rw || '-',
                'Kelurahan': item.kelurahan || '-',
                'Kecamatan': item.kecamatan || '-',
                'Kabupaten': item.kabupaten || '-',
                'Provinsi': item.provinsi || '-',
                'Kode Pos': item.kode_pos || '-',
                'Nomor Telephone': item.nomor_telephone || '-',
                'Nama Ibu Kandung': item.nama_ibu_kandung || '-',
                'Pendidikan Terakhir': item.pendidikan_terakhir || '-',

                // Data Pensiun
                'NOPEN': item.nopen || '-',
                'Jenis Pensiun': item.jenis_pensiun || '-',
                'Kantor Bayar': item.kantor_bayar || '-',
                'Nama Bank': item.nama_bank || '-',
                'No Rekening': item.no_rekening || '-',
                'Nomor Rekening Giro POS': item.nomor_rekening_giro_pos || '-',

                // Data Dapem & Keuangan
                'Jenis Dapem': item.jenis_dapem || '-',
                'Bulan Dapem': item.bulan_dapem || '-',
                'Status Dapem': item.status_dapem || '-',
                'Gaji Bersih': item.gaji_bersih || 0,
                'Gaji Tersedia': item.gaji_tersedia || 0,

                // Data Pengajuan
                'Jenis Pelayanan ID': item.jenis_pelayanan_id || '-',
                'Jenis Pelayanan': item.jenis_pelayanan?.name || '-',
                'Jenis Pembiayaan ID': item.jenis_pembiayaan_id || '-',
                'Jenis Pembiayaan': item.jenis_pembiayaan?.name || '-',
                'Kategori Pembiayaan': item.kategori_pembiayaan || '-',
                'Maksimal Jangka Waktu Usia': item.maksimal_jangka_waktu_usia || 0,
                'Jangka Waktu': item.jangka_waktu || 0,
                'Maksimal Pembiayaan': item.maksimal_pembiayaan || 0,
                'Jumlah Pembiayaan': item.jumlah_pembiayaan || 0,
                'Besar Angsuran': item.besar_angsuran || 0,
                'Total Potongan': item.total_potongan || 0,
                'Nominal Terima': item.nominal_terima || 0,
                'Kantor POS Petugas': item.kantor_pos_petugas || '-',

                // Data Petugas POS
                'Petugas NIPPOS': item.petugas_nippos || '-',
                'Petugas Name': item.petugas_name || '-',
                'Petugas Account No': item.petugas_account_no || '-',
                'Petugas Phone': item.petugas_phone || '-',
                'Petugas KCU Code': item.petugas_kcu_code || '-',
                'Petugas KCU Name': item.petugas_kcu_name || '-',
                'Petugas KC Code': item.petugas_kc_code || '-',
                'Petugas KC Name': item.petugas_kc_name || '-',
                'Petugas KCP Code': item.petugas_kcp_code || '-',
                'Petugas KCP Name': item.petugas_kcp_name || '-',

                // Status & Metadata
                'Approval': item.approval || '-',

                // Files
                'KTP URL': item.ktp_url || '-',
                'Slip Gaji URL': item.slip_gaji_url || '-',
                'Borrower Photos': item.borrower_photos || '-',
                'Pengajuan Permohonan URL': item.pengajuan_permohonan_url || '-',
                'Dokumen Akad URL': item.dokumen_akad_url || '-',
                'Flagging URL': item.flagging_url || '-',
                'Surat Pernyataan Beda URL': item.surat_pernyataan_beda_url || '-',
                'Karip Buku Asabri URL': item.karip_buku_asabri_url || '-',
                'Surat Permohonan Anggota URL': item.surat_permohonan_anggota_url || '-',
                'Potongan Detail': item.potongan_detail || '-',
                'SK Pensiun URL': item.sk_pensiun_url || '-',
                'Disbursement Proof URL': item.disbursement_proof_url || '-',
                'Shipping Receipt URL': item.shipping_receipt_url || '-',

                // Location
                'Latitude': item.latitude || '-',
                'Longitude': item.longitude || '-',

                // Timestamps
                'Created At': item.created_at || '-',
                'Updated At': item.updated_at || '-',
            }));

            // Create worksheet
            const worksheet = XLSX.utils.json_to_sheet(excelData);

            // Set column widths
            const columnWidths = [
                { wch: 5 },  // No
                { wch: 38 }, // ID
                { wch: 38 }, // User ID
                { wch: 20 }, // User Name
                { wch: 15 }, // User Username
                { wch: 15 }, // User Role
                { wch: 20 }, // User Unit
                { wch: 20 }, // Unit
                { wch: 20 }, // Status
                { wch: 30 }, // Notes
                { wch: 30 }, // Reject Reason
                { wch: 20 }, // NIK
                { wch: 30 }, // Nama Lengkap
                { wch: 15 }, // Jenis Kelamin
                { wch: 20 }, // Tempat Lahir
                { wch: 15 }, // Tanggal Lahir
                { wch: 10 }, // Usia
                { wch: 40 }, // Alamat
                { wch: 10 }, // RT
                { wch: 10 }, // RW
                { wch: 20 }, // Kelurahan
                { wch: 20 }, // Kecamatan
                { wch: 20 }, // Kabupaten
                { wch: 20 }, // Provinsi
                { wch: 10 }, // Kode Pos
                { wch: 15 }, // Nomor Telephone
                { wch: 30 }, // Nama Ibu Kandung
                { wch: 20 }, // Pendidikan Terakhir
                { wch: 20 }, // NOPEN
                { wch: 20 }, // Jenis Pensiun
                { wch: 30 }, // Kantor Bayar
                { wch: 20 }, // Nama Bank
                { wch: 20 }, // No Rekening
                { wch: 20 }, // Nomor Rekening Giro POS
                { wch: 20 }, // Jenis Dapem
                { wch: 15 }, // Bulan Dapem
                { wch: 15 }, // Status Dapem
                { wch: 15 }, // Gaji Bersih
                { wch: 15 }, // Gaji Tersedia
                { wch: 38 }, // Jenis Pelayanan ID
                { wch: 20 }, // Jenis Pelayanan
                { wch: 38 }, // Jenis Pembiayaan ID
                { wch: 20 }, // Jenis Pembiayaan
                { wch: 20 }, // Kategori Pembiayaan
                { wch: 25 }, // Maksimal Jangka Waktu Usia
                { wch: 15 }, // Jangka Waktu
                { wch: 20 }, // Maksimal Pembiayaan
                { wch: 20 }, // Jumlah Pembiayaan
                { wch: 15 }, // Besar Angsuran
                { wch: 15 }, // Total Potongan
                { wch: 15 }, // Nominal Terima
                { wch: 30 }, // Kantor POS Petugas
                { wch: 20 }, // Petugas NIPPOS
                { wch: 30 }, // Petugas Name
                { wch: 20 }, // Petugas Account No
                { wch: 15 }, // Petugas Phone
                { wch: 15 }, // Petugas KCU Code
                { wch: 30 }, // Petugas KCU Name
                { wch: 15 }, // Petugas KC Code
                { wch: 30 }, // Petugas KC Name
                { wch: 15 }, // Petugas KCP Code
                { wch: 30 }, // Petugas KCP Name
                { wch: 15 }, // Approval
                { wch: 50 }, // KTP URL
                { wch: 50 }, // Slip Gaji URL
                { wch: 50 }, // Borrower Photos
                { wch: 50 }, // Pengajuan Permohonan URL
                { wch: 50 }, // Dokumen Akad URL
                { wch: 50 }, // Flagging URL
                { wch: 50 }, // Surat Pernyataan Beda URL
                { wch: 50 }, // Karip Buku Asabri URL
                { wch: 50 }, // Surat Permohonan Anggota URL
                { wch: 50 }, // Potongan Detail
                { wch: 50 }, // SK Pensiun URL
                { wch: 50 }, // Disbursement Proof URL
                { wch: 50 }, // Shipping Receipt URL
                { wch: 15 }, // Latitude
                { wch: 15 }, // Longitude
                { wch: 25 }, // Created At
                { wch: 25 }, // Updated At
            ];
            worksheet['!cols'] = columnWidths;

            // Create workbook
            const workbook = XLSX.utils.book_new();
            XLSX.utils.book_append_sheet(workbook, worksheet, 'Rekonsiliasi POS');

            // Generate filename with timestamp
            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `Rekonsiliasi_POS_${timestamp}.xlsx`;

            // Download
            XLSX.writeFile(workbook, filename);

            hideLoading();
            showSuccess('File Excel berhasil diunduh!');
        } catch (err) {
            hideLoading();
            showError(handleError(err, 'Gagal export Excel'));
        }
    };

    const formatMoney = (value?: number) => {
        if (!value) return 'Rp 0';
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(value);
    };

    const formatDate = (dateString?: string) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
        });
    };

    return (
        <div className="p-6 space-y-6">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">Rekonsiliasi Data POS</h1>
                        <p className="text-sm text-slate-600 mt-1">
                            Data pengajuan yang melalui POS untuk keperluan rekonsiliasi
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            onClick={fetchData}
                            disabled={isLoading}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium rounded-lg transition-colors disabled:opacity-50"
                        >
                            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                        <button
                            onClick={handleExportExcel}
                            disabled={filteredList.length === 0}
                            className="inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Download className="h-4 w-4" />
                            Export Excel
                        </button>
                    </div>
                </div>

                {/* Stats & Search */}
                <div className="mt-6 flex flex-col gap-4">
                    {/* Row 1: Stats + Search */}
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="bg-indigo-50 border border-indigo-200 rounded-lg px-4 py-2">
                                <p className="text-xs text-indigo-600 font-medium">Total Data</p>
                                <p className="text-2xl font-bold text-indigo-900">{filteredList.length}</p>
                            </div>
                            <div className="bg-slate-50 border border-slate-200 rounded-lg px-4 py-2">
                                <p className="text-xs text-slate-500 font-medium">Semua Data</p>
                                <p className="text-2xl font-bold text-slate-700">{pengajuanList.length}</p>
                            </div>
                        </div>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Cari NIK, Nama, NOPEN, NIPPOS..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10 pr-4 py-2.5 w-full md:w-80 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none"
                            />
                        </div>
                    </div>

                    {/* Row 2: Filter Status + Range Tanggal */}
                    <div className="flex flex-col sm:flex-row gap-3 p-4 bg-slate-50 rounded-xl border border-slate-200">
                        <div className="flex items-center gap-2 text-slate-500 shrink-0">
                            <Filter className="h-4 w-4" />
                            <span className="text-sm font-medium text-slate-600">Filter:</span>
                        </div>

                        {/* Filter Status */}
                        <div className="flex-1 min-w-[180px]">
                            <select
                                value={filterStatus}
                                onChange={(e) => setFilterStatus(e.target.value)}
                                className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                            >
                                <option value="">Semua Status</option>
                                {STATUS_OPTIONS.map(s => (
                                    <option key={s} value={s}>{s}</option>
                                ))}
                            </select>
                        </div>

                        {/* Filter Tanggal Dari */}
                        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={dateFrom}
                                onChange={(e) => setDateFrom(e.target.value)}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                title="Tanggal Dari"
                            />
                        </div>

                        {/* Separator */}
                        <span className="text-slate-400 self-center text-sm shrink-0">s/d</span>

                        {/* Filter Tanggal Sampai */}
                        <div className="flex items-center gap-2 flex-1 min-w-[160px]">
                            <Calendar className="h-4 w-4 text-slate-400 shrink-0" />
                            <input
                                type="date"
                                value={dateTo}
                                onChange={(e) => setDateTo(e.target.value)}
                                className="w-full py-2 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                title="Tanggal Sampai"
                            />
                        </div>

                        {/* Reset Filter */}
                        {activeFilterCount > 0 && (
                            <button
                                onClick={resetFilters}
                                className="inline-flex items-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-sm font-medium rounded-lg transition-colors shrink-0"
                            >
                                <X className="h-3.5 w-3.5" />
                                Reset
                                <span className="bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                    {activeFilterCount}
                                </span>
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                <div
                    className="overflow-x-auto overflow-y-auto max-h-[600px] relative custom-scrollbar"
                    style={{
                        scrollBehavior: 'smooth'
                    }}
                >
                    <table className="w-full text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NIK</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Nama Lengkap</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NOPEN</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Jenis Pembiayaan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Jumlah Pembiayaan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tenor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Angsuran</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Nominal Terima</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NIPPOS</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Petugas POS</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">KCU</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={15} className="px-4 py-12 text-center">
                                        <FileSpreadsheet className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                                        <p className="text-slate-500 font-medium">
                                            {activeFilterCount > 0 ? `Tidak ada data yang cocok dengan ${activeFilterCount} filter aktif` : 'Tidak ada data rekonsiliasi'}
                                        </p>
                                    </td>
                                </tr>
                            ) : (
                                filteredList.map((item, index) => (
                                    <tr key={item.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{index + 1}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{formatDate(item.created_at)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium ${item.status === 'Disetujui' ? 'bg-emerald-100 text-emerald-700' :
                                                item.status === 'Ditolak' ? 'bg-rose-100 text-rose-700' :
                                                    item.status === 'Pending' ? 'bg-amber-100 text-amber-700' :
                                                        'bg-blue-100 text-blue-700'
                                                }`}>
                                                {item.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-mono text-xs">{item.nik}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.nama_lengkap}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-mono text-xs">{item.nopen || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.jenis_pembiayaan?.name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-semibold">{formatMoney(item.jumlah_pembiayaan)}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.jangka_waktu} Bulan</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{formatMoney(item.besar_angsuran)}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-semibold text-emerald-600">{formatMoney(item.nominal_terima)}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-mono text-xs">{item.petugas_nippos || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_kcu_name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.unit || '-'}</td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Info Footer */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start gap-3">
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">Informasi Export Excel</h3>
                        <p className="text-xs text-blue-800">
                            File Excel akan berisi <strong>semua kolom</strong> dari database termasuk ID, timestamps, URLs dokumen, data petugas POS, dan informasi lengkap lainnya.
                            Data yang ditampilkan di tabel hanya kolom utama untuk kemudahan melihat di layar.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
