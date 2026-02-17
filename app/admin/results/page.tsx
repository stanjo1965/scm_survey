'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Card,
  CardContent,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  InputAdornment
} from '@mui/material';
import {
  Search as SearchIcon,
  Visibility as ViewIcon,
  Assessment as AssessmentIcon,
  TrendingUp as TrendingUpIcon,
  People as PeopleIcon,
  Delete as DeleteIcon
} from '@mui/icons-material';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';
import AdminLayout from '../components/AdminLayout';

interface SurveyResult {
  id: number;
  user_name: string;
  user_email: string;
  company_id: string;
  total_score: number;
  created_at: string;
  updated_at: string;
}

interface CategoryAnalysis {
  category: string;
  score: number;
  max_score: number;
}

interface Category {
  id: number;
  key: string;
  title: string;
}

export default function AdminResultsPage() {
  const [results, setResults] = useState<SurveyResult[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [stats, setStats] = useState({ totalCount: 0, avgScore: 0 });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedResult, setSelectedResult] = useState<SurveyResult | null>(null);
  const [detailData, setDetailData] = useState<{ analysis: CategoryAnalysis[]; answers: any[] } | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<SurveyResult | null>(null);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetchResults();
  }, []);

  const fetchResults = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/admin/results');
      const data = await response.json();
      if (data.success) {
        setResults(data.results || []);
        setStats(data.stats || { totalCount: 0, avgScore: 0 });
        setCategories(data.categories || []);
      }
    } catch {
      console.error('Failed to fetch results');
    } finally {
      setLoading(false);
    }
  };

  const fetchDetail = async (result: SurveyResult) => {
    setSelectedResult(result);
    setDetailLoading(true);
    try {
      const response = await fetch(`/api/admin/results?id=${result.id}`);
      const data = await response.json();
      if (data.success) {
        setDetailData({ analysis: data.analysis || [], answers: data.answers || [] });
      }
    } catch {
      console.error('Failed to fetch detail');
    } finally {
      setDetailLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setDeleting(true);
    try {
      const response = await fetch(`/api/admin/results?id=${deleteTarget.id}`, { method: 'DELETE' });
      const data = await response.json();
      if (data.success) {
        setResults(prev => prev.filter(r => r.id !== deleteTarget.id));
        setStats(prev => {
          const newCount = prev.totalCount - 1;
          const newAvg = newCount > 0
            ? (prev.avgScore * prev.totalCount - (deleteTarget.total_score || 0)) / newCount
            : 0;
          return { totalCount: newCount, avgScore: newAvg };
        });
      }
    } catch {
      console.error('Failed to delete');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  const getCategoryName = (key: string) => {
    return categories.find(c => c.key === key)?.title || key;
  };

  const getGrade = (score: number): string => {
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    if (score >= 1.5) return 'D+';
    return 'D';
  };

  const getGradeColor = (score: number): 'success' | 'primary' | 'warning' | 'error' => {
    if (score >= 4.0) return 'success';
    if (score >= 3.0) return 'primary';
    if (score >= 2.0) return 'warning';
    return 'error';
  };

  const getMaturityLevel = (score: number): string => {
    if (score >= 4.5) return '최적화';
    if (score >= 3.5) return '표준화';
    if (score >= 2.5) return '체계화';
    if (score >= 1.5) return '기본';
    return '초기';
  };

  const filteredResults = results.filter(r => {
    const term = searchTerm.toLowerCase();
    return !term ||
      (r.user_name || '').toLowerCase().includes(term) ||
      (r.user_email || '').toLowerCase().includes(term) ||
      (r.company_id || '').toLowerCase().includes(term);
  });

  // 차트 데이터 준비
  const radarData = detailData?.analysis?.map(a => ({
    category: getCategoryName(a.category),
    score: Number(a.score?.toFixed(1) || 0),
    fullMark: 5
  })) || [];

  const barData = detailData?.analysis?.map(a => ({
    name: getCategoryName(a.category),
    점수: Number(a.score?.toFixed(1) || 0),
    최대: 5
  })) || [];

  // 전체 통계 차트용 데이터
  const scoreDistribution = [
    { range: '1.0-2.0', count: results.filter(r => r.total_score >= 1 && r.total_score < 2).length },
    { range: '2.0-3.0', count: results.filter(r => r.total_score >= 2 && r.total_score < 3).length },
    { range: '3.0-4.0', count: results.filter(r => r.total_score >= 3 && r.total_score < 4).length },
    { range: '4.0-5.0', count: results.filter(r => r.total_score >= 4 && r.total_score <= 5).length },
  ];

  return (
    <AdminLayout>
      <Typography variant="h4" sx={{ fontWeight: 'bold', mb: 4 }}>
        설문 결과 조회 및 분석
      </Typography>

      {/* Stats Cards */}
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <PeopleIcon sx={{ fontSize: 40, color: 'primary.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.totalCount}</Typography>
              <Typography variant="body2" color="text.secondary">총 참여자</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <AssessmentIcon sx={{ fontSize: 40, color: 'success.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{stats.avgScore.toFixed(1)}</Typography>
              <Typography variant="body2" color="text.secondary">평균 점수</Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={4}>
          <Card>
            <CardContent sx={{ textAlign: 'center' }}>
              <TrendingUpIcon sx={{ fontSize: 40, color: 'warning.main', mb: 1 }} />
              <Typography variant="h4" sx={{ fontWeight: 'bold' }}>{getGrade(stats.avgScore)}</Typography>
              <Typography variant="body2" color="text.secondary">평균 등급</Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Score Distribution Chart */}
      {results.length > 0 && (
        <Card sx={{ mb: 4 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>점수 분포</Typography>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={scoreDistribution}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="range" />
                <YAxis allowDecimals={false} />
                <Tooltip />
                <Bar dataKey="count" name="참여자 수" fill="#1976d2" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      )}

      {/* Results Table */}
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3, flexWrap: 'wrap', gap: 2 }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              진단 결과 목록
            </Typography>
            <TextField
              size="small"
              placeholder="이름, 이메일, 회사 검색..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start"><SearchIcon /></InputAdornment>
                ),
              }}
              sx={{ minWidth: 300 }}
            />
          </Box>

          {loading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : filteredResults.length === 0 ? (
            <Alert severity="info">설문 결과가 없습니다.</Alert>
          ) : (
            <TableContainer component={Paper}>
              <Table>
                <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.100' }}>
                    <TableCell sx={{ fontWeight: 'bold' }}>No.</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>이름</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>이메일</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>회사</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">점수</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">등급</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }}>진단일</TableCell>
                    <TableCell sx={{ fontWeight: 'bold' }} align="center">상세</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filteredResults.map((result, index) => (
                    <TableRow key={result.id} hover>
                      <TableCell>{index + 1}</TableCell>
                      <TableCell>{result.user_name || '-'}</TableCell>
                      <TableCell>{result.user_email || '-'}</TableCell>
                      <TableCell>{result.company_id || '-'}</TableCell>
                      <TableCell align="center">
                        <Typography sx={{ fontWeight: 'bold' }}>
                          {result.total_score ? result.total_score.toFixed(1) : '-'}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Chip
                          label={getGrade(result.total_score || 0)}
                          color={getGradeColor(result.total_score || 0)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        {result.created_at ? new Date(result.created_at).toLocaleDateString('ko-KR') : '-'}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          startIcon={<ViewIcon />}
                          onClick={() => fetchDetail(result)}
                        >
                          보기
                        </Button>
                        <Button
                          size="small"
                          color="error"
                          startIcon={<DeleteIcon />}
                          onClick={() => setDeleteTarget(result)}
                          sx={{ ml: 1 }}
                        >
                          삭제
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>

      {/* Detail Dialog */}
      <Dialog
        open={!!selectedResult}
        onClose={() => { setSelectedResult(null); setDetailData(null); }}
        maxWidth="lg"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
              진단 결과 상세 - {selectedResult?.user_name || ''}
            </Typography>
            {selectedResult && (
              <Chip
                label={`${getGrade(selectedResult.total_score || 0)} (${(selectedResult.total_score || 0).toFixed(1)}점)`}
                color={getGradeColor(selectedResult.total_score || 0)}
              />
            )}
          </Box>
        </DialogTitle>
        <DialogContent>
          {detailLoading ? (
            <Box sx={{ textAlign: 'center', py: 4 }}><CircularProgress /></Box>
          ) : selectedResult && detailData ? (
            <Box sx={{ pt: 2 }}>
              {/* User Info */}
              <Paper sx={{ p: 2, mb: 3, bgcolor: 'grey.50' }}>
                <Grid container spacing={2}>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">이름</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedResult.user_name || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">회사</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold' }}>{selectedResult.company_id || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">이메일</Typography>
                    <Typography variant="body1">{selectedResult.user_email || '-'}</Typography>
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <Typography variant="caption" color="text.secondary">성숙도 수준</Typography>
                    <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                      {getMaturityLevel(selectedResult.total_score || 0)}
                    </Typography>
                  </Grid>
                </Grid>
              </Paper>

              {/* Charts */}
              {detailData.analysis.length > 0 && (
                <Grid container spacing={3} sx={{ mb: 3 }}>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                        영역별 레이더 차트
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <RadarChart data={radarData}>
                          <PolarGrid />
                          <PolarAngleAxis dataKey="category" tick={{ fontSize: 12 }} />
                          <PolarRadiusAxis angle={90} domain={[0, 5]} tick={{ fontSize: 10 }} />
                          <Radar name="점수" dataKey="score" stroke="#1976d2" fill="#1976d2" fillOpacity={0.3} />
                        </RadarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <Paper sx={{ p: 2 }}>
                      <Typography variant="subtitle1" sx={{ fontWeight: 'bold', mb: 2, textAlign: 'center' }}>
                        영역별 점수
                      </Typography>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={barData} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 5]} />
                          <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 12 }} />
                          <Tooltip />
                          <Bar dataKey="점수" fill="#1976d2" />
                        </BarChart>
                      </ResponsiveContainer>
                    </Paper>
                  </Grid>
                </Grid>
              )}

              {/* Category Scores Table */}
              {detailData.analysis.length > 0 && (
                <TableContainer component={Paper}>
                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: 'grey.100' }}>
                        <TableCell sx={{ fontWeight: 'bold' }}>영역</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">점수</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">등급</TableCell>
                        <TableCell sx={{ fontWeight: 'bold' }} align="center">수준</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {detailData.analysis.map((a) => (
                        <TableRow key={a.category}>
                          <TableCell>{getCategoryName(a.category)}</TableCell>
                          <TableCell align="center">{a.score?.toFixed(1) || '-'}</TableCell>
                          <TableCell align="center">
                            <Chip label={getGrade(a.score || 0)} color={getGradeColor(a.score || 0)} size="small" />
                          </TableCell>
                          <TableCell align="center">{getMaturityLevel(a.score || 0)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
            </Box>
          ) : null}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => { setSelectedResult(null); setDetailData(null); }}>닫기</Button>
        </DialogActions>
      </Dialog>
      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteTarget} onClose={() => setDeleteTarget(null)}>
        <DialogTitle>설문 결과 삭제</DialogTitle>
        <DialogContent>
          <Typography>
            <strong>{deleteTarget?.user_name || '-'}</strong> ({deleteTarget?.user_email || '-'})의 진단 결과를 삭제하시겠습니까?
          </Typography>
          <Typography variant="body2" color="error" sx={{ mt: 1 }}>
            관련된 답변 및 분석 데이터가 모두 삭제되며 복구할 수 없습니다.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteTarget(null)} disabled={deleting}>취소</Button>
          <Button onClick={handleDelete} color="error" variant="contained" disabled={deleting}>
            {deleting ? '삭제 중...' : '삭제'}
          </Button>
        </DialogActions>
      </Dialog>
    </AdminLayout>
  );
}
