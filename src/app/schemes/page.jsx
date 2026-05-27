'use client';
import dynamic from 'next/dynamic';

const Schemes = dynamic(() => import('../../views/Schemes'), { ssr: false });

export default function Page() {
  return <Schemes />;
}
