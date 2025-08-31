import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import nodemailer from 'nodemailer';

// 이메일 발송 함수
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    // Gmail SMTP 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      port:587,
      secure: false,
      auth: {
        user: 'sangkeun.jo@gmail.com', // 발신자 이메일
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password' // Gmail 앱 비밀번호
      },
        tls: {
          rejectUnauthorized: false
        }
    });

    // 이메일 발송
    const mailOptions = {
      from: 'sangkeun.jo@gmail.com',
      to: to,
      subject: subject,
      html: htmlContent
    };

    const result = await transporter.sendMail(mailOptions);
    console.log('📧 이메일 발송 성공:', result.messageId);
    return true;
  } catch (error) {
    console.error('이메일 발송 오류:', error);
    
    // 오류 발생 시에도 콘솔에 로그 출력 (개발용)
    console.log('📧 이메일 발송 시뮬레이션 (오류로 인한 대체):');
    console.log('받는 사람:', to);
    console.log('제목:', subject);
    console.log('내용:', htmlContent.substring(0, 200) + '...');
    
    return false;
  }
};

// HTML 이메일 템플릿 생성
const generateEmailTemplate = (userInfo: any, resultData: any, categoryNames: Record<string, string>) => {
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
                            <h4>${categoryNames[category] || category}</h4>
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
    const { userId, companyId, userName, userEmail, userPhone, answers } = await request.json();

    if (!userId || !companyId || !answers) {
      return NextResponse.json(
        { message: '필수 데이터가 누락되었습니다.' },
        { status: 400 }
      );
    }

    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    
    // 기존 결과 확인
    const { data: existingResults, error: selectError } = await supabase
      .from('survey_results')
      .select('id')
      .eq('user_email', userEmail)
      .eq('company_id', companyId);

    let resultId: number;
    
  if (Array.isArray(existingResults) && existingResults.length > 0) {
      // 기존 결과 업데이트
      resultId = existingResults[0].id;
        await supabase
          .from('survey_results')
          .update({ 
            updated_at: new Date().toISOString(),
            total_score: null, // 임시, 아래에서 실제 점수로 업데이트
            user_name: userName
          })
          .eq('id', resultId);
      await supabase
        .from('survey_answers')
        .delete()
        .eq('survey_result_id', resultId);
    } else {
      // 새 결과 생성
      const { data: insertResult, error: insertError } = await supabase
        .from('survey_results')
        .insert({
          user_email: userEmail,
          company_id: companyId,
            user_name: userName,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          total_score: null // 임시, 아래에서 실제 점수로 업데이트
        })
        .select('id');
      resultId = insertResult?.[0]?.id;
    }
    // 전체 평균 점수 계산 후 survey_results에 total_score 업데이트
  // ...existing code...

    // 답변 저장
    for (const [questionId, answer] of Object.entries(answers)) {
      await supabase.from('survey_answers').insert({
        survey_result_id: resultId,
        question_id: questionId,
        answer_value: answer,
        created_at: new Date().toISOString()
      });
    }

    // 설문 질문 데이터 (가중치 정보 포함) DB에서 가져오기
    const { data: surveyQuestions, error: surveyQuestionsError } = await supabase
      .from('category_question')
      .select('question_id, category_id, question, weight')
      .eq('isactive', true);
    if (surveyQuestionsError) {
      console.error('Error fetching survey questions:', surveyQuestionsError);
      return NextResponse.json(
        { message: '설문 질문 데이터 조회 오류' },
        { status: 500 }
      );
    }

    // 카테고리명 DB에서 가져오기
    const { data: categoryRows, error: categoryError } = await supabase
      .from('category')
      .select('id, key, title')
      .order('id', { ascending: true });
    if (categoryError) {
      console.error('Error fetching categories:', categoryError);
    }
    const categoryNames: Record<string, string> = {};
    if (categoryRows) {
      for (const row of categoryRows) {
        categoryNames[row.key] = row.title;
      }
    }

    // 카테고리별 점수 계산 (가중치 고려)
    const categoryScores: Record<string, number> = {};
    const categoryWeights: Record<string, number> = {};
    for (const key in categoryNames) {
      categoryScores[key] = 0;
      categoryWeights[key] = 0;
    }

    for (const [questionId, answer] of Object.entries(answers)) {
      const question = surveyQuestions.find(q => q.question_id === questionId);
      if (question) {
        // category_id로 key 찾기
        const categoryRow = categoryRows?.find(cat => String(cat.id) === String(question.category_id));
        const categoryKey = categoryRow?.key;
        if (categoryKey && categoryScores.hasOwnProperty(categoryKey)) {
          const weightedScore = Number(answer) * question.weight;
          categoryScores[categoryKey] += weightedScore;
          categoryWeights[categoryKey] += question.weight;
        }
      }
    }

    // 가중 평균 점수 계산
    for (const category in categoryScores) {
      if (categoryWeights[category] > 0) {
        categoryScores[category] = categoryScores[category] / categoryWeights[category];
      }
    }

    // 전체 평균 점수 계산
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / Object.keys(categoryScores).length;

    // 전체 평균 점수 계산 후 survey_results에 total_score 업데이트
    await supabase
      .from('survey_results')
      .update({ total_score: totalScore })
      .eq('id', resultId);
    
    // 디버깅을 위한 점수 출력
    console.log('=== 진단 점수 계산 결과 ===');
    console.log('입력된 답변:', answers);
    console.log('카테고리별 점수:', categoryScores);
    console.log('전체 점수:', totalScore);
    console.log('========================');

    // 카테고리 분석 결과 저장
    for (const [category, score] of Object.entries(categoryScores)) {
      await supabase.from('category_analysis').insert({
        survey_result_id: resultId,
        category,
        score,
        max_score: 5,
        created_at: new Date().toISOString()
      });
    }

    // 이메일 발송
    const resultData = {
      totalScore,
      categoryScores
    };

    // 담당자에게 이메일 발송
    if (userEmail) {
      const userSubject = `[SCM 진단 결과] ${userName || '고객'}님의 SCM 성숙도 진단 결과입니다`;
      const userHtml = generateEmailTemplate({ name: userName, company: companyId, email: userEmail, phone: userPhone }, resultData, categoryNames);
      await sendEmail(userEmail, userSubject, userHtml);
    }

    // 관리자에게 이메일 발송 (올바른 주소)
    const adminSubject = `[SCM 진단 완료] ${userName || '고객'}님의 진단이 완료되었습니다`;
    const adminHtml = `
      <h2>새로운 SCM 진단 완료</h2>
      <p><strong>진단자:</strong> ${userName || '미입력'}</p>
      <p><strong>회사:</strong> ${companyId}</p>
      <p><strong>이메일:</strong> ${userEmail || '미입력'}</p>
      <p><strong>종합 점수:</strong> ${Number(totalScore).toFixed(1)}점</p>
      <p><strong>진단 완료 시간:</strong> ${now}</p>
    `;
    
    // 올바른 관리자 이메일 주소로 발송
    await sendEmail('sangkeun.jo@gmail.com', adminSubject, adminHtml);
    console.log('📧 관리자 이메일 발송 완료: sangkeun.jo@gmail.com');

    return NextResponse.json({
      success: true,
      id: resultId,
      userId,
      companyId,
      totalScore,
      categoryScores,
      createdAt: now
    });

  } catch (error) {
    console.error('Survey submission error:', error);
    return NextResponse.json(
      { message: '서버 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}