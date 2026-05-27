'use client';
import dynamic from 'next/dynamic';

const JobSchemeResults = dynamic(() => import('../../views/JobSchemeResults'), { ssr: false });

export default function Page() {
  return <JobSchemeResults />;
}
