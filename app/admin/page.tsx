'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Alert,
  CircularProgress,
  Snackbar,
  Switch,
  FormControlLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon,
  Refresh as RefreshIcon
} from '@mui/icons-material';
import AdminLayout from './components/AdminLayout';

interface Category {
  id: number;
  key: string;
  title: string;
}

interface SurveyQuestion {
  question_id: string;
  category_id: number;
  question: string;
  weight: number;
  isactive: boolean;
}

export default function AdminPage() {
  const [questions, setQuestions] = useState<SurveyQuestion[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [showInactive, setShowInactive] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [formData, setFormData] = useState({
    question_id: '',
    category_id: 0,
    question: '',
    weight: 3
  });
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ totalQuestions: 0, activeQuestions: 0, totalResults: 0, categories: 0 });
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [questionsRes, resultsRes] = await Promise.all([
        fetch('/api/admin/questions'),
        fetch('/api/admin/results')
      ]);
      const questionsData = await questionsRes.json();
      const resultsData = await resultsRes.json();

      if (questionsData.success) {
        setQuestions(questionsData.questions || []);
        setCategories(questionsData.categories || []);
        const active = (questionsData.questions || []).filter((q: SurveyQuestion) => q.isactive).length;
        setStats(prev => ({
          ...prev,
          totalQuestions: questionsData.questions?.length || 0,
          activeQuestions: active,
          categories: questionsData.categories?.length || 0
        }));
      }

      if (resultsData.success) {
        setStats(prev => ({ ...prev, totalResults: resultsData.stats?.totalCount || 0 }));
      }
    } catch (error) {
      setSnackbar({ open: true, message: '데이터 로딩에 실패했습니다.', severity: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const getCategoryName = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.title || `카테고리 ${categoryId}`;
  };

  const getCategoryKey = (categoryId: number) => {
    return categories.find(c => c.id === categoryId)?.key || '';
  };

  const filteredQuestions = questions.filter(q => {
    const categoryMatch = selectedCategory === 'all' || String(q.category_id) === selectedCategory;
    const activeMatch = showInactive || q.isactive;
    return categoryMatch && activeMatch;
  });

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    const defaultCategoryId = categories.length > 0 ? categories[0].id : 0;
    setFormData({ question_id: '', category_id: defaultCategoryId, question: '', weight: 3 });
    setOpenDialog(true);
  };

  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    setFormData({
      question_id: question.question_id,
      category_id: question.category_id,
      question: question.question,
      weight: question.weight
    });
    setOpenDialog(true);
  };

  const handleDeleteQuestion = async (questionId: string) => {
    if (!window.confirm('이 질문을 비활성화하시겠습니까?')) return;

    try {
      const response = await fetch(`/api/admin/questions?question_id=${questionId}`, {
        method: 'DELETE',
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: '질문이 비활성화되었습니다.', severity: 'success' });
        fetchData();
      } else {
        setSnackbar({ open: true, message: data.message || '삭제 실패', severity: 'error' });
      }
    } catch {
      setSnackbar({ open: true, message: '서버 오류', severity: 'error' });
    }
  };

  const handleSaveQuestion = async () => {
    if (!formData.category_id || !formData.question) {
      setSnackbar({ open: true, message: '모든 필드를 입력해주세요.', severity: 'error' });
      return;
    }

    try {
      if (editingQuestion) {
        const response = await fetch('/api/admin/questions', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setSnackbar({ open: true, message: '질문이 수정되었습니다.', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: data.message || '수정 실패', severity: 'error' });
          return;
        }
      } else {
        if (!formData.question_id) {
          setSnackbar({ open: true, message: '질문 ID를 입력해주세요.', severity: 'error' });
          return;
        }
        const response = await fetch('/api/admin/questions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        });
        const data = await response.json();
        if (data.success) {
          setSnackbar({ open: true, message: '질문이 추가되었습니다.', severity: 'success' });
        } else {
          setSnackbar({ open: true, message: data.message || '추가 실패', severity: 'error' });
          return;
        }
      }
      setOpenDialog(false);
      fetchData();
    } catch {
      setSnackbar({ open: true, message: '서버 오류', severity: 'error' });
    }
  };

  const handleReactivate = async (question: SurveyQuestion) => {
    try {
      const response = await fetch('/api/admin/questions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question_id: question.question_id, isactive: true }),
      });
      const data = await response.json();
      if (data.success) {
        setSnackbar({ open: true, message: '질문이 재활성화되었습니다.', severity: 'success' });
        fetchData();
      }
    } catch {
      setSnackbar({ open: true, message: '서버 오류', severity: 'error' });
    }
  };

  return (
    <AdminLayout>
      {/* Dashboard Overview */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.activeQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">활성 설문 항목</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalResults}
              </Typography>
              <Typography variant="body2" color="text.secondary">총 진단 참여자</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.totalQuestions}
              </Typography>
              <Typography variant="body2" color="text.secondary">전체 항목 수</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <SettingsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>
                {stats.categories}
              </Typography>
              <Typography variant="body2" color="text.secondary">진단 카테고리</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Survey Management */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
              설문 항목 관리
            </Typography>
            <Box sx={{ display: 'flex', gap: 1 }}>
              <Button variant="outlined" startIcon={<RefreshIcon />} onClick={fetchData}>
                새로고침
              </Button>
              <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddQuestion}>
                새 항목 추가
              </Button>
            </Box>
          </Box>

          {/* Filters */}
          <Box sx={{ display: 'flex', gap: 2, mb: 3, flexWrap: 'wrap', alignItems: 'center' }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>카테고리 필터</InputLabel>
              <Select
                value={selectedCategory}
                label="카테고리 필터"
                onChange={(e) => setSelectedCategory(e.target.value)}
              >
                <MenuItem value="all">전체 카테고리</MenuItem>
                {categories.map(cat => (
                  <MenuItem key={cat.id} value={String(cat.id)}>{cat.title}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <FormControlLabel
              control={<Switch checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />}
              label="비활성 항목 표시"
            />
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredQuestions.length === 0 ? (
            <Alert severity="info">표시할 질문이 없습니다.</Alert>
          ) : (
            <Paper>
              <List>
                {filteredQuestions.map((question, index) => (
                  <ListItem
                    key={question.question_id}
                    divider={index < filteredQuestions.length - 1}
                    sx={{ opacity: question.isactive ? 1 : 0.5 }}
                  >
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, flexWrap: 'wrap' }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {question.question}
                          </Typography>
                          <Chip label={getCategoryName(question.category_id)} size="small" color="primary" variant="outlined" />
                          <Chip label={`가중치: ${question.weight}점`} size="small" color="secondary" />
                          {!question.isactive && <Chip label="비활성" size="small" color="error" />}
                        </Box>
                      }
                      secondary={`ID: ${question.question_id}`}
                    />
                    <ListItemSecondaryAction>
                      {!question.isactive ? (
                        <Button size="small" onClick={() => handleReactivate(question)}>재활성화</Button>
                      ) : (
                        <>
                          <IconButton onClick={() => handleEditQuestion(question)} sx={{ mr: 1 }}>
                            <EditIcon />
                          </IconButton>
                          <IconButton onClick={() => handleDeleteQuestion(question.question_id)} color="error">
                            <DeleteIcon />
                          </IconButton>
                        </>
                      )}
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingQuestion ? '설문 항목 수정' : '새 설문 항목 추가'}</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
              {!editingQuestion && (
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="질문 ID"
                    value={formData.question_id}
                    onChange={(e) => setFormData(prev => ({ ...prev, question_id: e.target.value }))}
                    placeholder="예: planning_01"
                    helperText="영문, 숫자, 언더스코어 조합 (예: planning_01)"
                  />
                </Grid>
              )}
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="질문 내용"
                  multiline
                  rows={3}
                  value={formData.question}
                  onChange={(e) => setFormData(prev => ({ ...prev, question: e.target.value }))}
                  placeholder="설문 질문을 입력하세요..."
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>카테고리</InputLabel>
                  <Select
                    value={formData.category_id || ''}
                    label="카테고리"
                    onChange={(e) => setFormData(prev => ({ ...prev, category_id: Number(e.target.value) }))}
                  >
                    {categories.map(cat => (
                      <MenuItem key={cat.id} value={cat.id}>{cat.title}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel>가중치</InputLabel>
                  <Select
                    value={formData.weight}
                    label="가중치"
                    onChange={(e) => setFormData(prev => ({ ...prev, weight: Number(e.target.value) }))}
                  >
                    <MenuItem value={1}>1점 (낮음)</MenuItem>
                    <MenuItem value={2}>2점 (보통)</MenuItem>
                    <MenuItem value={3}>3점 (중간)</MenuItem>
                    <MenuItem value={4}>4점 (높음)</MenuItem>
                    <MenuItem value={5}>5점 (매우 높음)</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
            </Grid>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSaveQuestion} variant="contained">
            {editingQuestion ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>

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
