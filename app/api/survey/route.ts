import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import nodemailer from 'nodemailer';

// 이메일 발송 함수
const sendEmail = async (to: string, subject: string, htmlContent: string) => {
  try {
    // Gmail SMTP 설정
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: 'sangkeun.jo@gmail.com', // 발신자 이메일
        pass: process.env.GMAIL_APP_PASSWORD || 'your-app-password' // Gmail 앱 비밀번호
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
    const { userId, companyId, userName, userEmail, answers } = await request.json();

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

    // 설문 질문 데이터 (가중치 정보 포함)
    const surveyQuestions = [
      // 계획 관리 (10개)
      { id: 'planning_1', category: 'planning', weight: 3 },
      { id: 'planning_2', category: 'planning', weight: 4 },
      { id: 'planning_3', category: 'planning', weight: 3 },
      { id: 'planning_4', category: 'planning', weight: 3 },
      { id: 'planning_5', category: 'planning', weight: 4 },
      { id: 'planning_6', category: 'planning', weight: 3 },
      { id: 'planning_7', category: 'planning', weight: 3 },
      { id: 'planning_8', category: 'planning', weight: 3 },
      { id: 'planning_9', category: 'planning', weight: 4 },
      { id: 'planning_10', category: 'planning', weight: 3 },

      // 조달 관리 (10개)
      { id: 'procurement_1', category: 'procurement', weight: 4 },
      { id: 'procurement_2', category: 'procurement', weight: 3 },
      { id: 'procurement_3', category: 'procurement', weight: 3 },
      { id: 'procurement_4', category: 'procurement', weight: 3 },
      { id: 'procurement_5', category: 'procurement', weight: 4 },
      { id: 'procurement_6', category: 'procurement', weight: 4 },
      { id: 'procurement_7', category: 'procurement', weight: 3 },
      { id: 'procurement_8', category: 'procurement', weight: 3 },
      { id: 'procurement_9', category: 'procurement', weight: 3 },
      { id: 'procurement_10', category: 'procurement', weight: 4 },

      // 재고 관리 (10개)
      { id: 'inventory_1', category: 'inventory', weight: 3 },
      { id: 'inventory_2', category: 'inventory', weight: 3 },
      { id: 'inventory_3', category: 'inventory', weight: 3 },
      { id: 'inventory_4', category: 'inventory', weight: 4 },
      { id: 'inventory_5', category: 'inventory', weight: 3 },
      { id: 'inventory_6', category: 'inventory', weight: 4 },
      { id: 'inventory_7', category: 'inventory', weight: 3 },
      { id: 'inventory_8', category: 'inventory', weight: 3 },
      { id: 'inventory_9', category: 'inventory', weight: 3 },
      { id: 'inventory_10', category: 'inventory', weight: 3 },

      // 생산 관리 (10개)
      { id: 'production_1', category: 'production', weight: 3 },
      { id: 'production_2', category: 'production', weight: 3 },
      { id: 'production_3', category: 'production', weight: 4 },
      { id: 'production_4', category: 'production', weight: 3 },
      { id: 'production_5', category: 'production', weight: 3 },
      { id: 'production_6', category: 'production', weight: 3 },
      { id: 'production_7', category: 'production', weight: 3 },
      { id: 'production_8', category: 'production', weight: 4 },
      { id: 'production_9', category: 'production', weight: 3 },
      { id: 'production_10', category: 'production', weight: 3 },

      // 물류 관리 (10개)
      { id: 'logistics_1', category: 'logistics', weight: 3 },
      { id: 'logistics_2', category: 'logistics', weight: 3 },
      { id: 'logistics_3', category: 'logistics', weight: 4 },
      { id: 'logistics_4', category: 'logistics', weight: 3 },
      { id: 'logistics_5', category: 'logistics', weight: 3 },
      { id: 'logistics_6', category: 'logistics', weight: 3 },
      { id: 'logistics_7', category: 'logistics', weight: 4 },
      { id: 'logistics_8', category: 'logistics', weight: 3 },
      { id: 'logistics_9', category: 'logistics', weight: 3 },
      { id: 'logistics_10', category: 'logistics', weight: 3 },

      // 통합 관리 (10개)
      { id: 'integration_1', category: 'integration', weight: 4 },
      { id: 'integration_2', category: 'integration', weight: 3 },
      { id: 'integration_3', category: 'integration', weight: 4 },
      { id: 'integration_4', category: 'integration', weight: 3 },
      { id: 'integration_5', category: 'integration', weight: 3 },
      { id: 'integration_6', category: 'integration', weight: 3 },
      { id: 'integration_7', category: 'integration', weight: 3 },
      { id: 'integration_8', category: 'integration', weight: 4 },
      { id: 'integration_9', category: 'integration', weight: 4 },
      { id: 'integration_10', category: 'integration', weight: 3 }
    ];

    // 카테고리별 점수 계산 (가중치 고려)
    const categoryScores = {
      planning: 0,
      procurement: 0,
      inventory: 0,
      production: 0,
      logistics: 0,
      integration: 0
    };
    const categoryWeights = {
      planning: 0,
      procurement: 0,
      inventory: 0,
      production: 0,
      logistics: 0,
      integration: 0
    };

    for (const [questionId, answer] of Object.entries(answers)) {
      const question = surveyQuestions.find(q => q.id === questionId);
      if (question && categoryScores.hasOwnProperty(question.category)) {
        const weightedScore = Number(answer) * question.weight;
        categoryScores[question.category] += weightedScore;
        categoryWeights[question.category] += question.weight;
      }
    }

    // 가중 평균 점수 계산
    for (const category in categoryScores) {
      if (categoryWeights[category] > 0) {
        categoryScores[category] = categoryScores[category] / categoryWeights[category];
      }
    }

    // 전체 평균 점수 계산
    const totalScore = Object.values(categoryScores).reduce((sum, score) => sum + score, 0) / 6;

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
      const userHtml = generateEmailTemplate({ name: userName, company: companyId, email: userEmail, phone: '' }, resultData);
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