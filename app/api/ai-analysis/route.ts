import { NextResponse } from 'next/server';
import { queryOne, execute } from '../../lib/db';
import { callOpenAI, parseJsonResponse, getSystemPrompt, getMaturityLevel, generateDefaultAnalysis, CATEGORY_NAMES } from '../../lib/ai-utils';
import { StructuredAnalysis } from '../../types/ai';

// 구조화된 AI 심층 분석 생성
async function generateStructuredAnalysis(
  userInfo: any,
  resultData: any,
  benchmarkData?: any
): Promise<StructuredAnalysis> {
  const scores = resultData.categoryScores;
  const scoreEntries = Object.entries(scores).map(([key, score]) => ({
    key,
    name: CATEGORY_NAMES[key] || key,
    score: Number(score)
  }));

  const sorted = [...scoreEntries].sort((a, b) => a.score - b.score);
  const weakest = sorted[0];
  const strongest = sorted[sorted.length - 1];
  const avg = scoreEntries.reduce((s, e) => s + e.score, 0) / scoreEntries.length;
  const stdDev = Math.sqrt(scoreEntries.reduce((s, e) => s + Math.pow(e.score - avg, 2), 0) / scoreEntries.length);

  const benchmarkContext = benchmarkData
    ? scoreEntries.map(e => {
        const bm = benchmarkData[e.key];
        return bm
          ? `- ${e.name}: ${e.score.toFixed(1)}점 (업종 평균: ${bm.avg.toFixed(1)}, 상위 ${bm.percentile}%)`
          : `- ${e.name}: ${e.score.toFixed(1)}점`;
      }).join('\n')
    : scoreEntries.map(e => `- ${e.name}: ${e.score.toFixed(1)}점 (${getMaturityLevel(e.score)} 수준)`).join('\n');

  const prompt = `다음은 ${userInfo?.company || '기업'}의 SCM 성숙도 진단 결과입니다.

[기업 정보]
- 회사: ${userInfo?.company || '미입력'}
- 업종: ${userInfo?.industry || '미입력'}
- 기업 규모: ${userInfo?.companySize || '미입력'}
- 종합 점수: ${resultData.totalScore.toFixed(1)}/5.0 (${getMaturityLevel(resultData.totalScore)} 수준)

[영역별 점수]
${benchmarkContext}

[점수 패턴 분석]
- 가장 약한 영역: ${weakest.name} (${weakest.score.toFixed(1)}점)
- 가장 강한 영역: ${strongest.name} (${strongest.score.toFixed(1)}점)
- 영역 간 편차(표준편차): ${stdDev.toFixed(2)}
- 전체 성숙도 수준: ${getMaturityLevel(resultData.totalScore)}

다음 JSON 형식으로 심층 분석 결과를 제공해주세요. 반드시 이 JSON 구조를 정확히 따라주세요:

{
  "executive_summary": "경영진 대상 2-3문장 핵심 요약. 구체적 점수를 인용하세요.",
  "overall_assessment": "전반적 진단 평가 3-5문장. 성숙도 수준의 의미와 전략적 시사점을 설명하세요.",
  "category_analyses": [
    {
      "category_key": "카테고리키 (planning/procurement/inventory/production/logistics/integration)",
      "category_name": "한국어 카테고리명",
      "score": 점수(숫자),
      "root_causes": ["이 점수의 근본 원인 1", "근본 원인 2", "근본 원인 3"],
      "impact": "이 영역의 낮은/높은 점수가 사업 운영에 미치는 실질적 영향 설명",
      "quick_wins": ["비용 없이 즉시 실행 가능한 개선 1", "즉시 실행 가능한 개선 2", "즉시 실행 가능한 개선 3"],
      "next_level_gap": "현재 수준에서 다음 성숙도 수준으로 올라가기 위한 핵심 과제"
    }
  ],
  "priority_matrix": {
    "high_impact_low_effort": ["높은 효과 + 쉬운 실행 항목들 (3-4개)"],
    "high_impact_high_effort": ["높은 효과 + 어려운 실행 항목들 (2-3개)"],
    "low_impact_low_effort": ["낮은 효과 + 쉬운 실행 항목들 (1-2개)"],
    "low_impact_high_effort": ["낮은 효과 + 어려운 실행 항목들 (1-2개)"]
  },
  "interdependencies": [
    "영역 간 상호작용 인사이트 1 (예: 계획 관리 약점이 재고 관리에 미치는 영향)",
    "영역 간 상호작용 인사이트 2",
    "영역 간 상호작용 인사이트 3"
  ],
  "industry_context": "해당 업종(${userInfo?.industry || '일반'})과 기업 규모(${userInfo?.companySize || '중소기업'})에서 이 진단 결과가 갖는 의미와 시사점. 해당 업종의 SCM 트렌드와 벤치마크를 포함하세요."
}

중요 지침:
- 모든 6개 카테고리(planning, procurement, inventory, production, logistics, integration)를 category_analyses에 포함하세요.
- 점수가 낮은 카테고리일수록 더 구체적인 root_causes와 quick_wins를 제시하세요.
- quick_wins는 중소기업이 추가 비용 없이 당장 시작할 수 있는 것만 포함하세요.
- 한국 정부 지원사업(스마트공장, 디지털전환 지원 등)을 industry_context에서 언급하세요.`;

  const messages = [
    { role: 'system', content: getSystemPrompt() },
    { role: 'user', content: prompt }
  ];

  const response = await callOpenAI(messages, {
    jsonMode: true,
    maxTokens: 3500,
    temperature: 0.4
  });

  return parseJsonResponse<StructuredAnalysis>(response);
}

export async function POST(request: Request) {
  try {
    const { userInfo, resultData, benchmarkData } = await request.json();

    if (!resultData) {
      return NextResponse.json(
        { message: '진단 결과 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    // 캐시 확인: 이미 분석된 결과가 있으면 반환
    if (resultData.id) {
      try {
        const cached = await queryOne<{ ai_analysis_json: any; ai_generated_at: string }>(
          'SELECT ai_analysis_json, ai_generated_at FROM survey_results WHERE id = $1',
          [resultData.id]
        );

        if (cached?.ai_analysis_json) {
          return NextResponse.json({
            success: true,
            analysis: cached.ai_analysis_json,
            cached: true
          });
        }
      } catch {
        // 캐시 조회 실패 시 무시하고 새로 생성
      }
    }

    // AI 분석 생성
    try {
      const analysis = await generateStructuredAnalysis(userInfo, resultData, benchmarkData);

      // DB에 캐싱
      if (resultData.id) {
        try {
          await execute(
            'UPDATE survey_results SET ai_analysis_json = $1, ai_generated_at = $2 WHERE id = $3',
            [JSON.stringify(analysis), new Date().toISOString(), resultData.id]
          );
        } catch {
          // 캐싱 실패는 무시
        }
      }

      return NextResponse.json({
        success: true,
        analysis,
        cached: false
      });
    } catch (aiError) {
      console.error('AI 분석 생성 실패, fallback 사용:', aiError);
      const fallback = generateDefaultAnalysis();
      return NextResponse.json({
        success: true,
        analysis: fallback,
        isFallback: true,
        message: 'AI 분석을 사용할 수 없어 기본 분석을 제공합니다.'
      });
    }
  } catch (error) {
    console.error('AI 분석 API 오류:', error);
    return NextResponse.json(
      { message: 'AI 분석 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
