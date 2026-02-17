import { NextResponse } from 'next/server';
import { query } from '../../lib/db';
import { CATEGORY_NAMES } from '../../lib/ai-utils';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const industry = searchParams.get('industry');
    const companySize = searchParams.get('companySize');
    const surveyResultId = searchParams.get('surveyResultId');

    // 현재 사용자의 카테고리 점수
    let userScores: Record<string, number> = {};
    if (surveyResultId) {
      const userAnalysis = await query(
        'SELECT category, score FROM category_analysis WHERE survey_result_id = $1',
        [surveyResultId]
      );
      for (const row of userAnalysis) {
        userScores[row.category] = Number(row.score);
      }
    }

    // survey_results에서 업종 필터링용 ID 가져오기
    const allResults = await query('SELECT id, industry, company_size FROM survey_results');

    let filteredResultIds: number[] = [];
    if (allResults.length > 0) {
      let filtered = allResults;
      if (industry) {
        const industryFiltered = filtered.filter((r: any) => r.industry === industry);
        if (industryFiltered.length >= 5) {
          filtered = industryFiltered;
        }
      }
      filteredResultIds = filtered.map((r: any) => r.id);
    }

    // 카테고리별 분석 데이터
    const analysisData = await query('SELECT category, score, survey_result_id FROM category_analysis');

    if (!analysisData || analysisData.length === 0) {
      return NextResponse.json({
        success: true,
        data: {
          categories: [],
          total_sample_count: 0,
          industry: industry || '전체',
          company_size: companySize || '전체',
          is_sufficient: false,
          message: '아직 비교할 데이터가 없습니다.'
        }
      });
    }

    // 필터된 결과만 사용
    const filteredAnalysis = filteredResultIds.length > 0
      ? analysisData.filter((a: any) => filteredResultIds.includes(a.survey_result_id))
      : analysisData;

    // 카테고리별 집계
    const categoryStats: Record<string, { scores: number[]; sum: number; count: number }> = {};

    for (const row of filteredAnalysis) {
      const score = Number(row.score);
      if (!categoryStats[row.category]) {
        categoryStats[row.category] = { scores: [], sum: 0, count: 0 };
      }
      categoryStats[row.category].scores.push(score);
      categoryStats[row.category].sum += score;
      categoryStats[row.category].count += 1;
    }

    const totalSampleCount = new Set(filteredAnalysis.map((a: any) => a.survey_result_id)).size;
    const isSufficient = totalSampleCount >= 10;

    // 벤치마크 카테고리 데이터
    const categories = Object.entries(categoryStats).map(([catKey, stats]) => {
      const avg = stats.sum / stats.count;
      const sorted = [...stats.scores].sort((a, b) => a - b);
      const userScore = userScores[catKey] || 0;

      const belowCount = sorted.filter(s => s < userScore).length;
      const percentile = Math.round((belowCount / sorted.length) * 100);

      return {
        category_key: catKey,
        category_name: CATEGORY_NAMES[catKey] || catKey,
        user_score: userScore,
        avg_score: Math.round(avg * 100) / 100,
        sample_count: stats.count,
        percentile: 100 - percentile,
        gap: Math.round((userScore - avg) * 100) / 100
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        categories,
        total_sample_count: totalSampleCount,
        industry: industry || '전체',
        company_size: companySize || '전체',
        is_sufficient: isSufficient,
        message: isSufficient ? undefined : `현재 ${totalSampleCount}개 기업 데이터로 비교합니다. 10개 이상 누적 시 더 정확한 비교가 가능합니다.`
      }
    });
  } catch (error) {
    console.error('벤치마크 API 오류:', error);
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
