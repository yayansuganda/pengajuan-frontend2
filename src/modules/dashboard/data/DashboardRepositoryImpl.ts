import { DashboardStats } from '../core/DashboardEntity';
import { DashboardRepository } from './DashboardRepository';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export class DashboardRepositoryImpl implements DashboardRepository {
    async getStats(month?: string): Promise<DashboardStats> {
        const token = localStorage.getItem('token');
        
        let url = `${API_URL}/dashboard/stats`;
        if (month) {
            url += `?month=${month}`;
        }
        
        const response = await fetch(url, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error('Failed to fetch dashboard stats');
        }

        const data = await response.json();
        return data;
    }
}

