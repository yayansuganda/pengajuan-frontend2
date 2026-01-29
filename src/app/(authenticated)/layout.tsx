'use client';

import { DashboardLayout } from '@/modules/dashboard/presentation/DashboardLayout';

export default function Layout({ children }: { children: React.ReactNode }) {
    return <DashboardLayout>{children}</DashboardLayout>;
}
