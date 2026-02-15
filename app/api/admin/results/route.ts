import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET: 설문 결과 목록 조회
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (id) {
      // 특정 결과 상세 조회
      const { data: result, error } = await supabase
        .from('survey_results')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      // 카테고리 분석 조회
      const { data: analysis } = await supabase
        .from('category_analysis')
        .select('*')
        .eq('survey_result_id', id);

      // 개별 답변 조회
      const { data: answers } = await supabase
        .from('survey_answers')
        .select('*')
        .eq('survey_result_id', id);

      return NextResponse.json({ success: true, result, analysis, answers });
    }

    // 전체 결과 목록 조회
    const { data: results, error } = await supabase
      .from('survey_results')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    // 통계 데이터
    const totalCount = results?.length || 0;
    const avgScore = totalCount > 0
      ? results.reduce((sum: number, r: any) => sum + (r.total_score || 0), 0) / totalCount
      : 0;

    // 카테고리 정보
    const { data: categories } = await supabase
      .from('category')
      .select('*')
      .order('id', { ascending: true });

    return NextResponse.json({
      success: true,
      results,
      stats: { totalCount, avgScore },
      categories
    });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
