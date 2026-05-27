'use client';

import { useRouter, usePathname, useSearchParams, useParams as useNextParams } from 'next/navigation';
import NextLink from 'next/link';
import React from 'react';

export function useNavigate() {
  const router = useRouter();
  return (to, options) => {
    if (to === -1) {
      router.back();
    } else {
      if (options?.state && typeof window !== 'undefined') {
        window.__router_state = options.state;
      }
      router.push(to);
    }
  };
}

export function useLocation() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  
  // Create query string
  const search = searchParams ? `?${searchParams.toString()}` : '';
  
  return {
    pathname,
    search: search === '?' ? '' : search,
    state: typeof window !== 'undefined' ? window.__router_state : null
  };
}

export function Link({ to, children, ...props }) {
  // Replace direct router features with Next Link
  return (
    <NextLink href={to || '#'} {...props}>
      {children}
    </NextLink>
  );
}

export function Navigate({ to, replace }) {
  const router = useRouter();
  React.useEffect(() => {
    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [to, replace, router]);
  return null;
}

export function useParams() {
  return useNextParams() || {};
}
