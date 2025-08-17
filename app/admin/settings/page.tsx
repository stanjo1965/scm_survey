'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Alert,
  Snackbar,
  Paper,
  Divider
} from '@mui/material';
import {
  Save as SaveIcon,
  Visibility as VisibilityIcon,
  VisibilityOff as VisibilityOffIcon,
  Settings as SettingsIcon
} from '@mui/icons-material';

export default function AdminSettingsPage() {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [savedApiKey, setSavedApiKey] = useState('');
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    // localStorage에서 저장된 API 키 불러오기
    const storedApiKey = localStorage.getItem('openai_api_key');
    if (storedApiKey) {
      setSavedApiKey(storedApiKey);
      setApiKey(storedApiKey);
    }
  }, []);

  const handleSaveApiKey = () => {
    if (!apiKey.trim()) {
      setSnackbar({
        open: true,
        message: 'API 키를 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    // API 키를 localStorage에 저장
    localStorage.setItem('openai_api_key', apiKey);
    setSavedApiKey(apiKey);
    
    setSnackbar({
      open: true,
      message: 'API 키가 성공적으로 저장되었습니다.',
      severity: 'success'
    });
  };

  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      setSnackbar({
        open: true,
        message: 'API 키를 입력해주세요.',
        severity: 'error'
      });
      return;
    }

    try {
      const response = await fetch('/api/ai-analysis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userInfo: { name: '테스트', company: '테스트 회사' },
          resultData: {
            totalScore: 3.2,
            categoryScores: {
              planning: 3.1,
              procurement: 3.3,
              inventory: 2.8,
              production: 3.5,
              logistics: 3.0,
              integration: 3.4
            }
          }
        }),
      });

      if (response.ok) {
        setSnackbar({
          open: true,
          message: 'API 키가 정상적으로 작동합니다.',
          severity: 'success'
        });
      } else {
        setSnackbar({
          open: true,
          message: 'API 키 테스트에 실패했습니다. 키를 확인해주세요.',
          severity: 'error'
        });
      }
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'API 키 테스트 중 오류가 발생했습니다.',
        severity: 'error'
      });
    }
  };

  const handleClearApiKey = () => {
    localStorage.removeItem('openai_api_key');
    setApiKey('');
    setSavedApiKey('');
    setSnackbar({
      open: true,
      message: 'API 키가 삭제되었습니다.',
      severity: 'success'
    });
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default', py: 4 }}>
      <Container maxWidth="md">
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 4 }}>
          <SettingsIcon sx={{ fontSize: 40, color: 'primary.main', mr: 2 }} />
          <Typography variant="h4" component="h1" sx={{ fontWeight: 'bold' }}>
            관리자 설정
          </Typography>
        </Box>

        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', mb: 3 }}>
              OpenAI API 설정
            </Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                SCM 진단 시스템에서 AI 분석을 위해 OpenAI API 키를 설정합니다.
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
                    <Button
                      onClick={() => setShowApiKey(!showApiKey)}
                      sx={{ minWidth: 'auto' }}
                    >
                      {showApiKey ? <VisibilityOffIcon /> : <VisibilityIcon />}
                    </Button>
                  ),
                }}
              />
              
              {savedApiKey && (
                <Alert severity="info" sx={{ mb: 2 }}>
                  API 키가 저장되어 있습니다. (마지막 4자리: ...{savedApiKey.slice(-4)})
                </Alert>
              )}
            </Box>

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleSaveApiKey}
                size="large"
              >
                API 키 저장
              </Button>
              
              <Button
                variant="outlined"
                onClick={handleTestApiKey}
                size="large"
              >
                API 키 테스트
              </Button>
              
              <Button
                variant="outlined"
                color="error"
                onClick={handleClearApiKey}
                size="large"
              >
                API 키 삭제
              </Button>
            </Box>
          </CardContent>
        </Card>

        <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
          <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
            설정 안내
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • OpenAI API 키는 안전하게 브라우저에 저장됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • API 키가 설정되지 않으면 기본 분석 템플릿이 사용됩니다.
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            • API 키 테스트를 통해 정상 작동 여부를 확인할 수 있습니다.
          </Typography>
          <Typography variant="body2" color="text.secondary">
            • OpenAI API 사용량에 따라 비용이 발생할 수 있습니다.
          </Typography>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 