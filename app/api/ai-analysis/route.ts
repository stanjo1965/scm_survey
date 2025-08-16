import { NextResponse } from 'next/server';

// OpenAI API 호출 함수
const callOpenAI = async (prompt: string) => {
  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: 'gpt-4',
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
      throw new Error(`OpenAI API 오류: ${response.status}`);
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error('OpenAI API 호출 오류:', error);
    throw error;
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

  // 영역별 점수 분석
  const categoryAnalysis = Object.entries(resultData.categoryScores)
    .map(([category, score]) => ({
      category: categoryNames[category as keyof typeof categoryNames],
      score: Number(score),
      level: getMaturityLevel(Number(score))
    }))
    .sort((a, b) => a.score - b.score); // 점수가 낮은 순으로 정렬

  const lowestCategories = categoryAnalysis.slice(0, 3); // 가장 낮은 3개 영역
  const highestCategories = categoryAnalysis.slice(-2); // 가장 높은 2개 영역

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

## 🔍 진단 결과 분석

## 🎯 우선 개선 영역 및 방안

## 💪 강점 활용 전략

## 📅 단계별 개선 로드맵

## 📊 예상 효과 및 KPI

## ⚠️ 주의사항 및 리스크 관리

답변은 한국어로 작성하고, 구체적이고 실용적인 내용으로 구성해주세요.
`;

  try {
    const aiResponse = await callOpenAI(prompt);
    return aiResponse;
  } catch (error) {
    console.error('AI 분석 생성 오류:', error);
    throw new Error('AI 분석 생성에 실패했습니다.');
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

    // AI 분석 생성
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