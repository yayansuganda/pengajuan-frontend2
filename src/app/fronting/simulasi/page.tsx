'use client';

import React, { useState, useEffect } from 'react';
import { MobileLayoutWrapper } from '@/modules/pengajuan/presentation/components/MobileLayoutWrapper';
import { Calculator, TrendingUp, Calendar, DollarSign, TrendingDown, Receipt, AlertCircle } from 'lucide-react';
import { JenisPembiayaanRepositoryImpl } from '@/modules/jenis-pembiayaan/data/RepositoryImpl';
import { JenisPembiayaan } from '@/modules/jenis-pembiayaan/core/Entity';
import { PotonganRepositoryImpl } from '@/modules/potongan/data/RepositoryImpl';
import { Potongan } from '@/modules/potongan/core/Entity';
import { PotonganJangkaWaktuRepositoryImpl } from '@/modules/potongan-jangka-waktu/data/RepositoryImpl';
import { PotonganJangkaWaktu } from '@/modules/potongan-jangka-waktu/core/Entity';
import { SettingRepositoryImpl } from '@/modules/settings/data/RepositoryImpl';
import { Setting } from '@/modules/settings/core/Entity';

const jenisPembiayaanRepo = new JenisPembiayaanRepositoryImpl();
const potonganRepo = new PotonganRepositoryImpl();
const potonganJangkaWaktuRepo = new PotonganJangkaWaktuRepositoryImpl();
const settingRepo = new SettingRepositoryImpl();

