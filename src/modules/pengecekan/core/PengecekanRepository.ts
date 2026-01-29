import { Pensiunan } from './PensiunanEntity';

export interface PengecekanRepository {
    checkPensiunan(nopen: string): Promise<Pensiunan>;
}
