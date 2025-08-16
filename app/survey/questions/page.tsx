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
  RadioGroup,
  FormControlLabel,
  Radio,
  LinearProgress,
  Paper,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Divider
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward
} from '@mui/icons-material';

// Mock 설문 질문 데이터 (각 카테고리별로 10개 이상의 질문)
const surveyQuestions = [
  // 계획 관리 (10개)
  { id: 'planning_1', category: 'planning', question: '수요 예측의 정확도가 높은 편인가요?', weight: 3 },
  { id: 'planning_2', category: 'planning', question: 'S&OP(Sales & Operations Planning) 프로세스가 체계적으로 운영되고 있나요?', weight: 4 },
  { id: 'planning_3', category: 'planning', question: '생산 계획이 수요와 공급을 고려하여 수립되고 있나요?', weight: 3 },
  { id: 'planning_4', category: 'planning', question: '재고 계획이 체계적으로 수립되고 있나요?', weight: 3 },
  { id: 'planning_5', category: 'planning', question: '공급망 위험 관리 체계가 구축되어 있나요?', weight: 4 },
  { id: 'planning_6', category: 'planning', question: '계획 수립 시 다양한 시나리오를 고려하고 있나요?', weight: 3 },
  { id: 'planning_7', category: 'planning', question: '계획 실행 결과를 정기적으로 모니터링하고 있나요?', weight: 3 },
  { id: 'planning_8', category: 'planning', question: '계획과 실제 결과의 차이를 분석하고 개선하고 있나요?', weight: 3 },
  { id: 'planning_9', category: 'planning', question: '계획 수립에 필요한 데이터가 정확하고 시의적절하게 제공되고 있나요?', weight: 4 },
  { id: 'planning_10', category: 'planning', question: '계획 수립 프로세스가 표준화되어 있나요?', weight: 3 },

  // 조달 관리 (10개)
  { id: 'procurement_1', category: 'procurement', question: '공급업체 평가 및 관리 체계가 잘 구축되어 있나요?', weight: 4 },
  { id: 'procurement_2', category: 'procurement', question: '구매 프로세스가 표준화되어 있나요?', weight: 3 },
  { id: 'procurement_3', category: 'procurement', question: '공급업체와의 협력 관계가 잘 유지되고 있나요?', weight: 3 },
  { id: 'procurement_4', category: 'procurement', question: '조달 비용 최적화를 위한 노력을 하고 있나요?', weight: 3 },
  { id: 'procurement_5', category: 'procurement', question: '공급업체의 품질 관리 체계를 모니터링하고 있나요?', weight: 4 },
  { id: 'procurement_6', category: 'procurement', question: '조달 리스크 관리 체계가 구축되어 있나요?', weight: 4 },
  { id: 'procurement_7', category: 'procurement', question: '공급업체 개발 및 육성 프로그램을 운영하고 있나요?', weight: 3 },
  { id: 'procurement_8', category: 'procurement', question: '조달 성과를 정기적으로 측정하고 있나요?', weight: 3 },
  { id: 'procurement_9', category: 'procurement', question: '공급업체와의 정보 공유가 원활하게 이루어지고 있나요?', weight: 3 },
  { id: 'procurement_10', category: 'procurement', question: '조달 전략이 회사의 전체 전략과 일치하고 있나요?', weight: 4 },

  // 재고 관리 (10개)
  { id: 'inventory_1', category: 'inventory', question: '재고 수준이 적절하게 관리되고 있나요?', weight: 3 },
  { id: 'inventory_2', category: 'inventory', question: 'ABC 분석을 통한 재고 분류가 이루어지고 있나요?', weight: 3 },
  { id: 'inventory_3', category: 'inventory', question: '재고 회전율이 목표 수준을 달성하고 있나요?', weight: 3 },
  { id: 'inventory_4', category: 'inventory', question: '재고 부족으로 인한 손실이 최소화되고 있나요?', weight: 4 },
  { id: 'inventory_5', category: 'inventory', question: '재고 과잉으로 인한 비용이 적절히 관리되고 있나요?', weight: 3 },
  { id: 'inventory_6', category: 'inventory', question: '재고 예측 모델이 정확하게 작동하고 있나요?', weight: 4 },
  { id: 'inventory_7', category: 'inventory', question: '재고 관리 시스템이 효율적으로 운영되고 있나요?', weight: 3 },
  { id: 'inventory_8', category: 'inventory', question: '재고 실사가 정기적으로 이루어지고 있나요?', weight: 3 },
  { id: 'inventory_9', category: 'inventory', question: '재고 품질 관리가 체계적으로 이루어지고 있나요?', weight: 3 },
  { id: 'inventory_10', category: 'inventory', question: '재고 관리 성과 지표가 설정되고 모니터링되고 있나요?', weight: 3 },

  // 생산 관리 (10개)
  { id: 'production_1', category: 'production', question: '생산 계획이 효율적으로 실행되고 있나요?', weight: 3 },
  { id: 'production_2', category: 'production', question: '생산성 향상을 위한 지속적인 개선 활동이 이루어지고 있나요?', weight: 3 },
  { id: 'production_3', category: 'production', question: '품질 관리 체계가 잘 구축되어 있나요?', weight: 4 },
  { id: 'production_4', category: 'production', question: '생산 설비의 가동률이 목표 수준을 달성하고 있나요?', weight: 3 },
  { id: 'production_5', category: 'production', question: '생산 공정이 표준화되어 있나요?', weight: 3 },
  { id: 'production_6', category: 'production', question: '생산 일정 준수율이 높은 편인가요?', weight: 3 },
  { id: 'production_7', category: 'production', question: '생산 비용이 효율적으로 관리되고 있나요?', weight: 3 },
  { id: 'production_8', category: 'production', question: '생산 현장의 안전 관리가 체계적으로 이루어지고 있나요?', weight: 4 },
  { id: 'production_9', category: 'production', question: '생산 데이터가 실시간으로 수집되고 분석되고 있나요?', weight: 3 },
  { id: 'production_10', category: 'production', question: '생산 성과 지표가 설정되고 정기적으로 평가되고 있나요?', weight: 3 },

  // 물류 관리 (10개)
  { id: 'logistics_1', category: 'logistics', question: '운송 네트워크가 효율적으로 설계되어 있나요?', weight: 3 },
  { id: 'logistics_2', category: 'logistics', question: '창고 운영이 효율적으로 이루어지고 있나요?', weight: 3 },
  { id: 'logistics_3', category: 'logistics', question: '배송 서비스 수준이 고객 요구사항을 만족하고 있나요?', weight: 4 },
  { id: 'logistics_4', category: 'logistics', question: '물류 비용이 적절히 관리되고 있나요?', weight: 3 },
  { id: 'logistics_5', category: 'logistics', question: '물류 정보 시스템이 효율적으로 운영되고 있나요?', weight: 3 },
  { id: 'logistics_6', category: 'logistics', question: '물류 파트너와의 협력 관계가 잘 유지되고 있나요?', weight: 3 },
  { id: 'logistics_7', category: 'logistics', question: '물류 리스크 관리 체계가 구축되어 있나요?', weight: 4 },
  { id: 'logistics_8', category: 'logistics', question: '물류 성과 지표가 설정되고 모니터링되고 있나요?', weight: 3 },
  { id: 'logistics_9', category: 'logistics', question: '물류 프로세스가 표준화되어 있나요?', weight: 3 },
  { id: 'logistics_10', category: 'logistics', question: '물류 개선 활동이 지속적으로 이루어지고 있나요?', weight: 3 },

  // 통합 관리 (10개)
  { id: 'integration_1', category: 'integration', question: 'SCM 시스템이 통합적으로 운영되고 있나요?', weight: 4 },
  { id: 'integration_2', category: 'integration', question: '조직 내 부서 간 협력이 원활하게 이루어지고 있나요?', weight: 3 },
  { id: 'integration_3', category: 'integration', question: 'SCM 전략이 회사의 전체 전략과 일치하고 있나요?', weight: 4 },
  { id: 'integration_4', category: 'integration', question: 'SCM 성과 측정 체계가 구축되어 있나요?', weight: 3 },
  { id: 'integration_5', category: 'integration', question: 'SCM 개선 활동이 체계적으로 이루어지고 있나요?', weight: 3 },
  { id: 'integration_6', category: 'integration', question: 'SCM 관련 교육 및 훈련이 정기적으로 제공되고 있나요?', weight: 3 },
  { id: 'integration_7', category: 'integration', question: 'SCM 프로세스가 문서화되어 있나요?', weight: 3 },
  { id: 'integration_8', category: 'integration', question: 'SCM 관련 의사결정이 데이터 기반으로 이루어지고 있나요?', weight: 4 },
  { id: 'integration_9', category: 'integration', question: 'SCM 리스크 관리 체계가 구축되어 있나요?', weight: 4 },
  { id: 'integration_10', category: 'integration', question: 'SCM 지속가능성 관리가 이루어지고 있나요?', weight: 3 }
];

