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
  IconButton,
  Paper,
  Tabs,
  Tab,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  CircularProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Checkbox,
  Fab
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  CheckCircle as CheckCircleIcon,
  Schedule as ScheduleIcon,
  TrendingUp as TrendingUpIcon,
  Home as HomeIcon,
  ArrowBack as ArrowBackIcon,
  ExpandMore as ExpandMoreIcon,
  AutoAwesome as AutoAwesomeIcon,
  AccountTree as ProcessIcon,
  BarChart as DataIcon,
  Park as EsgIcon,
  Rocket as StrategyIcon,
  PlayArrow as PlayIcon,
  Assessment as AssessmentIcon,
  Chat as ChatIcon,
  Timeline as TimelineIcon
} from '@mui/icons-material';
import AIChatPanel from '../components/AIChatPanel';
import { AIImprovementPlanItem } from '../types/ai';
import {
  scmImprovementAreas,
  getRecommendedItems,
  categoryKeyMap,
  type ImprovementItem
} from '../lib/scm-framework';

interface ImprovementTask {
  id: string;
  frameworkItemId?: string;
  area: string;
  areaKey: string;
  category: string;
  categoryKey: string;
  title: string;
  description: string;
  actions: string[];
  kpis: string[];
  priority: 'high' | 'medium' | 'low';
  status: 'pending' | 'in-progress' | 'completed';
  startDate: string;
  endDate: string;
  progress: number;
  assignedTo: string;
  notes: string;
  checkedActions: boolean[];
}

const priorityLabels: Record<string, string> = { high: '높음', medium: '보통', low: '낮음' };
const priorityColors: Record<string, 'error' | 'warning' | 'success'> = { high: 'error', medium: 'warning', low: 'success' };
const statusLabels: Record<string, string> = { pending: '대기', 'in-progress': '진행중', completed: '완료' };
const statusColors: Record<string, 'default' | 'primary' | 'success'> = { pending: 'default', 'in-progress': 'primary', completed: 'success' };

const areaIcons: Record<string, React.ReactNode> = {
  scor: <ProcessIcon />,
  data: <DataIcon />,
  esg: <EsgIcon />,
  strategic: <StrategyIcon />
};

