'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { PengajuanRepositoryImpl } from '@/modules/pengajuan/data/PengajuanRepositoryImpl';
import { Pengajuan } from '@/modules/pengajuan/core/PengajuanEntity';
import { RekonsiliasiDashboardRepository } from '@/modules/rekonsiliasi/data/RekonsiliasiDashboardRepository';
import { RekonsiliasiFilterOptions } from '@/modules/rekonsiliasi/core/RekonsiliasiDashboardEntity';
import { showLoading, hideLoading, showError, showSuccess } from '@/shared/utils/sweetAlert';
import { handleError } from '@/shared/utils/errorHandler';
import { Download, FileSpreadsheet, Search, RefreshCw, Filter, X, Calendar, ChevronDown } from 'lucide-react';

const pengajuanRepo = new PengajuanRepositoryImpl();
const rekonsiliasiRepo = new RekonsiliasiDashboardRepository();

export const RekonsiliasiPage: React.FC = () => {
    const { user } = useAuth();
    const [pengajuanList, setPengajuanList] = useState<Pengajuan[]>([]);
    const [filteredList, setFilteredList] = useState<Pengajuan[]>([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [filterStatus, setFilterStatus] = useState('');
    const [filterRegional, setFilterRegional] = useState('');
    const [filterKcu, setFilterKcu] = useState('');
    const [dateFrom, setDateFrom] = useState('');
    const [dateTo, setDateTo] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [total, setTotal] = useState(0);
    const [filterOptions, setFilterOptions] = useState<RekonsiliasiFilterOptions | null>(null);

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

    // Gunakan data dari API untuk dropdown options
    const regionalOptions = useMemo(() => {
        return filterOptions?.regionals || [];
    }, [filterOptions]);

    const kcuOptions = useMemo(() => {
        // Jika regional dipilih, filter KCU berdasarkan data yang tersedia
        return filterOptions?.kcu_list || [];
    }, [filterOptions]);

    // Hitung jumlah filter aktif
    const activeFilterCount = useMemo(() => {
        let count = 0;
        if (searchQuery.trim()) count++;
        if (filterStatus) count++;
        if (filterRegional) count++;
        if (filterKcu) count++;
        if (dateFrom) count++;
        if (dateTo) count++;
        return count;
    }, [searchQuery, filterStatus, filterRegional, filterKcu, dateFrom, dateTo]);

    const resetFilters = () => {
        setSearchQuery('');
        setFilterStatus('');
        setFilterRegional('');
        setFilterKcu('');
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

            // Fetch filter options dan data secara parallel
            const [allData, options] = await Promise.all([
                pengajuanRepo.getPengajuanList({
                    limit: 9999,
                    page: 1,
                }),
                rekonsiliasiRepo.getFilterOptions().catch(() => null),
            ]);

            // Set filter options from API
            if (options) {
                setFilterOptions(options);
            }

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

        // Filter by kantor regional (petugas KC)
        if (filterRegional) {
            filtered = filtered.filter((item) => (item.petugas_kc_name || '') === filterRegional);
        }

        // Filter by kantor KCU
        if (filterKcu) {
            filtered = filtered.filter((item) => (item.petugas_kcu_name || '') === filterKcu);
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
    }, [searchQuery, filterStatus, filterRegional, filterKcu, dateFrom, dateTo, pengajuanList]);

    // Export to Excel
    const handleExportExcel = async () => {
        try {
            showLoading('Menyiapkan file Excel...');

            const ExcelJS = (await import('exceljs')).default;
            const workbook = new ExcelJS.Workbook();
            const worksheet = workbook.addWorksheet('Rekonsiliasi POS');

            // Helpers
            const toRp = (v?: number) =>
                v ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(v) : 'Rp 0';
            const fmtTgl = (s?: string) => {
                if (!s) return '-';
                const d = new Date(s);
                return `${String(d.getUTCDate()).padStart(2, '0')}-${String(d.getUTCMonth() + 1).padStart(2, '0')}-${d.getUTCFullYear()}`;
            };
            const fmtUsia = (months?: number) => {
                if (!months) return '-';
                const th = Math.floor(months / 12);
                const bl = months % 12;
                return bl > 0 ? `${th} tahun ${bl} bulan` : `${th} tahun`;
            };

            // Define columns
            worksheet.columns = [
                { header: 'NO', key: 'no', width: 5 },
                { header: 'TANGGAL PENGAJUAN', key: 'tgl_pengajuan', width: 22 },
                { header: 'TERAKHIR DIUPDATE', key: 'tgl_update', width: 22 },
                { header: 'STATUS', key: 'status', width: 30 },
                { header: 'CATATAN', key: 'catatan', width: 35 },
                { header: 'ALASAN PENOLAKAN', key: 'alasan_penolakan', width: 35 },
                { header: 'NIK', key: 'nik', width: 22 },
                { header: 'NAMA LENGKAP', key: 'nama', width: 30 },
                { header: 'MITRA', key: 'mitra', width: 20 },
                { header: 'JENIS KELAMIN', key: 'jenis_kelamin', width: 15 },
                { header: 'TEMPAT LAHIR', key: 'tempat_lahir', width: 20 },
                { header: 'TANGGAL LAHIR', key: 'tgl_lahir', width: 15 },
                { header: 'USIA', key: 'usia', width: 18 },
                { header: 'ALAMAT', key: 'alamat', width: 40 },
                { header: 'RT', key: 'rt', width: 6 },
                { header: 'RW', key: 'rw', width: 6 },
                { header: 'KELURAHAN', key: 'kelurahan', width: 20 },
                { header: 'KECAMATAN', key: 'kecamatan', width: 20 },
                { header: 'KABUPATEN', key: 'kabupaten', width: 20 },
                { header: 'PROVINSI', key: 'provinsi', width: 20 },
                { header: 'KODE POS', key: 'kode_pos', width: 10 },
                { header: 'NOMOR TELEPHONE', key: 'telepon', width: 18 },
                { header: 'NAMA IBU KANDUNG', key: 'ibu_kandung', width: 30 },
                { header: 'PENDIDIKAN TERAKHIR', key: 'pendidikan', width: 20 },
                { header: 'NOPEN', key: 'nopen', width: 20 },
                { header: 'JENIS PENSIUN', key: 'jenis_pensiun', width: 20 },
                { header: 'KANTOR BAYAR', key: 'kantor_bayar', width: 30 },
                { header: 'NAMA BANK', key: 'nama_bank', width: 20 },
                { header: 'NO REKENING', key: 'no_rekening', width: 22 },
                { header: 'NOMOR REKENING GIROPOS', key: 'giropos', width: 25 },
                { header: 'JENIS DAPEM', key: 'jenis_dapem', width: 20 },
                { header: 'BULAN DAPEM', key: 'bulan_dapem', width: 15 },
                { header: 'STATUS DAPEM', key: 'status_dapem', width: 15 },
                { header: 'GAJI BERSIH', key: 'gaji_bersih', width: 22 },
                { header: 'GAJI TERSEDIA', key: 'gaji_tersedia', width: 22 },
                { header: 'JENIS PELAYANAN', key: 'jenis_pelayanan', width: 22 },
                { header: 'JENIS PEMBIAYAAN', key: 'jenis_pembiayaan', width: 22 },
                { header: 'KATEGORI PEMBIAYAAN', key: 'kategori', width: 20 },
                { header: 'JANGKA WAKTU (BULAN)', key: 'jangka_waktu', width: 22 },
                { header: 'JUMLAH PEMBIAYAAN', key: 'jumlah_pembiayaan', width: 24 },
                { header: 'BESAR ANGSURAN', key: 'besar_angsuran', width: 22 },
                { header: 'TOTAL POTONGAN', key: 'total_potongan', width: 22 },
                { header: 'NOMINAL TERIMA', key: 'nominal_terima', width: 22 },
                { header: 'FEE PELAYANAN POS', key: 'fee_pelayanan_pos', width: 22 },
                { header: 'KANTOR POS PETUGAS', key: 'kantor_pos_petugas', width: 30 },
                { header: 'PETUGAS NIPPOS', key: 'nippos', width: 20 },
                { header: 'PETUGAS NAMA', key: 'petugas_nama', width: 30 },
                { header: 'PETUGAS NO. REKENING', key: 'petugas_rekening', width: 24 },
                { header: 'PETUGAS TELEPON', key: 'petugas_telepon', width: 18 },
                { header: 'PETUGAS KC', key: 'petugas_kc', width: 30 },
                { header: 'PETUGAS KCU', key: 'petugas_kcu', width: 30 },
                { header: 'PETUGAS KCP', key: 'petugas_kcp', width: 30 },
                { header: 'USER PEMBUAT', key: 'user_pembuat', width: 25 },
                { header: 'USERNAME PEMBUAT', key: 'username_pembuat', width: 22 },
                { header: 'ROLE PEMBUAT', key: 'role_pembuat', width: 18 },
                { header: 'UNIT', key: 'unit', width: 22 },
            ];

            // Style header row — light green background, bold, border
            const headerBorder: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FF4CAF50' } };
            const dataBorder: Partial<ExcelJS.Border> = { style: 'thin', color: { argb: 'FFD0D0D0' } };
            const headerRow = worksheet.getRow(1);
            headerRow.height = 32;
            headerRow.eachCell((cell) => {
                cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFC6EFCE' } };
                cell.font = { bold: true, size: 10, color: { argb: 'FF1A5E20' } };
                cell.alignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
                cell.border = { top: headerBorder, left: headerBorder, bottom: headerBorder, right: headerBorder };
            });

            // Add data rows
            filteredList.forEach((item, index) => {
                const row = worksheet.addRow({
                    no: index + 1,
                    tgl_pengajuan: item.created_at ? new Date(item.created_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
                    tgl_update: item.updated_at ? new Date(item.updated_at).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' }) : '-',
                    status: item.status || '-',
                    catatan: item.notes || '-',
                    alasan_penolakan: item.reject_reason || '-',
                    nik: item.nik || '-',
                    nama: item.nama_lengkap || '-',
                    mitra: item.mitra || '-',
                    jenis_kelamin: item.jenis_kelamin || '-',
                    tempat_lahir: item.tempat_lahir || '-',
                    tgl_lahir: fmtTgl(item.tanggal_lahir),
                    usia: fmtUsia(item.usia),
                    alamat: item.alamat || '-',
                    rt: item.rt || '-',
                    rw: item.rw || '-',
                    kelurahan: item.kelurahan || '-',
                    kecamatan: item.kecamatan || '-',
                    kabupaten: item.kabupaten || '-',
                    provinsi: item.provinsi || '-',
                    kode_pos: item.kode_pos || '-',
                    telepon: item.nomor_telephone || '-',
                    ibu_kandung: item.nama_ibu_kandung || '-',
                    pendidikan: item.pendidikan_terakhir || '-',
                    nopen: item.nopen || '-',
                    jenis_pensiun: item.jenis_pensiun || '-',
                    kantor_bayar: item.kantor_bayar || '-',
                    nama_bank: item.nama_bank || '-',
                    no_rekening: item.no_rekening || '-',
                    giropos: item.nomor_rekening_giro_pos || '-',
                    jenis_dapem: item.jenis_dapem || '-',
                    bulan_dapem: item.bulan_dapem || '-',
                    status_dapem: item.status_dapem || '-',
                    gaji_bersih: toRp(item.gaji_bersih),
                    gaji_tersedia: toRp(item.gaji_tersedia),
                    jenis_pelayanan: item.jenis_pelayanan?.name || '-',
                    jenis_pembiayaan: item.jenis_pembiayaan?.name || '-',
                    kategori: item.kategori_pembiayaan || '-',
                    jangka_waktu: item.jangka_waktu || 0,
                    jumlah_pembiayaan: toRp(item.jumlah_pembiayaan),
                    besar_angsuran: toRp(item.besar_angsuran),
                    total_potongan: toRp(item.total_potongan),
                    nominal_terima: toRp(item.nominal_terima),
                    fee_pelayanan_pos: toRp(item.fee_pelayanan_pos),
                    kantor_pos_petugas: item.kantor_pos_petugas || '-',
                    nippos: item.petugas_nippos || '-',
                    petugas_nama: item.petugas_name || '-',
                    petugas_rekening: item.petugas_account_no || '-',
                    petugas_telepon: item.petugas_phone || '-',
                    petugas_kc: item.petugas_kc_name || '-',
                    petugas_kcu: item.petugas_kcu_name || '-',
                    petugas_kcp: item.petugas_kcp_name || '-',
                    user_pembuat: item.user?.name || '-',
                    username_pembuat: item.user?.username || '-',
                    role_pembuat: item.user?.role || '-',
                    unit: item.unit || '-',
                });
                // Border + zebra stripe
                row.eachCell({ includeEmpty: true }, (cell) => {
                    cell.border = { top: dataBorder, left: dataBorder, bottom: dataBorder, right: dataBorder };
                    cell.alignment = { vertical: 'middle' };
                });
                if (index % 2 === 1) {
                    row.eachCell({ includeEmpty: true }, (cell) => {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF5F5F5' } };
                    });
                }
            });

            const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
            const filename = `Rekonsiliasi_POS_${timestamp}.xlsx`;

            const buffer = await workbook.xlsx.writeBuffer();
            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = filename;
            a.click();
            URL.revokeObjectURL(url);

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
        <div className="p-4 sm:p-6 space-y-6 w-full max-w-full min-w-0 overflow-x-hidden">
            {/* Header */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 w-full max-w-full min-w-0 overflow-hidden">
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

                    {/* Row 2: Filter Dropdowns */}
                    <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-3">
                        {/* Baris 1: Filter Status, Regional, KCU */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            <div className="flex items-center gap-2 text-slate-500 shrink-0">
                                <Filter className="h-4 w-4" />
                                <span className="text-sm font-medium text-slate-600">Filter:</span>
                            </div>

                            {/* Filter Status */}
                            <div className="relative min-w-0 w-full sm:w-auto sm:flex-1 sm:max-w-56">
                                <select
                                    value={filterStatus}
                                    onChange={(e) => setFilterStatus(e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white appearance-none"
                                >
                                    <option value="">Semua Status</option>
                                    {STATUS_OPTIONS.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Filter Kantor Regional */}
                            <div className="relative min-w-0 w-full sm:w-auto sm:flex-1 sm:max-w-64">
                                <select
                                    value={filterRegional}
                                    onChange={(e) => setFilterRegional(e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white appearance-none"
                                >
                                    <option value="">Semua Kantor Regional ({regionalOptions.length})</option>
                                    {regionalOptions.map((regional) => (
                                        <option key={regional} value={regional}>{regional}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Filter Kantor KCU */}
                            <div className="relative min-w-0 w-full sm:w-auto sm:flex-1 sm:max-w-64">
                                <select
                                    value={filterKcu}
                                    onChange={(e) => setFilterKcu(e.target.value)}
                                    className="w-full py-2 pl-3 pr-8 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white appearance-none"
                                >
                                    <option value="">Semua Kantor KCU ({kcuOptions.length})</option>
                                    {kcuOptions.map((kcu) => (
                                        <option key={kcu} value={kcu}>{kcu}</option>
                                    ))}
                                </select>
                                <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                            </div>

                            {/* Reset Filter */}
                            {activeFilterCount > 0 && (
                                <button
                                    onClick={resetFilters}
                                    className="inline-flex items-center justify-center gap-1.5 px-3 py-2 bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-600 text-sm font-medium rounded-lg transition-colors shrink-0"
                                >
                                    <X className="h-3.5 w-3.5" />
                                    Reset
                                    <span className="bg-rose-500 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                                        {activeFilterCount}
                                    </span>
                                </button>
                            )}
                        </div>

                        {/* Baris 2: Filter Range Tanggal */}
                        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 pt-2 border-t border-slate-200">
                            <div className="flex items-center gap-2 text-slate-500 shrink-0">
                                <Calendar className="h-4 w-4" />
                                <span className="text-sm font-medium text-slate-600">Periode:</span>
                            </div>

                            {/* Filter Tanggal Dari */}
                            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                                <span className="text-xs text-slate-500 shrink-0">Dari</span>
                                <input
                                    type="date"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                    className="w-full sm:w-44 py-2 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                    title="Tanggal Dari"
                                />
                            </div>

                            <span className="hidden sm:inline text-slate-400 text-sm shrink-0">s/d</span>

                            {/* Filter Tanggal Sampai */}
                            <div className="flex items-center gap-2 min-w-0 w-full sm:w-auto">
                                <span className="text-xs text-slate-500 shrink-0 sm:hidden">Sampai</span>
                                <input
                                    type="date"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                    className="w-full sm:w-44 py-2 px-3 border border-slate-300 rounded-lg text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none bg-white"
                                    title="Tanggal Sampai"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-200 w-full max-w-full min-w-0 overflow-hidden">
                <div
                    className="w-full max-w-full min-w-0 overflow-x-auto overflow-y-auto max-h-[600px] relative custom-scrollbar overscroll-x-contain"
                    style={{
                        scrollBehavior: 'smooth'
                    }}
                >
                    <table className="min-w-full w-max text-sm">
                        <thead className="bg-slate-50 border-b border-slate-200 sticky top-0 z-10 shadow-sm">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">No</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tanggal</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Status</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NIK</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Nama Lengkap</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Mitra</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NOPEN</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Jenis Pembiayaan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Jumlah Pembiayaan</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Tenor</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Angsuran</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Nominal Terima</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Fee Pelayanan POS</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">NIPPOS</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Petugas POS</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Rekening Petugas</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">KC</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">KCU</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">KCP</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-slate-600 uppercase tracking-wider whitespace-nowrap">Unit</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                            {filteredList.length === 0 ? (
                                <tr>
                                    <td colSpan={20} className="px-4 py-12 text-center">
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
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.mitra || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-mono text-xs">{item.nopen || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.jenis_pembiayaan?.name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-semibold">{formatMoney(item.jumlah_pembiayaan)}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.jangka_waktu} Bulan</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{formatMoney(item.besar_angsuran)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-emerald-600">{formatMoney(item.nominal_terima)}</td>
                                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-violet-600">{formatMoney(item.fee_pelayanan_pos)}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap font-mono text-xs">{item.petugas_nippos || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-600 whitespace-nowrap font-mono text-xs">{item.petugas_account_no || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_kc_name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_kcu_name || '-'}</td>
                                        <td className="px-4 py-3 text-slate-900 whitespace-nowrap">{item.petugas_kcp_name || '-'}</td>
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
                    <FileSpreadsheet className="h-5 w-5 text-blue-600 shrink-0 mt-0.5" />
                    <div className="flex-1">
                        <h3 className="text-sm font-semibold text-blue-900 mb-1">Informasi Export Excel</h3>
                        <p className="text-xs text-blue-800">
                            File Excel berisi data lengkap rekonsiliasi termasuk identitas pemohon, data pensiun, data keuangan, data pengajuan, dan data petugas POS (KC/KCU/KCP).
                            URL dokumen/file tidak disertakan dalam export.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};
