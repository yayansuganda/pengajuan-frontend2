'use client';

import { PengecekanPage } from '@/modules/pengecekan/presentation/PengecekanPage';
import { FrontingLayout } from '@/modules/fronting/presentation/FrontingLayout';

export default function Page() {
    return (
        <FrontingLayout title="Pengecekan Data">
            <PengecekanPage />
        </FrontingLayout>
    );
}
