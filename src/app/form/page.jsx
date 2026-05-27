'use client';
import dynamic from 'next/dynamic';

const VoiceForm = dynamic(() => import('../../views/VoiceForm'), { ssr: false });

export default function Page() {
  return <VoiceForm />;
}
