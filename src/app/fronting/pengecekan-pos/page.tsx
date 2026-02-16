'use client';

import { PengecekanPage } from '@/modules/pengecekan/presentation/PengecekanPage';
import { useAuth } from '@/modules/auth/presentation/useAuth';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

export default function Page() {
    const { user } = useAuth();
    const router = useRouter();

    // Redirect officer and petugas-pos to fronting home
    useEffect(() => {
        if (user && (user.role === 'officer' || user.role === 'petugas-pos')) {
            router.push('/fronting');
        }
    }, [user, router]);

    // Don't render if user is officer or petugas-pos
    if (user?.role === 'officer' || user?.role === 'petugas-pos') {
        return null;
    }

    return <PengecekanPage viewMode="mobile" forceVisible={true} />;
}
