import { NextResponse } from 'next/server';

// 기본 분석 생성 함수 (API 키 없거나 오류 시 사용)
const generateDefaultAnalysis = () => {
  return `## 진단 결과 분석

귀하의 SCM 성숙도 진단 결과를 분석한 결과, 전반적으로 보통 수준의 성숙도를 보이고 있습니다.

## 우선 개선 영역 및 방안

**1. 재고 관리 개선**
- ABC 분석을 통한 재고 분류 체계 구축
- 재고 예측 모델 정확도 향상
- 재고 회전율 목표 설정 및 모니터링

**2. 계획 관리 체계화**
- S&OP 프로세스 정착
- 수요 예측 정확도 향상
- 계획 실행 결과 분석 및 피드백 체계

**3. 조달 관리 최적화**
- 공급업체 평가 체계 구축
- 조달 비용 최적화
- 공급업체와의 협력 관계 강화

## 강점 활용 전략

- 우수한 영역의 베스트 프랙티스를 다른 영역에 적용
- 부서 간 협력 체계를 활용하여 전사적 개선 추진

## 단계별 개선 로드맵

**단기 (3개월)**
- 재고 관리 시스템 구축
- 공급업체 평가 기준 수립
- 계획 수립 프로세스 표준화

**중기 (6개월)**
- S&OP 프로세스 정착
- 재고 예측 모델 고도화
- 물류 네트워크 최적화

**장기 (1년)**
- 전사적 SCM 성숙도 향상
- 디지털 트랜스포메이션 추진
- 지속가능한 SCM 체계 구축

## 예상 효과 및 KPI

- 재고 회전율 20% 향상
- 수요 예측 정확도 30% 향상
- 재고 관리 비용 15% 절감

## 주의사항 및 리스크 관리

- 단계적 접근으로 조직 저항 최소화
- 충분한 교육 및 훈련 제공
- 정기적인 성과 측정 및 피드백

이 분석은 기본 템플릿을 기반으로 생성되었습니다. 더 정확한 분석을 위해서는 OpenAI API 키를 설정해주세요.`;
};

// OpenAI API 호출 함수
const callOpenAI = async (prompt: string) => {
  const apiKey = process.env.OPENAI_API_KEY;

  if (!apiKey) {
    console.log('OpenAI API 키가 설정되지 않아 기본 분석을 제공합니다.');
    return generateDefaultAnalysis();
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          {
            role: 'system',
            content: '당신은 SCM(공급망 관리) 전문가입니다. 진단 결과를 바탕으로 구체적이고 실용적인 개선 방안을 제시해주세요.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7
      })
    });

    if (!response.ok) {
      console.error('OpenAI API 호출 실패:', response.status);
      return generateDefaultAnalysis();
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    return generateDefaultAnalysis();
  }
};

// 개선 방안 생성 함수
const generateImprovementPlan = async (userInfo: any, resultData: any) => {
  const categoryNames = {
    planning: '계획 관리',
    procurement: '조달 관리',
    inventory: '재고 관리',
    production: '생산 관리',
    logistics: '물류 관리',
    integration: '통합 관리'
  };

  const getMaturityLevel = (score: number): string => {
    if (score >= 4.5) return '최적화';
    if (score >= 3.5) return '표준화';
    if (score >= 2.5) return '체계화';
    if (score >= 1.5) return '기본';
    return '초기';
  };

  const prompt = `
다음은 ${userInfo?.company || '기업'}의 SCM 성숙도 진단 결과입니다.

**진단자 정보:**
- 이름: ${userInfo?.name || '미입력'}
- 회사: ${userInfo?.company || '미입력'}
- 종합 점수: ${resultData.totalScore.toFixed(1)}점

**영역별 진단 결과:**
${Object.entries(resultData.categoryScores).map(([category, score]) =>
  `- ${categoryNames[category as keyof typeof categoryNames]}: ${Number(score).toFixed(1)}점 (${getMaturityLevel(Number(score))} 수준)`
).join('\n')}

**분석 요청사항:**
1. 가장 개선이 필요한 영역 3개에 대한 구체적인 개선 방안 제시
2. 현재 강점 영역을 활용한 전략적 접근 방안
3. 단기(3개월), 중기(6개월), 장기(1년) 개선 로드맵
4. 예상 효과 및 KPI 제안
5. 실행 시 주의사항 및 리스크 관리 방안

다음 형식으로 답변해주세요:

## 진단 결과 분석

## 우선 개선 영역 및 방안

## 강점 활용 전략

## 단계별 개선 로드맵

## 예상 효과 및 KPI

## 주의사항 및 리스크 관리

답변은 한국어로 작성하고, 구체적이고 실용적인 내용으로 구성해주세요.
`;

  try {
    const aiResponse = await callOpenAI(prompt);
    return aiResponse;
  } catch (error) {
    console.error('AI 분석 생성 오류:', error);
    return generateDefaultAnalysis();
  }
};

export async function POST(request: Request) {
  try {
    const { userInfo, resultData } = await request.json();

    if (!resultData) {
      return NextResponse.json(
        { message: '진단 결과 데이터가 필요합니다.' },
        { status: 400 }
      );
    }

    const aiAnalysis = await generateImprovementPlan(userInfo, resultData);

    return NextResponse.json({
      success: true,
      analysis: aiAnalysis
    });

  } catch (error) {
    console.error('AI 분석 API 오류:', error);
    return NextResponse.json(
      { message: 'AI 분석 생성 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
