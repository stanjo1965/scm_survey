import { NextResponse } from 'next/server';
import { getPool } from '../../lib/db';
import { RowDataPacket, OkPacket } from 'mysql2/promise';

export async function POST(request: Request) {
  try {
    const pool = await getPool();
    const { userId, companyId, answers } = await request.json();

    if (!userId || !companyId || !answers) {
      return NextResponse.json(
        { message: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 기존 결과 확인
    const [existingResults] = await pool.execute(
      'SELECT id FROM survey_results WHERE user_id = ? AND company_id = ?',
      [userId, companyId]
    ) as [RowDataPacket[], any];

    let resultId: number;
    
    if (existingResults.length > 0) {
      // 기존 결과 업데이트
      resultId = existingResults[0].id;
      await pool.execute(
        'UPDATE survey_results SET updated_at = ? WHERE id = ?',
        [now, resultId]
      );
      // 기존 답변 삭제
      await pool.execute(
        'DELETE FROM survey_answers WHERE survey_result_id = ?',
        [resultId]
      );
    } else {
      // 새 결과 생성
      const [result] = await pool.execute(
        'INSERT INTO survey_results (user_id, company_id, created_at, updated_at) VALUES (?, ?, ?, ?)',
        [userId, companyId, now, now]
      ) as [OkPacket, any];
      resultId = result.insertId;
    }

    // 답변 저장
    for (const [questionId, answer] of Object.entries(answers)) {
      await pool.execute(
        'INSERT INTO survey_answers (survey_result_id, question_id, answer_value, created_at) VALUES (?, ?, ?, ?)',
        [resultId, questionId, answer, now]
      );
    }

    // 카테고리별 점수 계산
    const categoryScores = {
      planning: 0,
      procurement: 0,
      inventory: 0,
      production: 0,
      logistics: 0,
      integration: 0
    };
    const categoryCounts = {
      planning: 0,
      procurement: 0,
      inventory: 0,
      production: 0,
      logistics: 0,
      integration: 0
    };

    for (const [questionId, answer] of Object.entries(answers)) {
      const category = questionId.split('_')[0];
      if (categoryScores.hasOwnProperty(category)) {
        categoryScores[category] += Number(answer);
        categoryCounts[category]++;
      }
    }

    // 평균 점수 계산
    for (const category in categoryScores) {
      if (categoryCounts[category] > 0) {
        categoryScores[category] = categoryScores[category] / categoryCounts[category];
      }
    }

    // 전체 평균 점수 계산
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 6;

    // 카테고리 분석 결과 저장
    for (const [category, score] of Object.entries(categoryScores)) {
      await pool.execute(
        'INSERT INTO category_analysis (survey_result_id, category, score, max_score, created_at) VALUES (?, ?, ?, ?, ?)',
        [resultId, category, score, 5, now]
      );
    }

    return NextResponse.json({
      success: true,
      resultId,
      totalScore,
      categoryScores
    });

  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
} 