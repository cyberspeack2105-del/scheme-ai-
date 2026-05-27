'use client';
import dynamic from 'next/dynamic';

const TermsOfService = dynamic(() => import('../../views/TermsOfService'), { ssr: false });

export default function Page() {
  return <TermsOfService />;
}
