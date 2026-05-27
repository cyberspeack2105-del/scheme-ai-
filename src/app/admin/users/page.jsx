'use client';
import dynamic from 'next/dynamic';

const UsersView = dynamic(() => import('../../../views/admin/UsersView'), { ssr: false });

export default function Page() {
  return <UsersView />;
}
