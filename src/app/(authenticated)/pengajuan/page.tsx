'use client';

import { PengajuanList } from '@/modules/pengajuan/presentation/PengajuanList';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function PengajuanPage() {
    return <PengajuanList />;
}
