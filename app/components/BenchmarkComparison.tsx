'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Chip,
  Alert
} from '@mui/material';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell
} from 'recharts';
import { CompareArrows, TrendingUp, TrendingDown } from '@mui/icons-material';
import { BenchmarkData, CATEGORY_NAMES } from '../types/ai';

interface Props {
  benchmarkData: BenchmarkData;
  userScores: Record<string, number>;
}

export default function BenchmarkComparison({ benchmarkData, userScores }: Props) {
  if (!benchmarkData) return null;

  const chartData = benchmarkData.categories?.map(cat => ({
    category: CATEGORY_NAMES[cat.category_key] || cat.category_key,
    '내 점수': Number(cat.user_score || userScores[cat.category_key] || 0).toFixed(1),
    '업종 평균': Number(cat.avg_score).toFixed(1),
    gap: Number(cat.user_score || userScores[cat.category_key] || 0) - cat.avg_score
  })) || [];

  const aboveAvgCount = chartData.filter(d => Number(d.gap) >= 0).length;
  const belowAvgCount = chartData.filter(d => Number(d.gap) < 0).length;

  return (
    <Card>
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <CompareArrows sx={{ fontSize: 28, color: 'primary.main', mr: 1 }} />
          <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
            벤치마크 비교 분석
          </Typography>
          {benchmarkData.industry && (
            <Chip label={benchmarkData.industry} size="small" sx={{ ml: 1 }} variant="outlined" />
          )}
        </Box>

        {!benchmarkData.is_sufficient && (
          <Alert severity="info" sx={{ mb: 2 }}>
            {benchmarkData.message || `아직 비교 데이터가 충분하지 않습니다 (현재 ${benchmarkData.total_sample_count}개 기업 참여). 전체 평균으로 비교합니다.`}
          </Alert>
        )}

        {/* 비교 차트 */}
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="category" tick={{ fontSize: 12 }} />
            <YAxis domain={[0, 5]} />
            <Tooltip />
            <Legend />
            <Bar dataKey="내 점수" fill="#1976d2" radius={[4, 4, 0, 0]} />
            <Bar dataKey="업종 평균" fill="#bdbdbd" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>

        {/* 요약 */}
        <Box sx={{ display: 'flex', gap: 2, mt: 2, flexWrap: 'wrap', justifyContent: 'center' }}>
          {aboveAvgCount > 0 && (
            <Chip
              icon={<TrendingUp />}
              label={`${aboveAvgCount}개 영역 평균 이상`}
              color="success"
              variant="outlined"
            />
          )}
          {belowAvgCount > 0 && (
            <Chip
              icon={<TrendingDown />}
              label={`${belowAvgCount}개 영역 평균 이하`}
              color="error"
              variant="outlined"
            />
          )}
          <Chip
            label={`비교 기업: ${benchmarkData.total_sample_count}개`}
            variant="outlined"
            size="small"
          />
        </Box>
      </CardContent>
    </Card>
  );
}
