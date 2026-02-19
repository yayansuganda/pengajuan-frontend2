import { PengecekanRepository } from '../core/PengecekanRepository';
import { Pensiunan } from '../core/PensiunanEntity';
import { apiLogger } from '@/shared/utils/apiLogger';
import axios from 'axios';

export class PengecekanRepositoryImpl implements PengecekanRepository {
    // Use internal Next.js API route instead of calling external API directly
    // This avoids CORS issues
    private readonly API_URL = '/api/pengecekan';

    async checkPensiunan(nopen: string): Promise<Pensiunan> {
        const startTime = Date.now();

        try {
            // Call internal API route (which will call external API from server-side)
            const response = await axios.post(this.API_URL, { nopen });

            const duration = Date.now() - startTime;

            // Log successful request
            apiLogger.logAPICall({
                timestamp: new Date().toISOString(),
                nopen,
                payload: { nopen },
                headers: {
                    'Content-Type': 'application/json'
                },
                jwtToken: 'Generated server-side',
                response: response.data,
                duration
            });

            // Response structure from API:
            // {
            //   "data": {
            //     "bulan_dapem": "202602",
            //     "gaji_bersih": 1675900,
            //     "jenis_dapem": "1",
            //     "jenis_pensiun": "7212",
            //     "kode_kantor": "90000",
            //     "kode_kprk": "90000",
            //     "mitra": "TASPEN",
            //     "nama_kantor": "KANTOR POS MAKASAR",
            //     "nama_kprk": "KANTOR POS MAKASAR",
            //     "nama_lengkap": "RIDHA SAMBO",
            //     "nomor_pensiun": "08000511000",
            //     "nomor_rekening": "80851167185",
            //     "status_dapem": "13"
            //   },
            //   "resp_code": "00",
            //   "resp_mess": "SUKSES",
            //   "status": true
            // }

            const responseData = response.data;

            // Check if response is successful
            if (!responseData.status || responseData.resp_code !== '00') {
                throw new Error(responseData.resp_mess || 'Data tidak ditemukan');
            }

            const data = responseData.data;

            // Calculate total potongan from potongan_pinjaman if available
            const totalPotongan = data.potongan_pinjaman
                ? data.potongan_pinjaman.reduce((sum: number, p: any) => sum + (p.AMOUNT || 0), 0)
                : 0;

            return {
                nopen: data.nomor_pensiun || nopen,
                nama_lengkap: data.nama_lengkap || '',
                tanggal_lahir: data.tanggal_lahir || '', // From API if available
                jenis_kelamin: '', // Not provided by API
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
                alamat: '', // Not provided by API
                nama_bank: data.mitra || '',
                mitra: data.mitra || '',
                no_rekening: data.nomor_rekening || data.nomor_rekening_giro || '',
                gaji_pokok: 0, // Not provided separately
                tunjangan: 0, // Not provided separately
                potongan: totalPotongan, // Calculate from potongan_pinjaman array
                gaji_bersih: parseFloat(String(data.gaji_bersih || 0)),
                bulan_dapem: data.bulan_dapem || '',
                potongan_pinjaman: data.potongan_pinjaman || [], // Include loan deductions array
                last_updated: data.tgl_transaksi || data.bulan_dapem || new Date().toISOString()
            };
        } catch (error: any) {
            const duration = Date.now() - startTime;

            // Log failed request
            apiLogger.logAPICall({
                timestamp: new Date().toISOString(),
                nopen,
                payload: { nopen },
                headers: {
                    'Content-Type': 'application/json'
                },
                jwtToken: 'Generated server-side',
                error: error.response?.data || error.message,
                duration
            });

            console.error('Error fetching pensiunan data:', error);

            // Check if it's an API error response
            if (error.response?.data?.error) {
                throw new Error(error.response.data.details?.resp_mess || error.response.data.error);
            }

            throw new Error(error.response?.data?.message || 'Gagal mengambil data pensiunan');
        }
    }
}
