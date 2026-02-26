import { RekonsiliasiStats, RekonsiliasiFilterOptions } from '../core/RekonsiliasiDashboardEntity';
import httpClient from '@/shared/utils/httpClient';

export class RekonsiliasiDashboardRepository {
    async getStats(dateFrom?: string, dateTo?: string, regional?: string, kcu?: string, kc?: string): Promise<RekonsiliasiStats> {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;
        if (regional) params.regional = regional;
        if (kcu) params.kcu = kcu;
        if (kc) params.kc = kc;

        const response = await httpClient.get<RekonsiliasiStats>('/dashboard/rekonsiliasi-stats', { params });
        return response.data;
    }

    async getFilterOptions(regional?: string, kcu?: string): Promise<RekonsiliasiFilterOptions> {
        const params: Record<string, string> = {};
        if (regional) params.regional = regional;
        if (kcu) params.kcu = kcu;

        const response = await httpClient.get<RekonsiliasiFilterOptions>('/dashboard/rekonsiliasi-filter-options', { params });
        return response.data;
    }
}
