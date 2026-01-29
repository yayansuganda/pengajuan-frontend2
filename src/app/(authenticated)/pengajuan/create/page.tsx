'use client';

import React from 'react';
import { CreatePengajuanWizard } from '@/modules/pengajuan/presentation/components/CreatePengajuanWizard';
import { useAuth } from '@/modules/auth/presentation/useAuth';

export default function CreatePengajuanPage() {
    const { user } = useAuth();

    return <CreatePengajuanWizard />;
}
