'use client';

import { Box, Container, Typography, Button, Card, CardContent, Grid, Paper } from '@mui/material';
import { useRouter } from 'next/navigation';
import { ArrowBack } from '@mui/icons-material';

export default function AboutPage() {
  const router = useRouter();

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleStartSurvey = () => {
    router.push('/survey');
  };

  const scmProcesses = [
    {
      title: '1. Plan (계획)',
      description: '수요 예측, 생산 계획, 재고 계획 등을 통합적으로 수립하는 단계',
      details: [
        '수요 예측 및 분석',
        'S&OP (Sales & Operations Planning)',
        '생산 계획 수립',
        '재고 계획 및 관리'
      ]
    },
    {
      title: '2. Source (조달)',
      description: '공급업체 관리, 구매 프로세스, 품질 관리 등을 수행하는 단계',
      details: [
        '공급업체 평가 및 선정',
        '구매 프로세스 관리',
        '품질 관리 및 검증',
        '공급업체 관계 관리'
      ]
    },
    {
      title: '3. Make (생산)',
      description: '제품 생산, 품질 관리, 생산성 향상을 위한 활동을 수행하는 단계',
      details: [
        '생산 계획 실행',
        '품질 관리 및 검사',
        '생산성 향상 활동',
        '설비 관리 및 유지보수'
      ]
    },
    {
      title: '4. Deliver (배송)',
      description: '물류 관리, 배송, 고객 서비스를 제공하는 단계',
      details: [
        '운송 및 물류 관리',
        '창고 운영 및 관리',
        '배송 서비스 제공',
        '고객 만족도 관리'
      ]
    }
  ];

  const benefits = [
    {
      title: '비용 절감',
      description: '효율적인 공급망 관리를 통해 운영 비용을 최대 30%까지 절감할 수 있습니다.'
    },
    {
      title: '고객 만족도 향상',
      description: '정확한 수요 예측과 신속한 배송으로 고객 만족도를 크게 향상시킬 수 있습니다.'
    },
    {
      title: '리스크 관리',
      description: '체계적인 위험 관리 체계를 통해 공급망 중단 위험을 최소화합니다.'
    },
    {
      title: '경쟁력 강화',
      description: '최적화된 SCM을 통해 시장에서의 경쟁력을 크게 향상시킬 수 있습니다.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SCM 성숙도 진단 시스템
            </Typography>
            <Button color="inherit" startIcon={<ArrowBack />} onClick={handleBackToHome}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Introduction */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main', mb: 3 }}>
              SCM (Supply Chain Management)이란?
            </Typography>
            <Typography variant="h6" paragraph sx={{ lineHeight: 1.6, color: 'text.secondary', mb: 3 }}>
              공급망 관리(SCM)는 제품이나 서비스가 원자재 단계에서 최종 소비자에게 전달되기까지의 전체 과정을 계획, 실행, 모니터링하는 통합적인 관리 시스템입니다.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
              효과적인 SCM은 비용 절감, 고객 만족도 향상, 리스크 관리, 그리고 전반적인 경쟁력 강화에 핵심적인 역할을 합니다. 우리의 진단 시스템은 귀사의 SCM 성숙도를 평가하고 개선 방안을 제시하여 지속적인 발전을 지원합니다.
            </Typography>
          </CardContent>
        </Card>

        {/* SCM Process Flow */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              SCM 프로세스 흐름
            </Typography>
            <Grid container spacing={3}>
              {scmProcesses.map((process, index) => (
                <Grid item xs={12} md={6} key={index}>
                  <Paper sx={{ p: 3, height: '100%', borderLeft: `4px solid ${index === 0 ? '#1976d2' : index === 1 ? '#388e3c' : index === 2 ? '#f57c00' : '#7b1fa2'}` }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {process.title}
                    </Typography>
                    <Typography variant="body2" paragraph sx={{ color: 'text.secondary', mb: 2 }}>
                      {process.description}
                    </Typography>
                    <Box component="ul" sx={{ pl: 2 }}>
                      {process.details.map((detail, detailIndex) => (
                        <Typography component="li" key={detailIndex} variant="body2" sx={{ mb: 0.5 }}>
                          {detail}
                        </Typography>
                      ))}
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* SCM Process Diagram */}
        <Card sx={{ mb: 6 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h3" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              SCM 프로세스 다이어그램
            </Typography>
            <Box sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center', 
              maxWidth: 600, 
              mx: 'auto', 
              mb: 3 
            }}>
              {scmProcesses.map((process, index) => (
                <Box key={index} sx={{ textAlign: 'center', flex: 1 }}>
                  <Box sx={{ 
                    width: 80, 
                    height: 80, 
                    borderRadius: '50%', 
                    bgcolor: index === 0 ? '#1976d2' : index === 1 ? '#388e3c' : index === 2 ? '#f57c00' : '#7b1fa2', 
                    color: 'white', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    mx: 'auto', 
                    mb: 1, 
                    fontWeight: 'bold' 
                  }}>
                    {index + 1}
                  </Box>
                  <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                    {process.title.split(' ')[1]}
                  </Typography>
                  {index < scmProcesses.length - 1 && (
                    <Box sx={{ 
                      width: 40, 
                      height: 2, 
                      bgcolor: 'primary.main', 
                      mx: 'auto', 
                      mt: 2 
                    }} />
                  )}
                </Box>
              ))}
            </Box>
            <Typography variant="body2" color="text.secondary">
              계획 수립부터 배송까지 통합적인 공급망 관리 프로세스
            </Typography>
          </CardContent>
        </Card>

        {/* Benefits */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              효과적인 SCM의 혜택
            </Typography>
            <Grid container spacing={3}>
              {benefits.map((benefit, index) => (
                <Grid item xs={12} sm={6} md={3} key={index}>
                  <Paper sx={{ p: 3, height: '100%', textAlign: 'center' }}>
                    <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {benefit.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {benefit.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* CTA */}
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
            sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
          >
            진단 시작하기
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 