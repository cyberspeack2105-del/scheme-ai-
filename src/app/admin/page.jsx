'use client';
import dynamic from 'next/dynamic';

const AdminPanel = dynamic(() => import('../../views/admin/Panel'), { ssr: false });

export default function Page() {
  return <AdminPanel />;
}
