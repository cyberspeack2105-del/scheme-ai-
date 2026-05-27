'use client';
import dynamic from 'next/dynamic';

const SchemesView = dynamic(() => import('../../../views/admin/SchemesView'), { ssr: false });

export default function Page() {
  return <SchemesView />;
}
