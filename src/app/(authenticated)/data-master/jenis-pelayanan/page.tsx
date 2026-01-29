import { JenisPelayananList } from '@/modules/jenis-pelayanan/presentation/JenisPelayananList';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function Page() {
    return <JenisPelayananList />;
}
