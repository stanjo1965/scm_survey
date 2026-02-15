import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { callOpenAI, getSystemPrompt, getMaturityLevel, CATEGORY_NAMES } from '../../lib/ai-utils';

export async function POST(request: Request) {
  try {
    const { sessionId, surveyResultId, message, userInfo, categoryScores, totalScore } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, message: '메시지가 필요합니다.' }, { status: 400 });
    }

    let currentSessionId = sessionId;

    // 새 세션 생성
    if (!currentSessionId) {
      try {
        const { data: session, error } = await supabase
          .from('ai_chat_sessions')
          .insert({
            survey_result_id: surveyResultId || null,
            title: message.substring(0, 50),
            created_at: new Date().toISOString()
          })
          .select('id')
          .single();

        if (!error && session) {
          currentSessionId = session.id;
        }
      } catch (e) {
        // 테이블 없으면 세션 없이 진행
        currentSessionId = null;
      }
    }

    // 이전 대화 로드 (최근 10개)
    let previousMessages: { role: string; content: string }[] = [];
    if (currentSessionId) {
      try {
        const { data: history } = await supabase
          .from('ai_chat_messages')
          .select('role, content')
          .eq('session_id', currentSessionId)
          .order('created_at', { ascending: true })
          .limit(10);

        if (history) {
          previousMessages = history.map(h => ({ role: h.role, content: h.content }));
        }
      } catch (e) {
        // 히스토리 로드 실패 무시
      }
    }

    // 점수 컨텍스트 생성
    const scoreContext = categoryScores
      ? Object.entries(categoryScores)
          .map(([key, score]) => `${CATEGORY_NAMES[key] || key}: ${Number(score).toFixed(1)}점 (${getMaturityLevel(Number(score))})`)
          .join(', ')
      : '';

    // 시스템 프롬프트 구성
    const systemPrompt = `${getSystemPrompt()}

현재 상담 중인 기업 정보:
- 회사: ${userInfo?.company || '미입력'}
- 업종: ${userInfo?.industry || '미입력'}
- 규모: ${userInfo?.companySize || '미입력'}
- 종합 점수: ${totalScore ? Number(totalScore).toFixed(1) : '?'}/5.0
- 영역별: ${scoreContext}

대화 규칙:
1. 300단어 이내로 간결하게 답변하세요.
2. 사용자의 실제 점수를 인용하며 답변하세요.
3. 중소기업에 적합한 현실적 조언만 제공하세요.
4. 질문이 SCM 범위 밖이면 정중히 SCM 관련 상담으로 유도하세요.
5. 구체적 도구, 방법론, 예산 범위를 포함하세요.`;

    // OpenAI 호출
    const messages = [
      { role: 'system', content: systemPrompt },
      ...previousMessages,
      { role: 'user', content: message }
    ];

    let aiResponse: string;
    try {
      aiResponse = await callOpenAI(messages, {
        maxTokens: 800,
        temperature: 0.7
      });
    } catch (e) {
      aiResponse = '죄송합니다. AI 서비스에 일시적인 문제가 발생했습니다. 잠시 후 다시 시도해주세요.';
    }

    // 메시지 저장
    if (currentSessionId) {
      try {
        await supabase.from('ai_chat_messages').insert([
          {
            session_id: currentSessionId,
            role: 'user',
            content: message,
            created_at: new Date().toISOString()
          },
          {
            session_id: currentSessionId,
            role: 'assistant',
            content: aiResponse,
            created_at: new Date().toISOString()
          }
        ]);
      } catch (e) {
        // 저장 실패 무시
      }
    }

    return NextResponse.json({
      success: true,
      sessionId: currentSessionId,
      message: aiResponse
    });
  } catch (error) {
    console.error('AI 채팅 API 오류:', error);
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
