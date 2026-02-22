import { RekonsiliasiStats, RekonsiliasiFilterOptions } from '../core/RekonsiliasiDashboardEntity';
import httpClient from '@/shared/utils/httpClient';

export class RekonsiliasiDashboardRepository {
    async getStats(dateFrom?: string, dateTo?: string): Promise<RekonsiliasiStats> {
        const params: Record<string, string> = {};
        if (dateFrom) params.date_from = dateFrom;
        if (dateTo) params.date_to = dateTo;

        const response = await httpClient.get<RekonsiliasiStats>('/dashboard/rekonsiliasi-stats', { params });
        return response.data;
    }

    async getFilterOptions(): Promise<RekonsiliasiFilterOptions> {
        const response = await httpClient.get<RekonsiliasiFilterOptions>('/dashboard/rekonsiliasi-filter-options');
        return response.data;
    }
}
