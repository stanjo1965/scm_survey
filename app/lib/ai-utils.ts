import { StructuredAnalysis } from '../types/ai';

// OpenAI API 공통 호출 함수
export async function callOpenAI(
  messages: { role: string; content: string }[],
  options: {
    jsonMode?: boolean;
    maxTokens?: number;
    temperature?: number;
  } = {}
): Promise<string> {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    throw new Error('OPENAI_API_KEY가 설정되지 않았습니다.');
  }

  const { jsonMode = false, maxTokens = 3000, temperature = 0.4 } = options;

  const body: any = {
    model: 'gpt-4o-mini',
    messages,
    max_tokens: maxTokens,
    temperature
  };

  if (jsonMode) {
    body.response_format = { type: 'json_object' };
  }

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`
    },
    body: JSON.stringify(body)
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`OpenAI API 오류 (${response.status}): ${errorText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
}

// AI 응답에서 JSON 추출
export function parseJsonResponse<T = any>(text: string): T {
  // ```json 블록 제거
  let cleaned = text.trim();
  if (cleaned.startsWith('```json')) {
    cleaned = cleaned.slice(7);
  } else if (cleaned.startsWith('```')) {
    cleaned = cleaned.slice(3);
  }
  if (cleaned.endsWith('```')) {
    cleaned = cleaned.slice(0, -3);
  }
  cleaned = cleaned.trim();

  return JSON.parse(cleaned);
}

// SCM 전문가 시스템 프롬프트
export function getSystemPrompt(): string {
  return `당신은 한국표준협회(KSA) 소속 SCM 수석 컨설턴트로, 20년 이상 한국 중소기업의 공급망 최적화를 지원해온 전문가입니다.
SCOR 모델, Lean/Six Sigma, 디지털 전환에 정통하며, 중소기업의 자원 제약을 고려한 실용적인 솔루션을 제시합니다.

핵심 원칙:
1. 반드시 한국어로 답변합니다.
2. 구체적이고 실행 가능한 조언만 제시합니다 (일반론 금지).
3. 중소기업의 예산, 인력 제약을 항상 고려합니다.
4. 사용자의 실제 점수를 인용하며 설명합니다.
5. 무료/저가 솔루션을 우선 추천합니다 (ERPNext, Google Sheets, 네이버 스마트스토어 등).
6. 한국 정부 지원사업을 적극 안내합니다 (스마트공장, 디지털 전환 지원, 혁신바우처 등).
7. 단계적 접근을 권장합니다 (프로세스 문서화 → 스프레드시트 관리 → 시스템 도입).`;
}

// 성숙도 수준 판정
export function getMaturityLevel(score: number): string {
  if (score >= 4.5) return '최적화';
  if (score >= 3.5) return '표준화';
  if (score >= 2.5) return '체계화';
  if (score >= 1.5) return '기본';
  return '초기';
}

// 등급 판정
export function getGrade(score: number): string {
  if (score >= 4.5) return 'A+';
  if (score >= 4.0) return 'A';
  if (score >= 3.5) return 'B+';
  if (score >= 3.0) return 'B';
  if (score >= 2.5) return 'C+';
  if (score >= 2.0) return 'C';
  if (score >= 1.5) return 'D+';
  return 'D';
}

// 기본 분석 fallback (API 키 없거나 오류 시)
export function generateDefaultAnalysis(): StructuredAnalysis {
  return {
    executive_summary: '진단 결과를 기반으로 한 기본 분석입니다. 더 정확한 AI 분석을 위해 관리자에게 문의하세요.',
    overall_assessment: '전반적으로 개선이 필요한 영역이 존재하며, 단계적 접근을 통해 SCM 성숙도를 향상시킬 수 있습니다.',
    category_analyses: [],
    priority_matrix: {
      high_impact_low_effort: ['프로세스 문서화', '재고 ABC 분류', '공급업체 평가 기준 수립'],
      high_impact_high_effort: ['ERP 시스템 도입', 'S&OP 프로세스 정착'],
      low_impact_low_effort: ['보고서 양식 표준화'],
      low_impact_high_effort: []
    },
    interdependencies: [
      '계획 관리의 개선은 재고 관리와 생산 관리의 효율성에 직접적인 영향을 미칩니다.',
      '조달 관리의 체계화는 전체 공급망 비용 절감의 핵심입니다.'
    ],
    industry_context: 'AI 심층 분석을 생성하면 업종별 맞춤 시사점을 확인할 수 있습니다.'
  };
}

// 카테고리 이름 매핑
export const CATEGORY_NAMES: Record<string, string> = {
  planning: '계획 관리',
  procurement: '조달 관리',
  inventory: '재고 관리',
  production: '생산 관리',
  logistics: '물류 관리',
  integration: '통합 관리'
};
