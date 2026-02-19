import { Pengajuan, PengajuanFilter } from './PengajuanEntity';

export interface PengajuanRepository {
    getPengajuanList(filter?: PengajuanFilter): Promise<Pengajuan[]>;
    getPengajuanDetail(id: string): Promise<Pengajuan>;
    createPengajuan(data: any): Promise<void>;
    updatePengajuan(id: string, data: any): Promise<void>;
    updateStatus(id: string, status: string, rejectReason?: string, revisionNote?: string): Promise<void>;
    checkDuplicate(nik: string): Promise<{ exists: boolean, status?: string }>;
}
