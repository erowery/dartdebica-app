import './globals.css';

export const metadata = {
  title: 'Dart Dębica - Ligi i Wyniki Live',
  description: 'Oficjalna aplikacja Stowarzyszenia Dart Dębica',
  themeColor: '#07080d',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pl">
      <body>{children}</body>
    </html>
  );
}
