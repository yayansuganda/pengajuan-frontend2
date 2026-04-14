import { Pensiunan } from './PensiunanEntity';

export type PengecekanResult =
    | { success: true; data: Pensiunan }
    | { success: false; error: string };

export interface PengecekanRepository {
    checkPensiunan(nopen: string): Promise<PengecekanResult>;
}
