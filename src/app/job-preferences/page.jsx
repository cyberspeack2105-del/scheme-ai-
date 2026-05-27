'use client';
import dynamic from 'next/dynamic';

const JobPreferences = dynamic(() => import('../../views/JobPreferences'), { ssr: false });

export default function Page() {
  return <JobPreferences />;
}
