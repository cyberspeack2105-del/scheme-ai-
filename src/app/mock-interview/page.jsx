'use client';
import dynamic from 'next/dynamic';

const MockInterviewLanding = dynamic(() => import('../../views/MockInterviewLanding'), { ssr: false });

export default function Page() {
  return <MockInterviewLanding />;
}
