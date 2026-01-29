import { DashboardStats } from '../core/DashboardEntity';

export interface DashboardRepository {
    getStats(month?: string): Promise<DashboardStats>;
}

