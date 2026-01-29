export interface Pencairan {
    id: number;
    loan_id: number;
    user_id: number;
    unit: string;
    bank_name: string;
    account_number: string;
    account_name: string;
    status: string;
    notes?: string;
    created_at: string;
    updated_at: string;
}

export interface CreatePencairanRequest {
    loan_id: number;
    bank_name: string;
    account_number: string;
    account_name: string;
}

