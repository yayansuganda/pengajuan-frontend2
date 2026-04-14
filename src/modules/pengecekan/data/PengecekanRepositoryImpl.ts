import { PengecekanRepository, PengecekanResult } from '../core/PengecekanRepository';
import { apiLogger } from '@/shared/utils/apiLogger';
import axios from 'axios';

export class PengecekanRepositoryImpl implements PengecekanRepository {
    private readonly API_URL = '/api/pengecekan';

    async checkPensiunan(nopen: string): Promise<PengecekanResult> {
        const startTime = Date.now();

        try {
            const response = await axios.post(this.API_URL, { nopen });

            const duration = Date.now() - startTime;

            apiLogger.logAPICall({
                timestamp: new Date().toISOString(),
                nopen,
                payload: { nopen },
                headers: { 'Content-Type': 'application/json' },
                jwtToken: 'Generated server-side',
                response: response.data,
                duration
            });

            const responseData = response.data;

            if (!responseData.status || responseData.resp_code !== '00') {
                return { success: false, error: responseData.resp_mess || 'Data tidak ditemukan' };
            }

            const data = responseData.data;

            const totalPotongan = data.potongan_pinjaman
                ? data.potongan_pinjaman.reduce((sum: number, p: any) => sum + (p.AMOUNT || 0), 0)
                : 0;

            return {
                success: true,
                data: {
                    nopen: data.nomor_pensiun || nopen,
                    nama_lengkap: data.nama_lengkap || '',
                    tanggal_lahir: data.tanggal_lahir || '',
                    jenis_kelamin: '',
                    jenis_pensiun: data.jenis_pensiun || '',
                    ket_jenis_pensiun: data.ket_jenis_pensiun || '',
                    jenis_dapem: data.jenis_dapem || '',
                    ket_jenis_dapem: data.ket_jenis_dapem || '',
                    status_keaktifan: data.status_dapem === '13' || data.status_dapem === '1' ? 'Aktif' : 'Tidak Aktif',
                    status_dapem: data.status_dapem || '',
                    ket_status_dapem: data.ket_status_dapem || '',
                    kantor_bayar: data.nama_kantor || data.nama_kprk || '',
                    kode_kantor: data.kode_kantor || '',
                    kode_kprk: data.kode_kprk || '',
                    alamat: '',
                    nama_bank: data.mitra || '',
                    mitra: data.mitra || '',
                    no_rekening: data.nomor_rekening || data.nomor_rekening_giro || '',
                    gaji_pokok: 0,
                    tunjangan: 0,
                    potongan: totalPotongan,
                    gaji_bersih: parseFloat(String(data.gaji_bersih || 0)),
                    bulan_dapem: data.bulan_dapem || '',
                    potongan_pinjaman: data.potongan_pinjaman || [],
                    last_updated: data.tgl_transaksi || data.bulan_dapem || new Date().toISOString()
                }
            };
        } catch (error: any) {
            const duration = Date.now() - startTime;

            apiLogger.logAPICall({
                timestamp: new Date().toISOString(),
                nopen,
                payload: { nopen },
                headers: { 'Content-Type': 'application/json' },
                jwtToken: 'Generated server-side',
                error: error.response?.data || error.message,
                duration
            });

            console.warn('Error fetching pensiunan data:', error.message);

            if (error.response?.data?.error) {
                return { success: false, error: error.response.data.details?.resp_mess || error.response.data.error };
            }

            return { success: false, error: error.response?.data?.message || 'Gagal mengambil data pensiunan' };
        }
    }
}
