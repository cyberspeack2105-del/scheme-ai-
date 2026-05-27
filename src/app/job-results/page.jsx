'use client';
import dynamic from 'next/dynamic';

const JobResults = dynamic(() => import('../../views/JobResults'), { ssr: false });

export default function Page() {
  return <JobResults />;
}
