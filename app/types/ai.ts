// AI 관련 TypeScript 인터페이스 정의

// === 구조화된 AI 분석 ===
export interface CategoryAnalysis {
  category_key: string;
  category_name: string;
  score: number;
  benchmark_avg?: number;
  percentile?: number;
  root_causes: string[];
  impact: string;
  quick_wins: string[];
  next_level_gap: string;
}

export interface PriorityMatrix {
  high_impact_low_effort: string[];
  high_impact_high_effort: string[];
  low_impact_low_effort: string[];
  low_impact_high_effort: string[];
}

export interface StructuredAnalysis {
  executive_summary: string;
  overall_assessment: string;
  category_analyses: CategoryAnalysis[];
  priority_matrix: PriorityMatrix;
  interdependencies: string[];
  industry_context: string;
}

// === AI 맞춤 개선계획 ===
export interface AIImprovementPlanItem {
  id?: number;
  survey_result_id?: number;
  phase: 'short' | 'mid' | 'long';
  phase_label: string;
  category_key: string;
  title: string;
  description: string;
  actions: string[];
  kpis: string[];
  expected_outcomes: string[];
  priority: 'high' | 'medium' | 'low';
  estimated_budget: string;
  estimated_effort: string;
  order_index: number;
  status: 'pending' | 'in_progress' | 'completed';
  progress: number;
  checked_actions: boolean[];
  created_at?: string;
  updated_at?: string;
}

// === AI 채팅 ===
export interface ChatSession {
  id: number;
  survey_result_id: number;
  title: string;
  created_at: string;
  updated_at?: string;
}

export interface ChatMessage {
  id?: number;
  session_id: number;
  role: 'user' | 'assistant';
  content: string;
  created_at?: string;
}

// === 벤치마크 ===
export interface BenchmarkCategory {
  category_key: string;
  category_name: string;
  user_score: number;
  avg_score: number;
  sample_count: number;
  percentile: number;
  gap: number;
}

export interface BenchmarkData {
  categories: BenchmarkCategory[];
  total_sample_count: number;
  industry: string;
  company_size: string;
  is_sufficient: boolean;
  message?: string;
}

// === 진행 피드백 ===
export interface ProgressFeedback {
  message: string;
  next_suggestion: string;
  is_celebration: boolean;
}

// === 공통 ===
export interface AIApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  isFallback?: boolean;
}

export interface UserInfo {
  name: string;
  phone: string;
  company: string;
  email: string;
  industry?: string;
  companySize?: string;
}

export const INDUSTRY_OPTIONS = [
  '제조업 (일반)',
  '제조업 (식품)',
  '제조업 (전자/반도체)',
  '제조업 (자동차부품)',
  '유통/도소매업',
  'IT/소프트웨어',
  '건설업',
  '서비스업',
  '기타'
] as const;

export const COMPANY_SIZE_OPTIONS = [
  '10명 미만',
  '10-50명',
  '50-100명',
  '100-300명',
  '300명 이상'
] as const;

export const CATEGORY_NAMES: Record<string, string> = {
  planning: '계획 관리',
  procurement: '조달 관리',
  inventory: '재고 관리',
  production: '생산 관리',
  logistics: '물류 관리',
  integration: '통합 관리'
};
