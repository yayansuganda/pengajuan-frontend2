import { CreatePencairanRequest, Pencairan } from '../core/PencairanEntity';
import { PencairanRepository } from './PencairanRepository';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8081';

export class PencairanRepositoryImpl implements PencairanRepository {
    async createPencairan(request: CreatePencairanRequest): Promise<Pencairan> {
        const token = localStorage.getItem('token');
        
        const response = await fetch(`${API_URL}/pencairan`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify(request),
        });

        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.error || 'Failed to create pencairan');
        }

        const result = await response.json();
        return result.data;
    }

    async getPencairanByLoanId(loanId: number): Promise<Pencairan | null> {
        const token = localStorage.getItem('token');
        
        try {
            const response = await fetch(`${API_URL}/pencairan/loan/${loanId}`, {
                method: 'GET',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`,
                },
            });

            if (response.status === 404) {
                return null;
            }

            if (!response.ok) {
                throw new Error('Failed to fetch pencairan');
            }

            const result = await response.json();
            return result.data;
        } catch (error) {
            console.error('Error fetching pencairan by loan ID:', error);
            return null;
        }
    }
}

