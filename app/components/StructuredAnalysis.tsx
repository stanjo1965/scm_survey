'use client';

import {
  Box,
  Card,
  CardContent,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Chip,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Alert
} from '@mui/material';
import {
  ExpandMore,
  Star,
  TrendingUp,
  Warning,
  CheckCircle,
  BoltOutlined as Bolt,
  ArrowUpward,
  ArrowDownward,
  LinkOutlined as LinkIcon,
  FactoryOutlined as IndustryIcon
} from '@mui/icons-material';
import { StructuredAnalysis as StructuredAnalysisType, CATEGORY_NAMES } from '../types/ai';

interface Props {
  analysis: StructuredAnalysisType;
  isFallback?: boolean;
}

const getScoreColor = (score: number) => {
  if (score >= 4.0) return '#2e7d32';
  if (score >= 3.0) return '#ed6c02';
  if (score >= 2.0) return '#d32f2f';
  return '#b71c1c';
};

const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'high_impact_low_effort': return { bg: '#e8f5e9', border: '#4caf50', label: '높은 효과 + 쉬운 실행', icon: '🎯' };
    case 'high_impact_high_effort': return { bg: '#fff3e0', border: '#ff9800', label: '높은 효과 + 높은 난이도', icon: '🏗️' };
    case 'low_impact_low_effort': return { bg: '#e3f2fd', border: '#2196f3', label: '낮은 효과 + 쉬운 실행', icon: '✅' };
    case 'low_impact_high_effort': return { bg: '#fce4ec', border: '#f44336', label: '낮은 효과 + 높은 난이도', icon: '⚠️' };
    default: return { bg: '#f5f5f5', border: '#9e9e9e', label: '', icon: '' };
  }
};

