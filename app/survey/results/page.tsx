'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Container,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  LinearProgress,
  Paper,
  Chip
} from '@mui/material';
import {
  RadarChart,
  Radar,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend
} from 'recharts';
import { generateHTMLToPDF } from '../../utils/htmlPdfGenerator';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon
} from '@mui/icons-material';

// Mock 결과 데이터
const mockResult = {
  id: '1',
  userId: 'guest-123',
  companyId: 'guest-company',
  totalScore: 3.2,
  categoryScores: {
    planning: 3.1,
    procurement: 3.3,
    inventory: 2.8,
    production: 3.5,
    logistics: 3.0,
    integration: 3.4
  },
  createdAt: new Date().toISOString()
};

const categoryNames = {
  planning: '계획 관리',
  procurement: '조달 관리',
  inventory: '재고 관리',
  production: '생산 관리',
  logistics: '물류 관리',
  integration: '통합 관리'
};

const getMaturityLevel = (score: number): string => {
  if (score >= 4.5) return '최적화';
  if (score >= 3.5) return '표준화';
  if (score >= 2.5) return '체계화';
  if (score >= 1.5) return '기본';
  return '초기';
};

const getGrade = (score: number): string => {
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D+';
  return 'D';
};

export default function SurveyResultsPage() {
  const router = useRouter();
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const radarData = Object.entries(mockResult.categoryScores).map(([key, value]) => ({
    category: categoryNames[key as keyof typeof categoryNames],
    score: value,
    fullMark: 5
  }));

  const barData = Object.entries(mockResult.categoryScores).map(([key, value]) => ({
    category: categoryNames[key as keyof typeof categoryNames],
    score: value
  }));

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateHTMLToPDF(mockResult, '귀하의 회사');
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleNewSurvey = () => {
    router.push('/survey');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              진단 결과
            </Typography>
            <Button color="inherit" startIcon={<HomeIcon />} onClick={handleBackToHome}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Overall Score */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
              진단 완료!
            </Typography>
            <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
              종합 점수: {mockResult.totalScore.toFixed(1)}점
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Chip 
                label={`${getMaturityLevel(mockResult.totalScore)} 수준`} 
                color="primary" 
                variant="outlined"
                size="medium"
              />
              <Chip 
                label={`${getGrade(mockResult.totalScore)} 등급`} 
                color="secondary" 
                variant="outlined"
                size="medium"
              />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              귀사의 SCM 성숙도는 <strong>{getMaturityLevel(mockResult.totalScore)} 수준</strong>입니다.
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<DownloadIcon />}
                onClick={handleDownloadReport}
                disabled={isGeneratingPDF}
                size="large"
              >
                {isGeneratingPDF ? 'PDF 생성 중...' : 'PDF 보고서 다운로드'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleNewSurvey}
                size="large"
              >
                새 진단 시작
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Grid container spacing={4}>
          {/* Radar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  영역별 성숙도 분석
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <RadarChart data={radarData}>
                    <PolarGrid />
                    <PolarAngleAxis dataKey="category" />
                    <PolarRadiusAxis angle={90} domain={[0, 5]} />
                    <Radar
                      name="점수"
                      dataKey="score"
                      stroke="#1976d2"
                      fill="#1976d2"
                      fillOpacity={0.3}
                    />
                  </RadarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Bar Chart */}
          <Grid item xs={12} md={6}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  영역별 점수 비교
                </Typography>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={barData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="category" />
                    <YAxis domain={[0, 5]} />
                    <Tooltip />
                    <Bar dataKey="score" fill="#1976d2" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </Grid>

          {/* Category Details */}
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  영역별 상세 분석
                </Typography>
                <Grid container spacing={3}>
                  {Object.entries(mockResult.categoryScores).map(([category, score]) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {categoryNames[category as keyof typeof categoryNames]}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                          {score.toFixed(1)}점
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress 
                            variant="determinate" 
                            value={(score / 5) * 100} 
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip 
                            label={getMaturityLevel(score)} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={getGrade(score)} 
                            size="small" 
                            color="secondary" 
                            variant="outlined"
                          />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>
    </Box>
  );
} 