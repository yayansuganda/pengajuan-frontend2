import { UserList } from '@/modules/user/presentation/UserList';

// Disable static generation for this page
export const dynamic = 'force-dynamic';

export default function UsersPage() {
    return <UserList />;
}
