'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  Analytics as AnalyticsIcon,
  TrendingUp as TrendingUpIcon,
  Security as SecurityIcon,
  Speed as SpeedIcon,
  Support as SupportIcon,
  ArrowForward as ArrowForwardIcon,
  Info as InfoIcon,
  ContactSupport as ContactSupportIcon,
  Assignment as AssignmentIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export default function HomePage() {
  const router = useRouter();

  const handleStartSurvey = () => {
    console.log('진단 시작 버튼 클릭됨');
    try {
      // 정보 입력 페이지로 이동
      router.push('/survey/info');
    } catch (error) {
      console.error('페이지 이동 오류:', error);
      // 대안: window.location 사용
      window.location.href = '/survey/info';
    }
  };

  const handleLearnMore = () => {
    router.push('/about');
  };

  const handleContactUs = () => {
    router.push('/contact');
  };

  const handleGoToImprovementPlan = () => {
    router.push('/improvement-plan');
  };

  const features = [
    {
      icon: <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main' }} />,
      title: '종합 진단',
      description: '6개 영역의 SCM 성숙도를 체계적으로 진단합니다.'
    },
    {
      icon: <AnalyticsIcon sx={{ fontSize: 40, color: 'success.main' }} />,
      title: '상세 분석',
      description: '영역별 점수와 개선 방안을 제시합니다.'
    },
    {
      icon: <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main' }} />,
      title: '성과 추적',
      description: '진단 결과를 바탕으로 지속적인 개선을 지원합니다.'
    },
    {
      icon: <SecurityIcon sx={{ fontSize: 40, color: 'info.main' }} />,
      title: '데이터 보안',
      description: '모든 진단 데이터는 안전하게 보호됩니다.'
    },
    {
      icon: <SpeedIcon sx={{ fontSize: 40, color: 'secondary.main' }} />,
      title: '빠른 진단',
      description: '약 10분 내에 완료되는 간편한 진단 과정입니다.'
    },
    {
      icon: <SupportIcon sx={{ fontSize: 40, color: 'error.main' }} />,
      title: '전문 지원',
      description: 'SCM 전문가의 상세한 분석과 권장사항을 제공합니다.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Box sx={{ bgcolor: 'white', p: 0.5, borderRadius: 1, display: 'flex' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src="/ksa_logo.png" alt="KSA Logo" style={{ height: '40px', width: 'auto' }} />
              </Box>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                SCM 성숙도 진단 시스템
              </Typography>
            </Box>
            <Stack direction="row" spacing={2}>
              <Button color="inherit" startIcon={<InfoIcon />} onClick={handleLearnMore}>
                자세히 알아보기
              </Button>
              <Button color="inherit" startIcon={<AssignmentIcon />} onClick={handleGoToImprovementPlan}>
                개선계획 관리
              </Button>
              <Button color="inherit" startIcon={<SettingsIcon />} onClick={() => router.push('/admin/settings')}>
                관리자 설정
              </Button>
              <Button color="inherit" startIcon={<ContactSupportIcon />} onClick={handleContactUs}>
                문의하기
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* Hero Section */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 8 }}>
        <Container maxWidth="lg">
          <Grid container spacing={6} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography variant="h2" component="h1" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                SCM 성숙도 진단
              </Typography>
              <Typography variant="h5" paragraph sx={{ mb: 4, opacity: 0.9 }}>
                공급망 관리(SCM)의 현재 수준을 진단하고<br />
                체계적인 개선 방안을 제시합니다
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={handleStartSurvey}
                  component="a"
                  href="/survey/info"
                  sx={{
                    bgcolor: 'white',
                    color: 'primary.main',
                    px: 4,
                    py: 1.5,
                    textDecoration: 'none',
                    '&:hover': { bgcolor: 'grey.100' }
                  }}
                >
                  진단 시작하기
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleLearnMore}
                  sx={{
                    borderColor: 'white',
                    color: 'white',
                    px: 4,
                    py: 1.5,
                    '&:hover': { borderColor: 'grey.300', bgcolor: 'rgba(255,255,255,0.1)' }
                  }}
                >
                  자세히 알아보기
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Card sx={{
                bgcolor: '#f5f5f5',
                p: 3,
                borderRadius: 3,
                border: '1px solid #e0e0e0'
              }}>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  SCM 프로세스 모델
                </Typography>
                <Box sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  mb: 2
                }}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      1 Plan
                    </Typography>
                    <Box sx={{
                      width: 60,
                      height: 30,
                      bgcolor: '#1976d2',
                      borderRadius: '0 15px 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        →
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      2 Source
                    </Typography>
                    <Box sx={{
                      width: 60,
                      height: 30,
                      bgcolor: '#388e3c',
                      borderRadius: '0 15px 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        →
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      3 Make
                    </Typography>
                    <Box sx={{
                      width: 60,
                      height: 30,
                      bgcolor: '#f57c00',
                      borderRadius: '0 15px 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        →
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      4 Deliver
                    </Typography>
                    <Box sx={{
                      width: 60,
                      height: 30,
                      bgcolor: '#7b1fa2',
                      borderRadius: '0 15px 15px 0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center'
                    }}>
                      <Typography variant="caption" sx={{ color: 'white', fontWeight: 'bold' }}>
                        ✓
                      </Typography>
                    </Box>
                  </Box>
                </Box>
                <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.9rem' }}>
                  계획 수립부터 배송까지 통합적인 공급망 관리 프로세스
                </Typography>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Typography variant="h3" component="h2" align="center" gutterBottom sx={{ fontWeight: 'bold', mb: 6 }}>
          진단 시스템의 특징
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <Card sx={{ height: '100%', p: 3, textAlign: 'center' }}>
                <Box sx={{ mb: 2 }}>
                  {feature.icon}
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                  {feature.title}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  {feature.description}
                </Typography>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* CTA Section */}
      <Box sx={{ bgcolor: 'grey.100', py: 8 }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center' }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              지금 바로 진단을 시작하세요
            </Typography>
            <Typography variant="h6" paragraph sx={{ mb: 4, color: 'text.secondary' }}>
              무료로 제공되는 SCM 성숙도 진단으로 귀사의 공급망 관리 수준을 확인하고<br />
              체계적인 개선 방안을 받아보세요
            </Typography>
            <Button
              variant="contained"
              size="large"
              onClick={handleStartSurvey}
              component="a"
              href="/survey/info"
              endIcon={<ArrowForwardIcon />}
              sx={{ px: 6, py: 2, fontSize: '1.1rem', textDecoration: 'none' }}
            >
              무료 진단 시작하기
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Footer */}
      <Box sx={{ bgcolor: 'primary.dark', color: 'white', py: 4 }}>
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                SCM 성숙도 진단 시스템
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                공급망 관리의 현재 수준을 진단하고 체계적인 개선 방안을 제시하는 전문 진단 시스템입니다.
              </Typography>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                진단 영역
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                <Chip label="계획 관리" size="small" variant="outlined" />
                <Chip label="조달 관리" size="small" variant="outlined" />
                <Chip label="재고 관리" size="small" variant="outlined" />
                <Chip label="생산 관리" size="small" variant="outlined" />
                <Chip label="물류 관리" size="small" variant="outlined" />
                <Chip label="통합 관리" size="small" variant="outlined" />
              </Stack>
            </Grid>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                연락처
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8, mb: 1 }}>
                이메일: sangkeun.jo@gmail.com
              </Typography>
              <Typography variant="body2" sx={{ opacity: 0.8 }}>
                전화: 010-2482-7898
              </Typography>
            </Grid>
          </Grid>
          <Box sx={{ borderTop: 1, borderColor: 'rgba(255,255,255,0.2)', mt: 4, pt: 2, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ opacity: 0.6 }}>
              © 2025 SCM 성숙도 진단 시스템. KSA 한국표준협회 All rights reserved.
            </Typography>
          </Box>
        </Container>
      </Box>
    </Box>
  );
} 