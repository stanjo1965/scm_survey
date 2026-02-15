import { NextResponse } from 'next/server';
import { callOpenAI, getSystemPrompt } from '../../lib/ai-utils';

export async function POST(request: Request) {
  try {
    const { completedActions, totalActions, completedTasks, totalTasks, recentlyCompleted, currentFocus } = await request.json();

    const percentage = totalActions > 0 ? Math.round((completedActions / totalActions) * 100) : 0;
    const isCelebration = completedTasks > 0 && completedTasks === totalTasks;

    const prompt = `사용자의 SCM 개선 진행 상황입니다:
- 전체 진행률: ${completedActions}/${totalActions} 액션 완료 (${percentage}%)
- 과제 완료: ${completedTasks}/${totalTasks}
- 최근 완료: ${recentlyCompleted || '없음'}
- 현재 진행 중: ${currentFocus || '없음'}

${isCelebration ? '모든 과제를 완료했습니다! 축하 메시지와 다음 단계를 제안하세요.' : ''}

JSON으로 응답하세요:
{
  "message": "격려 및 피드백 메시지 (2-3문장, 한국어)",
  "next_suggestion": "다음 구체적 제안 (1문장)",
  "is_celebration": ${isCelebration}
}`;

    try {
      const response = await callOpenAI(
        [
          { role: 'system', content: getSystemPrompt() + '\n\n짧고 격려하는 톤으로 응답하세요. 200토큰 이내.' },
          { role: 'user', content: prompt }
        ],
        { jsonMode: true, maxTokens: 300, temperature: 0.7 }
      );

      const parsed = JSON.parse(response);
      return NextResponse.json({ success: true, data: parsed });
    } catch (e) {
      // Fallback
      const fallbackMessage = isCelebration
        ? '축하합니다! 모든 개선 과제를 완료하셨습니다. 정기적인 모니터링과 지속적 개선이 중요합니다.'
        : `좋은 진행입니다! ${percentage}% 완료되었습니다. 꾸준히 진행해주세요.`;

      return NextResponse.json({
        success: true,
        data: {
          message: fallbackMessage,
          next_suggestion: '다음 액션 항목을 확인하고 실행해보세요.',
          is_celebration: isCelebration
        }
      });
    }
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