export default function StructuredAnalysisView({ analysis, isFallback }: Props) {
  if (!analysis) return null;

  return (
    <Box sx={{ mt: 3 }}>
      {isFallback && (
        <Alert severity="info" sx={{ mb: 2 }}>
          기본 분석이 제공되었습니다. AI 심층 분석을 위해 OpenAI API 키를 설정해주세요.
        </Alert>
      )}

      {/* 경영진 요약 */}
      <Card sx={{ mb: 3, background: 'linear-gradient(135deg, #1a237e 0%, #283593 100%)', color: 'white' }}>
        <CardContent sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Star sx={{ mr: 1 }} />
            <Typography variant="h6" sx={{ fontWeight: 'bold' }}>경영진 요약</Typography>
          </Box>
          <Typography variant="body1" sx={{ lineHeight: 1.8, fontSize: '1.05rem' }}>
            {analysis.executive_summary}
          </Typography>
        </CardContent>
      </Card>

      {/* 전반적 평가 */}
      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, color: 'primary.main' }}>
            전반적 평가
          </Typography>
          <Typography variant="body1" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
            {analysis.overall_assessment}
          </Typography>
        </CardContent>
      </Card>

      {/* 영역별 심층 분석 */}
      <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2, display: 'flex', alignItems: 'center' }}>
        <TrendingUp sx={{ mr: 1, color: 'primary.main' }} />
        영역별 심층 분석
      </Typography>

      {analysis.category_analyses?.map((cat, index) => (
        <Accordion key={cat.category_key || index} sx={{ mb: 1 }}>
          <AccordionSummary expandIcon={<ExpandMore />}>
            <Box sx={{ display: 'flex', alignItems: 'center', width: '100%', justifyContent: 'space-between', pr: 2 }}>
              <Typography sx={{ fontWeight: 'bold' }}>
                {cat.category_name || CATEGORY_NAMES[cat.category_key] || cat.category_key}
              </Typography>
              <Chip
                label={`${Number(cat.score).toFixed(1)}점`}
                size="small"
                sx={{
                  bgcolor: getScoreColor(Number(cat.score)),
                  color: 'white',
                  fontWeight: 'bold'
                }}
              />
            </Box>
          </AccordionSummary>
          <AccordionDetails>
            {/* 근본 원인 */}
            {cat.root_causes?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'error.main', mb: 1 }}>
                  <Warning sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  근본 원인
                </Typography>
                <List dense disablePadding>
                  {cat.root_causes.map((cause, i) => (
                    <ListItem key={i} sx={{ py: 0.25, pl: 2 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <ArrowDownward sx={{ fontSize: 14, color: 'error.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={cause} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* 사업 영향 */}
            {cat.impact && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'warning.main', mb: 0.5 }}>
                  사업 영향
                </Typography>
                <Typography variant="body2" sx={{ pl: 2, color: 'text.secondary' }}>{cat.impact}</Typography>
              </Box>
            )}

            {/* 즉시 실행 가능한 개선 */}
            {cat.quick_wins?.length > 0 && (
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', color: 'success.main', mb: 1 }}>
                  <Bolt sx={{ fontSize: 16, mr: 0.5, verticalAlign: 'text-bottom' }} />
                  즉시 실행 가능한 개선 (Quick Wins)
                </Typography>
                <List dense disablePadding>
                  {cat.quick_wins.map((win, i) => (
                    <ListItem key={i} sx={{ py: 0.25, pl: 2 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <CheckCircle sx={{ fontSize: 14, color: 'success.main' }} />
                      </ListItemIcon>
                      <ListItemText primary={win} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            )}

            {/* 다음 수준 과제 */}
            {cat.next_level_gap && (
              <Box sx={{ bgcolor: 'grey.50', p: 1.5, borderRadius: 1, mt: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                  <ArrowUpward sx={{ fontSize: 14, mr: 0.5, verticalAlign: 'text-bottom', color: 'primary.main' }} />
                  다음 수준으로의 핵심 과제
                </Typography>
                <Typography variant="body2" sx={{ color: 'text.secondary' }}>{cat.next_level_gap}</Typography>
              </Box>
            )}
          </AccordionDetails>
        </Accordion>
      ))}

      {/* 우선순위 매트릭스 */}
      {analysis.priority_matrix && (
        <Box sx={{ mt: 3 }}>
          <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
            우선순위 매트릭스 (영향도 vs 난이도)
          </Typography>
          <Grid container spacing={2}>
            {(['high_impact_low_effort', 'high_impact_high_effort', 'low_impact_low_effort', 'low_impact_high_effort'] as const).map((key) => {
              const items = analysis.priority_matrix[key];
              if (!items || items.length === 0) return null;
              const style = getPriorityColor(key);
              return (
                <Grid item xs={12} sm={6} key={key}>
                  <Paper sx={{ p: 2, bgcolor: style.bg, border: `1px solid ${style.border}`, height: '100%' }}>
                    <Typography variant="subtitle2" sx={{ fontWeight: 'bold', mb: 1 }}>
                      {style.icon} {style.label}
                    </Typography>
                    <List dense disablePadding>
                      {items.map((item, i) => (
                        <ListItem key={i} sx={{ py: 0.25 }}>
                          <ListItemText primary={`• ${item}`} primaryTypographyProps={{ variant: 'body2' }} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              );
            })}
          </Grid>
        </Box>
      )}

      {/* 영역간 상호작용 */}
      {analysis.interdependencies?.length > 0 && (
        <Card sx={{ mt: 3 }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
              <LinkIcon sx={{ mr: 1, color: 'primary.main' }} />
              영역 간 상호작용 인사이트
            </Typography>
            <Divider sx={{ mb: 2 }} />
            {analysis.interdependencies.map((insight, i) => (
              <Box key={i} sx={{ display: 'flex', alignItems: 'flex-start', mb: 1.5 }}>
                <Chip label={i + 1} size="small" color="primary" sx={{ mr: 1.5, mt: 0.25, minWidth: 28 }} />
                <Typography variant="body2" sx={{ lineHeight: 1.6 }}>{insight}</Typography>
              </Box>
            ))}
          </CardContent>
        </Card>
      )}

      {/* 업종별 시사점 */}
      {analysis.industry_context && (
        <Card sx={{ mt: 3, bgcolor: '#f3e5f5' }}>
          <CardContent>
            <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 1, display: 'flex', alignItems: 'center' }}>
              <IndustryIcon sx={{ mr: 1, color: '#7b1fa2' }} />
              업종별 시사점
            </Typography>
            <Typography variant="body2" sx={{ lineHeight: 1.8, color: 'text.secondary' }}>
              {analysis.industry_context}
            </Typography>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
