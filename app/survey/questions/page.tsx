'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../lib/supabase';
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

// ...surveyQuestions removed. Will fetch from Supabase.

// ...categories removed. Will fetch from Supabase.

export default function SurveyQuestionsPage() {
  const router = useRouter();
  const [currentCategoryIndex, setCurrentCategoryIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [showAlert, setShowAlert] = useState(false);
  const [categories, setCategories] = useState<Array<{ key: string; name: string; color: string; id: number }>>([]);
  const [surveyQuestions, setSurveyQuestions] = useState<Array<{ id: string; category: string; question: string; weight: number }>>([]);
  const [loading, setLoading] = useState(false);

  // 카테고리 및 질문 데이터 Supabase에서 가져오기
  useEffect(() => {
    async function fetchData() {
      const { data: catData, error: catError } = await supabase.from('category').select('id, key, title');
      if (catError) {
        console.error('Error fetching categories:', catError);
      } else {
        console.log('Fetched categories:', catData);
      }

      if (catData) {
        const categoryColors: Record<string, string> = {
          planning: '#1976d2',
          procurement: '#388e3c',
          inventory: '#f57c00',
          production: '#7b1fa2',
          logistics: '#d32f2f',
          integration: '#1976d2',
        };

        const merged = catData.map((cat: any) => ({
          id: cat.id,
          key: cat.key,
          name: cat.title,
          color: categoryColors[cat.key] || '#1976d2',
        }));

        setCategories(merged);
      }

      const { data: qData, error: qError } = await supabase
        .from('category_question')
        .select('question_id, category_id, question, weight')
        .eq('isactive', true);
      if (qError) {
        console.error('Error fetching questions:', qError);
      } else {
        console.log('Fetched questions:', qData);
      }

      if (qData && catData) {
        const questions = qData.map((q: any) => {
          const categoryObj = catData.find((cat: any) => cat.id === q.category_id);
          return {
            id: q.question_id,
            category: categoryObj?.key || '',
            question: q.question,
            weight: q.weight,
          };
        });
        setSurveyQuestions(questions);
      }
    }
    fetchData();
  }, []);

useEffect(() => {
  console.log(categories);
  console.log(surveyQuestions);
}, [categories, surveyQuestions]);

  // 카테고리가 변경될 때마다 페이지 상단으로 스크롤
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentCategoryIndex]);

  const currentCategory = categories[currentCategoryIndex];
  const currentCategoryQuestions = currentCategory ? surveyQuestions.filter(q => q.category === currentCategory.key) : [];
  const progress = categories.length > 0 ? ((currentCategoryIndex + 1) / categories.length) * 100 : 0;

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
      // 다음 모듈로 이동할 때 페이지 상단으로 스크롤하고 1번 항목으로 이동
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
        // 첫 번째 질문 카드로 포커스 이동
        const firstQuestionCard = document.querySelector('[data-question-id]');
        if (firstQuestionCard) {
          firstQuestionCard.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } else {
      handleSubmitSurvey();
    }
  };

  const handlePrevious = () => {
    if (currentCategoryIndex > 0) {
      setCurrentCategoryIndex(prev => prev - 1);
      // 이전 모듈로 이동할 때도 페이지 상단으로 스크롤
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSubmitSurvey = async () => {
    setLoading(true);
    try {
      // localStorage에서 사용자 정보 가져오기
      const userInfo = localStorage.getItem('userInfo');
      let userId = 'guest-123';
      let companyId = 'guest-company';
      let userName = '게스트';
      let userEmail = '';
      if (userInfo) {
        const parsedUserInfo = JSON.parse(userInfo);
        userId = `user-${Date.now()}`;
        companyId = parsedUserInfo.company || 'guest-company';
        userName = parsedUserInfo.name || '게스트';
        userEmail = parsedUserInfo.email || '';
      }
      const response = await fetch('/api/survey', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: userId,
          companyId: companyId,
          userName: userName,
          userEmail: userEmail,
          answers: answers
        }),
      });
      if (response.ok) {
        const resultData = await response.json();
        localStorage.setItem('surveyResult', JSON.stringify(resultData));
        router.push('/survey/results');
      } else {
        console.error('Survey submission failed');
        alert('진단 제출 중 오류가 발생했습니다.');
      }
    } catch (error) {
      console.error('Survey submission error:', error);
      alert('진단 제출 중 오류가 발생했습니다.');
    } finally {
      setLoading(false);
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
  <Card sx={{ mb: 4, bgcolor: currentCategory?.color || 'defaultColor', color: 'white' }}>
          <CardContent sx={{ p: 3 }}>
            <Typography variant="h4" component="h2" gutterBottom sx={{ fontWeight: 'bold' }}>
              {currentCategory?.name || ''}
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
             <Card key={question.id} sx={{ mb: 3 }} data-question-id={question.id}>
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
            disabled={currentCategoryIndex === 0 || loading}
            size="large"
          >
            이전 모듈
          </Button>
          <Button
            variant="contained"
            endIcon={currentCategoryIndex === categories.length - 1 ? undefined : <ArrowForward />}
            onClick={handleNext}
            size="large"
            sx={{ bgcolor: currentCategory?.color ?? 'primary.main' }}
            disabled={loading}
          >
            {loading && currentCategoryIndex === categories.length - 1 ? '제출 중...' : currentCategoryIndex === categories.length - 1 ? '진단 완료' : '다음 모듈'}
          </Button>
        </Box>
        {loading && currentCategoryIndex === categories.length - 1 && (
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
            <Typography variant="h6" color="primary">제출 중입니다...</Typography>
          </Box>
        )}
      </Container>
    </Box>
  );
}