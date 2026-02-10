'use client';

import { PengajuanList } from '@/modules/pengajuan/presentation/PengajuanList';


export default function Page() {
    return <PengajuanList viewMode="mobile" forceVisible={true} />;
}
