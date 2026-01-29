import { PengecekanRepository } from '../core/PengecekanRepository';
import { Pensiunan } from '../core/PensiunanEntity';
import { createHttpClient } from '@/shared/utils/httpClient';

export class PengecekanRepositoryImpl implements PengecekanRepository {
    private httpClient = createHttpClient();

    async checkPensiunan(nopen: string): Promise<Pensiunan> {
        // Saya asumsikan endpointnya adalah GET /pensiunan/:nopen
        // Jika belum ada di backend, ini akan error 404, tapi struktur frontend sudah siap.
        const response = await this.httpClient.get<{ data: Pensiunan }>(`/pensiunan/${nopen}`);
        return response.data.data;
    }
}
