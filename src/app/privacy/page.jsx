'use client';
import dynamic from 'next/dynamic';

const PrivacyPolicy = dynamic(() => import('../../views/PrivacyPolicy'), { ssr: false });

export default function Page() {
  return <PrivacyPolicy />;
}
