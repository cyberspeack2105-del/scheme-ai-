'use client';
import dynamic from 'next/dynamic';

const ReviewApplication = dynamic(() => import('../../views/ReviewApplication'), { ssr: false });

export default function Page() {
  return <ReviewApplication />;
}
