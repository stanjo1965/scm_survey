'use client';

import { useRouter } from 'next/navigation';
import { Box, Container, Typography, Button } from '@mui/material';
import { Home as HomeIcon } from '@mui/icons-material';

export default function SurveyResultDetailPage() {
  const router = useRouter();

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
      <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
        결과 상세 페이지
      </Typography>
      <Typography variant="body1" color="text.secondary">
        준비 중인 페이지입니다.
      </Typography>
      <Button variant="contained" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
        홈으로 돌아가기
      </Button>
    </Box>
  );
}
