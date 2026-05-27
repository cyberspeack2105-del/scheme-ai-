'use client';
import dynamic from 'next/dynamic';

const JobsView = dynamic(() => import('../../../views/admin/JobsView'), { ssr: false });

export default function Page() {
  return <JobsView />;
}
