import { CekStatusRepository } from '../core/CekStatusRepository';
import { PengajuanStatusResult } from '../core/StatusEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class CekStatusRepositoryImpl implements CekStatusRepository {
    private httpClient = createHttpClient();

    async checkStatusByNik(nik: string): Promise<PengajuanStatusResult[]> {
        // Asumsi endpoint: GET /pengajuan/cek-status?nik=...
        // Jika endpoint backend belum support history detail, kita mungkin perlu melakukan mapping dari response list pengajuan biasa.
        // Untuk sekarang saya arahkan ke endpoint pencarian pengajuan yang sudah ada, tapi di frontend kita olah datanya.

        try {
            // Mengecek endpoint /loans (pengajuan) dengan filter search NIK
            // Response aslinya mungkin list Pengajuan biasa, kita perlu assign mock history jika backend belum support.
            const response = await this.httpClient.get<any>('/pengajuan', { params: { search: nik } });

            // Map data pengajuan ke format status result
            // Note: Ini mapping sementara sampai backend support endpoint khusus tracking
            return response.data.data.map((item: any) => ({
                id: item.id,
                nik: item.nik,
                nama_lengkap: item.nama_lengkap,
                jenis_pembiayaan: item.jenis_pembiayaan?.name || '-',
                jumlah_pembiayaan: item.jumlah_pembiayaan,
                tanggal_pengajuan: item.created_at,
                status_terakhir: item.status,
                history: this.generateMockHistory(item.status, item.created_at) // Mocking history based on current status
            }));
        } catch (error) {
            throw error;
        }
    }

    // Helper untuk generate history sementara (karena backend biasanya belum nyimpen log detail per step di endpoint list)
    private generateMockHistory(currentStatus: string, createdDate: string): any[] {
        const history = [
            {
                status: 'Pengajuan Diterima',
                date: createdDate,
                description: 'Berkas pengajuan telah diterima oleh sistem.',
                is_completed: true,
                actor: 'System'
            }
        ];

        if (currentStatus === 'Proses Persetujuan' || currentStatus === 'Disetujui' || currentStatus === 'Ditolak') {
            history.push({
                status: 'Verifikasi Berkas',
                date: '', // Tanggal tidak diketahui pastinya
                description: 'Verifikasi kelengkapan dokumen fisik dan digital.',
                is_completed: true,
                actor: 'Admin Verifikator'
            });
        }

        if (currentStatus === 'Disetujui') {
            history.push({
                status: 'Analisa Kredit',
                date: '',
                description: 'Analisa kelayakan kredit nasabah.',
                is_completed: true,
                actor: 'Credit Analyst'
            });
            history.push({
                status: 'Disetujui',
                date: '',
                description: 'Pengajuan telah disetujui dan siap untuk akad.',
                is_completed: true,
                actor: 'Kepala Cabang'
            });
        } else if (currentStatus === 'Ditolak') {
            history.push({
                status: 'Ditolak',
                date: '',
                description: 'Pengajuan tidak dapat dilanjutkan.',
                is_completed: true,
                actor: 'Verifikator'
            });
        } else if (currentStatus === 'Proses Persetujuan') {
            history.push({
                status: 'Dalam Proses',
                date: '',
                description: 'Sedang dalam tahap analisa dan persetujuan pejabat berwenang.',
                is_completed: false,
                actor: 'Credit Analyst'
            });
        }

        return history.reverse(); // Paling baru di atas
    }
}
