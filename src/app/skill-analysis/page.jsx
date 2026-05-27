'use client';
import dynamic from 'next/dynamic';

const SkillGap = dynamic(() => import('../../views/SkillGap'), { ssr: false });

export default function Page() {
  return <SkillGap />;
}
