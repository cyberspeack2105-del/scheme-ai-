'use client';
import dynamic from 'next/dynamic';

const LearnMore = dynamic(() => import('../../views/LearnMore'), { ssr: false });

export default function Page() {
  return <LearnMore />;
}
