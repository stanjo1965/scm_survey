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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar
} from '@mui/material';
import {
  ArrowBack,
  Email,
  Phone,
  LocationOn,
  Send
} from '@mui/icons-material';

export default function ContactPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    company: '',
    phone: '',
    subject: '',
    message: ''
  });
  const [showSuccess, setShowSuccess] = useState(false);

  const handleBackToHome = () => {
    router.push('/');
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }
    
    try {
      // 메일 클라이언트로 문의 내용 전송
      const subject = `[SCM 진단 시스템 문의] ${formData.subject || '일반 문의'}`;
      const body = `안녕하세요, SCM 성숙도 진단 시스템에 대한 문의입니다.

문의자 정보:
- 이름: ${formData.name}
- 이메일: ${formData.email}
- 회사명: ${formData.company || '미입력'}
- 연락처: ${formData.phone || '미입력'}
- 문의 유형: ${formData.subject || '일반 문의'}

문의 내용:
${formData.message}

감사합니다.`;

      const mailtoLink = `mailto:sangkeun.jo@gmail.com?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
      
      // 메일 클라이언트 열기
      const mailWindow = window.open(mailtoLink, '_blank');
      
      if (mailWindow) {
        setShowSuccess(true);
        setFormData({
          name: '',
          email: '',
          company: '',
          phone: '',
          subject: '',
          message: ''
        });
      } else {
        // 팝업이 차단된 경우 대안 제공
        alert('메일 클라이언트를 열 수 없습니다. 수동으로 메일을 보내주세요.\n\n받는 사람: sangkeun.jo@gmail.com\n제목: ' + subject);
        
        // 클립보드에 메일 내용 복사
        const fullMailContent = `받는 사람: sangkeun.jo@gmail.com\n제목: ${subject}\n\n${body}`;
        navigator.clipboard.writeText(fullMailContent).then(() => {
          alert('메일 내용이 클립보드에 복사되었습니다.');
        });
      }
    } catch (error) {
      console.error('메일 전송 오류:', error);
      alert('메일 전송 중 오류가 발생했습니다. 수동으로 메일을 보내주세요.');
    }
  };

  const contactInfo = [
    {
      icon: <Email />,
      title: '이메일',
      content: 'sangkeun.jo@gmail.com',
      description: '일반 문의 및 상담'
    },
    {
      icon: <Phone />,
      title: '전화',
      content: '010-2482-7898',
      description: '평일 09:00-18:00'
    },
    {
      icon: <LocationOn />,
      title: '주소',
      content: '서울특별시 강남구 테헤란로 123',
      description: 'SCM 전문 컨설팅 센터'
    }
  ];

  const faqItems = [
    {
      question: '진단은 무료인가요?',
      answer: '네, SCM 성숙도 진단은 완전 무료로 제공됩니다.'
    },
    {
      question: '진단 결과는 언제 받을 수 있나요?',
      answer: '진단 완료 후 즉시 결과를 확인할 수 있으며, PDF 보고서도 다운로드 가능합니다.'
    },
    {
      question: '개인정보는 안전한가요?',
      answer: '네, 모든 개인정보는 암호화되어 안전하게 보호됩니다.'
    },
    {
      question: '기업 맞춤 상담이 가능한가요?',
      answer: '네, 진단 결과를 바탕으로 전문가의 맞춤 상담 서비스를 제공합니다.'
    }
  ];

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
              문의하기
            </Typography>
            <Button color="inherit" startIcon={<ArrowBack />} onClick={handleBackToHome}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Page Title */}
        <Box sx={{ textAlign: 'center', mb: 4 }}>
          <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
            문의하기
          </Typography>
          <Typography variant="h6" sx={{ color: 'text.secondary' }}>
            SCM 성숙도 진단 시스템에 대한 문의사항이 있으시면 언제든 연락주세요
          </Typography>
        </Box>

        <Grid container spacing={4}>
          {/* Contact Form */}
          <Grid item xs={12} md={8}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  문의 양식
                </Typography>
                <Box component="form" onSubmit={handleSubmit}>
                  <Grid container spacing={3}>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="이름 *"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="이메일 *"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        required
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="회사명"
                        value={formData.company}
                        onChange={(e) => handleInputChange('company', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <TextField
                        fullWidth
                        label="연락처"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                      />
                    </Grid>
                    <Grid item xs={12}>
                      <FormControl fullWidth>
                        <InputLabel>문의 유형</InputLabel>
                        <Select
                          value={formData.subject}
                          label="문의 유형"
                          onChange={(e) => handleInputChange('subject', e.target.value)}
                        >
                          <MenuItem value="general">일반 문의</MenuItem>
                          <MenuItem value="technical">기술 지원</MenuItem>
                          <MenuItem value="consulting">컨설팅 문의</MenuItem>
                          <MenuItem value="partnership">파트너십</MenuItem>
                          <MenuItem value="other">기타</MenuItem>
                        </Select>
                      </FormControl>
                    </Grid>
                    <Grid item xs={12}>
                      <TextField
                        fullWidth
                        label="문의 내용 *"
                        multiline
                        rows={6}
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        required
                      />
                    </Grid>
                                         <Grid item xs={12}>
                       <Button
                         type="submit"
                         variant="contained"
                         size="large"
                         startIcon={<Send />}
                         sx={{ px: 4, py: 1.5, mr: 2 }}
                       >
                         문의하기
                       </Button>
                       <Button
                         variant="outlined"
                         size="large"
                         onClick={() => {
                           const mailContent = `받는 사람: sangkeun.jo@gmail.com\n제목: [SCM 진단 시스템 문의]\n\n안녕하세요, SCM 성숙도 진단 시스템에 대한 문의가 있습니다.`;
                           navigator.clipboard.writeText(mailContent).then(() => {
                             alert('기본 메일 내용이 클립보드에 복사되었습니다. 메일 클라이언트에서 붙여넣기 후 문의 내용을 작성해주세요.');
                           });
                         }}
                         sx={{ px: 4, py: 1.5 }}
                       >
                         메일 내용 복사
                       </Button>
                     </Grid>
                  </Grid>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          {/* Contact Information */}
          <Grid item xs={12} md={4}>
            <Card>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  연락처 정보
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                  {contactInfo.map((info, index) => (
                    <Box key={index} sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ color: 'primary.main', mt: 0.5 }}>
                        {info.icon}
                      </Box>
                      <Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                          {info.title}
                        </Typography>
                        <Typography variant="body1" sx={{ fontWeight: 600, mb: 0.5 }}>
                          {info.content}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {info.description}
                        </Typography>
                      </Box>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>

            {/* FAQ */}
            <Card sx={{ mt: 3 }}>
              <CardContent sx={{ p: 4 }}>
                <Typography variant="h5" component="h2" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
                  자주 묻는 질문
                </Typography>
                <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                  {faqItems.map((item, index) => (
                    <Box key={index}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 1 }}>
                        Q. {item.question}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        A. {item.answer}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Container>

      {/* Success Snackbar */}
      <Snackbar
        open={showSuccess}
        autoHideDuration={6000}
        onClose={() => setShowSuccess(false)}
      >
                 <Alert onClose={() => setShowSuccess(false)} severity="success" sx={{ width: '100%' }}>
           메일 클라이언트가 열렸습니다. 메일을 확인하고 전송해주세요. 만약 메일 클라이언트가 열리지 않았다면, 수동으로 sangkeun.jo@gmail.com으로 메일을 보내주세요.
         </Alert>
      </Snackbar>
    </Box>
  );
} 