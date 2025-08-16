'use client';

import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from '../theme';
import { SurveyProvider } from '../contexts/SurveyContext';

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <SurveyProvider>
        {children}
      </SurveyProvider>
    </ThemeProvider>
  );
} 