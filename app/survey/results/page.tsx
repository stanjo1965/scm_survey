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
  Home as HomeIcon,
  Psychology as PsychologyIcon,
  Assignment as AssignmentIcon
} from '@mui/icons-material';

// 기본 결과 데이터 (실제 데이터가 없을 때 사용)
const defaultResult = {
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
  const [isGeneratingAI, setIsGeneratingAI] = useState(false);
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  
  // 사용자 정보와 결과 데이터 가져오기
  const [userInfo, setUserInfo] = useState<any>(null);
  const [resultData, setResultData] = useState<any>(defaultResult);
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // 사용자 정보 가져오기
      const storedUserInfo = localStorage.getItem('userInfo');
      if (storedUserInfo) {
        setUserInfo(JSON.parse(storedUserInfo));
      }
      
      // 실제 설문 결과 가져오기
      const storedResult = localStorage.getItem('surveyResult');
      if (storedResult) {
        const parsedResult = JSON.parse(storedResult);
        console.log('저장된 결과 데이터:', parsedResult);
        setResultData(parsedResult);
      } else {
        console.log('저장된 결과 데이터가 없습니다.');
      }
    }
  }, []);

  const radarData = Object.entries(resultData.categoryScores).map(([key, value]) => ({
    category: categoryNames[key as keyof typeof categoryNames],
    score: value,
    fullMark: 5
  }));

  const barData = Object.entries(resultData.categoryScores).map(([key, value]) => ({
    category: categoryNames[key as keyof typeof categoryNames],
    score: value
  }));

  const handleDownloadReport = async () => {
    setIsGeneratingPDF(true);
    try {
      // AI 분석이 없으면 먼저 생성
      let analysisToInclude = aiAnalysis;
      if (!aiAnalysis) {
        console.log('AI 분석이 없어서 먼저 생성합니다.');
        await handleGenerateAIAnalysis();
        // 잠시 기다린 후 AI 분석 가져오기
        await new Promise(resolve => setTimeout(resolve, 2000));
        analysisToInclude = aiAnalysis;
      }
      
      await generateHTMLToPDF(resultData, userInfo?.company || '귀하의 회사', analysisToInclude);
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
          resultData: resultData
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setAiAnalysis(data.analysis);
      } else {
        const errorData = await response.json();
        console.error('AI 분석 API 오류:', errorData);
        alert('AI 분석 생성 중 오류가 발생했습니다. 기본 분석을 제공합니다.');
        // 기본 분석 제공
        setAiAnalysis(`## 🔍 진단 결과 분석

귀하의 SCM 성숙도 진단 결과를 분석한 결과, 전반적으로 보통 수준의 성숙도를 보이고 있습니다.

## 🎯 우선 개선 영역 및 방안

**1. 재고 관리 개선**
- ABC 분석을 통한 재고 분류 체계 구축
- 재고 예측 모델 정확도 향상
- 재고 회전율 목표 설정 및 모니터링

**2. 계획 관리 체계화**
- S&OP 프로세스 정착
- 수요 예측 정확도 향상
- 계획 실행 결과 분석 및 피드백 체계

**3. 조달 관리 최적화**
- 공급업체 평가 체계 구축
- 조달 비용 최적화
- 공급업체와의 협력 관계 강화

## 💪 강점 활용 전략

**생산 관리 (3.5점)**
- 우수한 생산성과를 바탕으로 다른 영역 개선에 활용
- 생산 프로세스의 베스트 프랙티스를 다른 영역에 적용

**통합 관리 (3.4점)**
- 부서 간 협력 체계를 활용하여 전사적 개선 추진
- SCM 시스템 통합을 통한 정보 공유 체계 구축

## 📅 단계별 개선 로드맵

**단기 (3개월)**
- 재고 관리 시스템 구축
- 공급업체 평가 기준 수립
- 계획 수립 프로세스 표준화

**중기 (6개월)**
- S&OP 프로세스 정착
- 재고 예측 모델 고도화
- 물류 네트워크 최적화

**장기 (1년)**
- 전사적 SCM 성숙도 향상
- 디지털 트랜스포메이션 추진
- 지속가능한 SCM 체계 구축

## 📊 예상 효과 및 KPI

**재고 관리**
- 재고 회전율 20% 향상
- 재고 부족률 50% 감소
- 재고 관리 비용 15% 절감

**계획 관리**
- 수요 예측 정확도 30% 향상
- 계획 실행률 25% 향상
- 생산 계획 준수율 20% 향상

## ⚠️ 주의사항 및 리스크 관리

**실행 시 주의사항**
- 단계적 접근으로 조직 저항 최소화
- 충분한 교육 및 훈련 제공
- 정기적인 성과 측정 및 피드백

**리스크 관리**
- 공급업체 의존도 분산
- 재고 과잉 리스크 관리
- 시스템 장애 대비 백업 체계 구축

이 분석은 기본 템플릿을 기반으로 생성되었습니다. 더 정확한 분석을 위해서는 OpenAI API 키를 설정해주세요.`);
      }
    } catch (error) {
      console.error('AI 분석 오류:', error);
      alert('AI 분석 생성 중 오류가 발생했습니다. 기본 분석을 제공합니다.');
      // 기본 분석 제공
      setAiAnalysis(`## 🔍 진단 결과 분석

귀하의 SCM 성숙도 진단 결과를 분석한 결과, 전반적으로 보통 수준의 성숙도를 보이고 있습니다.

## 🎯 우선 개선 영역 및 방안

**1. 재고 관리 개선**
- ABC 분석을 통한 재고 분류 체계 구축
- 재고 예측 모델 정확도 향상
- 재고 회전율 목표 설정 및 모니터링

**2. 계획 관리 체계화**
- S&OP 프로세스 정착
- 수요 예측 정확도 향상
- 계획 실행 결과 분석 및 피드백 체계

**3. 조달 관리 최적화**
- 공급업체 평가 체계 구축
- 조달 비용 최적화
- 공급업체와의 협력 관계 강화

## 💪 강점 활용 전략

**생산 관리 (3.5점)**
- 우수한 생산성과를 바탕으로 다른 영역 개선에 활용
- 생산 프로세스의 베스트 프랙티스를 다른 영역에 적용

**통합 관리 (3.4점)**
- 부서 간 협력 체계를 활용하여 전사적 개선 추진
- SCM 시스템 통합을 통한 정보 공유 체계 구축

## 📅 단계별 개선 로드맵

**단기 (3개월)**
- 재고 관리 시스템 구축
- 공급업체 평가 기준 수립
- 계획 수립 프로세스 표준화

**중기 (6개월)**
- S&OP 프로세스 정착
- 재고 예측 모델 고도화
- 물류 네트워크 최적화

**장기 (1년)**
- 전사적 SCM 성숙도 향상
- 디지털 트랜스포메이션 추진
- 지속가능한 SCM 체계 구축

## 📊 예상 효과 및 KPI

**재고 관리**
- 재고 회전율 20% 향상
- 재고 부족률 50% 감소
- 재고 관리 비용 15% 절감

**계획 관리**
- 수요 예측 정확도 30% 향상
- 계획 실행률 25% 향상
- 생산 계획 준수율 20% 향상

## ⚠️ 주의사항 및 리스크 관리

**실행 시 주의사항**
- 단계적 접근으로 조직 저항 최소화
- 충분한 교육 및 훈련 제공
- 정기적인 성과 측정 및 피드백

**리스크 관리**
- 공급업체 의존도 분산
- 재고 과잉 리스크 관리
- 시스템 장애 대비 백업 체계 구축

이 분석은 기본 템플릿을 기반으로 생성되었습니다. 더 정확한 분석을 위해서는 OpenAI API 키를 설정해주세요.`);
    } finally {
      setIsGeneratingAI(false);
    }
  };

  const handleNewSurvey = () => {
    router.push('/survey');
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
             {resultData && resultData.totalScore ? (
               <>
                 <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                   진단 완료!
                 </Typography>
               </>
             ) : (
               <>
                 <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                   진단 결과
                 </Typography>
                 <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
                   진단을 먼저 완료해주세요.
                 </Typography>
                 <Button
                   variant="contained"
                   onClick={() => router.push('/survey')}
                   size="large"
                 >
                   진단 시작하기
                 </Button>
               </>
             )}
                         {resultData && resultData.totalScore && (
               <>
                 <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold', mb: 2 }}>
                   종합 점수: {(resultData.totalScore as number).toFixed(1)}점
                 </Typography>
                 <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
                   <Chip 
                     label={`${getMaturityLevel(resultData.totalScore as number)} 수준`} 
                     color="primary" 
                     variant="outlined"
                     size="medium"
                   />
                   <Chip 
                     label={`${getGrade(resultData.totalScore as number)} 등급`} 
                     color="secondary" 
                     variant="outlined"
                     size="medium"
                   />
                 </Box>
                 <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                   귀사의 SCM 성숙도는 <strong>{getMaturityLevel(resultData.totalScore as number)} 수준</strong>입니다.
                 </Typography>
               </>
             )}
            
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
                <Box sx={{ mt: 2, p: 2, bgcolor: 'success.light', borderRadius: 1 }}>
                  <Typography variant="body2" sx={{ color: 'success.dark', fontWeight: 'bold' }}>
                    ✅ 진단 결과가 {userInfo.email}과 관리자에게 이메일로 발송되었습니다.
                  </Typography>
                </Box>
              </Box>
            )}
                                                   {resultData && resultData.totalScore && (
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
                          )}
          </CardContent>
        </Card>

                 {resultData && resultData.totalScore && (
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
                     {Object.entries(resultData.categoryScores).map(([category, score]) => (
                       <Grid item xs={12} sm={6} md={4} key={category}>
                         <Paper sx={{ p: 3, height: '100%' }}>
                           <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                             {categoryNames[category as keyof typeof categoryNames]}
                           </Typography>
                           <Typography variant="h4" sx={{ fontWeight: 'bold', color: 'primary.main', mb: 1 }}>
                             {(score as number).toFixed(1)}점
                           </Typography>
                           <Box sx={{ mb: 2 }}>
                             <LinearProgress 
                               variant="determinate" 
                               value={((score as number) / 5) * 100} 
                               sx={{ height: 8, borderRadius: 4 }}
                             />
                           </Box>
                           <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                             <Chip 
                               label={getMaturityLevel(score as number)} 
                               size="small" 
                               color="primary" 
                               variant="outlined"
                             />
                             <Chip 
                               label={getGrade(score as number)} 
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
         )}

                   {/* AI 분석 결과 */}
          {resultData && resultData.totalScore && aiAnalysis && (
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