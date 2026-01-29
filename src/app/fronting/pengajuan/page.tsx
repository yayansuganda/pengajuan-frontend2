'use client';

import { PengajuanList } from '@/modules/pengajuan/presentation/PengajuanList';
import { FrontingLayout } from '@/modules/fronting/presentation/FrontingLayout';

export default function Page() {
    return (
        <FrontingLayout title="Data Pengajuan">
            <PengajuanList />
        </FrontingLayout>
    );
}
