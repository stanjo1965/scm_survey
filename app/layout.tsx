import { AppRouterCacheProvider } from '@mui/material-nextjs/v13-appRouter';
import ClientLayout from './components/ClientLayout';
import './globals.css';

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key:", supabaseAnonKey);
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