'use client';

import { PengajuanDetail } from '@/modules/pengajuan/presentation/PengajuanDetail';
import { useParams } from 'next/navigation';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function PengajuanDetailPage() {
    const params = useParams();
    const id = params.id as string;

    return <PengajuanDetail id={id} />;
}
