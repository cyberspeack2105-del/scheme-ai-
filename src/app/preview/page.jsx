'use client';
import dynamic from 'next/dynamic';

const Preview = dynamic(() => import('../../views/Preview'), { ssr: false });

export default function Page() {
  return <Preview />;
}
