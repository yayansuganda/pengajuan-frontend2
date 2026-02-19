import { PengajuanRepository } from '../core/PengajuanRepository';
import { Pengajuan, PengajuanFilter } from '../core/PengajuanEntity';
import httpClient from '@/shared/utils/httpClient';

export class PengajuanRepositoryImpl implements PengajuanRepository {
    private httpClient = httpClient;

    async getPengajuanList(filter?: PengajuanFilter): Promise<Pengajuan[]> {
        console.log('[PengajuanRepository] 🚀 ========== API CALL ==========');
        console.log('[PengajuanRepository] Endpoint: /pengajuan');
        console.log('[PengajuanRepository] Filter params:', JSON.stringify(filter, null, 2));
        console.log('[PengajuanRepository] Full URL will be: /pengajuan?' + new URLSearchParams(filter as any).toString());

        const response = await this.httpClient.get<{ data: Pengajuan[], total: number }>('/pengajuan', { params: filter });

        console.log('[PengajuanRepository] ✅ Response received:');
        console.log('[PengajuanRepository]   - Total:', response.data.total);
        console.log('[PengajuanRepository]   - Items:', response.data.data.length);
        if (response.data.data.length > 0) {
            console.log('[PengajuanRepository]   - First item NIPPOS:', response.data.data[0].petugas_nippos);
        }

        return response.data.data; // Extract the data array from the response
    }

    async getPengajuanDetail(id: string): Promise<Pengajuan> {
        const response = await this.httpClient.get<{ data: Pengajuan }>(`/pengajuan/${id}`);
        return response.data.data; // Extract the data from the response
    }

    async createPengajuan(data: any): Promise<void> {
        await this.httpClient.post('/loans', data);
    }

    async updatePengajuan(id: string, data: any): Promise<void> {
        await this.httpClient.put(`/loans/${id}`, data);
    }

    async update(id: string, data: any): Promise<void> {
        return this.updatePengajuan(id, data);
    }

    async updateStatus(id: string, status: string, rejectReason?: string): Promise<void> {
        await this.httpClient.put(`/pengajuan/${id}/status`, { status, reject_reason: rejectReason });
    }

    async uploadDisbursementProof(disbursementId: string, proofUrl: string, notes?: string): Promise<void> {
        await this.httpClient.put(`/pencairan/${disbursementId}/proof`, {
            proof_url: proofUrl,
            notes: notes || ''
        });
    }

    async checkDuplicate(nik: string): Promise<{ exists: boolean, status?: string }> {
        const response = await this.httpClient.get<{ exists: boolean, status?: string }>(`/pengajuan/check-duplicate`, {
            params: { nik }
        });
        return response.data;
    }
}
