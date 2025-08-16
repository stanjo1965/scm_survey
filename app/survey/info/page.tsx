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
  TextField,
  Alert,
  Stepper,
  Step,
  StepLabel,
  Paper
} from '@mui/material';
import {
  ArrowBack,
  ArrowForward,
  Person,
  Phone,
  Business,
  Email
} from '@mui/icons-material';

export default function SurveyInfoPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    company: '',
    email: ''
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // 에러 메시지 제거
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.name.trim()) {
      newErrors.name = '이름을 입력해주세요.';
    }

    if (!formData.phone.trim()) {
      newErrors.phone = '전화번호를 입력해주세요.';
    } else if (!/^[0-9-]+$/.test(formData.phone.replace(/\s/g, ''))) {
      newErrors.phone = '올바른 전화번호 형식을 입력해주세요.';
    }

    if (!formData.company.trim()) {
      newErrors.company = '회사명을 입력해주세요.';
    }

    if (!formData.email.trim()) {
      newErrors.email = '이메일을 입력해주세요.';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = '올바른 이메일 형식을 입력해주세요.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      // 사용자 정보를 localStorage에 저장
      localStorage.setItem('userInfo', JSON.stringify(formData));
      
      // 진단 소개 페이지로 이동
      router.push('/survey');
    }
  };

  const handleSkip = () => {
    // 정보 입력을 건너뛰고 바로 진단 소개 페이지로 이동
    router.push('/survey');
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
            <Button color="inherit" startIcon={<ArrowBack />} onClick={handleBackToHome}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md" sx={{ py: 4 }}>
        {/* Progress Stepper */}
        <Box sx={{ mb: 4 }}>
          <Stepper activeStep={0} alternativeLabel>
            <Step>
              <StepLabel>정보 입력</StepLabel>
            </Step>
            <Step>
              <StepLabel>진단 소개</StepLabel>
            </Step>
            <Step>
              <StepLabel>진단 진행</StepLabel>
            </Step>
            <Step>
              <StepLabel>결과 확인</StepLabel>
            </Step>
          </Stepper>
        </Box>

        {/* Page Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            진단 시작 전 정보 입력
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary', mb: 3 }}>
            정확한 진단 결과와 향후 결과 조회를 위해 기본 정보를 입력해주세요
          </Typography>
        </Box>

        {/* Info Card */}
        <Card sx={{ mb: 4 }}>
          <CardContent sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
              <Person sx={{ fontSize: 30, color: 'primary.main', mr: 2 }} />
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                기본 정보 입력
              </Typography>
            </Box>
            
            <Alert severity="info" sx={{ mb: 3 }}>
              <Typography variant="body2">
                <strong>입력하신 정보는 다음과 같이 활용됩니다:</strong><br />
                • 진단 결과의 개인화된 분석 제공<br />
                • 향후 진단 결과 조회 및 비교 분석<br />
                • 통계 데이터 수집 (개인정보는 암호화되어 보호)<br />
                • 개선된 서비스 제공을 위한 데이터 활용
              </Typography>
            </Alert>

            <Box component="form" onSubmit={handleSubmit}>
              <Box sx={{ display: 'grid', gap: 3 }}>
                {/* 이름 */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Person sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      이름 *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="이름"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    error={!!errors.name}
                    helperText={errors.name}
                    placeholder="홍길동"
                  />
                </Box>

                {/* 전화번호 */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Phone sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      전화번호 *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="전화번호"
                    value={formData.phone}
                    onChange={(e) => handleInputChange('phone', e.target.value)}
                    error={!!errors.phone}
                    helperText={errors.phone}
                    placeholder="010-1234-5678"
                  />
                </Box>

                {/* 회사명 */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Business sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      회사명 *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="회사명"
                    value={formData.company}
                    onChange={(e) => handleInputChange('company', e.target.value)}
                    error={!!errors.company}
                    helperText={errors.company}
                    placeholder="(주)예시기업"
                  />
                </Box>

                {/* 이메일 */}
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <Email sx={{ fontSize: 20, color: 'primary.main', mr: 1 }} />
                    <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                      이메일 *
                    </Typography>
                  </Box>
                  <TextField
                    fullWidth
                    label="이메일"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    error={!!errors.email}
                    helperText={errors.email}
                    placeholder="example@company.com"
                  />
                </Box>
              </Box>

              {/* Buttons */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 4 }}>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={handleSkip}
                  sx={{ px: 4, py: 1.5 }}
                >
                  건너뛰기
                </Button>
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  endIcon={<ArrowForward />}
                  sx={{ px: 4, py: 1.5 }}
                >
                  다음 단계
                </Button>
              </Box>
            </Box>
          </CardContent>
        </Card>

        {/* Additional Info */}
        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            💡 정보 입력의 장점
          </Typography>
          <Box component="ul" sx={{ pl: 2, mb: 0 }}>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>개인화된 분석:</strong> 귀하의 업종과 규모에 맞는 맞춤형 진단 결과 제공
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>결과 추적:</strong> 향후 재진단 시 이전 결과와 비교 분석 가능
            </Typography>
            <Typography component="li" variant="body2" sx={{ mb: 1 }}>
              <strong>통계 활용:</strong> 업종별, 규모별 SCM 성숙도 통계에 기여
            </Typography>
            <Typography component="li" variant="body2">
              <strong>보안 보장:</strong> 모든 개인정보는 암호화되어 안전하게 보호됩니다
            </Typography>
          </Box>
        </Paper>
      </Container>
    </Box>
  );
} 