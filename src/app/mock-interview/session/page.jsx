'use client';
import dynamic from 'next/dynamic';

const MockInterviewSession = dynamic(() => import('../../../views/MockInterviewSession'), { ssr: false });

export default function Page() {
  return <MockInterviewSession />;
}
