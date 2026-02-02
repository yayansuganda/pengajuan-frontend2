'use client';

import React from 'react';
import { CreatePengajuanWizard } from '@/modules/pengajuan/presentation/components/CreatePengajuanWizard';
import { useParams } from 'next/navigation';

export default function EditPengajuanPage() {
    const params = useParams();
    const id = params.id as string;

    return <CreatePengajuanWizard pengajuanId={id} />;
}
