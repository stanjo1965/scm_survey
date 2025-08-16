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
  Alert
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Assessment as AssessmentIcon,
  People as PeopleIcon,
  Settings as SettingsIcon,
  Analytics as AnalyticsIcon
} from '@mui/icons-material';

interface SurveyQuestion {
  id: string;
  category: string;
  categoryName: string;
  question: string;
  weight: number;
}

const mockQuestions: SurveyQuestion[] = [
  {
    id: 'planning_1',
    category: 'planning',
    categoryName: '계획 관리',
    question: '수요 예측의 정확도가 높은 편인가요?',
    weight: 3
  },
  {
    id: 'planning_2',
    category: 'planning',
    categoryName: '계획 관리',
    question: 'S&OP(Sales & Operations Planning) 프로세스가 체계적으로 운영되고 있나요?',
    weight: 4
  },
  {
    id: 'procurement_1',
    category: 'procurement',
    categoryName: '조달 관리',
    question: '공급업체 평가 및 관리 체계가 잘 구축되어 있나요?',
    weight: 3
  },
  {
    id: 'procurement_2',
    category: 'procurement',
    categoryName: '조달 관리',
    question: '구매 프로세스가 표준화되어 있나요?',
    weight: 3
  }
];

const categories = [
  { key: 'planning', name: '계획 관리' },
  { key: 'procurement', name: '조달 관리' },
  { key: 'inventory', name: '재고 관리' },
  { key: 'production', name: '생산 관리' },
  { key: 'logistics', name: '물류 관리' },
  { key: 'integration', name: '통합 관리' }
];

export default function AdminPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<SurveyQuestion[]>(mockQuestions);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingQuestion, setEditingQuestion] = useState<SurveyQuestion | null>(null);
  const [formData, setFormData] = useState({
    id: '',
    category: '',
    question: '',
    weight: 3
  });

  const filteredQuestions = selectedCategory === 'all' 
    ? questions 
    : questions.filter(q => q.category === selectedCategory);

  const handleAddQuestion = () => {
    setEditingQuestion(null);
    setFormData({
      id: '',
      category: '',
      question: '',
      weight: 3
    });
    setOpenDialog(true);
  };

  const handleEditQuestion = (question: SurveyQuestion) => {
    setEditingQuestion(question);
    setFormData({
      id: question.id,
      category: question.category,
      question: question.question,
      weight: question.weight
    });
    setOpenDialog(true);
  };

  const handleDeleteQuestion = (id: string) => {
    if (window.confirm('정말로 이 질문을 삭제하시겠습니까?')) {
      setQuestions(prev => prev.filter(q => q.id !== id));
    }
  };

  const handleSaveQuestion = () => {
    if (!formData.category || !formData.question) {
      alert('모든 필드를 입력해주세요.');
      return;
    }

    const categoryName = categories.find(c => c.key === formData.category)?.name || '';

    if (editingQuestion) {
      // 수정
      setQuestions(prev => prev.map(q => 
        q.id === editingQuestion.id 
          ? { ...formData, categoryName }
          : q
      ));
    } else {
      // 추가
      const newId = `${formData.category}_${Date.now()}`;
      const newQuestion: SurveyQuestion = {
        ...formData,
        id: newId,
        categoryName
      };
      setQuestions(prev => [...prev, newQuestion]);
    }

    setOpenDialog(false);
  };

  const handleBackToHome = () => {
    router.push('/');
  };

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" component="div">
              SCM Survey 관리자
            </Typography>
            <Button color="inherit" onClick={handleBackToHome}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Dashboard Overview */}
        <Grid container spacing={4} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AssessmentIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  {questions.length}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 설문 항목
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <PeopleIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  156
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  총 진단 참여자
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <AnalyticsIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  89
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  이번 달 진단
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <SettingsIcon sx={{ fontSize: 40, color: 'info.main', mb: 1 }} />
                <Typography variant="h4" component="div" sx={{ fontWeight: 'bold' }}>
                  6
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  진단 카테고리
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Survey Management */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
                설문 항목 관리
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddQuestion}
              >
                새 항목 추가
              </Button>
            </Box>

            {/* Category Filter */}
            <Box sx={{ mb: 3 }}>
              <FormControl sx={{ minWidth: 200 }}>
                <InputLabel>카테고리 필터</InputLabel>
                <Select
                  value={selectedCategory}
                  label="카테고리 필터"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="all">전체 카테고리</MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category.key} value={category.key}>
                      {category.name}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Box>

            {/* Questions List */}
            <Paper>
              <List>
                {filteredQuestions.map((question, index) => (
                  <ListItem key={question.id} divider={index < filteredQuestions.length - 1}>
                    <ListItemText
                      primary={
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                            {question.question}
                          </Typography>
                          <Chip 
                            label={question.categoryName} 
                            size="small" 
                            color="primary" 
                            variant="outlined"
                          />
                          <Chip 
                            label={`가중치: ${question.weight}점`} 
                            size="small" 
                            color="secondary"
                          />
                        </Box>
                      }
                      secondary={`ID: ${question.id}`}
                    />
                    <ListItemSecondaryAction>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleEditQuestion(question)}
                        sx={{ mr: 1 }}
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        edge="end" 
                        onClick={() => handleDeleteQuestion(question.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </ListItemSecondaryAction>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </CardContent>
        </Card>
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingQuestion ? '설문 항목 수정' : '새 설문 항목 추가'}
        </DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Grid container spacing={3}>
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
                    value={formData.category}
                    label="카테고리"
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  >
                    {categories.map(category => (
                      <MenuItem key={category.key} value={category.key}>
                        {category.name}
                      </MenuItem>
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
    </Box>
  );
} 