// 카테고리별로 질문 그룹화
const categories = [
  { key: 'planning', name: '계획 관리', color: '#1976d2' },
  { key: 'procurement', name: '조달 관리', color: '#388e3c' },
  { key: 'inventory', name: '재고 관리', color: '#f57c00' },
  { key: 'production', name: '생산 관리', color: '#7b1fa2' },
  { key: 'logistics', name: '물류 관리', color: '#d32f2f' },
  { key: 'integration', name: '통합 관리', color: '#1976d2' }
];

export default function SurveyQuestionsPage() {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAlert, setShowAlert] = useState(false);

  const currentCategory = categories[currentCategoryIndex];
  const currentCategoryQuestions = surveyQuestions.filter(q => q.category === currentCategory.key);
  const progress = ((currentCategoryIndex + 1) / categories.length) * 100;

  const handleAnswerChange = (questionId: string, value: number) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleNext = () => {
    const currentAnswers = currentCategoryQuestions.every(q => answers[q.id]);
    if (!currentAnswers) {
      setShowAlert(true);
      return;
    }
    setShowAlert(false);
    if (currentCategoryIndex < categories.length - 1) {
      setCurrentCategoryIndex(prev => prev + 1);
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
    }
  };

  const handleSubmitSurvey = async () => {
    try {
      // Mock 사용자 정보 (로그인 없이 진단 가능)
      const mockUserId = 'guest-123';
      const mockCompanyId = 'guest-company';

      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: mockUserId,
          companyId: mockCompanyId,
          answers: answers
        }),
      });

      if (response.ok) {
        router.push('/survey/results');
      } else {
        console.error('Survey submission failed');
        alert('진단 제출 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      alert('진단 제출 중 오류가 발생했습니다.');
    }
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              SCM 성숙도 진단
            </Typography>
            <Typography variant="body2">
              모듈 {currentCategoryIndex + 1} / {categories.length}
            </Typography>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={currentCategoryIndex} alternativeLabel>
            {categories.map((category, index) => (
              <Step key={category.key}>
                <StepLabel>{category.name}</StepLabel>
              </Step>
            ))}
          </Stepper>
        </Box>

        {/* Progress Bar */}
        <Box sx={{ mb: 4 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
            <Typography variant="body2" color="text.secondary">
              진행률
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {Math.round(progress)}%
            </Typography>
          </Box>
          <LinearProgress variant="determinate" value={progress} sx={{ height: 8, borderRadius: 4 }} />
        </Box>

        {/* Category Header */}
        <Card sx={{ mb: 4, bgcolor: currentCategory.color, color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              {currentCategory.name}
            </Typography>
            <Typography variant="h6">
              {currentCategoryQuestions.length}개 질문에 답변해주세요
            </Typography>
          </CardContent>
        </Card>

        {showAlert && (
          <Alert severity="warning" sx={{ mb: 3 }}>
            현재 모듈의 모든 질문에 답변해주세요.
          </Alert>
        )}

        {/* Questions */}
        <Box sx={{ mb: 4 }}>
          {currentCategoryQuestions.map((question, index) => (
            <Card key={question.id} sx={{ mb: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ bgcolor: currentCategory.color, color: 'white', px: 2, py: 0.5, borderRadius: 1, mr: 2 }}>
                    Q{index + 1}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    가중치: {question.weight}점
                  </Typography>
                </Box>
                <Typography variant="h6" component="h3" gutterBottom sx={{ fontWeight: 600, mb: 3 }}>
                  {question.question}
                </Typography>
                <RadioGroup
                  value={answers[question.id] || ''}
                  onChange={(e) => handleAnswerChange(question.id, Number(e.target.value))}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                    {[1, 2, 3, 4, 5].map((value) => (
                      <FormControlLabel
                        key={value}
                        value={value}
                        control={<Radio />}
                        label={
                          <Box sx={{ textAlign: 'center' }}>
                            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>{value}점</Typography>
                            <Typography variant="caption" color="text.secondary">
                              {value === 1 ? '매우 부족' : value === 2 ? '부족' : value === 3 ? '보통' : value === 4 ? '우수' : '매우 우수'}
                            </Typography>
                          </Box>
                        }
                        sx={{ 
                          flex: 1, 
                          minWidth: '120px', 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 2, 
                          p: 2, 
                          m: 0, 
                          '&:hover': { 
                            borderColor: currentCategory.color, 
                            bgcolor: 'action.hover' 
                          } 
                        }}
                      />
                    ))}
                  </Box>
                </RadioGroup>
              </CardContent>
            </Card>
          ))}
        </Box>

        {/* Navigation Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Button
            variant="outlined"
            startIcon={<ArrowBack />}
            onClick={handlePrevious}
            disabled={currentCategoryIndex === 0}
            size="large"
          >
            이전 모듈
          </Button>
          <Button
            variant="contained"
            endIcon={currentCategoryIndex === categories.length - 1 ? undefined : <ArrowForward />}
            onClick={handleNext}
            size="large"
            sx={{ bgcolor: currentCategory.color }}
          >
            {currentCategoryIndex === categories.length - 1 ? '진단 완료' : '다음 모듈'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
} 