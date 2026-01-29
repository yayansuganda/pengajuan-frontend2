import { Pengajuan, PengajuanFilter } from './PengajuanEntity';

export interface PengajuanRepository {
    getPengajuanList(filter?: PengajuanFilter): Promise<Pengajuan[]>;
    getPengajuanDetail(id: string): Promise<Pengajuan>;
    createPengajuan(data: any): Promise<void>;
}
