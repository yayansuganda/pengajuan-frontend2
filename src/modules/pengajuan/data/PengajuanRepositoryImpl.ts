import { PengajuanRepository } from '../core/PengajuanRepository';
import { Pengajuan, PengajuanFilter } from '../core/PengajuanEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class PengajuanRepositoryImpl implements PengajuanRepository {
    private httpClient = createHttpClient();

    async getPengajuanList(filter?: PengajuanFilter): Promise<Pengajuan[]> {
        const response = await this.httpClient.get<{ data: Pengajuan[], total: number }>('/pengajuan', { params: filter });
        return response.data.data; // Extract the data array from the response
    }

    async getPengajuanDetail(id: string): Promise<Pengajuan> {
        const response = await this.httpClient.get<{ data: Pengajuan }>(`/pengajuan/${id}`);
        return response.data.data; // Extract the data from the response
    }

    async createPengajuan(data: any): Promise<void> {
        await this.httpClient.post('/loans', data);
    }

    async uploadDisbursementProof(disbursementId: string, proofUrl: string, notes?: string): Promise<void> {
        await this.httpClient.put(`/pencairan/${disbursementId}/proof`, {
            proof_url: proofUrl,
            notes: notes || ''
        });
    }
}
