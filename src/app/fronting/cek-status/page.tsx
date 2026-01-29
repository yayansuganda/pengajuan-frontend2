'use client';

import { CekStatusPage } from '@/modules/cek-status/presentation/CekStatusPage';
import { FrontingLayout } from '@/modules/fronting/presentation/FrontingLayout';

export default function Page() {
    return (
        <FrontingLayout title="Cek Status Pengajuan">
            <CekStatusPage />
        </FrontingLayout>
    );
}
