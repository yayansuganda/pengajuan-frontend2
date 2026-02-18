import React, { useState, useRef, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { usePengajuan } from '../usePengajuan';
import { ChevronRight, ChevronLeft, Check, Save, User, Briefcase, Calculator, Upload, Eye, AlertCircle, Download, X, FileText, Loader2, MinusCircle } from 'lucide-react';
import Swal from 'sweetalert2';
import { JenisPelayananRepositoryImpl } from '@/modules/jenis-pelayanan/data/RepositoryImpl';
import { JenisPembiayaanRepositoryImpl } from '@/modules/jenis-pembiayaan/data/RepositoryImpl';
import { JenisPelayanan } from '@/modules/jenis-pelayanan/core/Entity';
import { JenisPembiayaan } from '@/modules/jenis-pembiayaan/core/Entity';
import { PotonganRepositoryImpl } from '@/modules/potongan/data/RepositoryImpl';
import { Potongan } from '@/modules/potongan/core/Entity';
import { PotonganJangkaWaktuRepositoryImpl } from '@/modules/potongan-jangka-waktu/data/RepositoryImpl';
import { PotonganJangkaWaktu } from '@/modules/potongan-jangka-waktu/core/Entity';
import { SettingRepositoryImpl } from '@/modules/settings/data/RepositoryImpl';
import { Setting } from '@/modules/settings/core/Entity';
import { PengecekanRepositoryImpl } from '@/modules/pengecekan/data/PengecekanRepositoryImpl';
import { useAuth } from '@/modules/auth/presentation/useAuth';

const STEPS = [
    { number: 1, title: 'Data Pensiun', icon: Briefcase, description: 'Pelayanan & Bank' },
    { number: 2, title: 'Data Diri', icon: User, description: 'Informasi Pribadi' },
    { number: 3, title: 'Perhitungan', icon: Calculator, description: 'Simulasi Pembiayaan' },
    { number: 4, title: 'Dokumen', icon: Upload, description: 'Upload Berkas' },
    { number: 5, title: 'Review', icon: Eye, description: 'Konfirmasi' }
];

// Education levels list
const EDUCATION_LEVELS = [
    'SD',
    'SMP',
    'SMA/SMK',
    'D1',
    'D2',
    'D3',
    'D4',
    'S1',
    'S2',
    'S3',
    'Profesor'
];

// Document upload config - Required documents for pengajuan
// Other documents (Pengajuan Permohonan, Dokumen Akad, Flagging, Surat Pernyataan Beda Penerima)
// will be uploaded after approval
const UPLOAD_FIELDS = [
    { name: 'upload_ktp_pemohon', label: 'KTP Pemohon', hasTemplate: false, required: true },
    { name: 'upload_karip_buku_asabri', label: 'KARIP / Buku ASABRI', hasTemplate: false, required: true },
    { name: 'upload_slip_gaji_terakhir', label: 'Resi Penerimaan', hasTemplate: false, required: true },
    { name: 'upload_sk_pensiun', label: 'SK Pensiun', hasTemplate: false, required: false },
    { name: 'upload_surat_permohonan_anggota', label: 'Surat Permohonan Anggota & Pembiayaan', hasTemplate: true, required: true },
    { name: 'upload_borrower_photos', label: 'Foto Pemohon', hasTemplate: false, required: true, multiple: true },
];

// Helper function to calculate age from birth date
const calculateAge = (birthDate: string): string => {
    if (!birthDate) return '';

    const birth = new Date(birthDate);
    const today = new Date();

    let years = today.getFullYear() - birth.getFullYear();
    let months = today.getMonth() - birth.getMonth();

    if (months < 0) {
        years--;
        months += 12;
    }

    // Adjust for day of month
    if (today.getDate() < birth.getDate()) {
        months--;
        if (months < 0) {
            years--;
            months += 12;
        }
    }

    if (years <= 0 && months <= 0) return '';
    if (years === 0) return `${months} bulan`;
    if (months === 0) return `${years} tahun`;
    return `${years} tahun ${months} bulan`;
};

import { PengajuanRepositoryImpl } from '@/modules/pengajuan/data/PengajuanRepositoryImpl';

// Initial Form State
const INITIAL_FORM_STATE = {
    // Step 1 - Data Pensiun & Pelayanan
    jenis_pelayanan_id: '', jenis_pembiayaan_id: '', kategori_pembiayaan: '',
    // POS fields
    nopen: '', jenis_pensiun: '', nomor_rekening_giro_pos: '',
    // Non-POS fields
    nama_bank: '', no_rekening: '',
    // Common fields
    gaji_bersih: '', total_potongan_pinjaman: '', gaji_tersedia: '',
    jenis_dapem: '', bulan_dapem: '', status_dapem: '',

    // Step 2 - Data Diri
    nik: '', nama_lengkap: '', jenis_kelamin: 'Laki-laki', tempat_lahir: '', tanggal_lahir: '',
    usia: '', nomor_telephone: '', nama_ibu_kandung: '', pendidikan_terakhir: '',
    alamat: '', rt: '', rw: '', kode_pos: '', kelurahan: '', kecamatan: '', kabupaten: '', provinsi: '',

    // Step 3 - Perhitungan
    maksimal_jangka_waktu_usia: '', jangka_waktu: '', maksimal_pembiayaan: '', jumlah_pembiayaan: '',
    besar_angsuran: '', total_potongan: '', nominal_terima: '',
    kantor_bayar: '', // For non-POS
    kantor_pos_petugas: '', // For POS

    // Step 4 - Upload Dokumen
    upload_ktp_pemohon: '', upload_pengajuan_permohonan: '', upload_dokumen_akad: '',
    upload_flagging: '', upload_surat_pernyataan_beda_penerima: '', upload_karip_buku_asabri: '',
    upload_slip_gaji_terakhir: '', upload_sk_pensiun: '', upload_surat_permohonan_anggota: '', upload_borrower_photos: '',

    // Fronting User Data (from localStorage) - for POS
    petugas_nippos: '',
    petugas_name: '',
    petugas_account_no: '',
    petugas_phone: '',
    petugas_kcu_code: '',
    petugas_kcu_name: '',
    petugas_kc_code: '',
    petugas_kc_name: '',
    petugas_kcp_code: '',
    petugas_kcp_name: '',
};

export const CreatePengajuanWizard: React.FC<{ pengajuanId?: string }> = ({ pengajuanId }) => {
    const router = useRouter();
    const { user } = useAuth();
    const { createPengajuan, updatePengajuan } = usePengajuan();
    const [currentStep, setCurrentStep] = useState(1);
    const [fetchingDetail, setFetchingDetail] = useState(false);
    const [submitting, setSubmitting] = useState(false);
    const fileInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

    // Master data states
    const [jenisPelayananList, setJenisPelayananList] = useState<JenisPelayanan[]>([]);
    const [jenisPembiayaanList, setJenisPembiayaanList] = useState<JenisPembiayaan[]>([]);
    const [potonganList, setPotonganList] = useState<Potongan[]>([]);
    const [allPotonganList, setAllPotonganList] = useState<Potongan[]>([]); // All potongan including is_view = false
    const [potonganJangkaWaktuList, setPotonganJangkaWaktuList] = useState<PotonganJangkaWaktu[]>([]); // All potongan jangka waktu
    const [potonganJangkaWaktu, setPotonganJangkaWaktu] = useState<PotonganJangkaWaktu | null>(null);
    const [settings, setSettings] = useState<Setting | null>(null);
    const [loadingMasterData, setLoadingMasterData] = useState(true);

    // Initial Form State
    const [formData, setFormData] = useState(INITIAL_FORM_STATE);

    // Store file names for display
    const [fileNames, setFileNames] = useState<{ [key: string]: string }>({});

    // Upload loading states
    const [uploadingFiles, setUploadingFiles] = useState<{ [key: string]: boolean }>({});

    // Image preview URLs
    const [imagePreviews, setImagePreviews] = useState<{ [key: string]: string[] }>({});

    // Upload menu state
    const [showUploadMenu, setShowUploadMenu] = useState<string | null>(null);

    // Field errors state for inline validation
    const [fieldErrors, setFieldErrors] = useState<{ [key: string]: string }>({});

    // NOPEN API loading state
    const [loadingNopen, setLoadingNopen] = useState(false);

    // Debug: Log imagePreviews state changes
    useEffect(() => {
        console.log('🔄 imagePreviews state changed:', imagePreviews);
        Object.keys(imagePreviews).forEach(key => {
            if (imagePreviews[key]?.length > 0) {
                console.log(`  ✅ ${key}: ${imagePreviews[key].length} preview(s)`);
            }
        });
    }, [imagePreviews]);

    // Cleanup blob URLs on unmount
    useEffect(() => {
        return () => {
            console.log('🧹 Component unmounting, cleaning up blob URLs...');
            Object.values(imagePreviews).forEach(previews => {
                previews.forEach(url => {
                    if (url.startsWith('blob:')) {
                        URL.revokeObjectURL(url);
                        console.log(`🧹 Revoked: ${url}`);
                    }
                });
            });
        };
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Clear corrupted total_potongan on mount
    useEffect(() => {
        const currentTotal = parseFloat(formData.total_potongan);
        if (currentTotal > 100000000) { // If more than 100 million, likely corrupted
            console.warn('Clearing corrupted total_potongan:', formData.total_potongan);
            setFormData(prev => ({ ...prev, total_potongan: '' }));
        }
    }, []); // Only run once on mount

    // Fetch master data on mount
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                setLoadingMasterData(true);
                const pelayananRepo = new JenisPelayananRepositoryImpl();
                const pembiayaanRepo = new JenisPembiayaanRepositoryImpl();
                const potonganRepo = new PotonganRepositoryImpl();
                const potonganJangkaWaktuRepo = new PotonganJangkaWaktuRepositoryImpl();
                const settingRepo = new SettingRepositoryImpl();

                const [pelayananRes, pembiayaanRes, potonganRes, potonganJWRes, settingsRes] = await Promise.all([
                    pelayananRepo.getAll('', 1, 100),
                    pembiayaanRepo.getAll('', 1, 100),
                    potonganRepo.getAll(1, 100),
                    potonganJangkaWaktuRepo.getAll(1, 100),
                    settingRepo.getActive()
                ]);

                setJenisPelayananList(pelayananRes.data);
                setJenisPembiayaanList(pembiayaanRes.data);

                // Store all potongan for Ta'awun calculation
                setAllPotonganList(potonganRes.data.filter(p => p.is_active));

                // Filter only is_view = true and is_active = true for display
                setPotonganList(potonganRes.data.filter(p => p.is_view && p.is_active));

                // Store all potongan jangka waktu
                setPotonganJangkaWaktuList(potonganJWRes.data.filter((p: PotonganJangkaWaktu) => p.is_active));

                // Store settings (for jasa_perbulan)
                setSettings(settingsRes);
            } catch (error) {
                console.error('Failed to fetch master data:', error);
            } finally {
                setLoadingMasterData(false);
            }
        };

        fetchMasterData();
        fetchMasterData();
    }, []);

    // Auto-set Jenis Pelayanan to POS if user is Petugas Pos or Admin Pos
    useEffect(() => {
        // Only auto-set if:
        // 1. Not editing existing pengajuan (pengajuanId is not set)
        // 2. Jenis pelayanan list is loaded
        // 3. User role is petugas-pos or admin-pos
        if (pengajuanId || !jenisPelayananList.length) return;

        const isPetugasPos = user?.role === 'petugas-pos' || user?.role === 'admin-pos';
        if (!isPetugasPos) return;

        // Find POS jenis pelayanan
        const posJenisPelayanan = jenisPelayananList.find(jp => jp.name?.toUpperCase() === 'POS');

        if (posJenisPelayanan && formData.jenis_pelayanan_id !== posJenisPelayanan.id.toString()) {
            console.log('[CreatePengajuanWizard] Auto-setting Jenis Pelayanan to POS for user:', user?.role);
            setFormData(prev => ({
                ...prev,
                jenis_pelayanan_id: posJenisPelayanan.id.toString()
            }));
        }
    }, [jenisPelayananList, pengajuanId, user, formData.jenis_pelayanan_id]);

    // Auto-fill Petugas Pos data from localStorage (fronting_user)
    useEffect(() => {
        // Only for Petugas Pos/Admin Pos and not editing
        if (pengajuanId) return;

        const isPetugasPos = user?.role === 'petugas-pos' || user?.role === 'admin-pos';
        if (!isPetugasPos) return;

        // Get fronting user data from localStorage
        try {
            const frontingUserStr = localStorage.getItem('fronting_user');
            if (!frontingUserStr) {
                console.warn('[CreatePengajuanWizard] ⚠️ No fronting_user in localStorage');
                return;
            }

            const frontingUser = JSON.parse(frontingUserStr);
            console.log('[CreatePengajuanWizard] 📋 Auto-filling Petugas Pos data from localStorage:');
            console.log('  - NIPPOS:', frontingUser.nippos);
            console.log('  - Name:', frontingUser.name);
            console.log('  - KCU Name (for Kantor Pos Petugas):', frontingUser.kcu_name);

            setFormData(prev => {
                // Only update if not already filled (prevent overwrite)
                if (prev.petugas_nippos) {
                    console.log('[CreatePengajuanWizard] ℹ️ Data already filled, skipping...');
                    return prev;
                }

                console.log('[CreatePengajuanWizard] ✅ Filling formData with localStorage data');
                return {
                    ...prev,
                    // Auto-fill kantor_pos_petugas from kcu_name
                    kantor_pos_petugas: frontingUser.kcu_name || prev.kantor_pos_petugas,
                    // Save all fronting user data
                    petugas_nippos: frontingUser.nippos || '',
                    petugas_name: frontingUser.name || '',
                    petugas_account_no: frontingUser.account_no || '',
                    petugas_phone: frontingUser.phone || '',
                    petugas_kcu_code: frontingUser.kcu_code || '',
                    petugas_kcu_name: frontingUser.kcu_name || '',
                    petugas_kc_code: frontingUser.kc_code || '',
                    petugas_kc_name: frontingUser.kc_name || '',
                    petugas_kcp_code: frontingUser.kcp_code || '',
                    petugas_kcp_name: frontingUser.kcp_name || '',
                };
            });
        } catch (error) {
            console.error('[CreatePengajuanWizard] ❌ Error reading fronting_user from localStorage:', error);
        }
    }, [pengajuanId, user, currentStep]); // Tambahkan currentStep untuk re-run saat navigasi

    // Fetch existing data for editing
    useEffect(() => {
        if (!pengajuanId) return;

        const fetchDetail = async () => {
            try {
                setFetchingDetail(true);
                const repo = new PengajuanRepositoryImpl();
                const data = await repo.getPengajuanDetail(pengajuanId);

                if (data) {
                    console.log('📄 Fetched Pengajuan Detail:', data);

                    // Parse borrower photos
                    let borrowerPhotosStr = '';
                    let borrowerPhotosArr: string[] = [];
                    if (data.borrower_photos) {
                        try {
                            if (data.borrower_photos.startsWith('[')) {
                                borrowerPhotosArr = JSON.parse(data.borrower_photos);
                                // If it's an array, we might want to pass the JSON string to upload_borrower_photos?
                                // Actually upload logic expects array for previews but string for payload.
                                // For display we use imagePreviews.
                                borrowerPhotosStr = data.borrower_photos;
                            } else {
                                borrowerPhotosArr = [data.borrower_photos];
                                borrowerPhotosStr = data.borrower_photos;
                            }
                        } catch (e) {
                            borrowerPhotosArr = [data.borrower_photos];
                            borrowerPhotosStr = data.borrower_photos;
                        }
                    }

                    // Pre-fill One-to-One file mappings
                    const fileMappings: Record<string, string> = {
                        upload_ktp_pemohon: data.ktp_url || '',
                        upload_slip_gaji_terakhir: data.slip_gaji_url || '',
                        upload_karip_buku_asabri: data.karip_buku_asabri_url || '',
                        upload_surat_permohonan_anggota: (data as any).surat_permohonan_anggota_url || '', // Cast as any if missing in interface
                        upload_pengajuan_permohonan: data.pengajuan_permohonan_url || '',
                        upload_dokumen_akad: data.dokumen_akad_url || '',
                        upload_flagging: data.flagging_url || '',
                        upload_surat_pernyataan_beda_penerima: data.surat_pernyataan_beda_url || '',
                    };

                    // Set Previews
                    const newPreviews: Record<string, string[]> = {};
                    const newFileNames: Record<string, string> = {};

                    Object.entries(fileMappings).forEach(([key, url]) => {
                        if (url) {
                            newPreviews[key] = [url];
                            newFileNames[key] = 'File tersimpan';
                        }
                    });

                    if (borrowerPhotosArr.length > 0) {
                        newPreviews['upload_borrower_photos'] = borrowerPhotosArr;
                        newFileNames['upload_borrower_photos'] = `${borrowerPhotosArr.length} Foto tersimpan`;
                    }

                    setImagePreviews(newPreviews);
                    setFileNames(newFileNames);

                    // Populate Form Data
                    setFormData(prev => ({
                        ...prev,
                        // Data Diri
                        nik: data.nik || '',
                        nama_lengkap: data.nama_lengkap || '',
                        jenis_kelamin: data.jenis_kelamin || 'Laki-laki',
                        tempat_lahir: data.tempat_lahir || '',
                        tanggal_lahir: data.tanggal_lahir || '',
                        alamat: data.alamat || '',
                        rt: data.rt || '',
                        rw: data.rw || '',
                        kelurahan: data.kelurahan || '',
                        kecamatan: data.kecamatan || '',
                        kabupaten: data.kabupaten || '',
                        provinsi: data.provinsi || '',
                        kode_pos: data.kode_pos || '',
                        nomor_telephone: (data as any).nomor_telephone || '',
                        nama_ibu_kandung: data.nama_ibu_kandung || '',
                        pendidikan_terakhir: data.pendidikan_terakhir || '',
                        usia: data.usia ? `${data.usia} tahun` : '', // Convert number to string format

                        // Data Pensiun
                        nopen: data.nopen || '',
                        jenis_pensiun: data.jenis_pensiun || '',
                        kantor_bayar: data.kantor_bayar || '',
                        nama_bank: data.nama_bank || '',
                        no_rekening: data.no_rekening || '',
                        nomor_rekening_giro_pos: data.nomor_rekening_giro_pos || '',

                        // Data Dapem
                        jenis_dapem: data.jenis_dapem || '',
                        bulan_dapem: data.bulan_dapem || '',
                        status_dapem: data.status_dapem || '',
                        gaji_bersih: data.gaji_bersih?.toString() || '',
                        total_potongan_pinjaman: data.total_potongan?.toString() || '',
                        gaji_tersedia: data.gaji_tersedia?.toString() || '',

                        // Data Pengajuan
                        jenis_pelayanan_id: data.jenis_pelayanan?.id || data.jenis_pelayanan_id || '',
                        jenis_pembiayaan_id: data.jenis_pembiayaan?.id || data.jenis_pembiayaan_id || '',
                        maksimal_jangka_waktu_usia: data.maksimal_jangka_waktu_usia?.toString() || '',
                        jangka_waktu: data.jangka_waktu?.toString() || '',
                        maksimal_pembiayaan: data.maksimal_pembiayaan?.toString() || '',
                        jumlah_pembiayaan: data.jumlah_pembiayaan?.toString() || '',
                        besar_angsuran: data.besar_angsuran?.toString() || '',
                        total_potongan: data.total_potongan?.toString() || '',
                        nominal_terima: data.nominal_terima?.toString() || '',
                        kantor_pos_petugas: data.kantor_pos_petugas || '',

                        // Files (need to set these so validation passes)
                        ...fileMappings,
                        upload_borrower_photos: borrowerPhotosStr,
                    }));

                    // We might need to manually trigger calculations or just trust the values?
                    // Better to rely on fetched values for now.
                }

            } catch (err) {
                console.error("Failed to fetch detail for edit:", err);
            } finally {
                setFetchingDetail(false);
            }
        };

        fetchDetail();
    }, [pengajuanId]);

    // Auto-calculate age when birth date changes
    useEffect(() => {
        if (formData.tanggal_lahir) {
            const age = calculateAge(formData.tanggal_lahir);
            setFormData(prev => ({ ...prev, usia: age }));
        }
    }, [formData.tanggal_lahir]);

    // Auto-calculate Maks Jangka Waktu (Usia) when age, settings, or category changes
    useEffect(() => {
        if (formData.usia && settings) {
            // Check if Micro category is selected
            if (formData.kategori_pembiayaan === 'Micro' && settings.mikro_jangka_waktu > 0) {
                console.log('📊 Using Micro Setting for Jangka Waktu:', settings.mikro_jangka_waktu);
                setFormData(prev => ({ ...prev, maksimal_jangka_waktu_usia: settings.mikro_jangka_waktu.toString() }));
                return;
            }

            // Normal calculation for Macro or others
            if (settings.batas_usia_perhitungan_lunas) {
                // Extract age in months
                const tahunMatch = formData.usia.match(/(\d+)\s*tahun/);
                const bulanMatch = formData.usia.match(/(\d+)\s*bulan/);

                const tahunNum = tahunMatch ? parseInt(tahunMatch[1]) : 0;
                const bulanNum = bulanMatch ? parseInt(bulanMatch[1]) : 0;
                const ageInMonths = (tahunNum * 12) + bulanNum;

                // Convert batas_usia_perhitungan_lunas to months and subtract current age
                const batasUsiaBulan = settings.batas_usia_perhitungan_lunas * 12;
                const maksJangkaWaktu = batasUsiaBulan - ageInMonths;

                console.log('📊 Maks Jangka Waktu Calculation:', {
                    batasUsia: settings.batas_usia_perhitungan_lunas,
                    batasUsiaBulan,
                    ageInMonths,
                    maksJangkaWaktu
                });

                // Only set if positive
                if (maksJangkaWaktu > 0) {
                    // Use months directly
                    setFormData(prev => ({ ...prev, maksimal_jangka_waktu_usia: maksJangkaWaktu.toString() }));
                } else {
                    setFormData(prev => ({ ...prev, maksimal_jangka_waktu_usia: '0' }));
                }
            }
        }
    }, [formData.usia, settings, formData.kategori_pembiayaan]);

    // Auto-calculate Maks Pembiayaan when Gaji Tersedia, Maks Jangka Waktu, category or settings changes
    useEffect(() => {
        // Check if Micro category is selected
        if (formData.kategori_pembiayaan === 'Micro' && settings && settings.mikro_maksimal_pembiayaan > 0) {
            console.log('💰 Using Micro Setting for Max Pembiayaan:', settings.mikro_maksimal_pembiayaan);
            setFormData(prev => ({
                ...prev,
                maksimal_pembiayaan: Math.round(settings.mikro_maksimal_pembiayaan).toString()
            }));
            return;
        }

        // Normal calculation for Macro or others
        const gajiTersedia = parseFloat((formData.gaji_tersedia || '').replace(/\./g, '')) || 0;
        const maksJangkaWaktu = parseInt(formData.maksimal_jangka_waktu_usia) || 0;

        if (gajiTersedia > 0 && maksJangkaWaktu > 0) {
            // Calculate: Gaji Tersedia * Maks Jangka Waktu (in months)
            const maksPembiayaan = gajiTersedia * maksJangkaWaktu;

            console.log('💰 Maks Pembiayaan Calculation:', {
                gajiTersedia,
                maksJangkaWaktu: `${maksJangkaWaktu} bulan`,
                maksPembiayaan
            });

            // Store as raw number (no formatting)
            setFormData(prev => ({
                ...prev,
                maksimal_pembiayaan: Math.round(maksPembiayaan).toString()
            }));
        } else if (gajiTersedia === 0 || maksJangkaWaktu === 0) {
            // Clear if either is zero
            setFormData(prev => ({ ...prev, maksimal_pembiayaan: '' }));
        }
    }, [formData.gaji_tersedia, formData.maksimal_jangka_waktu_usia, formData.kategori_pembiayaan, settings]);

    // Find matching potongan jangka waktu based on jangka_waktu input
    useEffect(() => {
        // Parse and validate jangka_waktu
        const jangkaWaktu = parseInt(formData.jangka_waktu);

        // Only search if jangka_waktu is a valid positive number
        if (!isNaN(jangkaWaktu) && jangkaWaktu > 0) {
            // Find matching range from loaded data
            const matched = potonganJangkaWaktuList.find(
                p => p.min_bulan <= jangkaWaktu && p.max_bulan >= jangkaWaktu
            );
            setPotonganJangkaWaktu(matched || null);
        } else {
            // Clear potongan jangka waktu if input is invalid or empty
            setPotonganJangkaWaktu(null);
        }
    }, [formData.jangka_waktu, potonganJangkaWaktuList]);

    // Auto-calculate total potongan when plafond changes (including Ta'awun)
    useEffect(() => {
        // Parse plafond - ensure we only parse raw number (no dots)
        const rawPlafond = (formData.jumlah_pembiayaan || '').replace(/\./g, '');
        const plafondPengajuan = parseFloat(rawPlafond) || 0;

        if (plafondPengajuan > 0 && potonganList.length > 0) {
            const calculatePotonganValue = (potongan: Potongan): number => {
                if (potongan.kategori === 'persentase') {
                    return (potongan.persentase_nominal / 100) * plafondPengajuan;
                } else {
                    return potongan.persentase_nominal;
                }
            };

            // Calculate regular potongan
            let totalPotongan = potonganList.reduce((total, p) => total + calculatePotonganValue(p), 0);

            // Calculate Ta'awun
            // 1. Sum all percentage potongan with is_view = false
            const hiddenPercentageSum = allPotonganList
                .filter(p => p.kategori === 'persentase' && !p.is_view)
                .reduce((sum, p) => sum + p.persentase_nominal, 0);

            // 2. Get potongan_persen from potongan_jangka_waktu
            const potonganJWPersen = potonganJangkaWaktu?.potongan_persen || 0;

            // 3. Calculate Ta'awun percentage (DIBALIK: Potongan JW - Hidden Sum)
            const taawunPersen = potonganJWPersen - hiddenPercentageSum;

            // 4. Calculate Ta'awun value
            if (taawunPersen > 0) {
                const taawunValue = (taawunPersen / 100) * plafondPengajuan;
                totalPotongan += taawunValue;
            }

            // Round to avoid floating point precision issues and convert to integer
            const roundedTotal = Math.round(totalPotongan);

            // Debug logging
            if (roundedTotal > 100000000) { // If more than 100 million, something is wrong
                console.error('⚠️ Total potongan calculation error:', {
                    plafondPengajuan,
                    totalPotongan,
                    roundedTotal,
                    potonganList: potonganList.length,
                    hiddenSum: allPotonganList.filter(p => p.kategori === 'persentase' && !p.is_view).reduce((sum, p) => sum + p.persentase_nominal, 0),
                    potonganJW: potonganJangkaWaktu?.potongan_persen || 0
                });
            }

            setFormData(prev => ({ ...prev, total_potongan: roundedTotal.toString() }));
        } else {
            // Clear total potongan if no plafond or potongan list
            setFormData(prev => ({ ...prev, total_potongan: '' }));
        }
    }, [formData.jumlah_pembiayaan, potonganList, allPotonganList, potonganJangkaWaktu]);

    // Auto-calculate Angsuran/Bulan: (plafond / jangka_waktu) + (jasa_perbulan% x plafond)
    // Auto-calculate Angsuran/Bulan: (plafond / jangka_waktu) + (jasa_perbulan% x plafond)
    useEffect(() => {
        const rawPlafond = (formData.jumlah_pembiayaan || '').replace(/\./g, '');
        const plafond = parseFloat(rawPlafond) || 0;
        const jangkaWaktu = parseInt(formData.jangka_waktu) || 0;
        const jasaPerbulan = settings?.jasa_perbulan || 0;

        if (plafond > 0 && jangkaWaktu > 0) {
            // Rumus: (plafond / jangka_waktu) + (jasa_perbulan% x plafond)
            const angsuranPokok = plafond / jangkaWaktu;
            const jasaBulanNilai = (jasaPerbulan / 100) * plafond;
            const totalAngsuran = angsuranPokok + jasaBulanNilai;

            const roundedAngsuran = Math.round(totalAngsuran);

            // Check against Gaji Tersedia immediately
            const gajiTersedia = parseFloat((formData.gaji_tersedia || '').replace(/\./g, '')) || 0;
            const sisaGaji = gajiTersedia - roundedAngsuran;

            if (roundedAngsuran > sisaGaji) {
                console.log('⚠️ Warning: Angsuran melebihi sisa gaji (50% rule or similar)');
                // We don't set error here directly to avoid UI flickering, but we could if needed.
                // The main validation is in validateCurrentStep or on blur.
                // However, the user asked for immediate notification.
                // Let's rely on validateCurrentStep for blocking, but we can set error here if we want immediate feedback.
                // Actually, let's update the form data first.
            }

            setFormData(prev => ({ ...prev, besar_angsuran: roundedAngsuran.toString() }));

            // Trigger validation immediately
            if (gajiTersedia > 0 && roundedAngsuran > sisaGaji) {
                setFieldErrors(prev => ({
                    ...prev,
                    besar_angsuran: 'Angsuran tidak boleh lebih besar dari Sisa Gaji (Gaji Tersedia - Angsuran)'
                }));
            } else if (gajiTersedia > 0 && roundedAngsuran > 0 && sisaGaji < 100000) {
                setFieldErrors(prev => ({
                    ...prev,
                    besar_angsuran: 'Sisa Gaji (setelah angsuran) minimal Rp 100.000'
                }));
            } else {
                // Clear error if valid
                setFieldErrors(prev => {
                    const newErrors = { ...prev };
                    delete newErrors.besar_angsuran;
                    return newErrors;
                });
            }

        } else {
            setFormData(prev => ({ ...prev, besar_angsuran: '' }));
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors.besar_angsuran;
                return newErrors;
            });
        }
    }, [formData.jumlah_pembiayaan, formData.jangka_waktu, settings, formData.gaji_tersedia]);

    // Auto-calculate Terima Bersih: Plafond - Total Potongan
    useEffect(() => {
        const rawPlafond = (formData.jumlah_pembiayaan || '').replace(/\./g, '');
        const plafond = parseFloat(rawPlafond) || 0;
        const totalPotongan = parseFloat(formData.total_potongan) || 0;

        if (plafond > 0 && totalPotongan > 0) {
            const terimaBersih = plafond - totalPotongan;
            const roundedTerimaBersih = Math.round(terimaBersih);
            setFormData(prev => ({ ...prev, nominal_terima: roundedTerimaBersih.toString() }));
        } else if (plafond > 0) {
            setFormData(prev => ({ ...prev, nominal_terima: plafond.toString() }));
        } else {
            setFormData(prev => ({ ...prev, nominal_terima: '' }));
        }
    }, [formData.jumlah_pembiayaan, formData.total_potongan]);

    // Check if user is Petugas Pos or Admin Pos
    const isPetugasPos = useMemo(() => {
        return user?.role === 'petugas-pos' || user?.role === 'admin-pos';
    }, [user?.role]);

    // Check if selected jenis pelayanan is POS
    const isPOS = useMemo(() => {
        const selected = jenisPelayananList.find(jp => jp.id.toString() === formData.jenis_pelayanan_id);
        return selected?.name?.toUpperCase() === 'POS';
    }, [formData.jenis_pelayanan_id, jenisPelayananList]);

    // Format number to Indonesian format (12.500)
    const formatNumberID = (value: string | number): string => {
        if (!value || value === '0') return '';

        // Convert to string and clean
        let numStr = value.toString().trim();

        // Remove all dots (thousand separators)
        numStr = numStr.replace(/\./g, '');

        // Remove any non-digit characters except leading minus
        numStr = numStr.replace(/[^\d-]/g, '');

        // Check if valid number
        if (numStr === '' || numStr === '-' || isNaN(Number(numStr))) return '';

        // Convert to number and format
        const num = parseInt(numStr, 10);

        // Sanity check for reasonable values (max 1 trillion)
        if (Math.abs(num) > 1000000000000) {
            console.warn('Number too large:', num, 'Original value:', value);
            return '';
        }

        return num.toLocaleString('id-ID');
    };

    // Parse Indonesian format to raw number string
    const parseNumberID = (value: string): string => {
        return value.replace(/\./g, ''); // Remove dots (thousand separators)
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Strict Validation for NIK input - Only numbers and max 16 chars
        if (name === 'nik') {
            // Check if value contains non-numeric characters
            if (!/^\d*$/.test(value)) return;
            // Check max length
            if (value.length > 16) return;
        }

        setFormData(prev => ({ ...prev, [name]: value }));
        // Clear error when user starts typing
        if (fieldErrors[name]) {
            setFieldErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[name];
                return newErrors;
            });
        }
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        // Allow empty or numbers with dots (Indonesian format)
        if (value === '' || /^[0-9.]+$/.test(value)) {
            // Parse to raw number (remove dots)
            const rawValue = parseNumberID(value);
            // Validate it's a valid number
            if (rawValue === '' || /^[0-9]+$/.test(rawValue)) {

                // Specific validation for RT and RW - Max 3 digits
                if ((name === 'rt' || name === 'rw') && rawValue.length > 3) {
                    return; // Prevent input
                }

                // Specific validation for NIK - Max 16 digits (optional but good UX)
                if (name === 'nik' && rawValue.length > 16) {
                    return; // Prevent input
                }

                setFormData(prev => ({ ...prev, [name]: rawValue }));

                // Immediate Validation for Jangka Waktu
                if (name === 'jangka_waktu') {
                    const currentVal = parseInt(rawValue || '0');
                    const maxVal = parseInt(formData.maksimal_jangka_waktu_usia || '0');

                    if (maxVal > 0 && currentVal > maxVal) {
                        setFieldErrors(prev => ({
                            ...prev,
                            [name]: `Jangka waktu tidak boleh melebihi ${maxVal} bulan`
                        }));
                    } else if (currentVal > 0 && currentVal < 6) {
                        setFieldErrors(prev => ({
                            ...prev,
                            [name]: `Jangka waktu minimal 6 bulan`
                        }));
                    } else {
                        // Clear specific error if valid
                        if (fieldErrors[name]) {
                            setFieldErrors(prev => {
                                const newErrors = { ...prev };
                                delete newErrors[name];
                                return newErrors;
                            });
                        }
                    }
                } else {
                    // Default behavior: Clear error when user starts typing
                    if (fieldErrors[name]) {
                        setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[name];
                            return newErrors;
                        });
                    }
                }
            }
        }
    };

    // Fetch data from Pos Indonesia API when NOPEN is entered
    const handleNopenBlur = async () => {
        const nopen = formData.nopen.trim();

        // Only fetch if NOPEN is filled and isPOS
        if (!nopen || !isPOS) return;

        try {
            setLoadingNopen(true);
            const pengecekanRepo = new PengecekanRepositoryImpl();
            const data = await pengecekanRepo.checkPensiunan(nopen);

            // Calculate Gaji Tersedia (Available Salary)
            // UPDATE: User requested that POS API potongan should NOT reduce Gaji Tersedia. 
            // It should only be displayed.
            // So Gaji Tersedia = Gaji Bersih.
            const gajiBersih = data.gaji_bersih || 0;
            const totalPotonganAPI = data.potongan || 0; // Renamed to clarify source
            const gajiTersedia = gajiBersih; // DO NOT SUBTRACT totalPotonganAPI

            console.log('💰 Auto-calculating Gaji Tersedia (Ignored POS Potongan for calculation):');
            console.log('  - Gaji Bersih:', gajiBersih);
            console.log('  - Total Potongan (Display Only):', totalPotonganAPI);
            console.log('  - Gaji Tersedia (= Gaji Bersih):', gajiTersedia);

            // Auto-fill form fields with API data
            setFormData(prev => ({
                ...prev,
                // Data from API
                nama_lengkap: data.nama_lengkap || prev.nama_lengkap,
                jenis_pensiun: data.jenis_pensiun || prev.jenis_pensiun,
                jenis_dapem: data.jenis_dapem || prev.jenis_dapem,
                bulan_dapem: data.bulan_dapem || prev.bulan_dapem,
                status_dapem: data.status_dapem || prev.status_dapem,
                gaji_bersih: gajiBersih ? gajiBersih.toString() : prev.gaji_bersih,
                total_potongan_pinjaman: totalPotonganAPI ? totalPotonganAPI.toString() : prev.total_potongan_pinjaman, // Display Only
                gaji_tersedia: gajiTersedia ? gajiTersedia.toString() : prev.gaji_tersedia, // Equal to Gaji Bersih
                nomor_rekening_giro_pos: data.no_rekening || prev.nomor_rekening_giro_pos,
                kantor_pos_petugas: data.kantor_bayar || prev.kantor_pos_petugas,
            }));

            // Show success notification with potongan info
            const potonganInfo = totalPotonganAPI > 0
                ? `\n\nGaji Bersih: Rp ${gajiBersih.toLocaleString('id-ID')}\nPotongan (Display): Rp ${totalPotonganAPI.toLocaleString('id-ID')}\nGaji Tersedia: Rp ${gajiTersedia.toLocaleString('id-ID')}`
                : '';

            Swal.fire({
                icon: 'success',
                title: 'Data Ditemukan!',
                text: `Data pensiunan ${data.nama_lengkap} berhasil dimuat dari sistem Pos Indonesia.${potonganInfo}`,
                timer: 5000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });

        } catch (error: any) {
            console.error('Error fetching NOPEN data:', error);

            // Show error notification
            Swal.fire({
                icon: 'error',
                title: 'Data Tidak Ditemukan',
                text: error.message || 'Gagal mengambil data dari sistem Pos Indonesia. Silakan isi manual.',
                timer: 4000,
                showConfirmButton: false,
                toast: true,
                position: 'top-end'
            });
        } finally {
            setLoadingNopen(false);
        }
    };


    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>, fieldName: string, isMultiple: boolean = false) => {
        if (isMultiple) {
            // Handle multiple files - DIRECT PREVIEW APPROACH
            const files = Array.from(e.target.files || []);
            if (files.length > 0) {
                console.log(`📸 ========================================`);
                console.log(`📸 MULTIPLE FILES - NEW APPROACH`);
                console.log(`📸 Field: ${fieldName}, Files: ${files.length}`);

                const fileNamesArray = files.map(file => file.name);
                const imageFiles = files.filter(file => file.type.startsWith('image/'));

                // Set filenames
                setFileNames(prev => ({ ...prev, [fieldName]: fileNamesArray.join(', ') }));

                // Read all images as base64
                if (imageFiles.length > 0) {
                    console.log(`📸 Reading ${imageFiles.length} images as base64...`);

                    const readers = imageFiles.map((file, idx) => {
                        return new Promise<string>((resolve) => {
                            const reader = new FileReader();
                            reader.onloadend = () => {
                                const base64 = reader.result as string;
                                console.log(`📸 ✅ Image ${idx + 1} ready: ${base64.substring(0, 50)}...`);
                                resolve(base64);
                            };
                            reader.onerror = () => {
                                console.error(`📸 ❌ Image ${idx + 1} failed`);
                                resolve('');
                            };
                            reader.readAsDataURL(file);
                        });
                    });

                    Promise.all(readers).then(base64Array => {
                        const validPreviews = base64Array.filter(b => b !== '');
                        console.log(`📸 All ${validPreviews.length} images ready!`);

                        setImagePreviews(prev => {
                            const newState = { ...prev, [fieldName]: validPreviews };
                            console.log(`📸 State updated with ${validPreviews.length} previews`);
                            return newState;
                        });

                        console.log(`🖼️ ✅ ALL PREVIEWS READY!`);
                    });
                }

                console.log(`📸 ========================================`);

                // NOW start upload in background
                setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
                try {
                    // Upload each file to server
                    const uploadPromises = files.map(async (file) => {
                        const uploadFormData = new FormData();
                        uploadFormData.append('file', file);

                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                            method: 'POST',
                            headers: {
                                'Authorization': `Bearer ${localStorage.getItem('token')}`,
                            },
                            body: uploadFormData,
                        });

                        if (!response.ok) {
                            throw new Error(`Upload failed for ${file.name}`);
                        }

                        const data = await response.json();
                        return data.url; // Backend returns { url: "/uploads/filename.jpg" }
                    });

                    const uploadedUrls = await Promise.all(uploadPromises);

                    // Store server URLs as JSON array string
                    setFormData(prev => ({ ...prev, [fieldName]: JSON.stringify(uploadedUrls) }));

                    // File names and previews already set above, keep them
                    console.log('✅ Upload successful, server URLs stored, previews kept');

                    // Clear error when upload success
                    if (fieldErrors[fieldName]) {
                        setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[fieldName];
                            return newErrors;
                        });
                    }
                } catch (error) {
                    console.error('Error uploading files:', error);
                    setFieldErrors(prev => ({ ...prev, [fieldName]: 'Gagal mengupload file. Pastikan file tidak melebihi 5MB dan format sesuai.' }));
                    // Clear preview on error
                    setImagePreviews(prev => ({ ...prev, [fieldName]: [] }));
                } finally {
                    setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
                }
            }
        } else {
            // Handle single file - DIRECT PREVIEW APPROACH
            const file = e.target.files?.[0];
            if (file) {
                console.log(`📸 ========================================`);
                console.log(`📸 SINGLE FILE - NEW APPROACH`);
                console.log(`📸 Field: ${fieldName}`);
                console.log(`📸 File:`, file.name, file.type, file.size);

                // Set filename first
                setFileNames(prev => ({ ...prev, [fieldName]: file.name }));

                // For images: Use FileReader with base64 (most reliable)
                if (file.type.startsWith('image/')) {
                    console.log(`📸 Reading as base64...`);

                    const reader = new FileReader();
                    reader.onloadend = () => {
                        const base64String = reader.result as string;
                        console.log(`📸 ✅ Base64 ready:`, base64String.substring(0, 50) + '...');
                        console.log(`📸 Length:`, base64String.length);

                        // Direct state update with base64
                        setImagePreviews(prev => {
                            const newState = { ...prev, [fieldName]: [base64String] };
                            console.log(`📸 State updated:`, fieldName, 'has preview:', newState[fieldName]?.length > 0);
                            return newState;
                        });

                        // Force a re-render by updating a timestamp
                        console.log(`🖼️ ✅ PREVIEW READY! Base64 length: ${base64String.length}`);
                    };

                    reader.onerror = () => {
                        console.error(`📸 ❌ FileReader failed!`);
                    };

                    reader.readAsDataURL(file);
                } else {
                    console.log(`📸 Not an image`);
                }

                console.log(`📸 ========================================`)

                // NOW start upload in background
                setUploadingFiles(prev => ({ ...prev, [fieldName]: true }));
                try {
                    // Upload file to server
                    const uploadFormData = new FormData();
                    uploadFormData.append('file', file);

                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/upload`, {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${localStorage.getItem('token')}`,
                        },
                        body: uploadFormData,
                    });

                    if (!response.ok) {
                        throw new Error('Upload failed');
                    }

                    const data = await response.json();
                    const fileUrl = data.url; // Backend returns { url: "/uploads/filename.jpg" }

                    // Store server URL
                    setFormData(prev => ({ ...prev, [fieldName]: fileUrl }));

                    // File name and preview already set above, keep them
                    console.log('✅ Upload successful, server URL stored, preview kept');

                    // Clear error when upload success
                    if (fieldErrors[fieldName]) {
                        setFieldErrors(prev => {
                            const newErrors = { ...prev };
                            delete newErrors[fieldName];
                            return newErrors;
                        });
                    }
                } catch (error) {
                    console.error('Error uploading file:', error);
                    setFieldErrors(prev => ({ ...prev, [fieldName]: 'Gagal mengupload file. Pastikan file tidak melebihi 5MB dan format sesuai.' }));
                    // Clear preview on error
                    setImagePreviews(prev => ({ ...prev, [fieldName]: [] }));
                } finally {
                    setUploadingFiles(prev => ({ ...prev, [fieldName]: false }));
                }
            }
        }
    };

    const handleRemoveFile = (fieldName: string) => {
        // Revoke blob URLs to prevent memory leak
        const previews = imagePreviews[fieldName];
        if (previews) {
            previews.forEach(url => {
                if (url.startsWith('blob:')) {
                    URL.revokeObjectURL(url);
                    console.log(`🗑️ Revoked blob URL: ${url}`);
                }
            });
        }

        // Clear all file-related state
        setFormData(prev => ({ ...prev, [fieldName]: '' }));
        setFileNames(prev => ({ ...prev, [fieldName]: '' }));
        setImagePreviews(prev => ({ ...prev, [fieldName]: [] }));
        if (fileInputRefs.current[fieldName]) {
            fileInputRefs.current[fieldName]!.value = '';
        }
        console.log(`🗑️ Removed file for ${fieldName}`);
    };

    const nextStep = () => {
        // Validate required fields based on current step
        if (!validateCurrentStep()) {
            return;
        }

        if (currentStep < STEPS.length) {
            // Clear errors when moving to next step
            setFieldErrors({});
            setCurrentStep(curr => curr + 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const validateCurrentStep = (): boolean => {
        const errors: { [key: string]: string } = {};

        // Step 1: Data Pensiun & Pelayanan
        if (currentStep === 1) {
            if (!formData.jenis_pelayanan_id) errors.jenis_pelayanan_id = 'Jenis Pelayanan wajib dipilih';
            if (!formData.jenis_pembiayaan_id) errors.jenis_pembiayaan_id = 'Jenis Pembiayaan wajib dipilih';
            if (!formData.kategori_pembiayaan) errors.kategori_pembiayaan = 'Kategori Pembiayaan wajib dipilih';
        }

        // Step 2: Data Diri
        if (currentStep === 2) {
            if (!formData.nik) {
                errors.nik = 'NIK wajib diisi';
            } else if (formData.nik.length !== 16) {
                errors.nik = 'NIK harus 16 digit';
            }
            if (!formData.nama_lengkap) errors.nama_lengkap = 'Nama Lengkap wajib diisi';
            if (!formData.jenis_kelamin) errors.jenis_kelamin = 'Jenis Kelamin wajib dipilih';
            if (!formData.tempat_lahir) errors.tempat_lahir = 'Tempat Lahir wajib diisi';
            if (!formData.tanggal_lahir) errors.tanggal_lahir = 'Tanggal Lahir wajib diisi';
            if (!formData.nomor_telephone) errors.nomor_telephone = 'Nomor Telephone wajib diisi';
            if (!formData.pendidikan_terakhir) errors.pendidikan_terakhir = 'Pendidikan Terakhir wajib dipilih';

            // Optional: Add validation for RT/RW if they are filled
            if (formData.rt && formData.rt.length > 3) errors.rt = 'RT maksimal 3 digit';
            if (formData.rw && formData.rw.length > 3) errors.rw = 'RW maksimal 3 digit';
        }

        // Step 3: Perhitungan
        if (currentStep === 3) {
            // Validate Jangka Waktu
            const jangkaWaktu = parseInt(formData.jangka_waktu) || 0;
            const maksJangkaWaktu = parseInt(formData.maksimal_jangka_waktu_usia) || 0;

            if (!formData.jangka_waktu) {
                errors.jangka_waktu = 'Jangka Waktu wajib diisi';
            } else if (jangkaWaktu > maksJangkaWaktu) {
                errors.jangka_waktu = `Jangka Waktu tidak boleh lebih dari Maksimal (${maksJangkaWaktu} bulan)`;
            } else if (jangkaWaktu < 6) {
                errors.jangka_waktu = 'Jangka Waktu minimal 6 bulan';
            }

            if (!formData.jumlah_pembiayaan || parseFloat((formData.jumlah_pembiayaan || '').replace(/\./g, '')) <= 0) {
                errors.jumlah_pembiayaan = 'Jumlah Pengajuan wajib diisi dan harus lebih dari 0';
            } else if (parseFloat((formData.jumlah_pembiayaan || '').replace(/\./g, '')) < 1000000) {
                errors.jumlah_pembiayaan = 'Jumlah Pengajuan minimal Rp 1.000.000';
            }

            // Validate Sisa Gaji must be at least 100,000 more than Biaya Angsuran
            const besarAngsuran = parseFloat((formData.besar_angsuran || '').replace(/\./g, '')) || 0;
            const gajiTersedia = parseFloat((formData.gaji_tersedia || '').replace(/\./g, '')) || 0;
            const sisaGaji = gajiTersedia - besarAngsuran;

            // Check if Angsuran exceeds Sisa Gaji (User's specific request: "Angsuran/Bulan" lebih besar dari "Sisa Gaji")
            // Interpretation: If Angsuran > Sisa Gaji (where Sisa Gaji = Gaji Tersedia - Angsuran), 
            // effectively meaning Angsuran > (GajiTersedia / 2). 
            // BUT, usually "Sisa Gaji" refers to the final remaining amount.
            // If the user means "Angsuran > Gaji Tersedia", that's invalid.
            // If the user means "Angsuran > Current Sisa Gaji displayed", that's recursive.
            // Let's assume the standard: Sisa Gaji (Net Income after new installment) must be positive and > Angsuran?
            // "Angsuran lebih besar dari Sisa Gaji" -> Angsuran > (Gaji Tersedia - Angsuran)
            // Example: Gaji 5jt, Angsuran 3jt. Sisa = 2jt. Angsuran (3jt) > Sisa (2jt). ERROR.
            // Example: Gaji 5jt, Angsuran 2jt. Sisa = 3jt. Angsuran (2jt) < Sisa (3jt). OK.

            if (besarAngsuran > sisaGaji) {
                errors.besar_angsuran = 'Angsuran/Bulan tidak boleh lebih besar dari Sisa Gaji';
                errors.gaji_tersedia = 'Pendapatan tidak mencukupi (Ratio angsuran terlalu besar)';
            }
            // Also check the absolute minimum buffer
            else if (besarAngsuran > 0 && sisaGaji < 100000) {
                errors.besar_angsuran = 'Sisa Gaji setelah angsuran minimal Rp 100.000';
                errors.gaji_tersedia = 'Sisa Gaji tidak mencukupi (minimal Rp 100.000 setelah angsuran)';
            }
        }

        // Step 4: Upload Dokumen
        if (currentStep === 4) {
            UPLOAD_FIELDS.forEach(field => {
                if (field.required && !formData[field.name as keyof typeof formData]) {
                    errors[field.name] = `${field.label} wajib diupload`;
                }
            });
        }

        setFieldErrors(errors);

        if (Object.keys(errors).length > 0) {
            // Scroll to first error
            const firstErrorField = Object.keys(errors)[0];
            const element = document.getElementById(firstErrorField);
            if (element) {
                element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                element.focus();
            }
            return false;
        }

        return true;
    };

    const prevStep = () => {
        if (currentStep > 1) {
            // Clear errors when moving to previous step
            setFieldErrors({});
            setCurrentStep(curr => curr - 1);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSubmit = async () => {
        try {
            setSubmitting(true);

            // Validate required fields
            const submitErrors: { [key: string]: string } = {};
            if (!formData.nik || !formData.nama_lengkap) {
                if (!formData.nik) submitErrors.nik = 'NIK wajib diisi';
                if (!formData.nama_lengkap) submitErrors.nama_lengkap = 'Nama Lengkap wajib diisi';
            }

            if (!formData.jumlah_pembiayaan || parseFloat((formData.jumlah_pembiayaan || '').replace(/\./g, '')) <= 0) {
                submitErrors.jumlah_pembiayaan = 'Jumlah Pembiayaan wajib diisi dan harus lebih dari 0';
            }

            if (Object.keys(submitErrors).length > 0) {
                setFieldErrors(submitErrors);
                setSubmitting(false);
                // Scroll to first error
                const firstErrorField = Object.keys(submitErrors)[0];
                const element = document.getElementById(firstErrorField);
                if (element) {
                    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
                return;
            }

            // Extract and convert age to total months for API
            // Format: "45 tahun 6 bulan" or "45 tahun" or "6 bulan"
            const tahunMatch = formData.usia.match(/(\d+)\s*tahun/);
            const bulanMatch = formData.usia.match(/(\d+)\s*bulan/);

            const tahunNum = tahunMatch ? parseInt(tahunMatch[1]) : 0;
            const bulanNum = bulanMatch ? parseInt(bulanMatch[1]) : 0;

            // Convert to total months: (years * 12) + months
            const usiaNum = (tahunNum * 12) + bulanNum;

            console.log('📅 Age Calculation:', {
                original: formData.usia,
                tahun: tahunNum,
                bulan: bulanNum,
                totalBulan: usiaNum
            });

            // Build potongan_detail JSON array
            const rawPlafond = (formData.jumlah_pembiayaan || '').replace(/\./g, '');
            const plafond = parseFloat(rawPlafond) || 0;

            const potonganDetailArray: any[] = [];

            // Add regular potongan (is_view = true)
            potonganList.forEach(p => {
                const nilai = p.kategori === 'persentase'
                    ? (p.persentase_nominal / 100) * plafond
                    : p.persentase_nominal;

                potonganDetailArray.push({
                    nama: p.nama_potongan,
                    kategori: p.kategori,
                    persentase_nominal: p.persentase_nominal,
                    nilai: Math.round(nilai)
                });
            });

            // Add Ta'awun if applicable
            const hiddenPercentageSum = allPotonganList
                .filter(p => p.kategori === 'persentase' && !p.is_view)
                .reduce((sum, p) => sum + p.persentase_nominal, 0);
            const potonganJWPersen = potonganJangkaWaktu?.potongan_persen || 0;
            const taawunPersen = potonganJWPersen - hiddenPercentageSum;

            if (taawunPersen > 0) {
                const taawunValue = (taawunPersen / 100) * plafond;
                potonganDetailArray.push({
                    nama: "Ta'awun",
                    kategori: 'persentase',
                    persentase_nominal: parseFloat(taawunPersen.toFixed(2)),
                    nilai: Math.round(taawunValue)
                });
            }

            // Build payload matching backend CreateLoanRequest structure
            const payload = {
                // Data Diri
                nik: (formData.nik || '').replace(/\./g, ''), // Remove dots from formatted NIK
                nama_lengkap: formData.nama_lengkap,
                jenis_kelamin: formData.jenis_kelamin,
                tempat_lahir: formData.tempat_lahir,
                tanggal_lahir: formData.tanggal_lahir,
                alamat: formData.alamat,
                rt: formData.rt,
                rw: formData.rw,
                kelurahan: formData.kelurahan,
                kecamatan: formData.kecamatan,
                kabupaten: formData.kabupaten,
                provinsi: formData.provinsi,
                kode_pos: formData.kode_pos,
                nomor_telephone: formData.nomor_telephone,
                nama_ibu_kandung: formData.nama_ibu_kandung,
                pendidikan_terakhir: formData.pendidikan_terakhir,
                usia: usiaNum,

                // Data Pensiun
                nopen: formData.nopen,
                jenis_pensiun: formData.jenis_pensiun,
                kantor_bayar: formData.kantor_bayar,
                nama_bank: formData.nama_bank,
                no_rekening: formData.no_rekening,
                nomor_rekening_giro_pos: formData.nomor_rekening_giro_pos,

                // Data Dapem & Keuangan
                jenis_dapem: formData.jenis_dapem,
                bulan_dapem: formData.bulan_dapem,
                status_dapem: formData.status_dapem,
                gaji_bersih: parseFloat((formData.gaji_bersih || '').replace(/\./g, '')) || 0,
                gaji_tersedia: parseFloat((formData.gaji_tersedia || '').replace(/\./g, '')) || 0,

                // Data Pengajuan
                jenis_pelayanan_id: formData.jenis_pelayanan_id,
                jenis_pembiayaan_id: formData.jenis_pembiayaan_id,
                maksimal_jangka_waktu_usia: parseInt(formData.maksimal_jangka_waktu_usia) || 0,
                jangka_waktu: parseInt(formData.jangka_waktu) || 0,
                maksimal_pembiayaan: parseFloat((formData.maksimal_pembiayaan || '').replace(/\./g, '')) || 0,
                jumlah_pembiayaan: parseFloat((formData.jumlah_pembiayaan || '').replace(/\./g, '')) || 0,
                besar_angsuran: parseFloat((formData.besar_angsuran || '').replace(/\./g, '')) || 0,
                total_potongan: parseFloat((formData.total_potongan || '').replace(/\./g, '')) || 0,
                potongan_detail: JSON.stringify(potonganDetailArray),
                nominal_terima: parseFloat((formData.nominal_terima || '').replace(/\./g, '')) || 0,
                kantor_pos_petugas: formData.kantor_pos_petugas,

                // Data Petugas POS (from localStorage fronting_user)
                petugas_nippos: formData.petugas_nippos || '',
                petugas_name: formData.petugas_name || '',
                petugas_account_no: formData.petugas_account_no || '',
                petugas_phone: formData.petugas_phone || '',
                petugas_kcu_code: formData.petugas_kcu_code || '',
                petugas_kcu_name: formData.petugas_kcu_name || '',
                petugas_kc_code: formData.petugas_kc_code || '',
                petugas_kc_name: formData.petugas_kc_name || '',
                petugas_kcp_code: formData.petugas_kcp_code || '',
                petugas_kcp_name: formData.petugas_kcp_name || '',

                // Files & Metadata
                ktp_url: formData.upload_ktp_pemohon || '',
                slip_gaji_url: formData.upload_slip_gaji_terakhir || '',
                borrower_photos: formData.upload_borrower_photos || '',
                pengajuan_permohonan_url: formData.upload_pengajuan_permohonan || '',
                dokumen_akad_url: formData.upload_dokumen_akad || '',
                flagging_url: formData.upload_flagging || '',
                surat_pernyataan_beda_url: formData.upload_surat_pernyataan_beda_penerima || '',
                karip_buku_asabri_url: formData.upload_karip_buku_asabri || '',
                surat_permohonan_anggota_url: formData.upload_surat_permohonan_anggota || '',
                latitude: 0,
                longitude: 0,
                approval: 'Pending',
            };

            // Debug log
            console.log('📤 Submitting payload:', {
                nik: payload.nik,
                nama_lengkap: payload.nama_lengkap,
                jumlah_pembiayaan: payload.jumlah_pembiayaan,
                potongan_detail: payload.potongan_detail
            });

            // Send to Backend
            console.log('🚀 Payload:', payload);

            if (pengajuanId) {
                await updatePengajuan(pengajuanId, payload);
            } else {
                await createPengajuan(payload);
            }

            // Show Success UI
            await Swal.fire({
                title: 'Berhasil!',
                text: pengajuanId ? 'Data pengajuan berhasil diperbarui.' : 'Pengajuan baru telah berhasil disimpan.',
                icon: 'success',
                confirmButtonText: 'Tutup',
                confirmButtonColor: '#059669', // Emerald 600
                showConfirmButton: false,
                timer: 2000
            });

            // Redirect based on user role 
            // OR Reset form if creating
            if (pengajuanId) {
                // If editing, redirect back
                if (isPetugasPos) {
                    console.log('[CreatePengajuanWizard] ✅ Redirecting Petugas Pos to /fronting');
                    router.push('/fronting');
                } else {
                    console.log('[CreatePengajuanWizard] ✅ Redirecting to /pengajuan');
                    router.push('/pengajuan');
                }
            } else {
                // If creating, reset form to allow new submission
                console.log('[CreatePengajuanWizard] 🔄 Resetting form for new submission');
                setFormData(INITIAL_FORM_STATE);
                setFileNames({});
                setImagePreviews({});
                setUploadingFiles({});
                setFieldErrors({});
                setCurrentStep(1);

                // Reset file inputs
                Object.values(fileInputRefs.current).forEach(input => {
                    if (input) input.value = '';
                });

                window.scrollTo({ top: 0, behavior: 'smooth' });
            }

        } catch (error: any) {
            console.error('Submit Error:', error);
            // Error handling is done in usePengajuan
        } finally {
            setSubmitting(false);
        }
    };

    const inputClasses = "block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm px-3 py-2 text-gray-900 bg-white placeholder-gray-400 border";
    const labelClasses = "block text-sm font-semibold text-gray-900 mb-1";

    const renderInput = (label: string, name: string, type: string = "text", required: boolean = false, placeholder: string = "", isNumber: boolean = false, disabled: boolean = false) => {
        const rawValue = formData[name as keyof typeof formData];
        // For number inputs, format the display value. For date/other types, use raw value
        const displayValue = isNumber ? formatNumberID(rawValue) : rawValue;
        // Use text type for number formatting, otherwise use actual type (date, text, etc)
        const inputType = isNumber ? "text" : type;
        const hasError = fieldErrors[name];

        return (
            <div className="col-span-1">
                <label htmlFor={name} className={labelClasses}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <input
                    type={inputType}
                    name={name}
                    id={name}
                    required={required}
                    disabled={disabled}
                    className={`${inputClasses} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder={placeholder}
                    value={displayValue}
                    onChange={isNumber ? handleNumberChange : handleChange}
                />
                {hasError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {hasError}
                    </p>
                )}
            </div>
        );
    };

    const renderSelect = (label: string, name: string, options: { value: string; label: string }[], required: boolean = false, loading: boolean = false, disabled: boolean = false) => {
        const hasError = fieldErrors[name];

        return (
            <div className="col-span-1">
                <label htmlFor={name} className={labelClasses}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <div className="relative">
                    <select
                        name={name}
                        id={name}
                        required={required}
                        className={`${inputClasses} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''} ${disabled ? 'bg-gray-100 cursor-not-allowed' : ''}`}
                        value={formData[name as keyof typeof formData]}
                        onChange={handleChange}
                        disabled={loading || disabled}
                    >
                        <option value="">{loading ? 'Memuat...' : 'Pilih...'}</option>
                        {options.map(opt => (
                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                        ))}
                    </select>
                    {loading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
                        </div>
                    )}
                </div>
                {hasError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {hasError}
                    </p>
                )}
            </div>
        );
    };

    const renderSimpleSelect = (label: string, name: string, options: string[], required: boolean = false) => {
        const hasError = fieldErrors[name];

        return (
            <div className="col-span-1">
                <label htmlFor={name} className={labelClasses}>
                    {label} {required && <span className="text-red-500">*</span>}
                </label>
                <select
                    name={name}
                    id={name}
                    required={required}
                    className={`${inputClasses} ${hasError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}`}
                    value={formData[name as keyof typeof formData]}
                    onChange={handleChange}
                >
                    <option value="">Pilih...</option>
                    {options.map(opt => (
                        <option key={opt} value={opt}>{opt}</option>
                    ))}
                </select>
                {hasError && (
                    <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                        <AlertCircle className="w-4 h-4" />
                        {hasError}
                    </p>
                )}
            </div>
        );
    };

    // Step 1: Data Diri
    const renderStep1 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full mb-2">
                <h3 className="text-lg font-bold text-gray-900">Informasi Pribadi</h3>
            </div>

            {renderInput("NIK", "nik", "text", true, "16 nomor identitas", false)}
            {renderInput("Nama Lengkap", "nama_lengkap", "text", true, "Sesuai KTP")}
            {renderSimpleSelect("Jenis Kelamin", "jenis_kelamin", ["Laki-laki", "Perempuan"], true)}
            {renderInput("Tempat Lahir", "tempat_lahir", "text", true)}
            {renderInput("Tanggal Lahir", "tanggal_lahir", "date", true)}
            {renderInput("Usia", "usia", "text", false, "", false, true)}
            {renderInput("Nomor Telephone", "nomor_telephone", "tel", true, "08xxxxxxxxxx")}
            {renderInput("Nama Ibu Kandung", "nama_ibu_kandung")}
            {renderSimpleSelect("Pendidikan Terakhir", "pendidikan_terakhir", EDUCATION_LEVELS, true)}

            <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Alamat Domisili</h3>
            </div>
            <div className="col-span-full">
                <label htmlFor="alamat" className={labelClasses}>Alamat Lengkap</label>
                <textarea
                    name="alamat"
                    id="alamat"
                    rows={2}
                    className={inputClasses}
                    value={formData.alamat}
                    onChange={handleChange}
                    placeholder="Nama Jalan, Komplek, No. Rumah"
                />
            </div>
            <div className="grid grid-cols-2 gap-4 col-span-1">
                {renderInput("RT", "rt", "text", false, "000", true)}
                {renderInput("RW", "rw", "text", false, "000", true)}
            </div>
            {renderInput("Kode Pos", "kode_pos", "text", false, "", false)}
            {renderInput("Desa / Kelurahan", "kelurahan")}
            {renderInput("Kecamatan", "kecamatan")}
            {renderInput("Kabupaten / Kota", "kabupaten")}
            {renderInput("Provinsi", "provinsi")}
        </div>
    );

    // Step 2: Data Pensiun & Pelayanan
    const renderStep2 = () => (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="col-span-full mb-2">
                <h3 className="text-lg font-bold text-gray-900">Data Pelayanan</h3>
            </div>
            {/* Hidden field untuk Petugas Pos / Admin Pos saat create */}
            {isPetugasPos && !pengajuanId ? (
                <div className="col-span-1">
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                        <div className="flex items-center gap-2">
                            <AlertCircle className="w-4 h-4 text-blue-600" />
                            <div>
                                <p className="text-sm font-semibold text-blue-900">Jenis Pelayanan: POS</p>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="col-span-1">
                    {renderSelect(
                        "Jenis Pelayanan",
                        "jenis_pelayanan_id",
                        jenisPelayananList.map(jp => ({ value: jp.id.toString(), label: jp.name })),
                        true,
                        loadingMasterData,
                        false
                    )}
                </div>
            )}


            {/* Conditional fields based on jenis_pelayanan */}
            {isPOS ? (
                <>
                    {/* POS specific fields */}
                    <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Data Pensiun (POS)</h3>
                    </div>
                    {/* NOPEN with API integration */}
                    <div className="col-span-1">
                        <label htmlFor="nopen" className={labelClasses}>
                            Nopen <span className="text-sm text-gray-500">(Nomor Pensiun)</span>
                        </label>
                        <div className="relative">
                            <input
                                type="text"
                                name="nopen"
                                id="nopen"
                                className={`${inputClasses} ${loadingNopen ? 'pr-10' : ''}`}
                                placeholder="Masukkan NOPEN untuk auto-fill data"
                                value={formData.nopen}
                                onChange={handleChange}
                                onBlur={handleNopenBlur}
                            />
                            {loadingNopen && (
                                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                                    <Loader2 className="w-5 h-5 text-indigo-600 animate-spin" />
                                </div>
                            )}
                        </div>
                        <p className="mt-1 text-xs text-gray-500">
                            💡 Data akan otomatis terisi dari sistem Pos Indonesia setelah input NOPEN
                        </p>
                    </div>
                    {renderInput("Jenis Pensiun", "jenis_pensiun")}
                    {renderInput("No Giro Pos", "nomor_rekening_giro_pos", "text", false, "", false)}

                    <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Data Keuangan</h3>
                    </div>
                    {renderInput("Gaji Bersih", "gaji_bersih", "number", false, "Rp", true)}
                    {renderInput("Total Potongan Pinjaman", "total_potongan_pinjaman", "number", false, "Rp", true)}
                    {renderInput("Gaji Tersedia", "gaji_tersedia", "number", false, "Rp", true)}
                    {renderInput("Jenis Dapem", "jenis_dapem")}
                    {renderInput("Bulan Dapem", "bulan_dapem")}
                    {renderInput("Status Dapem", "status_dapem")}
                </>
            ) : (
                <>
                    {/* Non-POS specific fields */}
                    <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Rekening Bank</h3>
                    </div>
                    {renderInput("Nama Bank", "nama_bank")}
                    {renderInput("No Rekening", "no_rekening", "text", false, "", false)}

                    <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                        <h3 className="text-lg font-bold text-gray-900">Data Keuangan</h3>
                    </div>
                    {renderInput("Gaji Bersih", "gaji_bersih", "number", false, "Rp", true)}
                    {renderInput("Total Potongan Pinjaman", "total_potongan_pinjaman", "number", false, "Rp", true)}
                    {renderInput("Gaji Tersedia", "gaji_tersedia", "number", false, "Rp", true)}
                </>
            )}

            <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                <h3 className="text-lg font-bold text-gray-900">Detail Pembiayaan</h3>
            </div>
            {renderSelect(
                "Jenis Pembiayaan",
                "jenis_pembiayaan_id",
                jenisPembiayaanList.map(jp => ({ value: jp.id.toString(), label: jp.name })),
                true,
                loadingMasterData
            )}
            {renderSimpleSelect(
                "Kategori Pembiayaan",
                "kategori_pembiayaan",
                ["Macro", "Micro"],
                true
            )}

            {/* Show hint if no jenis pelayanan selected */}
            {!formData.jenis_pelayanan_id && (
                <div className="col-span-full mt-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
                    <p className="text-sm text-blue-700">
                        <AlertCircle className="w-4 h-4 inline mr-2" />
                        Pilih jenis pelayanan untuk menampilkan form yang sesuai.
                    </p>
                </div>
            )}
        </div>
    );

    // Step 3: Perhitungan
    const renderStep3 = () => {
        // Parse plafond - ensure we only parse raw number (no dots) 
        const rawPlafond = (formData.jumlah_pembiayaan || '').replace(/\./g, '');
        const plafondPengajuan = parseFloat(rawPlafond) || 0;

        const calculatePotonganValue = (potongan: Potongan): number => {
            if (potongan.kategori === 'persentase') {
                return (potongan.persentase_nominal / 100) * plafondPengajuan;
            } else {
                return potongan.persentase_nominal;
            }
        };

        const formatRupiah = (amount: number): string => {
            return new Intl.NumberFormat('id-ID', {
                style: 'currency',
                currency: 'IDR',
                minimumFractionDigits: 0,
                maximumFractionDigits: 0
            }).format(amount);
        };

        // Calculate total potongan for display (including Ta'awun)
        let totalPotongan = potonganList.reduce((total, p) => total + calculatePotonganValue(p), 0);

        // Add Ta'awun to total if applicable
        const hiddenPercentageSum = allPotonganList
            .filter(p => p.kategori === 'persentase' && !p.is_view)
            .reduce((sum, p) => sum + p.persentase_nominal, 0);
        const potonganJWPersen = potonganJangkaWaktu?.potongan_persen || 0;
        const taawunPersen = potonganJWPersen - hiddenPercentageSum; // DIBALIK: Potongan JW - Hidden Sum
        if (taawunPersen > 0) {
            const taawunValue = (taawunPersen / 100) * plafondPengajuan;
            totalPotongan += taawunValue;
        }

        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="col-span-full mb-2">
                    <h3 className="text-lg font-bold text-gray-900">Simulasi Pembiayaan</h3>
                </div>
                {renderInput("Maks Jangka Waktu (Bln)", "maksimal_jangka_waktu_usia", "number", false, "Bulan", true, true)}
                {renderInput("Jangka Waktu (Bln)", "jangka_waktu", "number", true, "Bulan", true)}
                {renderInput("Maks Pembiayaan", "maksimal_pembiayaan", "number", false, "Rp", true, true)}
                {renderInput("Jumlah Pengajuan", "jumlah_pembiayaan", "number", true, "Rp", true)}

                {/* Daftar Potongan */}
                {potonganList.length > 0 && plafondPengajuan > 0 && (
                    <div className="col-span-full mt-4 mb-2">
                        <div className="flex items-center gap-2 mb-3">
                            <MinusCircle className="h-5 w-5 text-indigo-600" />
                            <h3 className="text-base font-semibold text-gray-900">Rincian Potongan</h3>
                        </div>
                        <div className="bg-indigo-50 rounded-lg p-4 border border-indigo-200">
                            <ul className="space-y-2">
                                {potonganList.map((potongan) => {
                                    const nilaiPotongan = calculatePotonganValue(potongan);
                                    return (
                                        <li key={potongan.id} className="flex items-center justify-between text-sm">
                                            <span className="text-gray-700">
                                                {potongan.nama_potongan}
                                            </span>
                                            <span className="font-semibold text-indigo-700">{formatRupiah(nilaiPotongan)}</span>
                                        </li>
                                    );
                                })}

                                {/* Ta'awun Calculation */}
                                {taawunPersen > 0 && (
                                    <li className="flex items-center justify-between text-sm">
                                        <span className="text-gray-700">
                                            Ta'awun
                                        </span>
                                        <span className="font-semibold text-indigo-700">
                                            {formatRupiah((taawunPersen / 100) * plafondPengajuan)}
                                        </span>
                                    </li>
                                )}

                                <li className="flex items-center justify-between text-sm pt-2 mt-2 border-t border-indigo-300">
                                    <span className="font-bold text-gray-900">Total Potongan</span>
                                    <span className="font-bold text-indigo-700">{formatRupiah(totalPotongan)}</span>
                                </li>
                            </ul>
                        </div>
                    </div>
                )}

                <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                    <h3 className="text-lg font-bold text-gray-900">Detail Pembayaran</h3>
                </div>
                {renderInput("Angsuran / Bulan", "besar_angsuran", "number", false, "Rp", true, true)}
                {renderInput("Total Potongan", "total_potongan", "number", false, "Rp", true, true)}
                {renderInput("Terima Bersih", "nominal_terima", "number", false, "Rp", true, true)}

                {!isPOS && (
                    <>
                        <div className="col-span-full mt-4 mb-2 pt-4 border-t border-gray-100">
                            <h3 className="text-lg font-bold text-gray-900">Kantor</h3>
                        </div>
                        {renderInput("Kantor Bayar", "kantor_bayar")}
                    </>
                )}
            </div>
        );
    };

    // Step 4: Upload Dokumen with Modern Preview Box
    const renderStep4 = () => {
        const renderUploadBox = (field: typeof UPLOAD_FIELDS[0]) => {
            const isMultiple = field.multiple || false;
            const acceptType = field.name === 'upload_borrower_photos' ? 'image/*' : 'image/*,.pdf';
            const hasFile = !!fileNames[field.name];
            const isUploading = uploadingFiles[field.name];
            const previews = imagePreviews[field.name] || [];
            const hasError = fieldErrors[field.name];

            // Debug: Log render state
            console.log(`🎯 renderUploadBox for ${field.name}:`, {
                hasFile,
                isUploading,
                previewsLength: previews.length,
                fileNames: fileNames[field.name],
                willShowPreview: !isUploading && hasFile && previews.length > 0
            });

            return (
                <div key={field.name} id={field.name} className="relative">
                    <div className="flex items-center justify-between mb-2">
                        <label className="block text-sm font-semibold text-gray-900">
                            {field.label}
                            {field.required && <span className="text-red-500 ml-1">*</span>}
                            {isMultiple && <span className="text-xs text-gray-500 ml-2">(Multiple files)</span>}
                        </label>

                        {/* Template Download Button */}
                        {field.hasTemplate && (
                            <a
                                href="/templates/SURAT_PERMOHONAN_ANGGOTA_PEMBIAYAAN.pdf"
                                target="_blank"
                                rel="noopener noreferrer"
                                onClick={(e) => {
                                    e.preventDefault();
                                    // Show info that template is not available yet
                                    Swal.fire({
                                        icon: 'info',
                                        title: 'Template Belum Tersedia',
                                        text: 'Template Surat Permohonan Anggota & Pembiayaan belum tersedia. Silakan hubungi admin untuk mendapatkan template.',
                                        confirmButtonText: 'OK',
                                        confirmButtonColor: '#3B82F6'
                                    });
                                }}
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors cursor-pointer"
                            >
                                <Download className="w-3.5 h-3.5" />
                                Download Template
                            </a>
                        )}
                    </div>

                    {/* Upload Box with Preview */}
                    <div className="relative group">
                        {/* Input Hidden - File Upload */}
                        <input
                            ref={(el) => { fileInputRefs.current[field.name] = el; }}
                            type="file"
                            className="hidden"
                            accept={acceptType}
                            multiple={isMultiple}
                            disabled={isUploading}
                            onChange={(e) => handleFileChange(e, field.name, isMultiple)}
                        />

                        {/* Input Hidden - Camera */}
                        <input
                            ref={(el) => { fileInputRefs.current[`${field.name}_camera`] = el; }}
                            type="file"
                            className="hidden"
                            accept="image/*"
                            capture
                            multiple={isMultiple}
                            disabled={isUploading}
                            onChange={(e) => handleFileChange(e, field.name, isMultiple)}
                        />

                        {/* Upload/Preview Box */}
                        <div
                            onClick={() => {
                                if (!isUploading) {
                                    // Jika "Surat Permohonan Anggota & Pembiayaan", langsung buka file picker
                                    if (field.name === 'upload_surat_permohonan_anggota') {
                                        fileInputRefs.current[field.name]?.click();
                                    } else {
                                        setShowUploadMenu(showUploadMenu === field.name ? null : field.name);
                                    }
                                }
                            }}
                            className={`
                                relative overflow-hidden rounded-xl border-2 border-dashed transition-all duration-200
                                ${isUploading ? 'border-blue-400 bg-blue-50 cursor-wait' :
                                    hasFile ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 cursor-pointer hover:border-green-600' :
                                        hasError ? 'border-red-500 bg-red-50 cursor-pointer hover:border-red-600' :
                                            'border-gray-300 bg-gray-50 cursor-pointer hover:border-indigo-500 hover:bg-indigo-50'}
                            `}
                            style={{ minHeight: isMultiple ? '240px' : '180px' }}
                        >
                            {/* Loading State */}
                            {isUploading && (
                                <div className="absolute inset-0 flex flex-col items-center justify-center bg-blue-50 bg-opacity-90 z-10">
                                    <Loader2 className="w-12 h-12 text-blue-600 animate-spin mb-3" />
                                    <p className="text-sm font-medium text-blue-700">Mengupload...</p>
                                </div>
                            )}

                            {/* SIMPLIFIED PREVIEW RENDERING */}
                            {(() => {
                                const showPreview = !isUploading && hasFile && previews.length > 0;
                                console.log(`🎨 RENDER CHECK ${field.name}:`, {
                                    isUploading,
                                    hasFile,
                                    previewsLength: previews.length,
                                    showPreview
                                });

                                if (!isUploading && hasFile && previews.length > 0) {
                                    console.log(`✅ SHOWING PREVIEW for ${field.name}`);
                                    return (
                                        <div className="p-6">
                                            {/* Preview Images */}
                                            <div className="flex flex-wrap gap-4 justify-center mb-4">
                                                {previews.map((src, idx) => {
                                                    console.log(`🖼️ Image ${idx}: ${src.substring(0, 50)}... (${src.length} chars)`);
                                                    return (
                                                        <div key={idx} className="w-32 h-32">
                                                            <img
                                                                src={src}
                                                                alt={`Preview ${idx + 1}`}
                                                                className="w-full h-full object-cover rounded-lg border-4 border-green-500 shadow-xl"
                                                                style={{ backgroundColor: '#ffffff' }}
                                                                onLoad={() => console.log(`✅ IMG ${idx} LOADED`)}
                                                                onError={(e) => {
                                                                    console.error(`❌ IMG ${idx} ERROR`);
                                                                    (e.target as HTMLImageElement).style.backgroundColor = '#ff0000';
                                                                }}
                                                            />
                                                        </div>
                                                    );
                                                })}
                                            </div>

                                            {/* Filename */}
                                            <div className="text-center">
                                                <p className="text-sm font-bold text-green-700">{fileNames[field.name]}</p>
                                                <p className="text-xs text-gray-500 mt-1">Klik box untuk ganti</p>
                                            </div>
                                        </div>
                                    );
                                }

                                return null;
                            })()}

                            {/* No Preview State */}
                            {!isUploading && hasFile && previews.length === 0 && (() => {
                                console.log(`⚠️ NO PREVIEW: ${field.name}, file: ${fileNames[field.name]}, previews: ${previews.length}`);
                                return (
                                    <div className="p-6 flex flex-col items-center justify-center h-full">
                                        <FileText className="w-16 h-16 text-orange-500 mb-3" />
                                        <p className="text-sm font-medium text-orange-700">{fileNames[field.name]}</p>
                                        <p className="text-xs text-gray-500 mt-2">Preview not available</p>
                                        <div className="mt-3 px-3 py-2 bg-yellow-50 rounded border border-yellow-300">
                                            <p className="text-xs text-yellow-700 font-mono">
                                                Previews: {previews.length}<br />
                                                Check Console (F12)
                                            </p>
                                        </div>
                                    </div>
                                );
                            })()}

                            {/* Empty State */}
                            {!isUploading && !hasFile && (
                                <div className="p-6 flex flex-col items-center justify-center h-full text-center">
                                    <div className="w-16 h-16 rounded-full bg-indigo-100 flex items-center justify-center mb-4 group-hover:bg-indigo-200 transition-colors">
                                        <Upload className="w-8 h-8 text-indigo-600" />
                                    </div>
                                    <p className="text-sm font-semibold text-gray-900 mb-1">
                                        Klik untuk upload {field.label.toLowerCase()}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {acceptType === 'image/*' ? 'JPG, PNG (Max 5MB)' : 'JPG, PNG, PDF (Max 5MB)'}
                                    </p>
                                </div>
                            )}

                            {/* Remove Button (Floating) */}
                            {!isUploading && hasFile && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        handleRemoveFile(field.name);
                                    }}
                                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg hover:bg-red-600 transition-colors z-20"
                                    title="Hapus file"
                                >
                                    <X className="w-4 h-4" />
                                </button>
                            )}

                            {/* Upload Options Menu - Skip for Surat Permohonan Anggota */}
                            {showUploadMenu === field.name && !isUploading && field.name !== 'upload_surat_permohonan_anggota' && (
                                <div
                                    className="absolute inset-0 bg-white/95 backdrop-blur-sm z-30 flex items-center justify-center p-4"
                                    onClick={(e) => e.stopPropagation()}
                                >
                                    <div className="w-full max-w-xs space-y-3">
                                        <div className="text-center mb-4">
                                            <h4 className="text-sm font-bold text-gray-900">{hasFile ? 'Ganti File' : 'Pilih Metode Upload'}</h4>
                                            <p className="text-xs text-gray-500 mt-1">{hasFile ? 'Pilih metode untuk mengganti file' : 'Pilih dari file atau ambil foto langsung'}</p>
                                        </div>

                                        {/* File Upload Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadMenu(null);
                                                fileInputRefs.current[field.name]?.click();
                                            }}
                                            className="w-full flex items-center gap-3 p-4 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors shadow-md"
                                        >
                                            <Upload className="w-5 h-5" />
                                            <div className="text-left">
                                                <div className="text-sm font-semibold">Upload dari File</div>
                                                <div className="text-xs opacity-90">Pilih file dari galeri/storage</div>
                                            </div>
                                        </button>

                                        {/* Camera Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadMenu(null);
                                                fileInputRefs.current[`${field.name}_camera`]?.click();
                                            }}
                                            className="w-full flex items-center gap-3 p-4 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors shadow-md"
                                        >
                                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                                            </svg>
                                            <div className="text-left">
                                                <div className="text-sm font-semibold">Ambil Foto</div>
                                                <div className="text-xs opacity-90">Gunakan kamera perangkat</div>
                                            </div>
                                        </button>

                                        {/* Cancel Button */}
                                        <button
                                            type="button"
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setShowUploadMenu(null);
                                            }}
                                            className="w-full p-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                                        >
                                            Batal
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Error Message */}
                    {hasError && (
                        <div className="mt-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                            <p className="text-sm text-red-600 flex items-center gap-2">
                                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                                <span>{hasError}</span>
                            </p>
                        </div>
                    )}
                </div>
            );
        };

        return (
            <div className="space-y-6">
                <div className="mb-6">
                    <h3 className="text-lg font-bold text-gray-900">Upload Dokumen Pengajuan</h3>
                    <p className="text-sm text-gray-500 mt-1">Unggah dokumen yang diperlukan untuk proses pengajuan.</p>

                    {/* Info Banner */}
                    <div className="mt-3 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                        <p className="text-xs text-blue-700 flex items-start gap-2">
                            <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                            <span>
                                Dokumen lainnya (Pengajuan Permohonan, Dokumen Akad, Flagging, Surat Pernyataan) akan diupload setelah pengajuan di-approve.
                            </span>
                        </p>
                    </div>


                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {UPLOAD_FIELDS.map((field) => renderUploadBox(field))}
                </div>
            </div>
        );
    };

    // Step 5: Preview
    const renderStep5 = () => {
        const formatCurrency = (value: string) => {
            const num = Number(value);
            if (isNaN(num) || num === 0) return '-';
            return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(num);
        };

        // Get selected names from master data
        const selectedPelayanan = jenisPelayananList.find(jp => jp.id.toString() === formData.jenis_pelayanan_id);
        const selectedPembiayaan = jenisPembiayaanList.find(jp => jp.id.toString() === formData.jenis_pembiayaan_id);

        const PreviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
            <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                    <h4 className="text-sm font-bold text-gray-900">{title}</h4>
                </div>
                <div className="px-4 py-4">
                    <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-3">
                        {children}
                    </dl>
                </div>
            </div>
        );

        const PreviewItem = ({ label, value }: { label: string; value: string }) => (
            <div>
                <dt className="text-xs font-medium text-gray-500 uppercase">{label}</dt>
                <dd className="mt-0.5 text-sm text-gray-900">{value || '-'}</dd>
            </div>
        );

        return (
            <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-l-4 border-indigo-500 p-4 rounded-r-lg shadow-sm">
                    <div className="flex">
                        <div className="flex-shrink-0">
                            <AlertCircle className="h-5 w-5 text-indigo-500" aria-hidden="true" />
                        </div>
                        <div className="ml-3">
                            <p className="text-sm text-indigo-700 font-bold">
                                Konfirmasi Data Pengajuan
                            </p>
                            <p className="text-xs text-indigo-600 mt-1">
                                Pastikan semua data sudah benar sebelum menyimpan.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Data Diri */}
                <PreviewSection title="Data Diri">
                    <PreviewItem label="NIK" value={formData.nik} />
                    <PreviewItem label="Nama Lengkap" value={formData.nama_lengkap} />
                    <PreviewItem label="Jenis Kelamin" value={formData.jenis_kelamin} />
                    <PreviewItem label="Tempat, Tanggal Lahir" value={`${formData.tempat_lahir}, ${formData.tanggal_lahir}`} />
                    <PreviewItem label="Usia" value={formData.usia} />
                    <PreviewItem label="Nomor Telephone" value={formData.nomor_telephone} />
                    <PreviewItem label="Nama Ibu Kandung" value={formData.nama_ibu_kandung} />
                    <PreviewItem label="Pendidikan Terakhir" value={formData.pendidikan_terakhir} />
                    <div className="sm:col-span-2">
                        <dt className="text-xs font-medium text-gray-500 uppercase">Alamat</dt>
                        <dd className="mt-0.5 text-sm text-gray-900">
                            {formData.alamat ? `${formData.alamat}, RT ${formData.rt}/RW ${formData.rw}, ${formData.kelurahan}, ${formData.kecamatan}, ${formData.kabupaten}, ${formData.provinsi} ${formData.kode_pos}` : '-'}
                        </dd>
                    </div>
                </PreviewSection>

                {/* Data Pensiun & Pelayanan */}
                <PreviewSection title="Data Pensiun & Pelayanan">
                    <PreviewItem label="Jenis Pelayanan" value={selectedPelayanan?.name || ''} />
                    <PreviewItem label="Jenis Pembiayaan" value={selectedPembiayaan?.name || ''} />
                    {isPOS ? (
                        <>
                            <PreviewItem label="Nopen" value={formData.nopen} />
                            <PreviewItem label="Jenis Pensiun" value={formData.jenis_pensiun} />
                            <PreviewItem label="No Giro Pos" value={formData.nomor_rekening_giro_pos} />
                            <PreviewItem label="Jenis Dapem" value={formData.jenis_dapem} />
                            <PreviewItem label="Bulan Dapem" value={formData.bulan_dapem} />
                            <PreviewItem label="Status Dapem" value={formData.status_dapem} />
                        </>
                    ) : (
                        <>
                            <PreviewItem label="Nama Bank" value={formData.nama_bank} />
                            <PreviewItem label="No Rekening" value={formData.no_rekening} />
                        </>
                    )}
                    <PreviewItem label="Gaji Bersih" value={formatCurrency(formData.gaji_bersih)} />
                    <PreviewItem label="Total Potongan Pinjaman" value={formatCurrency(formData.total_potongan_pinjaman)} />
                    <PreviewItem label="Gaji Tersedia" value={formatCurrency(formData.gaji_tersedia)} />
                </PreviewSection>

                {/* Perhitungan */}
                <PreviewSection title="Perhitungan Pembiayaan">
                    <PreviewItem label="Maks Jangka Waktu" value={formData.maksimal_jangka_waktu_usia ? `${formData.maksimal_jangka_waktu_usia} Tahun` : ''} />
                    <PreviewItem label="Jangka Waktu" value={formData.jangka_waktu ? `${formData.jangka_waktu} Bulan` : ''} />
                    <PreviewItem label="Maks Pembiayaan" value={formatCurrency(formData.maksimal_pembiayaan)} />
                    <PreviewItem label="Jumlah Pengajuan" value={formatCurrency(formData.jumlah_pembiayaan)} />
                    <PreviewItem label="Angsuran/Bulan" value={formatCurrency(formData.besar_angsuran)} />
                    <PreviewItem label="Total Potongan" value={formatCurrency(formData.total_potongan)} />
                    <PreviewItem label="Terima Bersih" value={formatCurrency(formData.nominal_terima)} />
                    {isPOS ? (
                        <PreviewItem label="Petugas Pos" value={formData.kantor_pos_petugas} />
                    ) : (
                        <PreviewItem label="Kantor Bayar" value={formData.kantor_bayar} />
                    )}
                </PreviewSection>

                {/* Dokumen dengan Preview */}
                <div className="bg-white rounded-lg border border-gray-200 overflow-hidden">
                    <div className="px-4 py-3 bg-gray-50 border-b border-gray-200">
                        <h4 className="text-sm font-bold text-gray-900">Dokumen</h4>
                    </div>
                    <div className="px-4 py-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {UPLOAD_FIELDS.map((field) => {
                                const hasPreview = imagePreviews[field.name] && imagePreviews[field.name].length > 0;
                                const previews = imagePreviews[field.name] || [];
                                const fileName = fileNames[field.name];

                                // Debug log untuk Step 5
                                console.log(`📋 Step 5 Preview for ${field.name}:`, {
                                    hasPreview,
                                    previewsLength: previews.length,
                                    fileName,
                                    firstPreviewLength: previews[0]?.length || 0
                                });

                                return (
                                    <div key={field.name} className="space-y-3">
                                        <dt className="text-xs font-bold text-gray-700 uppercase tracking-wide">{field.label}</dt>

                                        {hasPreview ? (
                                            <div className="space-y-3">
                                                {/* Preview Box - Same as Step 4 but read-only */}
                                                <div className="relative overflow-hidden rounded-xl border-2 border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 p-4">
                                                    {/* Preview Images Grid */}
                                                    <div className="flex flex-wrap gap-4 justify-center">
                                                        {previews.map((src, idx) => {
                                                            console.log(`🖼️ Step 5 Image ${field.name}[${idx}]: ${src.substring(0, 60)}...`);
                                                            return (
                                                                <div key={idx} className="relative">
                                                                    <img
                                                                        src={src}
                                                                        alt={`${field.label} ${idx + 1}`}
                                                                        className="w-32 h-32 object-cover rounded-lg border-4 border-green-500 shadow-xl"
                                                                        style={{ backgroundColor: '#ffffff' }}
                                                                        onLoad={() => console.log(`✅ Step 5 IMG ${field.name}[${idx}] LOADED`)}
                                                                        onError={(e) => {
                                                                            console.error(`❌ Step 5 IMG ${field.name}[${idx}] ERROR`);
                                                                            (e.target as HTMLImageElement).style.backgroundColor = '#ff0000';
                                                                        }}
                                                                    />
                                                                    {/* Image Number Badge */}
                                                                    {previews.length > 1 && (
                                                                        <div className="absolute -top-2 -right-2 bg-green-600 text-white text-xs font-bold w-6 h-6 rounded-full flex items-center justify-center shadow-lg">
                                                                            {idx + 1}
                                                                        </div>
                                                                    )}
                                                                </div>
                                                            );
                                                        })}
                                                    </div>

                                                    {/* Filename with Icon */}
                                                    <div className="text-center mt-4">
                                                        <div className="flex items-center justify-center gap-2">
                                                            <svg className="w-4 h-4 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                            </svg>
                                                            <span className="text-sm font-bold text-green-700">{fileName || 'Terupload'}</span>
                                                        </div>
                                                        <p className="text-xs text-gray-500 mt-1 italic">Preview dokumen yang diupload</p>
                                                    </div>
                                                </div>
                                            </div>
                                        ) : (
                                            <dd className="text-sm text-gray-900">
                                                {fileName ? (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-700 font-medium">{fileName}</span>
                                                    </div>
                                                ) : formData[field.name as keyof typeof formData] ? (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-200">
                                                        <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-green-700 font-medium">Terupload</span>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 p-3 rounded-lg bg-gray-50 border border-gray-200">
                                                        <svg className="w-5 h-5 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                                                        </svg>
                                                        <span className="text-gray-500">Belum diupload</span>
                                                    </div>
                                                )}
                                            </dd>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                </div>

                {/* Summary Card */}
                <div className="bg-gradient-to-r from-indigo-600 to-blue-600 rounded-xl p-6 text-white">
                    <h4 className="text-lg font-bold mb-4">Ringkasan Pengajuan</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <p className="text-indigo-200 text-xs uppercase">Plafond</p>
                            <p className="text-2xl font-black">{formatCurrency(formData.jumlah_pembiayaan)}</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs uppercase">Tenor</p>
                            <p className="text-2xl font-black">{formData.jangka_waktu || '0'} <span className="text-base font-normal">Bulan</span></p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs uppercase">Angsuran/Bulan</p>
                            <p className="text-lg font-bold">{formatCurrency(formData.besar_angsuran)}</p>
                        </div>
                        <div>
                            <p className="text-indigo-200 text-xs uppercase">Terima Bersih</p>
                            <p className="text-lg font-bold">{formatCurrency(formData.nominal_terima)}</p>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    // Stepper for Card Header
    const renderStepper = (isMobile = false) => {
        const bgLineColor = isMobile ? 'bg-emerald-400/30' : 'bg-indigo-400/30';
        const currentBgColor = isMobile ? 'bg-white border-white text-emerald-600' : 'bg-white border-white text-indigo-600';
        const completedBgColor = isMobile ? 'bg-emerald-400 border-emerald-300 text-white' : 'bg-indigo-500 border-indigo-400 text-white';
        const incompleteBgColor = isMobile ? 'bg-emerald-600/50 border-emerald-400/50 text-emerald-200' : 'bg-indigo-700/50 border-indigo-500/50 text-indigo-300';

        return (
            <div className="relative px-2 md:px-4">
                {/* Background Line */}
                <div className={`absolute top-1/2 left-0 w-full h-[2px] ${bgLineColor} -translate-y-1/2 z-0 rounded-full`}></div>

                {/* Progress Line */}
                <div
                    className="absolute top-1/2 left-0 h-[2px] bg-white -translate-y-1/2 z-0 transition-all duration-500 ease-out shadow-[0_0_8px_rgba(255,255,255,0.4)]"
                    style={{ width: `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
                ></div>

                <div className="relative z-10 flex justify-between w-full">
                    {STEPS.map((step) => {
                        const isCompleted = step.number < currentStep;
                        const isCurrent = step.number === currentStep;
                        const Icon = step.icon;

                        return (
                            <div key={step.number} className="flex flex-col items-center">
                                <div
                                    className={`flex items-center justify-center w-9 h-9 md:w-12 md:h-12 rounded-full border-2 md:border-[3px] transition-all duration-300 transform 
                                    ${isCurrent
                                            ? currentBgColor + ' scale-105 shadow-lg'
                                            : isCompleted
                                                ? completedBgColor
                                                : incompleteBgColor
                                        }`}
                                >
                                    <Icon className="w-4 h-4 md:w-5 md:h-5" strokeWidth={2.5} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        );
    };

    return (
        <>
            {/* Mobile Layout */}
            <div className="md:hidden min-h-screen bg-slate-100 pb-28">
                {/* Layer 1: Full Page Background */}
                <div className="fixed inset-0 z-0 pointer-events-none">
                    <img src="/images/loan_header_bg.png" alt="bg-full" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-slate-50/70 backdrop-blur-[1px]"></div>
                </div>

                {/* Layer 2: 30% Header Background */}
                <div className="fixed top-0 left-0 right-0 h-[250px] z-0 overflow-hidden rounded-b-3xl">
                    <img
                        src="/images/loan_header_bg.png"
                        alt="Loan Background"
                        className="w-full h-full object-cover object-center"
                    />
                </div>

                {/* Content */}
                <div className="relative z-10 pt-6 px-4">
                    {/* Header Info */}
                    <div className="mb-4 px-2 flex items-center justify-between">
                        <div>
                            <h1 className="text-emerald-900 text-xl font-bold mb-1">Pengajuan Baru</h1>
                            <p className="text-emerald-700 text-xs">Lengkapi formulir pengajuan pembiayaan</p>
                        </div>
                        <button
                            onClick={() => router.back()}
                            className="px-3 py-1.5 bg-rose-100 text-rose-700 text-xs font-semibold rounded-full border border-rose-200 hover:bg-rose-200 transition-colors"
                        >
                            Batal
                        </button>
                    </div>

                    {/* Main Card */}
                    <div className="bg-white rounded-3xl shadow-xl shadow-slate-900/10 overflow-hidden">
                        {/* Card Header with Stepper */}
                        <div className="bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 px-4 py-4 relative overflow-hidden">
                            {/* Decorative Elements */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3"></div>

                            {/* Stepper */}
                            <div className="relative z-10 w-full">
                                {renderStepper(true)}
                            </div>

                            {/* Step Info */}
                            <div className="relative z-10 text-center mt-3">
                                <h2 className="text-base font-bold text-white">{STEPS[currentStep - 1].title}</h2>
                                <p className="text-xs text-emerald-50 mt-0.5">{STEPS[currentStep - 1].description}</p>
                            </div>
                        </div>

                        {/* Form Content */}
                        <main className="px-4 py-5">
                            {currentStep === 1 && renderStep2()}
                            {currentStep === 2 && renderStep1()}
                            {currentStep === 3 && renderStep3()}
                            {currentStep === 4 && renderStep4()}
                            {currentStep === 5 && renderStep5()}
                        </main>
                    </div>
                </div>

                {/* Mobile Sticky Bottom Nav */}
                <div className="fixed bottom-0 left-0 right-0 p-3 bg-white border-t border-gray-200 z-50 shadow-lg">
                    <div className="flex gap-2">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1 || submitting}
                            className={`flex-1 py-2.5 border border-gray-300 rounded-lg font-medium text-gray-700 bg-white active:bg-gray-50 text-xs ${currentStep === 1 ? 'opacity-40' : ''}`}
                        >
                            Kembali
                        </button>

                        <button
                            type="button"
                            onClick={currentStep === STEPS.length ? handleSubmit : nextStep}
                            disabled={submitting}
                            className="flex-1 py-2.5 rounded-lg font-medium text-white bg-emerald-600 shadow active:bg-emerald-700 text-xs"
                        >
                            {submitting ? '...' : currentStep === STEPS.length ? 'Submit' : 'Lanjut'}
                        </button>
                    </div>
                </div>
            </div>

            {/* Desktop Layout - Original Design */}
            <div className="hidden md:block mx-1 md:mx-3 lg:mx-auto lg:max-w-7xl pt-2 md:pt-4 pb-24 md:pb-0">
                <div className="bg-white rounded-xl md:rounded-2xl shadow-md md:shadow-lg overflow-hidden">

                    {/* Card Header with Stepper */}
                    <div className="bg-gradient-to-r from-indigo-600 via-indigo-700 to-blue-700 px-4 py-5 md:px-8 md:py-6 relative overflow-hidden">
                        {/* Background Image */}
                        <img
                            src="/images/pengajuan-header-bg.png"
                            alt=""
                            className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay"
                        />

                        {/* Decorative Elements */}
                        <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-white/10 to-transparent rounded-full -translate-y-1/2 translate-x-1/3"></div>
                        <div className="absolute bottom-0 left-0 w-48 h-48 bg-gradient-to-tr from-blue-400/20 to-transparent rounded-full translate-y-1/2 -translate-x-1/3"></div>

                        {/* Stepper */}
                        <div className="relative z-10 w-full max-w-4xl mx-auto">
                            {renderStepper()}
                        </div>

                        {/* Step Info */}
                        <div className="relative z-10 text-center mt-4">
                            <h2 className="text-lg md:text-xl font-bold text-white">{STEPS[currentStep - 1].title}</h2>
                            <p className="text-xs md:text-sm text-indigo-100 mt-0.5">{STEPS[currentStep - 1].description}</p>
                        </div>
                    </div>

                    {/* Form Content */}
                    <main className="px-4 py-5 md:px-8 md:py-8 lg:px-10 lg:py-10">
                        {currentStep === 1 && renderStep2()}
                        {currentStep === 2 && renderStep1()}
                        {currentStep === 3 && renderStep3()}
                        {currentStep === 4 && renderStep4()}
                        {currentStep === 5 && renderStep5()}
                    </main>

                    {/* Desktop Footer */}
                    <div className="hidden md:flex bg-gray-50/80 px-8 lg:px-10 py-5 justify-between items-center border-t border-gray-100">
                        <button
                            type="button"
                            onClick={prevStep}
                            disabled={currentStep === 1 || submitting}
                            className={`inline-flex items-center px-5 py-2.5 border border-gray-300 shadow-sm text-sm font-semibold rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-all active:scale-95 ${currentStep === 1 ? 'opacity-0 cursor-default' : ''}`}
                        >
                            <ChevronLeft className="-ml-1 mr-1.5 h-4 w-4" />
                            Kembali
                        </button>

                        <button
                            type="button"
                            onClick={currentStep === STEPS.length ? handleSubmit : nextStep}
                            disabled={submitting}
                            className="inline-flex items-center px-6 py-2.5 border border-transparent shadow-md text-sm font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {submitting ? 'Menyimpan...' : currentStep === STEPS.length ? 'Submit Pengajuan' : 'Selanjutnya'}
                            {!submitting && currentStep !== STEPS.length && <ChevronRight className="ml-1.5 -mr-1 h-4 w-4" />}
                            {!submitting && currentStep === STEPS.length && <Save className="ml-1.5 -mr-1 h-4 w-4" />}
                        </button>
                    </div>
                </div>
            </div>
        </>
    );
};