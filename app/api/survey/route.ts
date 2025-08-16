import { NextResponse } from 'next/server';
import { getPool } from '../../lib/db'
import { RowDataPacket, OkPacket } from 'mysql2/promise';

// 이메일 발송 함수 (실제 구현에서는 nodemailer 등을 사용)
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    // 실제 이메일 발송 로직 (현재는 콘솔 출력으로 대체)
    console.log('📧 이메일 발송 시뮬레이션:');
    console.log('받는 사람:', to);
    console.log('제목:', subject);
    console.log('내용:', htmlContent);
    
    // 실제 구현 시에는 다음과 같이 nodemailer를 사용할 수 있습니다:
    /*
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: to,
      subject: subject,
      html: htmlContent
    });
    */
    
    return true;
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    return false;
  }
};

// HTML 이메일 템플릿 생성
const generateEmailTemplate = (userInfo: any, resultData: any) => {
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

  const getGrade = (score: number): string => {
    if (score >= 4.5) return 'A+';
    if (score >= 4.0) return 'A';
    if (score >= 3.5) return 'B+';
    if (score >= 3.0) return 'B';
    if (score >= 2.5) return 'C+';
    if (score >= 2.0) return 'C';
    if (score >= 1.5) return 'D+';
    return 'D';
  };

  return `
    <!DOCTYPE html>
    <html lang="ko">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SCM 성숙도 진단 결과</title>
        <style>
            body { font-family: 'Noto Sans KR', Arial, sans-serif; line-height: 1.6; color: #333; }
            .container { max-width: 600px; margin: 0 auto; padding: 20px; }
            .header { background: #1976d2; color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
            .content { background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px; }
            .score-box { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center; }
            .category-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr)); gap: 15px; margin: 20px 0; }
            .category-item { background: white; padding: 15px; border-radius: 8px; border-left: 4px solid #1976d2; }
            .highlight { color: #1976d2; font-weight: bold; }
            .footer { text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #ddd; color: #666; }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>SCM 성숙도 진단 결과</h1>
                <p>${userInfo?.company || '귀하의 회사'}의 공급망 관리 성숙도 진단이 완료되었습니다.</p>
            </div>
            
            <div class="content">
                <h2>진단자 정보</h2>
                <p><strong>이름:</strong> ${userInfo?.name || '미입력'}</p>
                <p><strong>회사:</strong> ${userInfo?.company || '미입력'}</p>
                <p><strong>이메일:</strong> ${userInfo?.email || '미입력'}</p>
                <p><strong>전화:</strong> ${userInfo?.phone || '미입력'}</p>
                
                <div class="score-box">
                    <h2>종합 진단 결과</h2>
                    <h1 class="highlight">${resultData.totalScore.toFixed(1)}점</h1>
                    <p><strong>성숙도 수준:</strong> ${getMaturityLevel(resultData.totalScore)}</p>
                    <p><strong>등급:</strong> ${getGrade(resultData.totalScore)}</p>
                </div>
                
                <h3>영역별 진단 결과</h3>
                <div class="category-grid">
                    ${Object.entries(resultData.categoryScores).map(([category, score]) => `
                        <div class="category-item">
                            <h4>${categoryNames[category as keyof typeof categoryNames]}</h4>
                            <p class="highlight">${(score as number).toFixed(1)}점</p>
                            <p>수준: ${getMaturityLevel(score as number)} (${getGrade(score as number)})</p>
                        </div>
                    `).join('')}
                </div>
                
                <h3>다음 단계</h3>
                <p>진단 결과를 바탕으로 다음과 같은 개선 활동을 권장합니다:</p>
                <ul>
                    <li>점수가 낮은 영역에 대한 우선순위 개선 계획 수립</li>
                    <li>SCM 전문가와의 상담을 통한 구체적인 개선 방안 도출</li>
                    <li>정기적인 재진단을 통한 개선 효과 측정</li>
                </ul>
                
                <div class="footer">
                    <p>본 이메일은 SCM 성숙도 진단 시스템에서 자동으로 발송되었습니다.</p>
                    <p>문의사항: sangkeun.jo@gmail.com</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export async function POST(request: Request) {
  try {
    const pool = await getPool();
    const { userId, companyId, userName, userEmail, answers } = await request.json();

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

    // 이메일 발송
    const resultData = {
      totalScore,
      categoryScores
    };

    // 담당자에게 이메일 발송
    if (userEmail) {
      const userSubject = `[SCM 진단 결과] ${userName || '고객'}님의 SCM 성숙도 진단 결과입니다`;
      const userHtml = generateEmailTemplate({ name: userName, company: companyId, email: userEmail, phone: '' }, resultData);
      await sendEmail(userEmail, userSubject, userHtml);
    }

    // 관리자에게 이메일 발송
    const adminSubject = `[SCM 진단 완료] ${userName || '고객'}님의 진단이 완료되었습니다`;
    const adminHtml = `
      <h2>새로운 SCM 진단 완료</h2>
      <p><strong>진단자:</strong> ${userName || '미입력'}</p>
      <p><strong>회사:</strong> ${companyId}</p>
      <p><strong>이메일:</strong> ${userEmail || '미입력'}</p>
      <p><strong>종합 점수:</strong> ${Number(totalScore).toFixed(1)}점</p>
      <p><strong>진단 완료 시간:</strong> ${now}</p>
    `;
    await sendEmail('sangkeun.jo@gmail.com', adminSubject, adminHtml);

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