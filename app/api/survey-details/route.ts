import { NextResponse } from 'next/server';
import { query } from '../../lib/db';

// GET: 특정 설문 결과의 카테고리별 질문-점수 상세 데이터
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('result_id');

    if (!resultId) {
      return NextResponse.json({ success: false, message: 'result_id가 필요합니다.' }, { status: 400 });
    }

    // 답변 조회
    const answers = await query(
      'SELECT question_id, answer_value FROM survey_answers WHERE survey_result_id = $1',
      [resultId]
    );

    // 질문 정보 조회
    const questions = await query(
      'SELECT question_id, category_id, question, weight FROM category_question WHERE isactive = true'
    );

    // 카테고리 정보 조회
    const categories = await query('SELECT id, key, title FROM category');

    // category별 질문별 점수 배열 생성
    const result: Record<string, Array<{ questionId: string; question: string; score: number; weight: number }>> = {};
    for (const cat of categories) {
      result[cat.key] = [];
    }

    for (const answer of answers) {
      const question = questions.find((q: any) => q.question_id === answer.question_id);
      if (question) {
        const category = categories.find((c: any) => c.id === question.category_id);
        if (category && result[category.key]) {
          result[category.key].push({
            questionId: answer.question_id,
            question: question.question,
            score: Number(answer.answer_value),
            weight: Number(question.weight)
          });
        }
      }
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error) {
    console.error('Survey details API error:', error);
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
