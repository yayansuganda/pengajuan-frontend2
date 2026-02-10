'use client';

import React, { Suspense } from 'react';
import { PengajuanDetail } from '@/modules/pengajuan/presentation/PengajuanDetail';
import { useParams } from 'next/navigation';

export default function FrontingDetailPage() {
    const params = useParams();
    const id = params?.id as string;

    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mb-4"></div>
                    <p className="text-slate-600">Memuat detail pengajuan...</p>
                </div>
            </div>
        }>
            <PengajuanDetail id={id} />
        </Suspense>
    );
}
