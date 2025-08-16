import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ClientLayout from './components/ClientLayout';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ko">
      <body>
        <AppRouterCacheProvider options={{ enableCssLayer: true }}>
          <ClientLayout>
            {children}
          </ClientLayout>
        </AppRouterCacheProvider>
      </body>
    </html>
  );
} 