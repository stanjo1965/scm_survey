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
  Chip,
  CircularProgress
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
  Tooltip
} from 'recharts';
import { generateHTMLToPDF } from '../../utils/htmlPdfGenerator';
import {
  Download as DownloadIcon,
  Refresh as RefreshIcon,
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

interface SurveyResultData {
  id: string | number;
  totalScore: number;
  categoryScores: Record<string, number>;
  createdAt: string;
}

const categoryNames: Record<string, string> = {
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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [userInfo, setUserInfo] = useState<{ name?: string; company?: string; email?: string; phone?: string } | null>(null);
  const [surveyResult, setSurveyResult] = useState<SurveyResultData | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }

      const storedResult = localStorage.getItem('surveyResult');
      if (storedResult) {
        setSurveyResult(JSON.parse(storedResult));
      }
    }
  }, []);

  // 데이터 로딩 중
  if (!surveyResult) {
    return (
      <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 3 }}>
        <CircularProgress />
        <Typography variant="h6" color="text.secondary">
          진단 결과를 불러오는 중...
        </Typography>
        <Button variant="outlined" onClick={() => router.push('/survey/info')}>
          새 진단 시작하기
        </Button>
      </Box>
    );
  }

  const radarData = Object.entries(surveyResult.categoryScores).map(([key, value]) => ({
    category: categoryNames[key] || key,
    score: Number(value),
    fullMark: 5
  }));

  const barData = Object.entries(surveyResult.categoryScores).map(([key, value]) => ({
    category: categoryNames[key] || key,
    score: Number(value)
  }));

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      await generateHTMLToPDF(surveyResult, userInfo?.company || '귀하의 회사', aiAnalysis);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    setIsGeneratingAI(true);
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo: userInfo,
          resultData: surveyResult
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis);
      } else {
        alert('AI 분석 생성 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('AI 분석 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleNewSurvey = () => {
    router.push('/survey/info');
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleGoToImprovementPlan = () => {
    router.push('/improvement-plan');
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
              종합 점수: {surveyResult.totalScore.toFixed(1)}점
            </Typography>
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
              <Chip
                label={`${getMaturityLevel(surveyResult.totalScore)} 수준`}
                color="primary"
                variant="outlined"
                size="medium"
              />
              <Chip
                label={`${getGrade(surveyResult.totalScore)} 등급`}
                color="secondary"
                variant="outlined"
                size="medium"
              />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              귀사의 SCM 성숙도는 <strong>{getMaturityLevel(surveyResult.totalScore)} 수준</strong>입니다.
            </Typography>

            {/* 사용자 정보 표시 */}
            {userInfo && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                  진단자 정보
                </Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                  <Typography variant="body2">
                    <strong>이름:</strong> {userInfo.name}
                  </Typography>
                  <Typography variant="body2">
                    <strong>회사:</strong> {userInfo.company}
                  </Typography>
                  <Typography variant="body2">
                    <strong>이메일:</strong> {userInfo.email}
                  </Typography>
                  <Typography variant="body2">
                    <strong>전화:</strong> {userInfo.phone}
                  </Typography>
                </Box>
              </Box>
            )}

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
                variant="contained"
                color="secondary"
                startIcon={<PsychologyIcon />}
                onClick={handleGenerateAIAnalysis}
                disabled={isGeneratingAI}
                size="large"
              >
                {isGeneratingAI ? 'AI 분석 생성 중...' : 'AI 개선 방안 생성'}
              </Button>
              <Button
                variant="outlined"
                startIcon={<RefreshIcon />}
                onClick={handleNewSurvey}
                size="large"
              >
                새 진단 시작
              </Button>
              <Button
                variant="outlined"
                startIcon={<AssignmentIcon />}
                onClick={handleGoToImprovementPlan}
                size="large"
                color="secondary"
              >
                개선계획 관리
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
                  {Object.entries(surveyResult.categoryScores).map(([category, score]) => (
                    <Grid item xs={12} sm={6} md={4} key={category}>
                      <Paper sx={{ p: 3, height: '100%' }}>
                        <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                          {categoryNames[category] || category}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                          {Number(score).toFixed(1)}점
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress
                            variant="determinate"
                            value={(Number(score) / 5) * 100}
                            sx={{ height: 8, borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip
                            label={getMaturityLevel(Number(score))}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Chip
                            label={getGrade(Number(score))}
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

        {/* AI 분석 결과 */}
        {aiAnalysis && (
          <Card sx={{ mt: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <PsychologyIcon sx={{ fontSize: 30, color: 'secondary.main', mr: 2 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  AI 개선 방안 분석
                </Typography>
              </Box>
              <Box
                sx={{
                  p: 3,
                  bgcolor: 'grey.50',
                  borderRadius: 2,
                  border: '1px solid #e0e0e0'
                }}
              >
                <Typography
                  component="div"
                  variant="body1"
                  sx={{
                    whiteSpace: 'pre-line',
                    lineHeight: 1.8,
                    '& h2': {
                      color: 'primary.main',
                      fontWeight: 'bold',
                      mt: 3,
                      mb: 2,
                      fontSize: '1.3rem'
                    },
                    '& h3': {
                      color: 'secondary.main',
                      fontWeight: 'bold',
                      mt: 2,
                      mb: 1,
                      fontSize: '1.1rem'
                    },
                    '& ul': { pl: 3 },
                    '& li': { mb: 0.5 }
                  }}
                >
                  {aiAnalysis}
                </Typography>
              </Box>
            </CardContent>
          </Card>
        )}
      </Container>
    </Box>
  );
}
