import { NextResponse } from 'next/server';
import { query, queryOne } from '../../../lib/db';

// PostgreSQL numeric 필드를 숫자로 변환
function parseNumericFields(row: any) {
  if (!row) return row;
  const numericKeys = ['total_score', 'score', 'max_score', 'answer_value'];
  const parsed = { ...row };
  for (const key of numericKeys) {
    if (key in parsed && parsed[key] !== null) {
      parsed[key] = Number(parsed[key]);
    }
  }
  return parsed;
}

// GET: 설문 결과 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // 특정 결과 상세 조회
      const result = await queryOne('SELECT * FROM survey_results WHERE id = $1', [id]);

      if (!result) {
        return NextResponse.json({ success: false, message: '결과를 찾을 수 없습니다.' }, { status: 404 });
      }

      // 카테고리 분석 조회
      const analysis = await query('SELECT * FROM category_analysis WHERE survey_result_id = $1', [id]);

      // 개별 답변 조회
      const answers = await query('SELECT * FROM survey_answers WHERE survey_result_id = $1', [id]);

      return NextResponse.json({
        success: true,
        result: parseNumericFields(result),
        analysis: analysis.map(parseNumericFields),
        answers: answers.map(parseNumericFields),
      });
    }

    // 전체 결과 목록 조회
    const results = await query('SELECT * FROM survey_results ORDER BY created_at DESC');

    // 통계 데이터
    const totalCount = results.length;
    const avgScore = totalCount > 0
      ? results.reduce((sum: number, r: any) => sum + (Number(r.total_score) || 0), 0) / totalCount
      : 0;

    // 카테고리 정보
    const categories = await query('SELECT * FROM category ORDER BY id ASC');

    return NextResponse.json({
      success: true,
      results: results.map(parseNumericFields),
      stats: { totalCount, avgScore },
      categories
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
