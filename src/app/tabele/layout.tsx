import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tabele – Dart Dębica Zone',
  robots: { index: false, follow: false },
};

export default function TabeleLayout({ children }: { children: React.ReactNode }) {
  return children;
}
