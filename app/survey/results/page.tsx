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
  CircularProgress,
  Fab,
  Skeleton
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
  Assignment as AssignmentIcon,
  Chat as ChatIcon,
  AutoAwesome
} from '@mui/icons-material';
import StructuredAnalysisView from '../../components/StructuredAnalysis';
import BenchmarkComparison from '../../components/BenchmarkComparison';
import AIChatPanel from '../../components/AIChatPanel';
import { StructuredAnalysis, BenchmarkData, CATEGORY_NAMES } from '../../types/ai';

interface SurveyResultData {
  id: string | number;
  totalScore: number;
  categoryScores: Record<string, number>;
  createdAt: string;
}

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
  const [aiAnalysis, setAiAnalysis] = useState<StructuredAnalysis | null>(null);
  const [isFallback, setIsFallback] = useState(false);
  const [benchmarkData, setBenchmarkData] = useState<BenchmarkData | null>(null);
  const [chatOpen, setChatOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);
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

  // 벤치마크 데이터 자동 로드
  useEffect(() => {
    if (surveyResult && userInfo) {
      fetchBenchmark();
    }
  }, [surveyResult, userInfo]);

  const fetchBenchmark = async () => {
    try {
      const params = new URLSearchParams();
      if (userInfo?.industry) params.set('industry', userInfo.industry);
      if (userInfo?.companySize) params.set('companySize', userInfo.companySize);
      if (surveyResult?.id) params.set('surveyResultId', String(surveyResult.id));

      const response = await fetch(`/api/benchmark?${params.toString()}`);
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setBenchmarkData(data.data);
        }
      }
    } catch (e) {
      // 벤치마크 로드 실패 무시
    }
  };

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
    category: CATEGORY_NAMES[key] || key,
    score: Number(value),
    fullMark: 5
  }));

  const barData = Object.entries(surveyResult.categoryScores).map(([key, value]) => ({
    category: CATEGORY_NAMES[key] || key,
    score: Number(value)
  }));

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      const aiText = aiAnalysis ? aiAnalysis.executive_summary + '\n\n' + aiAnalysis.overall_assessment : '';
      await generateHTMLToPDF(surveyResult, userInfo?.company || '귀하의 회사', aiText);
    } catch (error) {
      console.error('PDF 생성 오류:', error);
      alert('PDF 생성 중 오류가 발생했습니다.');
    } finally {
      setIsGeneratingPDF(false);
    }
  };

  const handleGenerateAIAnalysis = async () => {
    setIsGeneratingAI(true);
    setIsFallback(false);
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo,
          resultData: {
            ...surveyResult,
            totalScore: surveyResult.totalScore
          },
          benchmarkData: benchmarkData?.categories?.reduce((acc: any, cat: any) => {
            acc[cat.category_key] = { avg: cat.avg_score, percentile: cat.percentile };
            return acc;
          }, {})
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis);
        setIsFallback(data.isFallback || false);
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

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              진단 결과
            </Typography>
            <Button color="inherit" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
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
              <Chip label={`${getMaturityLevel(surveyResult.totalScore)} 수준`} color="primary" variant="outlined" size="medium" />
              <Chip label={`${getGrade(surveyResult.totalScore)} 등급`} color="secondary" variant="outlined" size="medium" />
            </Box>
            <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
              귀사의 SCM 성숙도는 <strong>{getMaturityLevel(surveyResult.totalScore)} 수준</strong>입니다.
            </Typography>

            {userInfo && (
              <Box sx={{ mb: 3, p: 2, bgcolor: 'grey.50', borderRadius: 2 }}>
                <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>진단자 정보</Typography>
                <Box sx={{ display: 'flex', justifyContent: 'center', gap: 4, flexWrap: 'wrap' }}>
                  {userInfo.name && <Typography variant="body2"><strong>이름:</strong> {userInfo.name}</Typography>}
                  {userInfo.company && <Typography variant="body2"><strong>회사:</strong> {userInfo.company}</Typography>}
                  {userInfo.industry && <Typography variant="body2"><strong>업종:</strong> {userInfo.industry}</Typography>}
                  {userInfo.companySize && <Typography variant="body2"><strong>규모:</strong> {userInfo.companySize}</Typography>}
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
                startIcon={isGeneratingAI ? <CircularProgress size={20} color="inherit" /> : <AutoAwesome />}
                onClick={handleGenerateAIAnalysis}
                disabled={isGeneratingAI}
                size="large"
              >
                {isGeneratingAI ? 'AI 심층 분석 중...' : (aiAnalysis ? 'AI 분석 재생성' : 'AI 심층 분석 생성')}
              </Button>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={() => router.push('/survey/info')} size="large">
                새 진단 시작
              </Button>
              <Button variant="outlined" startIcon={<AssignmentIcon />} onClick={() => router.push('/improvement-plan')} size="large" color="secondary">
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
                    <Radar name="점수" dataKey="score" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
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
                          {CATEGORY_NAMES[category] || category}
                        </Typography>
                        <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                          {Number(score).toFixed(1)}점
                        </Typography>
                        <Box sx={{ mb: 2 }}>
                          <LinearProgress variant="determinate" value={(Number(score) / 5) * 100} sx={{ height: 8, borderRadius: 4 }} />
                        </Box>
                        <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                          <Chip label={getMaturityLevel(Number(score))} size="small" color="primary" variant="outlined" />
                          <Chip label={getGrade(Number(score))} size="small" color="secondary" variant="outlined" />
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* 벤치마크 비교 */}
        {benchmarkData && (
          <Box sx={{ mt: 4 }}>
            <BenchmarkComparison
              benchmarkData={benchmarkData}
              userScores={surveyResult.categoryScores}
            />
          </Box>
        )}

        {/* AI 심층 분석 로딩 */}
        {isGeneratingAI && (
          <Card sx={{ mt: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                <AutoAwesome sx={{ fontSize: 30, color: 'secondary.main', mr: 2 }} />
                <Typography variant="h5" sx={{ fontWeight: 'bold' }}>AI 심층 분석 생성 중...</Typography>
              </Box>
              <Skeleton variant="rounded" height={60} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={40} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={200} sx={{ mb: 2 }} />
              <Skeleton variant="rounded" height={150} />
            </CardContent>
          </Card>
        )}

        {/* AI 심층 분석 결과 */}
        {aiAnalysis && !isGeneratingAI && (
          <Card sx={{ mt: 4 }}>
            <CardContent sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <AutoAwesome sx={{ fontSize: 30, color: 'secondary.main', mr: 2 }} />
                <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                  AI 심층 분석 결과
                </Typography>
              </Box>
              <StructuredAnalysisView analysis={aiAnalysis} isFallback={isFallback} />
            </CardContent>
          </Card>
        )}
      </Container>

      {/* AI 코칭 챗봇 FAB */}
      <Fab
        color="secondary"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => setChatOpen(true)}
      >
        <ChatIcon />
      </Fab>

      {/* AI 채팅 패널 */}
      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        surveyResultId={surveyResult?.id ? Number(surveyResult.id) : 0}
        userInfo={userInfo}
        categoryScores={surveyResult.categoryScores}
        totalScore={surveyResult.totalScore}
      />
    </Box>
  );
}
