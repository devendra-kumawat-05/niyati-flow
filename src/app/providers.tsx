'use client';

import { ReactNode } from 'react';
import { ToastProvider } from '@/components/ui/simple-toast';

export function Providers({ children }: { children: ReactNode }) {
  return <ToastProvider>{children}</ToastProvider>;
}
