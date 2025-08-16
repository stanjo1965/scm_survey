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
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Alert
} from '@mui/material';
import {
  Assessment as AssessmentIcon,
  ArrowForward as ArrowForwardIcon,
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Timer as TimerIcon,
  Security as SecurityIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

export default function SurveyPage() {
  const router = useRouter();

  
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  console.log("Supabase URL:", supabaseUrl);
  console.log("Supabase Anon Key:", supabaseAnonKey);

  const handleStartSurvey = () => {
    router.push('/survey/questions');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const categories = [
    { name: '계획 관리', description: '수요 예측, S&OP, 생산 계획 등', color: '#1976d2' },
    { name: '조달 관리', description: '공급업체 관리, 구매 프로세스 등', color: '#388e3c' },
    { name: '재고 관리', description: '재고 최적화, ABC 분석 등', color: '#f57c00' },
    { name: '생산 관리', description: '생산 계획, 품질 관리 등', color: '#7b1fa2' },
    { name: '물류 관리', description: '운송, 창고 관리, 배송 등', color: '#d32f2f' },
    { name: '통합 관리', description: 'SCM 시스템, 성과 측정 등', color: '#1976d2' }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SCM 성숙도 진단
            </Typography>
            <Button color="inherit" startIcon={<ArrowBackIcon />} onClick={handleBackToHome}>
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
              SCM 성숙도 진단
            </Typography>
            <Typography variant="h6" paragraph sx={{ lineHeight: 1.6, color: 'text.secondary', mb: 3 }}>
              공급망 관리(SCM)의 현재 수준을 체계적으로 진단하고, 개선 방안을 제시하는 전문 진단 시스템입니다.
            </Typography>
            <Typography variant="body1" sx={{ lineHeight: 1.6, mb: 4 }}>
              이 진단은 6개 영역에서 총 60개의 질문을 통해 귀사의 SCM 성숙도를 평가합니다. 
              각 질문에 대해 1점(매우 부족)부터 5점(매우 우수)까지의 척도로 답변해주시면 됩니다.
            </Typography>
          </CardContent>
        </Card>

        {/* Evaluation Scale */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              평가 척도
            </Typography>
            <Grid container spacing={2}>
              {[
                { score: 1, label: '매우 부족', description: '해당 영역이 거의 체계화되지 않음' },
                { score: 2, label: '부족', description: '기본적인 수준으로 개선 필요' },
                { score: 3, label: '보통', description: '일반적인 수준으로 부분적 개선 필요' },
                { score: 4, label: '우수', description: '상위 수준으로 일부 고도화 필요' },
                { score: 5, label: '매우 우수', description: '최적화된 수준으로 지속적 유지 필요' }
              ].map((item) => (
                <Grid item xs={12} sm={6} md={2.4} key={item.score}>
                  <Paper sx={{ p: 2, textAlign: 'center', height: '100%' }}>
                    <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                      {item.score}점
                    </Typography>
                    <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {item.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.description}
                    </Typography>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Diagnosis Categories */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              진단 영역
            </Typography>
            <Grid container spacing={3}>
              {categories.map((category, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card sx={{ 
                    height: '100%', 
                    borderLeft: `4px solid ${category.color}`,
                    '&:hover': { boxShadow: 3 }
                  }}>
                    <CardContent>
                      <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 'bold' }}>
                        {category.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {category.description}
                      </Typography>
                      <Box sx={{ mt: 2 }}>
                        <Chip 
                          label="10개 질문" 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                      </Box>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </CardContent>
        </Card>

        {/* Process Diagram */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              SCM 프로세스 다이어그램
            </Typography>
            <Box sx={{ 
              width: 300, 
              height: 200, 
              bgcolor: 'rgba(25,118,210,0.1)', 
              borderRadius: 2, 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center',
              border: '2px dashed rgba(25,118,210,0.3)',
              mx: 'auto'
            }}>
              <Typography variant="h6" color="primary">
                SCM 프로세스 다이어그램
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Information Cards */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <TimerIcon sx={{ fontSize: 40, color: 'primary.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  소요 시간
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  약 10-15분
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  총 질문 수
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  60개 질문
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <SecurityIcon sx={{ fontSize: 40, color: 'info.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  데이터 보안
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  안전하게 보호
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card sx={{ height: '100%', textAlign: 'center' }}>
              <CardContent>
                <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 2 }} />
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                  상세 분석
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  영역별 점수 제공
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* CTA */}
        <Box sx={{ textAlign: 'center' }}>
          <Alert severity="info" sx={{ mb: 3, textAlign: 'left' }}>
            <Typography variant="body2">
              <strong>진단 시작 전 안내사항:</strong><br />
              • 모든 질문에 답변해주셔야 정확한 진단이 가능합니다.<br />
              • 각 모듈별로 모든 질문을 완료한 후 다음 모듈로 진행됩니다.<br />
              • 진단 결과는 즉시 확인 가능하며, PDF 보고서로 다운로드할 수 있습니다.
            </Typography>
          </Alert>
          <Button
            variant="contained"
            size="large"
            onClick={handleStartSurvey}
            endIcon={<ArrowForwardIcon />}
            sx={{ px: 6, py: 2, fontSize: '1.1rem' }}
          >
            진단 시작하기
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 