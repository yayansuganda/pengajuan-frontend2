import { CreatePencairanRequest, Pencairan } from '../core/PencairanEntity';

export interface PencairanRepository {
    createPencairan(request: CreatePencairanRequest): Promise<Pencairan>;
    getPencairanByLoanId(loanId: number): Promise<Pencairan | null>;
}

