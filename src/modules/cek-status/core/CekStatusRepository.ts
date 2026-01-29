import { PengajuanStatusResult } from './StatusEntity';

export interface CekStatusRepository {
    checkStatusByNik(nik: string): Promise<PengajuanStatusResult[]>; // Return array karena satu NIK bisa punya banyak pengajuan
}