export default function ImprovementPlanPage() {
  const router = useRouter();
  const [tasks, setTasks] = useState<ImprovementTask[]>([]);
  const [activeTab, setActiveTab] = useState(0);
  const [selectedArea, setSelectedArea] = useState<string>('all');
  const [openDialog, setOpenDialog] = useState(false);
  const [editingTask, setEditingTask] = useState<ImprovementTask | null>(null);
  const [detailTask, setDetailTask] = useState<ImprovementTask | null>(null);
  const [formData, setFormData] = useState({
    category: '',
    categoryKey: 'planning',
    title: '',
    description: '',
    priority: 'medium' as 'high' | 'medium' | 'low',
    startDate: '',
    endDate: '',
    assignedTo: '',
    notes: ''
  });
  const [surveyResult, setSurveyResult] = useState<{ totalScore: number; categoryScores: Record<string, number> } | null>(null);
  const [recommendations, setRecommendations] = useState<ImprovementItem[]>([]);
  const [generating, setGenerating] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' | 'info' });
  const [aiPlans, setAiPlans] = useState<AIImprovementPlanItem[]>([]);
  const [generatingAIPlan, setGeneratingAIPlan] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<any>(null);

  useEffect(() => {
    const savedTasks = localStorage.getItem('improvementTasks_v2');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    const storedResult = localStorage.getItem('surveyResult');
    if (storedResult) {
      const result = JSON.parse(storedResult);
      setSurveyResult({ totalScore: result.totalScore, categoryScores: result.categoryScores });
    }
    const storedUserInfo = localStorage.getItem('userInfo');
    if (storedUserInfo) {
      setUserInfo(JSON.parse(storedUserInfo));
    }
  }, []);

  const saveTasks = (newTasks: ImprovementTask[]) => {
    setTasks(newTasks);
    localStorage.setItem('improvementTasks_v2', JSON.stringify(newTasks));
  };

  const handleGenerateAIPlan = async () => {
    if (!surveyResult) {
      setSnackbar({ open: true, message: '진단 결과가 없습니다.', severity: 'error' });
      return;
    }
    setGeneratingAIPlan(true);
    try {
      const response = await fetch('/api/ai-improvement-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surveyResultId: null,
          userInfo,
          categoryScores: surveyResult.categoryScores,
          totalScore: surveyResult.totalScore
        })
      });
      if (response.ok) {
        const data = await response.json();
        if (data.plans) {
          setAiPlans(data.plans);
          setActiveTab(3);
          setSnackbar({ open: true, message: `AI가 ${data.plans.length}개 맞춤 개선계획을 생성했습니다.`, severity: 'success' });
        }
      } else {
        setSnackbar({ open: true, message: 'AI 개선계획 생성에 실패했습니다.', severity: 'error' });
      }
    } catch (e) {
      setSnackbar({ open: true, message: 'AI 서비스 연결에 실패했습니다.', severity: 'error' });
    } finally {
      setGeneratingAIPlan(false);
    }
  };

  const handleAddAIPlanItem = (plan: AIImprovementPlanItem) => {
    if (tasks.find(t => t.title === plan.title)) {
      setSnackbar({ open: true, message: '이미 추가된 항목입니다.', severity: 'info' });
      return;
    }
    const newTask: ImprovementTask = {
      id: Date.now().toString(),
      area: plan.phase_label,
      areaKey: plan.category_key || 'manual',
      category: plan.category_key || '',
      categoryKey: plan.category_key || 'planning',
      title: plan.title,
      description: plan.description,
      actions: plan.actions || [],
      kpis: plan.kpis || [],
      priority: plan.priority || 'medium',
      status: 'pending',
      startDate: '',
      endDate: '',
      progress: 0,
      assignedTo: '',
      notes: `예산: ${plan.estimated_budget || '미정'} | 인력: ${plan.estimated_effort || '미정'}`,
      checkedActions: (plan.actions || []).map(() => false)
    };
    saveTasks([...tasks, newTask]);
    setSnackbar({ open: true, message: `"${plan.title}" 항목이 추가되었습니다.`, severity: 'success' });
  };

  const handleGenerateRecommendations = () => {
    if (!surveyResult) {
      setSnackbar({ open: true, message: '진단 결과가 없습니다. 먼저 SCM 진단을 완료해주세요.', severity: 'error' });
      return;
    }
    setGenerating(true);
    const items = getRecommendedItems(surveyResult.categoryScores, surveyResult.totalScore);
    setRecommendations(items);
    setGenerating(false);
    setActiveTab(1);
    setSnackbar({ open: true, message: `${items.length}개의 개선 항목이 추천되었습니다.`, severity: 'success' });
  };

  const handleAddRecommendation = (item: ImprovementItem) => {
    if (tasks.find(t => t.frameworkItemId === item.id)) {
      setSnackbar({ open: true, message: '이미 추가된 항목입니다.', severity: 'info' });
      return;
    }
    const newTask: ImprovementTask = {
      id: Date.now().toString(),
      frameworkItemId: item.id,
      area: item.area,
      areaKey: item.areaKey,
      category: item.category,
      categoryKey: item.categoryKey,
      title: item.title,
      description: item.description,
      actions: item.actions,
      kpis: item.kpis,
      priority: item.priority,
      status: 'pending',
      startDate: '',
      endDate: '',
      progress: 0,
      assignedTo: '',
      notes: '',
      checkedActions: item.actions.map(() => false)
    };
    saveTasks([...tasks, newTask]);
    setSnackbar({ open: true, message: `"${item.title}" 항목이 추가되었습니다.`, severity: 'success' });
  };

  const handleAddAllRecommendations = () => {
    const newTasks: ImprovementTask[] = [];
    for (const item of recommendations) {
      if (!tasks.find(t => t.frameworkItemId === item.id)) {
        newTasks.push({
          id: (Date.now() + Math.random() * 1000).toString(),
          frameworkItemId: item.id,
          area: item.area,
          areaKey: item.areaKey,
          category: item.category,
          categoryKey: item.categoryKey,
          title: item.title,
          description: item.description,
          actions: item.actions,
          kpis: item.kpis,
          priority: item.priority,
          status: 'pending',
          startDate: '',
          endDate: '',
          progress: 0,
          assignedTo: '',
          notes: '',
          checkedActions: item.actions.map(() => false)
        });
      }
    }
    if (newTasks.length > 0) {
      saveTasks([...tasks, ...newTasks]);
      setSnackbar({ open: true, message: `${newTasks.length}개 항목이 추가되었습니다.`, severity: 'success' });
    } else {
      setSnackbar({ open: true, message: '모든 항목이 이미 추가되어 있습니다.', severity: 'info' });
    }
  };

  const handleAddTask = () => {
    setEditingTask(null);
    setFormData({ category: '', categoryKey: 'planning', title: '', description: '', priority: 'medium', startDate: '', endDate: '', assignedTo: '', notes: '' });
    setOpenDialog(true);
  };

  const handleEditTask = (task: ImprovementTask) => {
    setEditingTask(task);
    setFormData({ category: task.category, categoryKey: task.categoryKey, title: task.title, description: task.description, priority: task.priority, startDate: task.startDate, endDate: task.endDate, assignedTo: task.assignedTo, notes: task.notes });
    setOpenDialog(true);
  };

  const handleDeleteTask = (taskId: string) => {
    if (confirm('정말로 이 개선계획을 삭제하시겠습니까?')) {
      saveTasks(tasks.filter(t => t.id !== taskId));
    }
  };

  const handleSaveTask = () => {
    if (!formData.title || !formData.description) {
      setSnackbar({ open: true, message: '제목과 설명을 입력해주세요.', severity: 'error' });
      return;
    }
    if (editingTask) {
      saveTasks(tasks.map(t => t.id === editingTask.id ? { ...t, ...formData, category: formData.category || categoryKeyMap[formData.categoryKey] || formData.categoryKey } : t));
    } else {
      const newTask: ImprovementTask = {
        id: Date.now().toString(), area: '수동 추가', areaKey: 'manual',
        category: formData.category || categoryKeyMap[formData.categoryKey] || formData.categoryKey,
        categoryKey: formData.categoryKey, title: formData.title, description: formData.description,
        actions: [], kpis: [], priority: formData.priority, status: 'pending',
        startDate: formData.startDate, endDate: formData.endDate, progress: 0,
        assignedTo: formData.assignedTo, notes: formData.notes, checkedActions: []
      };
      saveTasks([...tasks, newTask]);
    }
    setOpenDialog(false);
    setSnackbar({ open: true, message: editingTask ? '수정되었습니다.' : '추가되었습니다.', severity: 'success' });
  };

  const handleStatusChange = (taskId: string, newStatus: ImprovementTask['status']) => {
    saveTasks(tasks.map(t => t.id === taskId ? { ...t, status: newStatus, progress: newStatus === 'completed' ? 100 : t.progress } : t));
  };

  const handleToggleAction = (taskId: string, actionIndex: number) => {
    saveTasks(tasks.map(t => {
      if (t.id !== taskId) return t;
      const newChecked = [...(t.checkedActions || t.actions.map(() => false))];
      newChecked[actionIndex] = !newChecked[actionIndex];
      const completedCount = newChecked.filter(Boolean).length;
      const progress = t.actions.length > 0 ? Math.round((completedCount / t.actions.length) * 100) : t.progress;
      const status: any = progress === 100 ? 'completed' : progress > 0 ? 'in-progress' : 'pending';
      return { ...t, checkedActions: newChecked, progress, status };
    }));
  };

  const filteredTasks = tasks.filter(t => selectedArea === 'all' || t.areaKey === selectedArea);
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const inProgressTasks = tasks.filter(t => t.status === 'in-progress').length;
  const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const areaStats = scmImprovementAreas.map(area => ({
    ...area,
    total: tasks.filter(t => t.areaKey === area.key).length,
    completed: tasks.filter(t => t.areaKey === area.key && t.status === 'completed').length,
    inProgress: tasks.filter(t => t.areaKey === area.key && t.status === 'in-progress').length
  }));

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f5f5f5' }}>
      {/* Header */}
      <Box sx={{ bgcolor: 'primary.main', color: 'white', py: 2 }}>
        <Container maxWidth="lg">
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <IconButton color="inherit" onClick={() => router.back()}>
                <ArrowBackIcon />
              </IconButton>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                SCM 개선계획 수립 및 관리
              </Typography>
            </Box>
            <Button color="inherit" startIcon={<HomeIcon />} onClick={() => router.push('/')}>
              홈으로
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="lg" sx={{ py: 4 }}>
        {/* 진단 결과 기반 추천 */}
        {surveyResult ? (
          <Card sx={{ mb: 4, border: '2px solid', borderColor: 'primary.main' }}>
            <CardContent>
              <Grid container spacing={3} alignItems="center">
                <Grid item xs={12} md={7}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
                    <AssessmentIcon sx={{ fontSize: 36, color: 'primary.main' }} />
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>진단 결과 기반 개선 추천</Typography>
                      <Typography variant="body2" color="text.secondary">
                        종합 점수: <strong>{surveyResult.totalScore.toFixed(1)}점</strong>
                      </Typography>
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap', mt: 2 }}>
                    {Object.entries(surveyResult.categoryScores).map(([key, score]) => (
                      <Chip key={key} label={`${categoryKeyMap[key] || key}: ${Number(score).toFixed(1)}`} size="small"
                        color={Number(score) < 3 ? 'error' : Number(score) < 4 ? 'warning' : 'success'} variant="outlined" />
                    ))}
                  </Box>
                </Grid>
                <Grid item xs={12} md={5} sx={{ textAlign: { md: 'right' } }}>
                  <Button variant="contained" size="large"
                    startIcon={generating ? <CircularProgress size={20} color="inherit" /> : <AutoAwesomeIcon />}
                    onClick={handleGenerateRecommendations} disabled={generating} sx={{ px: 4 }}>
                    {generating ? '분석 중...' : '개선 항목 추천 생성'}
                  </Button>
                </Grid>
              </Grid>
            </CardContent>
          </Card>
        ) : (
          <Alert severity="info" sx={{ mb: 4 }}>
            진단 결과가 없습니다. <Button size="small" onClick={() => router.push('/survey/info')}>SCM 진단</Button>을 먼저 완료하면 맞춤형 개선 항목을 추천받을 수 있습니다.
          </Alert>
        )}

        {/* Tabs */}
        {/* AI 맞춤 개선계획 버튼 */}
        {surveyResult && (
          <Box sx={{ mb: 2, display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              color="secondary"
              startIcon={generatingAIPlan ? <CircularProgress size={20} /> : <TimelineIcon />}
              onClick={handleGenerateAIPlan}
              disabled={generatingAIPlan}
            >
              {generatingAIPlan ? 'AI 분석 중...' : 'AI 맞춤 개선계획 생성'}
            </Button>
          </Box>
        )}

        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)} sx={{ mb: 3, '& .MuiTab-root': { fontWeight: 'bold' } }} variant="scrollable" scrollButtons="auto">
          <Tab label={`내 개선계획 (${totalTasks})`} />
          <Tab label={`추천 항목 (${recommendations.length})`} />
          <Tab label="SCM 프레임워크 전체" />
          <Tab label={`AI 맞춤 추천 (${aiPlans.length})`} icon={<AutoAwesomeIcon sx={{ fontSize: 18 }} />} iconPosition="start" />
        </Tabs>

        {/* Tab 0: 내 개선계획 */}
        {activeTab === 0 && (
          <>
            <Card sx={{ mb: 3 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>전체 진행률</Typography>
                  <Typography variant="h6" color="primary.main" sx={{ fontWeight: 'bold' }}>{overallProgress}%</Typography>
                </Box>
                <LinearProgress variant="determinate" value={overallProgress} sx={{ height: 10, borderRadius: 5, mb: 2 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5" sx={{ fontWeight: 'bold' }}>{totalTasks}</Typography><Typography variant="body2" color="text.secondary">전체</Typography></Box></Grid>
                  <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'primary.main' }}>{inProgressTasks}</Typography><Typography variant="body2" color="text.secondary">진행중</Typography></Box></Grid>
                  <Grid item xs={4}><Box sx={{ textAlign: 'center' }}><Typography variant="h5" sx={{ fontWeight: 'bold', color: 'success.main' }}>{completedTasks}</Typography><Typography variant="body2" color="text.secondary">완료</Typography></Box></Grid>
                </Grid>
              </CardContent>
            </Card>

            {/* Area Filter Cards */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              {areaStats.filter(a => a.total > 0).map(area => (
                <Grid item xs={6} sm={3} key={area.key}>
                  <Card sx={{ cursor: 'pointer', border: selectedArea === area.key ? '2px solid' : 'none', borderColor: 'primary.main' }}
                    onClick={() => setSelectedArea(selectedArea === area.key ? 'all' : area.key)}>
                    <CardContent sx={{ textAlign: 'center', py: 2 }}>
                      <Box sx={{ color: 'primary.main', mb: 1 }}>{areaIcons[area.key]}</Box>
                      <Typography variant="body2" sx={{ fontWeight: 'bold' }}>{area.title.split('(')[0].trim()}</Typography>
                      <Typography variant="caption" color="text.secondary">{area.completed}/{area.total} 완료</Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>개선계획 목록</Typography>
              <Box sx={{ display: 'flex', gap: 1 }}>
                {selectedArea !== 'all' && <Button variant="outlined" onClick={() => setSelectedArea('all')}>전체 보기</Button>}
                <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddTask}>수동 추가</Button>
              </Box>
            </Box>

            {filteredTasks.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 8 }}>
                <CardContent>
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    {tasks.length === 0 ? '아직 등록된 개선계획이 없습니다.' : '해당 영역의 계획이 없습니다.'}
                  </Typography>
                  {tasks.length === 0 && surveyResult && (
                    <Button variant="contained" startIcon={<AutoAwesomeIcon />} onClick={handleGenerateRecommendations}>진단 결과 기반 추천받기</Button>
                  )}
                </CardContent>
              </Card>
            ) : (
              filteredTasks.map(task => (
                <Card key={task.id} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1, flexWrap: 'wrap' }}>
                          <Chip label={task.area} size="small" color="primary" variant="outlined" />
                          <Chip label={task.category} size="small" variant="outlined" />
                          <Chip label={priorityLabels[task.priority]} size="small" color={priorityColors[task.priority]} />
                          <Chip label={statusLabels[task.status]} size="small" color={statusColors[task.status]} />
                        </Box>
                        <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 0.5 }}>{task.title}</Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{task.description}</Typography>
                        {task.assignedTo && <Typography variant="body2" sx={{ mb: 0.5 }}><strong>담당자:</strong> {task.assignedTo}</Typography>}
                        {(task.startDate || task.endDate) && (
                          <Typography variant="body2" sx={{ mb: 1 }}>
                            {task.startDate && <><strong>시작:</strong> {task.startDate}</>}
                            {task.startDate && task.endDate && ' ~ '}
                            {task.endDate && <><strong>완료:</strong> {task.endDate}</>}
                          </Typography>
                        )}
                        <Box sx={{ mb: 1 }}>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                            <Typography variant="caption">진행률</Typography>
                            <Typography variant="caption">{task.progress}%</Typography>
                          </Box>
                          <LinearProgress variant="determinate" value={task.progress} sx={{ height: 6, borderRadius: 3 }} />
                        </Box>

                        {task.actions && task.actions.length > 0 && (
                          <Box sx={{ mt: 1 }}>
                            <Button size="small" onClick={() => setDetailTask(detailTask?.id === task.id ? null : task)} startIcon={<PlayIcon />}>
                              실행 항목 ({(task.checkedActions || []).filter(Boolean).length}/{task.actions.length})
                            </Button>
                            {detailTask?.id === task.id && (
                              <Paper sx={{ mt: 1, p: 1 }}>
                                <List dense>
                                  {task.actions.map((action, idx) => (
                                    <ListItem key={idx} dense sx={{ py: 0 }}>
                                      <ListItemIcon sx={{ minWidth: 36 }}>
                                        <Checkbox edge="start" checked={task.checkedActions?.[idx] || false}
                                          onChange={() => handleToggleAction(task.id, idx)} size="small" />
                                      </ListItemIcon>
                                      <ListItemText primary={action}
                                        sx={{ textDecoration: task.checkedActions?.[idx] ? 'line-through' : 'none', opacity: task.checkedActions?.[idx] ? 0.6 : 1 }} />
                                    </ListItem>
                                  ))}
                                </List>
                                {task.kpis && task.kpis.length > 0 && (
                                  <Box sx={{ mt: 1, pt: 1, borderTop: '1px solid #eee' }}>
                                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>KPI:</Typography>
                                    <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 0.5 }}>
                                      {task.kpis.map((kpi, idx) => <Chip key={idx} label={kpi} size="small" variant="outlined" />)}
                                    </Box>
                                  </Box>
                                )}
                              </Paper>
                            )}
                          </Box>
                        )}
                      </Box>
                      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 0.5, ml: 1 }}>
                        <IconButton size="small" onClick={() => handleEditTask(task)} color="primary"><EditIcon fontSize="small" /></IconButton>
                        <IconButton size="small" onClick={() => handleDeleteTask(task.id)} color="error"><DeleteIcon fontSize="small" /></IconButton>
                      </Box>
                    </Box>
                    <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                      <Button size="small" variant={task.status === 'pending' ? 'contained' : 'outlined'} onClick={() => handleStatusChange(task.id, 'pending')} startIcon={<ScheduleIcon />}>대기</Button>
                      <Button size="small" variant={task.status === 'in-progress' ? 'contained' : 'outlined'} onClick={() => handleStatusChange(task.id, 'in-progress')} startIcon={<TrendingUpIcon />}>진행중</Button>
                      <Button size="small" variant={task.status === 'completed' ? 'contained' : 'outlined'} onClick={() => handleStatusChange(task.id, 'completed')} startIcon={<CheckCircleIcon />} color="success">완료</Button>
                    </Box>
                  </CardContent>
                </Card>
              ))
            )}
          </>
        )}

        {/* Tab 1: 추천 항목 */}
        {activeTab === 1 && (
          <>
            {recommendations.length === 0 ? (
              <Card sx={{ textAlign: 'center', py: 8 }}>
                <CardContent>
                  <AutoAwesomeIcon sx={{ fontSize: 60, color: 'grey.400', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary" sx={{ mb: 2 }}>
                    추천 항목을 생성하려면 위의 버튼을 클릭하세요.
                  </Typography>
                  {!surveyResult && (
                    <Alert severity="warning" sx={{ maxWidth: 500, mx: 'auto' }}>진단 결과가 없습니다. 먼저 SCM 진단을 완료해주세요.</Alert>
                  )}
                </CardContent>
              </Card>
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
                  <Typography variant="h6" sx={{ fontWeight: 'bold' }}>진단 결과 기반 추천 개선 항목 ({recommendations.length}개)</Typography>
                  <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddAllRecommendations}>전체 추가</Button>
                </Box>
                {scmImprovementAreas.map(area => {
                  const areaItems = recommendations.filter(r => r.areaKey === area.key);
                  if (areaItems.length === 0) return null;
                  return (
                    <Accordion key={area.key} defaultExpanded>
                      <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          {areaIcons[area.key]}
                          <Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{area.title}</Typography>
                            <Typography variant="caption" color="text.secondary">{area.description}</Typography>
                          </Box>
                          <Chip label={`${areaItems.length}개`} size="small" color="primary" />
                        </Box>
                      </AccordionSummary>
                      <AccordionDetails>
                        {areaItems.map(item => {
                          const isAdded = tasks.some(t => t.frameworkItemId === item.id);
                          return (
                            <Paper key={item.id} sx={{ p: 2, mb: 2, bgcolor: isAdded ? 'action.hover' : 'background.paper' }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Box sx={{ flex: 1 }}>
                                  <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                                    <Chip label={item.category} size="small" variant="outlined" />
                                    <Chip label={priorityLabels[item.priority]} size="small" color={priorityColors[item.priority]} />
                                    {isAdded && <Chip label="추가됨" size="small" color="success" />}
                                  </Box>
                                  <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>{item.description}</Typography>
                                  <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 'bold' }}>실행 항목:</Typography>
                                  <List dense sx={{ py: 0 }}>
                                    {item.actions.slice(0, 3).map((action, idx) => (
                                      <ListItem key={idx} dense sx={{ py: 0, pl: 1 }}>
                                        <ListItemText primary={`• ${action}`} primaryTypographyProps={{ variant: 'caption' }} />
                                      </ListItem>
                                    ))}
                                    {item.actions.length > 3 && (
                                      <Typography variant="caption" color="text.secondary" sx={{ pl: 1 }}>...외 {item.actions.length - 3}개</Typography>
                                    )}
                                  </List>
                                  <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mt: 1 }}>
                                    <Typography variant="caption" sx={{ fontWeight: 'bold' }}>KPI: </Typography>
                                    {item.kpis.map((kpi, idx) => <Chip key={idx} label={kpi} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.7rem' }} />)}
                                  </Box>
                                </Box>
                                <Button variant={isAdded ? 'outlined' : 'contained'} size="small" onClick={() => handleAddRecommendation(item)} disabled={isAdded} sx={{ ml: 2, minWidth: 80 }}>
                                  {isAdded ? '추가됨' : '추가'}
                                </Button>
                              </Box>
                            </Paper>
                          );
                        })}
                      </AccordionDetails>
                    </Accordion>
                  );
                })}
              </>
            )}
          </>
        )}

        {/* Tab 2: SCM 프레임워크 전체 */}
        {activeTab === 2 && (
          <>
            <Alert severity="info" sx={{ mb: 3 }}>
              SCM 개선 프레임워크의 전체 항목입니다. 필요한 항목을 선택하여 개선계획에 추가할 수 있습니다.
            </Alert>
            {scmImprovementAreas.map(area => (
              <Accordion key={area.key} sx={{ mb: 1 }}>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    {areaIcons[area.key]}
                    <Box>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{area.title}</Typography>
                      <Typography variant="caption" color="text.secondary">{area.description}</Typography>
                    </Box>
                    <Chip label={`${area.items.length}개 항목`} size="small" />
                  </Box>
                </AccordionSummary>
                <AccordionDetails>
                  {area.items.map(item => {
                    const isAdded = tasks.some(t => t.frameworkItemId === item.id);
                    return (
                      <Paper key={item.id} sx={{ p: 2, mb: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                              <Chip label={item.category} size="small" variant="outlined" />
                              <Chip label={`기준: ${item.scoreThreshold}점 이하`} size="small" variant="outlined" color="info" />
                              {isAdded && <Chip label="추가됨" size="small" color="success" />}
                            </Box>
                            <Typography variant="subtitle1" sx={{ fontWeight: 'bold' }}>{item.title}</Typography>
                            <Typography variant="body2" color="text.secondary">{item.description}</Typography>
                          </Box>
                          <Button variant={isAdded ? 'outlined' : 'contained'} size="small" onClick={() => handleAddRecommendation(item)} disabled={isAdded} sx={{ ml: 2 }}>
                            {isAdded ? '추가됨' : '추가'}
                          </Button>
                        </Box>
                      </Paper>
                    );
                  })}
                </AccordionDetails>
              </Accordion>
            ))}
          </>
        )}
      </Container>

      {/* Add/Edit Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingTask ? '개선계획 수정' : '새 개선계획 추가'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>SCM 영역</InputLabel>
                <Select value={formData.categoryKey} onChange={(e) => setFormData({ ...formData, categoryKey: e.target.value })} label="SCM 영역">
                  {Object.entries(categoryKeyMap).map(([key, name]) => <MenuItem key={key} value={key}>{name}</MenuItem>)}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel>우선순위</InputLabel>
                <Select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} label="우선순위">
                  <MenuItem value="high">높음</MenuItem>
                  <MenuItem value="medium">보통</MenuItem>
                  <MenuItem value="low">낮음</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}><TextField fullWidth label="계획 제목" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} required /></Grid>
            <Grid item xs={12}><TextField fullWidth label="계획 설명" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} multiline rows={3} required /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="시작일" type="date" value={formData.startDate} onChange={(e) => setFormData({ ...formData, startDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="완료일" type="date" value={formData.endDate} onChange={(e) => setFormData({ ...formData, endDate: e.target.value })} InputLabelProps={{ shrink: true }} /></Grid>
            <Grid item xs={12} sm={6}><TextField fullWidth label="담당자" value={formData.assignedTo} onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })} /></Grid>
            <Grid item xs={12}><TextField fullWidth label="메모" value={formData.notes} onChange={(e) => setFormData({ ...formData, notes: e.target.value })} multiline rows={2} /></Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>취소</Button>
          <Button onClick={handleSaveTask} variant="contained">{editingTask ? '수정' : '추가'}</Button>
        </DialogActions>
      </Dialog>

      {/* Tab 3: AI 맞춤 추천 */}
      {activeTab === 3 && (
        <Box>
          {aiPlans.length === 0 ? (
            <Card sx={{ p: 4, textAlign: 'center' }}>
              <AutoAwesomeIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                AI 맞춤 개선계획이 아직 없습니다
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
                위의 "AI 맞춤 개선계획 생성" 버튼을 클릭하면 귀사의 진단 결과를 분석하여 단기/중기/장기 맞춤 개선계획을 생성합니다.
              </Typography>
              <Button variant="contained" color="secondary" startIcon={<TimelineIcon />} onClick={handleGenerateAIPlan} disabled={generatingAIPlan || !surveyResult}>
                AI 맞춤 개선계획 생성
              </Button>
            </Card>
          ) : (
            <>
              {['short', 'mid', 'long'].map(phase => {
                const phaseLabel = phase === 'short' ? '단기 (1-3개월)' : phase === 'mid' ? '중기 (3-6개월)' : '장기 (6-12개월)';
                const phaseColor = phase === 'short' ? '#4caf50' : phase === 'mid' ? '#ff9800' : '#2196f3';
                const phasePlans = aiPlans.filter(p => p.phase === phase);
                if (phasePlans.length === 0) return null;

                return (
                  <Box key={phase} sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                      <Box sx={{ width: 4, height: 28, bgcolor: phaseColor, borderRadius: 2, mr: 1.5 }} />
                      <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                        {phaseLabel}
                      </Typography>
                      <Chip label={`${phasePlans.length}개 과제`} size="small" sx={{ ml: 1 }} />
                    </Box>

                    {phasePlans.map((plan, idx) => (
                      <Accordion key={idx} sx={{ mb: 1 }}>
                        <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, width: '100%', pr: 2 }}>
                            <Chip label={priorityLabels[plan.priority] || plan.priority} size="small" color={priorityColors[plan.priority] || 'default'} />
                            <Typography sx={{ fontWeight: 'bold', flex: 1 }}>{plan.title}</Typography>
                            {plan.estimated_budget && (
                              <Chip label={plan.estimated_budget} size="small" variant="outlined" />
                            )}
                          </Box>
                        </AccordionSummary>
                        <AccordionDetails>
                          <Typography variant="body2" sx={{ mb: 2, color: 'text.secondary' }}>{plan.description}</Typography>

                          {plan.actions?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>실행 단계</Typography>
                              <List dense disablePadding>
                                {plan.actions.map((action, i) => (
                                  <ListItem key={i} sx={{ py: 0.25 }}>
                                    <ListItemIcon sx={{ minWidth: 28 }}>
                                      <CheckCircleIcon sx={{ fontSize: 16, color: 'success.main' }} />
                                    </ListItemIcon>
                                    <ListItemText primary={action} primaryTypographyProps={{ variant: 'body2' }} />
                                  </ListItem>
                                ))}
                              </List>
                            </Box>
                          )}

                          {plan.kpis?.length > 0 && (
                            <Box sx={{ mb: 2 }}>
                              <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>KPI</Typography>
                              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                                {plan.kpis.map((kpi, i) => (
                                  <Chip key={i} label={kpi} size="small" variant="outlined" color="primary" />
                                ))}
                              </Box>
                            </Box>
                          )}

                          <Box sx={{ display: 'flex', gap: 1, mt: 2, flexWrap: 'wrap' }}>
                            {plan.estimated_effort && <Chip label={`인력: ${plan.estimated_effort}`} size="small" variant="outlined" />}
                            <Button size="small" variant="contained" onClick={() => handleAddAIPlanItem(plan)} startIcon={<AddIcon />}>
                              내 계획에 추가
                            </Button>
                          </Box>
                        </AccordionDetails>
                      </Accordion>
                    ))}
                  </Box>
                );
              })}

              <Box sx={{ textAlign: 'center', mt: 2 }}>
                <Button variant="outlined" onClick={() => {
                  aiPlans.forEach(p => handleAddAIPlanItem(p));
                }}>
                  전체 추가
                </Button>
              </Box>
            </>
          )}
        </Box>
      )}

      <Snackbar open={snackbar.open} autoHideDuration={4000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert severity={snackbar.severity} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>{snackbar.message}</Alert>
      </Snackbar>

      {/* AI 코칭 챗봇 FAB */}
      <Fab
        color="secondary"
        sx={{ position: 'fixed', bottom: 24, right: 24, zIndex: 1000 }}
        onClick={() => setChatOpen(true)}
      >
        <ChatIcon />
      </Fab>

      <AIChatPanel
        open={chatOpen}
        onClose={() => setChatOpen(false)}
        surveyResultId={0}
        userInfo={userInfo}
        categoryScores={surveyResult?.categoryScores || {}}
        totalScore={surveyResult?.totalScore || 0}
      />
    </Box>
  );
}
