'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Paper,
  Grid,
  InputAdornment,
  IconButton
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Email as EmailIcon,
  Key as KeyIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import AdminLayout from '../components/AdminLayout';

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState('');
  const [smtpUser, setSmtpUser] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
    const storedSmtpUser = localStorage.getItem('smtp_user');
    if (storedSmtpUser) setSmtpUser(storedSmtpUser);
    const storedAdminEmail = localStorage.getItem('admin_email');
    if (storedAdminEmail) setAdminEmail(storedAdminEmail);
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setSnackbar({ open: true, message: 'API 키를 입력해주세요.', severity: 'error' });
      return;
    }
    localStorage.setItem('openai_api_key', apiKey);
    setSavedApiKey(apiKey);
    setSnackbar({ open: true, message: 'API 키가 저장되었습니다.', severity: 'success' });
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setSnackbar({ open: true, message: 'API 키를 입력해주세요.', severity: 'error' });
      return;
    }
    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userInfo: { name: '테스트', company: '테스트 회사' },
          resultData: {
            totalScore: 3.2,
            categoryScores: { planning: 3.1, procurement: 3.3, inventory: 2.8, production: 3.5, logistics: 3.0, integration: 3.4 }
          }
        }),
      });
      if (response.ok) {
        setSnackbar({ open: true, message: 'API 키가 정상적으로 작동합니다.', severity: 'success' });
      } else {
        setSnackbar({ open: true, message: 'API 키 테스트에 실패했습니다.', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: 'API 키 테스트 중 오류가 발생했습니다.', severity: 'error' });
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setSavedApiKey('');
    setSnackbar({ open: true, message: 'API 키가 삭제되었습니다.', severity: 'success' });
  };

  const handleSaveSmtp = () => {
    if (smtpUser) localStorage.setItem('smtp_user', smtpUser);
    if (adminEmail) localStorage.setItem('admin_email', adminEmail);
    setSnackbar({ open: true, message: 'SMTP 설정이 저장되었습니다.', severity: 'success' });
  };



  return (
    <AdminLayout>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        시스템 설정
      </Typography>

      <Grid container spacing={3}>
        {/* OpenAI API Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <KeyIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  OpenAI API 설정
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                AI 분석 기능을 위한 OpenAI API 키를 설정합니다.
              </Typography>

              <TextField
                fullWidth
                label="OpenAI API 키"
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder="sk-..."
                sx={{ mb: 2 }}
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton onClick={() => setShowApiKey(!showApiKey)} edge="end">
                        {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              {savedApiKey && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  저장된 API 키: ...{savedApiKey.slice(-4)}
                </Alert>
              )}

              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveApiKey}>
                  저장
                </Button>
                <Button variant="outlined" onClick={handleTestApiKey}>
                  테스트
                </Button>
                <Button variant="outlined" color="error" startIcon={<DeleteIcon />} onClick={handleClearApiKey}>
                  삭제
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* SMTP / Email Settings */}
        <Grid item xs={12} md={6}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 1 }}>
                <EmailIcon color="primary" />
                <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                  이메일 설정
                </Typography>
              </Box>

              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                진단 결과 이메일 발송을 위한 SMTP 설정입니다.
              </Typography>

              <TextField
                fullWidth
                label="SMTP 사용자 (Gmail)"
                value={smtpUser}
                onChange={(e) => setSmtpUser(e.target.value)}
                placeholder="example@gmail.com"
                sx={{ mb: 2 }}
              />
              <TextField
                fullWidth
                label="관리자 알림 이메일"
                value={adminEmail}
                onChange={(e) => setAdminEmail(e.target.value)}
                placeholder="admin@company.com"
                sx={{ mb: 2 }}
              />

              <Alert severity="warning" sx={{ mb: 2 }}>
                SMTP 비밀번호(앱 비밀번호)는 보안상 환경변수(GMAIL_APP_PASSWORD)로 설정해주세요.
              </Alert>

              <Button variant="contained" startIcon={<SaveIcon />} onClick={handleSaveSmtp}>
                이메일 설정 저장
              </Button>
            </CardContent>
          </Card>
        </Grid>

        {/* Password Settings */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 3 }}>
                관리자 비밀번호
              </Typography>
              <Alert severity="info" sx={{ mb: 3 }}>
                관리자 비밀번호는 서버 환경변수(ADMIN_PASSWORD)로 관리됩니다. 기본값: admin1234
              </Alert>
            </CardContent>
          </Card>
        </Grid>

        {/* Info */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
              환경변수 안내
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
              다음 환경변수를 .env.local 파일에 설정할 수 있습니다:
            </Typography>
            <Box component="ul" sx={{ '& li': { mb: 0.5, fontSize: '0.875rem', color: 'text.secondary' } }}>
              <li><strong>ADMIN_PASSWORD</strong> - 관리자 로그인 비밀번호 (기본: admin1234)</li>
              <li><strong>JWT_SECRET</strong> - JWT 토큰 서명 키</li>
              <li><strong>SMTP_USER</strong> - Gmail SMTP 사용자 이메일</li>
              <li><strong>GMAIL_APP_PASSWORD</strong> - Gmail 앱 비밀번호</li>
              <li><strong>ADMIN_EMAIL</strong> - 관리자 알림 수신 이메일</li>
              <li><strong>NEXT_PUBLIC_SUPABASE_URL</strong> - Supabase 프로젝트 URL</li>
              <li><strong>NEXT_PUBLIC_SUPABASE_ANON_KEY</strong> - Supabase 익명 키</li>
            </Box>
          </Paper>
        </Grid>
      </Grid>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </AdminLayout>
  );
}