export default function FrontingSimulasiPage() {
    // Master data
    const [jenisPembiayaanList, setJenisPembiayaanList] = useState<JenisPembiayaan[]>([]);
    const [potonganList, setPotonganList] = useState<Potongan[]>([]);
    const [potonganJangkaWaktuList, setPotonganJangkaWaktuList] = useState<PotonganJangkaWaktu[]>([]);
    const [settings, setSettings] = useState<Setting | null>(null);

    // Form data
    const [gajiTersedia, setGajiTersedia] = useState<string>('');
    const [displayGajiTersedia, setDisplayGajiTersedia] = useState<string>('');
    const [jenisPembiayaanId, setJenisPembiayaanId] = useState<string>('');
    const [kategoriPembiayaan, setKategoriPembiayaan] = useState<string>('');
    const [jangkaWaktu, setJangkaWaktu] = useState<string>('');

    // Calculated values
    const [maksJangkaWaktuUsia, setMaksJangkaWaktuUsia] = useState<number>(0);
    const [maksimalPembiayaan, setMaksimalPembiayaan] = useState<number>(0);
    const [jumlahPembiayaan, setJumlahPembiayaan] = useState<string>('');
    const [displayJumlahPembiayaan, setDisplayJumlahPembiayaan] = useState<string>('');
    const [besarAngsuran, setBesarAngsuran] = useState<number>(0);
    const [totalPotongan, setTotalPotongan] = useState<number>(0);
    const [nominalTerima, setNominalTerima] = useState<number>(0);
    const [potonganDetail, setPotonganDetail] = useState<{ nama: string; nilai: number }[]>([]);
    const [potonganJangkaWaktu, setPotonganJangkaWaktu] = useState<PotonganJangkaWaktu | null>(null);

    // Format number with thousand separator
    const formatNumber = (value: string): string => {
        const number = value.replace(/\D/g, '');
        if (!number) return '';
        return new Intl.NumberFormat('id-ID').format(parseInt(number));
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('id-ID', {
            style: 'currency',
            currency: 'IDR',
            minimumFractionDigits: 0,
        }).format(amount);
    };

    // Handle input changes
    const handleGajiTersediaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setGajiTersedia(rawValue);
        setDisplayGajiTersedia(formatNumber(rawValue));
    };

    const handleJumlahPembiayaanChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const rawValue = e.target.value.replace(/\D/g, '');
        setJumlahPembiayaan(rawValue);
        setDisplayJumlahPembiayaan(formatNumber(rawValue));
    };

    // Fetch master data
    useEffect(() => {
        const fetchMasterData = async () => {
            try {
                const [pembiayaanRes, potonganRes, potonganJWRes, setting] = await Promise.all([
                    jenisPembiayaanRepo.getAll(),
                    potonganRepo.getAll(),
                    potonganJangkaWaktuRepo.getAll(),
                    settingRepo.getActive()
                ]);
                setJenisPembiayaanList(pembiayaanRes.data);
                // Filter only is_view = true and is_active = true for display
                setPotonganList(potonganRes.data.filter(p => p.is_view && p.is_active));
                setPotonganJangkaWaktuList(potonganJWRes.data.filter(p => p.is_active));
                setSettings(setting);
            } catch (error) {
                console.error('Error fetching master data:', error);
            }
        };
        fetchMasterData();
    }, []);

    // Auto-calculate Maks Jangka Waktu (aligned with create pengajuan logic)
    useEffect(() => {
        if (kategoriPembiayaan === 'Micro' && settings && settings.mikro_jangka_waktu > 0) {
            setMaksJangkaWaktuUsia(settings.mikro_jangka_waktu);
        } else if (kategoriPembiayaan === 'Macro' && settings && settings.makro_jangka_waktu > 0) {
            setMaksJangkaWaktuUsia(settings.makro_jangka_waktu);
        } else if (settings) {
            setMaksJangkaWaktuUsia(60); // Default 60 bulan
        }
    }, [kategoriPembiayaan, settings]);

    // Auto-calculate Maks Pembiayaan (aligned with create pengajuan logic)
    useEffect(() => {
        if (kategoriPembiayaan === 'Micro' && settings && settings.mikro_maksimal_pembiayaan > 0) {
            setMaksimalPembiayaan(Math.round(settings.mikro_maksimal_pembiayaan));
            return;
        }

        const gaji = parseFloat(gajiTersedia) || 0;
        const maksJW = maksJangkaWaktuUsia || 0;

        if (gaji > 0 && maksJW > 0) {
            const jasaPersen = (settings?.jasa_perbulan || 0) / 100;
            const factor = (1 / maksJW) + jasaPersen;

            let maxPlafond = 0;
            if (factor > 0) {
                maxPlafond = gaji / factor;
            }

            if (kategoriPembiayaan === 'Macro' && settings && settings.makro_maksimal_pembiayaan > 0) {
                if (maxPlafond > settings.makro_maksimal_pembiayaan) {
                    maxPlafond = settings.makro_maksimal_pembiayaan;
                }
            }

            const roundedMaxPlafond = Math.floor(maxPlafond / 1000) * 1000;
            setMaksimalPembiayaan(roundedMaxPlafond);
        } else {
            setMaksimalPembiayaan(0);
        }
    }, [gajiTersedia, maksJangkaWaktuUsia, kategoriPembiayaan, settings]);

    // Find matching potongan jangka waktu (fronting is always POS, must match is_pos=true)
    useEffect(() => {
        const jw = parseInt(jangkaWaktu);
        if (jw > 0 && potonganJangkaWaktuList.length > 0) {
            const matched = potonganJangkaWaktuList.find(
                p => p.min_bulan <= jw && p.max_bulan >= jw && p.is_pos === true
            );
            setPotonganJangkaWaktu(matched || null);
        } else {
            setPotonganJangkaWaktu(null);
        }
    }, [jangkaWaktu, potonganJangkaWaktuList]);

    // Auto-calculate total potongan (aligned with Create Pengajuan Ta'awun formula)
    useEffect(() => {
        const plafond = parseFloat(jumlahPembiayaan) || 0;

        if (plafond > 0 && potonganList.length > 0) {
            const calculatePotonganValue = (potongan: Potongan): number => {
                if (potongan.kategori === 'persentase') {
                    return (potongan.persentase_nominal / 100) * plafond;
                } else {
                    return potongan.persentase_nominal;
                }
            };

            let total = 0;
            const details: { nama: string; nilai: number }[] = [];

            // Regular potongan
            potonganList.forEach(p => {
                const value = calculatePotonganValue(p);
                total += value;
                details.push({ nama: p.nama_potongan, nilai: Math.round(value) });
            });

            // Ta'awun = Potongan JW (%) - Total Potongan Persentase Visible (%)
            if (potonganJangkaWaktu) {
                const visiblePercentageSum = potonganList
                    .filter(p => p.kategori === 'persentase')
                    .reduce((sum, p) => sum + (parseFloat(p.persentase_nominal.toString()) || 0), 0);

                const potonganJWPersen = parseFloat(potonganJangkaWaktu.potongan_persen?.toString() || '0');
                const taawunPersen = potonganJWPersen - visiblePercentageSum;

                if (taawunPersen > 0) {
                    const taawunValue = (taawunPersen / 100) * plafond;
                    total += taawunValue;
                    details.push({ nama: "Ta'awun", nilai: Math.round(taawunValue) });
                }
            }

            setTotalPotongan(Math.round(total));
            setPotonganDetail(details);
        } else {
            setTotalPotongan(0);
            setPotonganDetail([]);
        }
    }, [jumlahPembiayaan, potonganList, potonganJangkaWaktu]);

    // Auto-calculate Angsuran/Bulan
    useEffect(() => {
        const plafond = parseFloat(jumlahPembiayaan) || 0;
        const jw = parseInt(jangkaWaktu) || 0;
        const jasaPerbulan = settings?.jasa_perbulan || 0;

        if (plafond > 0 && jw > 0) {
            const angsuranPokok = plafond / jw;
            const jasaBulanNilai = (jasaPerbulan / 100) * plafond;
            const totalAngsuran = angsuranPokok + jasaBulanNilai;
            setBesarAngsuran(Math.round(totalAngsuran));
        } else {
            setBesarAngsuran(0);
        }
    }, [jumlahPembiayaan, jangkaWaktu, settings]);

    // Auto-calculate Terima Bersih
    useEffect(() => {
        const plafond = parseFloat(jumlahPembiayaan) || 0;
        if (plafond > 0 && totalPotongan > 0) {
            const terimaBersih = plafond - totalPotongan;
            setNominalTerima(Math.round(terimaBersih));
        } else if (plafond > 0) {
            setNominalTerima(plafond);
        } else {
            setNominalTerima(0);
        }
    }, [jumlahPembiayaan, totalPotongan]);

    const resetForm = () => {
        setGajiTersedia('');
        setDisplayGajiTersedia('');
        setJenisPembiayaanId('');
        setKategoriPembiayaan('');
        setJangkaWaktu('');
        setJumlahPembiayaan('');
        setDisplayJumlahPembiayaan('');
        setMaksJangkaWaktuUsia(0);
        setMaksimalPembiayaan(0);
        setBesarAngsuran(0);
        setTotalPotongan(0);
        setNominalTerima(0);
        setPotonganDetail([]);
    };

    const selectedPembiayaan = jenisPembiayaanList.find(jp => jp.id === jenisPembiayaanId);

    return (
        <MobileLayoutWrapper showBackground={false} forceVisible={true} moduleName="fronting">
            <div className="pt-6 px-4 pb-24 space-y-4">
                {/* Header */}
                <div className="mb-2">
                    <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
                            <Calculator className="w-6 h-6 text-white" />
                        </div>
                        <div>
                            <h1 className="text-xl font-bold text-slate-800">Simulasi Pembiayaan</h1>
                            <p className="text-xs text-slate-500">Hitung estimasi pembiayaan Anda</p>
                        </div>
                    </div>
                </div>

                {/* Input Form Card */}
                <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                    <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        Data Pembiayaan
                    </h2>

                    <div className="space-y-4">
                        {/* Gaji Tersedia */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Gaji Tersedia (Rp)
                            </label>
                            <input
                                type="text"
                                value={displayGajiTersedia}
                                onChange={handleGajiTersediaChange}
                                placeholder="Contoh: 5.000.000"
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            />
                        </div>

                        {/* Jenis Pembiayaan */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                Jenis Pembiayaan
                            </label>
                            <select
                                value={jenisPembiayaanId}
                                onChange={(e) => setJenisPembiayaanId(e.target.value)}
                                className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                            >
                                <option value="">-- Pilih Jenis Pembiayaan --</option>
                                {jenisPembiayaanList.map(jp => (
                                    <option key={jp.id} value={jp.id}>{jp.name}</option>
                                ))}
                            </select>
                        </div>

                        {/* Kategori */}
                        {jenisPembiayaanId && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Kategori Pembiayaan
                                </label>
                                <select
                                    value={kategoriPembiayaan}
                                    onChange={(e) => setKategoriPembiayaan(e.target.value)}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                >
                                    <option value="">-- Pilih Kategori --</option>
                                    <option value="Macro">Makro (SK Asli)</option>
                                    <option value="Micro">Mikro (Sisa Gaji)</option>
                                </select>
                            </div>
                        )}

                        {/* Jangka Waktu */}
                        {kategoriPembiayaan && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Jangka Waktu (bulan)
                                    {maksJangkaWaktuUsia > 0 && (
                                        <span className="text-emerald-600 ml-2">Max: {maksJangkaWaktuUsia} bulan</span>
                                    )}
                                </label>
                                <input
                                    type="number"
                                    value={jangkaWaktu}
                                    onChange={(e) => setJangkaWaktu(e.target.value)}
                                    placeholder="Contoh: 12"
                                    max={maksJangkaWaktuUsia}
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Jumlah Pembiayaan */}
                        {jangkaWaktu && maksimalPembiayaan > 0 && (
                            <div>
                                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                                    Jumlah Pembiayaan (Rp)
                                    <span className="text-emerald-600 ml-2">Max: {formatCurrency(maksimalPembiayaan)}</span>
                                </label>
                                <input
                                    type="text"
                                    value={displayJumlahPembiayaan}
                                    onChange={handleJumlahPembiayaanChange}
                                    placeholder="Masukkan jumlah pembiayaan"
                                    className="w-full px-4 py-2.5 text-sm border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                                />
                            </div>
                        )}

                        {/* Reset Button */}
                        {gajiTersedia && (
                            <button
                                onClick={resetForm}
                                className="w-full px-4 py-3 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-colors"
                            >
                                Reset Simulasi
                            </button>
                        )}
                    </div>
                </div>

                {/* Results Card */}
                {jumlahPembiayaan && parseFloat(jumlahPembiayaan) > 0 && (
                    <>
                        {/* Ringkasan Pembiayaan */}
                        <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                            <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                <TrendingUp className="w-4 h-4 text-emerald-600" />
                                Hasil Simulasi
                            </h2>

                            <div className="space-y-3">
                                {/* Cicilan per Bulan */}
                                <div className="bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-4 border border-emerald-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <Calendar className="w-4 h-4 text-emerald-600" />
                                        <span className="text-xs font-medium text-slate-600">Cicilan per Bulan</span>
                                    </div>
                                    <p className="text-lg font-bold text-emerald-700">
                                        {formatCurrency(besarAngsuran)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Jangka waktu: {jangkaWaktu} bulan
                                    </p>
                                </div>

                                {/* Nominal Terima */}
                                <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-4 border border-blue-100">
                                    <div className="flex items-center gap-2 mb-1">
                                        <DollarSign className="w-4 h-4 text-blue-600" />
                                        <span className="text-xs font-medium text-slate-600">Nominal Diterima</span>
                                    </div>
                                    <p className="text-lg font-bold text-blue-700">
                                        {formatCurrency(nominalTerima)}
                                    </p>
                                    <p className="text-[10px] text-slate-500 mt-1">
                                        Setelah dikurangi potongan
                                    </p>
                                </div>

                                {/* Summary */}
                                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                                    <div className="space-y-2 text-xs">
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Jumlah Pembiayaan</span>
                                            <span className="font-bold text-slate-800">{formatCurrency(parseFloat(jumlahPembiayaan))}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Total Potongan</span>
                                            <span className="font-bold text-rose-600">{formatCurrency(totalPotongan)}</span>
                                        </div>
                                        <div className="h-px bg-slate-200 my-2"></div>
                                        <div className="flex justify-between">
                                            <span className="text-slate-600">Total Pembayaran</span>
                                            <span className="font-bold text-slate-800">
                                                {formatCurrency(besarAngsuran * parseInt(jangkaWaktu))}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Detail Potongan */}
                        {potonganDetail.length > 0 && (
                            <div className="bg-white rounded-2xl shadow-lg p-5 border border-slate-100">
                                <h2 className="text-sm font-bold text-slate-800 mb-4 flex items-center gap-2">
                                    <Receipt className="w-4 h-4 text-rose-600" />
                                    Rincian Potongan
                                </h2>
                                <div className="space-y-2">
                                    {potonganDetail.map((p, idx) => (
                                        <div key={idx} className="flex items-center justify-between py-2 border-b border-slate-100 last:border-0">
                                            <div className="flex items-center gap-2">
                                                <TrendingDown className="w-3 h-3 text-rose-500" />
                                                <span className="text-xs text-slate-600">{p.nama}</span>
                                            </div>
                                            <span className="text-xs font-bold text-rose-600">{formatCurrency(p.nilai)}</span>
                                        </div>
                                    ))}
                                    <div className="flex items-center justify-between pt-2 border-t-2 border-slate-300">
                                        <span className="text-xs font-bold text-slate-700">TOTAL POTONGAN</span>
                                        <span className="text-sm font-bold text-rose-700">{formatCurrency(totalPotongan)}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Info Card */}
                        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                            <div className="flex items-start gap-3">
                                <AlertCircle className="w-4 h-4 text-blue-600 mt-0.5 shrink-0" />
                                <div>
                                    <p className="text-xs font-bold text-blue-900 mb-1">Catatan Penting</p>
                                    <p className="text-[10px] text-blue-800 leading-relaxed">
                                        Hasil simulasi ini bersifat <strong>estimasi</strong> dan dapat berbeda dengan perhitungan aktual.
                                        Jangka waktu maksimal ditentukan berdasarkan kategori pembiayaan yang dipilih.
                                        Untuk pengajuan resmi, silakan hubungi petugas atau gunakan menu <strong>Pengajuan</strong>.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </>
                )}

                {/* Empty State */}
                {(!jumlahPembiayaan || parseFloat(jumlahPembiayaan) === 0) && gajiTersedia && (
                    <div className="bg-white rounded-2xl shadow-lg p-8 border border-slate-100">
                        <div className="text-center">
                            <Calculator className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                            <p className="text-sm text-slate-500">Lengkapi semua data untuk melihat hasil simulasi</p>
                            <p className="text-xs text-slate-400 mt-1">Pilih jenis pembiayaan, kategori, dan tentukan jangka waktu</p>
                        </div>
                    </div>
                )}
            </div>
        </MobileLayoutWrapper>
    );
}
