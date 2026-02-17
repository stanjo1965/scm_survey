import { NextResponse } from 'next/server';
import { query, execute } from '../../lib/db';
import { callOpenAI, parseJsonResponse, getSystemPrompt, CATEGORY_NAMES } from '../../lib/ai-utils';
import { allImprovementItems } from '../../lib/scm-framework';

export async function POST(request: Request) {
  try {
    const { surveyResultId, userInfo, categoryScores, totalScore, aiAnalysis } = await request.json();

    if (!categoryScores) {
      return NextResponse.json({ success: false, message: '진단 데이터가 필요합니다.' }, { status: 400 });
    }

    // 캐시 확인: 기존 AI 개선계획이 있으면 반환
    if (surveyResultId) {
      try {
        const existing = await query(
          'SELECT * FROM ai_improvement_plans WHERE survey_result_id = $1 ORDER BY order_index ASC',
          [surveyResultId]
        );
        if (existing.length > 0) {
          return NextResponse.json({ success: true, plans: existing, cached: true });
        }
      } catch {
        // 테이블 없으면 무시
      }
    }

    // 약한 카테고리의 프레임워크 항목 참조
    const weakCategories = Object.entries(categoryScores)
      .filter(([_, score]) => Number(score) < 3.5)
      .map(([key, score]) => ({ key, score: Number(score), name: CATEGORY_NAMES[key] || key }));

    const frameworkRef = allImprovementItems
      .filter(item => {
        const score = categoryScores[item.categoryKey];
        return score && Number(score) <= item.scoreThreshold;
      })
      .slice(0, 10)
      .map(item => `- [${item.area}] ${item.title}: ${item.description} (실행: ${item.actions.slice(0, 3).join(', ')})`)
      .join('\n');

    const analysisContext = aiAnalysis
      ? `\n[AI 심층 분석 요약]\n${aiAnalysis.executive_summary || ''}\n우선순위: ${aiAnalysis.priority_matrix?.high_impact_low_effort?.slice(0, 3).join(', ') || '없음'}`
      : '';

    const prompt = `다음 기업의 SCM 진단 결과를 바탕으로 맞춤형 개선계획을 3단계(단기/중기/장기)로 생성해주세요.

[기업 정보]
- 회사: ${userInfo?.company || '미입력'}
- 업종: ${userInfo?.industry || '미입력'}
- 규모: ${userInfo?.companySize || '중소기업'}
- 종합 점수: ${Number(totalScore).toFixed(1)}/5.0

[약한 영역]
${weakCategories.map(c => `- ${c.name}: ${c.score.toFixed(1)}점`).join('\n')}
${analysisContext}

[참조 프레임워크 항목]
${frameworkRef || '해당 없음'}

다음 JSON 형식으로 반드시 응답하세요:

{
  "plans": [
    {
      "phase": "short",
      "phase_label": "단기 (1-3개월)",
      "category_key": "카테고리키",
      "title": "과제 제목",
      "description": "과제 설명 (2-3문장)",
      "actions": ["구체적 실행 단계 1", "실행 단계 2", "실행 단계 3", "실행 단계 4", "실행 단계 5"],
      "kpis": ["KPI 1", "KPI 2", "KPI 3"],
      "expected_outcomes": ["기대 성과 1", "기대 성과 2"],
      "priority": "high",
      "estimated_budget": "비용 없음 또는 금액",
      "estimated_effort": "담당자 1명, 주 2시간"
    }
  ]
}

중요 지침:
- 단기(short): 3-5개, 비용 최소 또는 무비용, 즉시 시작 가능
- 중기(mid): 3-4개, 프로세스 개선/시스템 도입, 정부 지원사업 활용
- 장기(long): 2-3개, 전략적 변혁, 디지털 전환
- 총 8-12개 항목
- 모든 actions는 중소기업 실무자가 바로 실행 가능한 수준으로 구체적으로
- estimated_budget은 "비용 없음", "50만원 이내", "100-500만원", "정부지원 활용" 등으로
- priority는 점수가 가장 낮은 영역부터 high`;

    try {
      const response = await callOpenAI(
        [
          { role: 'system', content: getSystemPrompt() },
          { role: 'user', content: prompt }
        ],
        { jsonMode: true, maxTokens: 4000, temperature: 0.4 }
      );

      const parsed = parseJsonResponse<{ plans: any[] }>(response);
      const plans = parsed.plans.map((plan: any, index: number) => ({
        ...plan,
        survey_result_id: surveyResultId || null,
        order_index: index,
        status: 'pending',
        progress: 0,
        checked_actions: (plan.actions || []).map(() => false),
        created_at: new Date().toISOString()
      }));

      // DB에 저장
      if (surveyResultId && plans.length > 0) {
        try {
          await execute('DELETE FROM ai_improvement_plans WHERE survey_result_id = $1', [surveyResultId]);

          const values: any[] = [];
          const placeholders: string[] = [];
          let idx = 1;
          for (const p of plans) {
            placeholders.push(
              `($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9}, $${idx+10}, $${idx+11}, $${idx+12}, $${idx+13}, $${idx+14}, $${idx+15})`
            );
            values.push(
              p.survey_result_id, p.phase, p.phase_label, p.category_key,
              p.title, p.description, JSON.stringify(p.actions), JSON.stringify(p.kpis),
              JSON.stringify(p.expected_outcomes), p.priority, p.estimated_budget, p.estimated_effort,
              p.order_index, p.status, JSON.stringify(p.checked_actions), p.created_at
            );
            idx += 16;
          }
          await execute(
            `INSERT INTO ai_improvement_plans (survey_result_id, phase, phase_label, category_key, title, description, actions, kpis, expected_outcomes, priority, estimated_budget, estimated_effort, order_index, status, checked_actions, created_at) VALUES ${placeholders.join(', ')}`,
            values
          );
        } catch {
          // 저장 실패 무시
        }
      }

      return NextResponse.json({ success: true, plans, cached: false });
    } catch (aiError) {
      console.error('AI 개선계획 생성 실패:', aiError);
      return NextResponse.json({
        success: false,
        message: 'AI 개선계획 생성에 실패했습니다. AI 분석을 먼저 생성해주세요.'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('AI 개선계획 API 오류:', error);
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
