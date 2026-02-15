'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  CircularProgress,
  AppBar,
  Toolbar,
  Tab,
  Tabs
} from '@mui/material';
import {
  Home as HomeIcon,
  Logout as LogoutIcon,
  Dashboard as DashboardIcon,
  Settings as SettingsIcon,
  Assessment as AssessmentIcon
} from '@mui/icons-material';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export default function AdminLayout({ children }: AdminLayoutProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      router.replace('/admin/login');
      return;
    }

    try {
      const response = await fetch('/api/admin/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token }),
      });

      const data = await response.json();
      if (data.valid) {
        setIsAuthenticated(true);
      } else {
        localStorage.removeItem('admin_token');
        router.replace('/admin/login');
      }
    } catch {
      localStorage.removeItem('admin_token');
      router.replace('/admin/login');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('admin_token');
    router.replace('/admin/login');
  };

  const getTabValue = () => {
    if (pathname === '/admin') return 0;
    if (pathname === '/admin/results') return 1;
    if (pathname === '/admin/settings') return 2;
    return 0;
  };

  if (loading) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      <AppBar position="static">
        <Toolbar>
          <DashboardIcon sx={{ mr: 1 }} />
          <Typography variant="h6" sx={{ flexGrow: 0, mr: 4 }}>
            SCM 관리자
          </Typography>
          <Tabs
            value={getTabValue()}
            textColor="inherit"
            indicatorColor="secondary"
            sx={{ flexGrow: 1, '& .MuiTab-root': { color: 'rgba(255,255,255,0.7)', '&.Mui-selected': { color: 'white' } } }}
          >
            <Tab label="대시보드" onClick={() => router.push('/admin')} />
            <Tab label="설문 결과" onClick={() => router.push('/admin/results')} />
            <Tab label="설정" onClick={() => router.push('/admin/settings')} />
          </Tabs>
          <Button color="inherit" startIcon={<HomeIcon />} onClick={() => router.push('/')} sx={{ mr: 1 }}>
            홈
          </Button>
          <Button color="inherit" startIcon={<LogoutIcon />} onClick={handleLogout}>
            로그아웃
          </Button>
        </Toolbar>
      </AppBar>
      <Container maxWidth="lg" sx={{ py: 4 }}>
        {children}
      </Container>
    </Box>
  );
}
