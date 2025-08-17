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
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  LinearProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Paper,
  Divider
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon
} from '@mui/icons-material';

interface ImprovementTask {
  id: string;
  category: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  progress: number;
  assignedTo: string;
  notes: string;
}

const categoryNames = {
  planning: '계획 관리',
  procurement: '조달 관리',
  inventory: '재고 관리',
  production: '생산 관리',
  logistics: '물류 관리',
  integration: '통합 관리'
};

const priorityColors = {
  high: 'error',
  medium: 'warning',
  low: 'success'
};

const statusColors = {
  pending: 'default',
  'in-progress': 'primary',
  completed: 'success'
};

export default function ImprovementPlanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ImprovementTask[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ImprovementTask | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    title: '',
    description: '',
    priority: 'medium' as const,
    startDate: '',
    endDate: '',
    assignedTo: '',
    notes: ''
  });

  useEffect(() => {
    // localStorage에서 기존 개선계획 불러오기
    const savedTasks = localStorage.getItem('improvementTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
  }, []);

  const saveTasks = (newTasks: ImprovementTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('improvementTasks', JSON.stringify(newTasks));
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({
      category: '',
      title: '',
      description: '',
      priority: 'medium',
      startDate: '',
      endDate: '',
      assignedTo: '',
      notes: ''
    });
    setOpenDialog(true);
  };

  const handleEditTask = (task: ImprovementTask) => {
    setEditingTask(task);
    setFormData({
      category: task.category,
      title: task.title,
      description: task.description,
      priority: task.priority,
      startDate: task.startDate,
      endDate: task.endDate,
      assignedTo: task.assignedTo,
      notes: task.notes
    });
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('정말로 이 개선계획을 삭제하시겠습니까?')) {
      const newTasks = tasks.filter(task => task.id !== taskId);
      saveTasks(newTasks);
    }
  };

  const handleSaveTask = () => {
    if (!formData.category || !formData.title || !formData.description) {
      alert('필수 항목을 모두 입력해주세요.');
      return;
    }

    const newTask: ImprovementTask = {
      id: editingTask?.id || Date.now().toString(),
      category: formData.category,
      title: formData.title,
      description: formData.description,
      priority: formData.priority,
      status: editingTask?.status || 'pending',
      startDate: formData.startDate,
      endDate: formData.endDate,
      progress: editingTask?.progress || 0,
      assignedTo: formData.assignedTo,
      notes: formData.notes
    };

    let newTasks: ImprovementTask[];
    if (editingTask) {
      newTasks = tasks.map(task => task.id === editingTask.id ? newTask : task);
    } else {
      newTasks = [...tasks, newTask];
    }

    saveTasks(newTasks);
    setOpenDialog(false);
  };

  const handleStatusChange = (taskId: string, newStatus: ImprovementTask['status']) => {
    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { ...task, status: newStatus, progress: newStatus === 'completed' ? 100 : task.progress }
        : task
    );
    saveTasks(newTasks);
  };

  const handleProgressChange = (taskId: string, newProgress: number) => {
    const newTasks = tasks.map(task => 
      task.id === taskId 
        ? { 
            ...task, 
            progress: newProgress,
            status: newProgress === 100 ? 'completed' : newProgress > 0 ? 'in-progress' : 'pending'
          }
        : task
    );
    saveTasks(newTasks);
  };

  const getCategoryStats = () => {
    const stats: Record<string, { total: number; completed: number; inProgress: number }> = {};
    
    tasks.forEach(task => {
      if (!stats[task.category]) {
        stats[task.category] = { total: 0, completed: 0, inProgress: 0 };
      }
      stats[task.category].total++;
      if (task.status === 'completed') {
        stats[task.category].completed++;
      } else if (task.status === 'in-progress') {
        stats[task.category].inProgress++;
      }
    });

    return stats;
  };

  const categoryStats = getCategoryStats();
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(task => task.status === 'completed').length;
  const overallProgress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" component="div" sx={{ fontWeight: 'bold' }}>
                개선계획 수립 및 관리
              </Typography>
            </Box>
            <Button color="inherit" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* Overall Progress */}
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                전체 진행률
              </Typography>
              <Typography variant="h6" color="primary.main">
                {overallProgress.toFixed(1)}%
              </Typography>
            </Box>
            <LinearProgress 
              variant="determinate" 
              value={overallProgress} 
              sx={{ height: 10, borderRadius: 5 }}
            />
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
              <Typography variant="body2" color="text.secondary">
                총 {totalTasks}개 계획
              </Typography>
              <Typography variant="body2" color="text.secondary">
                완료 {completedTasks}개
              </Typography>
            </Box>
          </CardContent>
        </Card>

        {/* Category Statistics */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          {Object.entries(categoryStats).map(([category, stats]) => (
            <Grid item xs={12} sm={6} md={4} key={category}>
              <Card>
                <CardContent>
                  <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                    {categoryNames[category as keyof typeof categoryNames]}
                  </Typography>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">전체</Typography>
                    <Typography variant="body2" fontWeight="bold">{stats.total}개</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2">진행중</Typography>
                    <Typography variant="body2" color="primary.main">{stats.inProgress}개</Typography>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="body2">완료</Typography>
                    <Typography variant="body2" color="success.main">{stats.completed}개</Typography>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
            개선계획 목록
          </Typography>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={handleAddTask}
            size="large"
          >
            새 계획 추가
          </Button>
        </Box>

        {/* Tasks List */}
        <Grid container spacing={3}>
          {tasks.map((task) => (
            <Grid item xs={12} key={task.id}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                    <Box sx={{ flex: 1 }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                        <Chip 
                          label={categoryNames[task.category as keyof typeof categoryNames]} 
                          size="small" 
                          color="primary" 
                          variant="outlined"
                        />
                        <Chip 
                          label={task.priority === 'high' ? '높음' : task.priority === 'medium' ? '보통' : '낮음'} 
                          size="small" 
                          color={priorityColors[task.priority]}
                        />
                        <Chip 
                          label={task.status === 'pending' ? '대기' : task.status === 'in-progress' ? '진행중' : '완료'} 
                          size="small" 
                          color={statusColors[task.status]}
                        />
                      </Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1 }}>
                        {task.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                        {task.description}
                      </Typography>
                      
                      {task.assignedTo && (
                        <Typography variant="body2" sx={{ mb: 1 }}>
                          <strong>담당자:</strong> {task.assignedTo}
                        </Typography>
                      )}
                      
                      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                        <Typography variant="body2">
                          <strong>시작일:</strong> {task.startDate}
                        </Typography>
                        <Typography variant="body2">
                          <strong>완료일:</strong> {task.endDate}
                        </Typography>
                      </Box>

                      <Box sx={{ mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2">진행률</Typography>
                          <Typography variant="body2">{task.progress}%</Typography>
                        </Box>
                        <LinearProgress 
                          variant="determinate" 
                          value={task.progress} 
                          sx={{ height: 6, borderRadius: 3 }}
                        />
                      </Box>

                      {task.notes && (
                        <Paper sx={{ p: 2, bgcolor: 'grey.50' }}>
                          <Typography variant="body2">
                            <strong>메모:</strong> {task.notes}
                          </Typography>
                        </Paper>
                      )}
                    </Box>
                    
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        onClick={() => handleEditTask(task)}
                        color="primary"
                      >
                        <EditIcon />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={() => handleDeleteTask(task.id)}
                        color="error"
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  </Box>

                  {/* Quick Actions */}
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                    <Button
                      size="small"
                      variant={task.status === 'pending' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange(task.id, 'pending')}
                      startIcon={<ScheduleIcon />}
                    >
                      대기
                    </Button>
                    <Button
                      size="small"
                      variant={task.status === 'in-progress' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange(task.id, 'in-progress')}
                      startIcon={<TrendingUpIcon />}
                    >
                      진행중
                    </Button>
                    <Button
                      size="small"
                      variant={task.status === 'completed' ? 'contained' : 'outlined'}
                      onClick={() => handleStatusChange(task.id, 'completed')}
                      startIcon={<CheckCircleIcon />}
                      color="success"
                    >
                      완료
                    </Button>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        {tasks.length === 0 && (
          <Card sx={{ textAlign: 'center', py: 8 }}>
            <CardContent>
              <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                아직 등록된 개선계획이 없습니다.
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={handleAddTask}
              >
                첫 번째 계획 추가하기
              </Button>
            </CardContent>
          </Card>
        )}
      </Container>

      {/* Add/Edit Task Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingTask ? '개선계획 수정' : '새 개선계획 추가'}
        </DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>카테고리</InputLabel>
                <Select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  label="카테고리"
                >
                  {Object.entries(categoryNames).map(([key, name]) => (
                    <MenuItem key={key} value={key}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  label="우선순위"
                >
                  <MenuItem value="high">높음</MenuItem>
                  <MenuItem value="medium">보통</MenuItem>
                  <MenuItem value="low">낮음</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="계획 제목"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="계획 설명"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                multiline
                rows={3}
                required
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="시작일"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="완료일"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="담당자"
                value={formData.assignedTo}
                onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="메모"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                multiline
                rows={2}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSaveTask} variant="contained">
            {editingTask ? '수정' : '추가'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
} 