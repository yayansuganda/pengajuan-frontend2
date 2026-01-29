'use client';

import { UnitForm } from '@/modules/unit/presentation/UnitForm';
import { use } from 'react';

export default function EditUnitPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const unitId = parseInt(resolvedParams.id);

    return <UnitForm unitId={unitId} />;
}
