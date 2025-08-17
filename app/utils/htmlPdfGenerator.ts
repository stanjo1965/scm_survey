import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

interface SurveyResult {
  id: string;
  userId: string;
  companyId: string;
  totalScore: number;
  categoryScores: {
    planning: number;
    procurement: number;
    inventory: number;
    production: number;
    logistics: number;
    integration: number;
  };
  createdAt: string;
}

const generateHTMLReport = (surveyResult: SurveyResult, companyName: string, aiAnalysis?: string): string => {
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
        <title>SCM 성숙도 진단 보고서</title>
        <link href="https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@300;400;500;700&display=swap" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            
            body {
                font-family: 'Noto Sans KR', sans-serif;
                line-height: 1.6;
                color: #333;
                background: white;
            }
            
            .report-container {
                width: 800px;
                margin: 0 auto;
                background: white;
            }
            
            .cover-section {
                height: 1123px;
                display: flex;
                flex-direction: column;
                justify-content: center;
                align-items: center;
                text-align: center;
                background: linear-gradient(135deg, #1976d2 0%, #42a5f5 100%);
                color: white;
                padding: 40px;
                page-break-after: always;
            }
            
            .cover-title {
                font-size: 48px;
                font-weight: 700;
                margin-bottom: 20px;
            }
            
            .cover-subtitle {
                font-size: 24px;
                margin-bottom: 40px;
                opacity: 0.9;
            }
            
            .cover-company {
                font-size: 32px;
                font-weight: 600;
                margin-bottom: 60px;
            }
            
            .cover-date {
                font-size: 18px;
                opacity: 0.8;
            }
            
            .category-analysis-page {
                height: 1123px;
                padding: 40px;
                page-break-after: always;
            }
            
            .analysis-page {
                height: 1123px;
                padding: 40px;
                page-break-after: always;
            }
            
            .recommendations-page {
                height: 1123px;
                padding: 40px;
                page-break-after: always;
            }
            
            .action-plan-page {
                height: 1123px;
                padding: 40px;
            }
            
            .page-title {
                font-size: 32px;
                font-weight: 700;
                color: #1976d2;
                margin-bottom: 30px;
                text-align: center;
            }
            
            .score-display {
                text-align: center;
                margin-bottom: 40px;
            }
            
            .total-score {
                font-size: 72px;
                font-weight: 700;
                color: #1976d2;
                margin-bottom: 10px;
            }
            
            .score-label {
                font-size: 18px;
                color: #666;
            }
            
            .category-grid {
                display: grid;
                grid-template-columns: 1fr 1fr;
                gap: 20px;
                margin-bottom: 30px;
            }
            
            .category-item {
                background: #f8f9fa;
                padding: 20px;
                border-radius: 8px;
                border-left: 4px solid #1976d2;
            }
            
            .category-name {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #1976d2;
            }
            
            .category-score {
                font-size: 24px;
                font-weight: 700;
                margin-bottom: 5px;
            }
            
            .category-level {
                font-size: 14px;
                color: #666;
            }
            
            .progress-bar {
                width: 100%;
                height: 8px;
                background: #e0e0e0;
                border-radius: 4px;
                margin: 10px 0;
                overflow: hidden;
            }
            
            .progress-fill {
                height: 100%;
                background: #1976d2;
                border-radius: 4px;
            }
            
            .section-title {
                font-size: 24px;
                font-weight: 600;
                color: #1976d2;
                margin-bottom: 20px;
                margin-top: 30px;
            }
            
            .strength-item, .weakness-item {
                background: #f8f9fa;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 6px;
                border-left: 3px solid #4caf50;
            }
            
            .weakness-item {
                border-left-color: #f44336;
            }
            
            .recommendation-item {
                background: #e3f2fd;
                padding: 20px;
                margin-bottom: 15px;
                border-radius: 8px;
                border-left: 4px solid #1976d2;
            }
            
            .recommendation-title {
                font-size: 18px;
                font-weight: 600;
                margin-bottom: 10px;
                color: #1976d2;
            }
            
            .action-item {
                background: #f3e5f5;
                padding: 15px;
                margin-bottom: 10px;
                border-radius: 6px;
                border-left: 3px solid #9c27b0;
            }
            
            .action-priority {
                font-weight: 600;
                color: #9c27b0;
                margin-bottom: 5px;
            }
            
            .ai-analysis-page {
                padding: 40px;
                min-height: 1123px;
                background: white;
                page-break-after: always;
            }
            
            .ai-content {
                margin-top: 30px;
            }
            
            .ai-section-title {
                font-size: 28px;
                font-weight: 700;
                color: #1976d2;
                margin-bottom: 20px;
                margin-top: 30px;
                border-bottom: 2px solid #1976d2;
                padding-bottom: 10px;
            }
            
            .ai-subtitle {
                font-size: 20px;
                font-weight: 600;
                color: #333;
                margin-bottom: 15px;
                margin-top: 25px;
            }
            
            .ai-text {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 15px;
                color: #555;
            }
            
            .ai-list-item {
                font-size: 16px;
                line-height: 1.8;
                margin-bottom: 8px;
                color: #555;
                padding-left: 20px;
                position: relative;
            }
            
            .ai-list-item:before {
                content: "•";
                color: #1976d2;
                font-weight: bold;
                position: absolute;
                left: 0;
            }
        </style>
    </head>
    <body>
        <div class="report-container">
            <!-- 표지 페이지 -->
            <div class="cover-section">
                <div class="cover-title">SCM 성숙도 진단 보고서</div>
                <div class="cover-subtitle">Supply Chain Management Maturity Assessment</div>
                <div class="cover-company">${companyName}</div>
                <div class="cover-date">진단일: ${new Date(surveyResult.createdAt).toLocaleDateString('ko-KR')}</div>
            </div>
            
            <!-- 카테고리별 분석 페이지 -->
            <div class="category-analysis-page">
                <div class="page-title">영역별 성숙도 분석</div>
                <div class="score-display">
                    <div class="total-score">${surveyResult.totalScore.toFixed(1)}</div>
                    <div class="score-label">전체 평균 점수 / 5.0점</div>
                </div>
                <div class="category-grid">
                    ${Object.entries(surveyResult.categoryScores).map(([category, score]) => `
                        <div class="category-item">
                            <div class="category-name">${categoryNames[category as keyof typeof categoryNames]}</div>
                            <div class="category-score">${score.toFixed(1)}점</div>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${(score / 5) * 100}%"></div>
                            </div>
                            <div class="category-level">${getMaturityLevel(score)} 수준</div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- 종합 분석 페이지 -->
            <div class="analysis-page">
                <div class="page-title">종합 분석</div>
                
                <div class="section-title">강점 영역</div>
                ${Object.entries(surveyResult.categoryScores)
                    .filter(([_, score]) => score >= 3.5)
                    .map(([category, score]) => `
                        <div class="strength-item">
                            <strong>${categoryNames[category as keyof typeof categoryNames]}</strong> (${score.toFixed(1)}점)
                            - ${getMaturityLevel(score)} 수준으로 우수한 성과를 보이고 있습니다.
                        </div>
                    `).join('')}
                
                <div class="section-title">개선 필요 영역</div>
                ${Object.entries(surveyResult.categoryScores)
                    .filter(([_, score]) => score < 3.0)
                    .map(([category, score]) => `
                        <div class="weakness-item">
                            <strong>${categoryNames[category as keyof typeof categoryNames]}</strong> (${score.toFixed(1)}점)
                            - ${getMaturityLevel(score)} 수준으로 개선이 필요한 영역입니다.
                        </div>
                    `).join('')}
            </div>
            
            <!-- 개선 권장사항 페이지 -->
            <div class="recommendations-page">
                <div class="page-title">개선 권장사항</div>
                
                ${Object.entries(surveyResult.categoryScores)
                    .filter(([_, score]) => score < 4.0)
                    .map(([category, score]) => `
                        <div class="recommendation-item">
                            <div class="recommendation-title">${categoryNames[category as keyof typeof categoryNames]} 개선 방안</div>
                            <p>현재 ${score.toFixed(1)}점 (${getMaturityLevel(score)} 수준)에서 ${getMaturityLevel(Math.min(score + 1, 5))} 수준으로 향상시키기 위한 구체적인 개선 방안을 제시합니다.</p>
                        </div>
                    `).join('')}
            </div>
            
            <!-- AI 분석 페이지 -->
            ${aiAnalysis ? `
            <div class="ai-analysis-page">
                <div class="page-title">AI 분석 결과</div>
                
                <div class="ai-content">
                    ${aiAnalysis.split('\n').map(line => {
                        if (line.startsWith('## ')) {
                            return `<h2 class="ai-section-title">${line.replace('## ', '')}</h2>`;
                        } else if (line.startsWith('**') && line.endsWith('**')) {
                            return `<h3 class="ai-subtitle">${line.replace(/\*\*/g, '')}</h3>`;
                        } else if (line.startsWith('- ')) {
                            return `<li class="ai-list-item">${line.replace('- ', '')}</li>`;
                        } else if (line.trim() === '') {
                            return '<br>';
                        } else {
                            return `<p class="ai-text">${line}</p>`;
                        }
                    }).join('')}
                </div>
            </div>
            ` : ''}
            
            <!-- 실행 계획 페이지 -->
            <div class="action-plan-page">
                <div class="page-title">실행 계획</div>
                
                <div class="section-title">우선순위별 실행 계획</div>
                
                <div class="action-item">
                    <div class="action-priority">1단계 (1-3개월)</div>
                    <p>기본적인 프로세스 표준화 및 시스템 구축</p>
                </div>
                
                <div class="action-item">
                    <div class="action-priority">2단계 (3-6개월)</div>
                    <p>성과 측정 체계 구축 및 지속적 개선 활동</p>
                </div>
                
                <div class="action-item">
                    <div class="action-priority">3단계 (6-12개월)</div>
                    <p>고도화된 SCM 시스템 구축 및 최적화</p>
                </div>
            </div>
        </div>
    </body>
    </html>
  `;
};

export const generateHTMLToPDF = async (surveyResult: SurveyResult, companyName: string = '귀하의 회사', aiAnalysis?: string): Promise<void> => {
  try {
    const htmlContent = generateHTMLReport(surveyResult, companyName, aiAnalysis);
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    tempDiv.style.position = 'absolute';
    tempDiv.style.left = '-9999px';
    tempDiv.style.top = '0';
    tempDiv.style.width = '800px';
    document.body.appendChild(tempDiv);

    await new Promise(resolve => setTimeout(resolve, 3000));

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4', compress: true });
    const sections = ['.cover-section', '.category-analysis-page', '.analysis-page', '.ai-analysis-page', '.recommendations-page', '.action-plan-page'].filter(selector => {
      if (selector === '.ai-analysis-page' && !aiAnalysis) {
        return false;
      }
      return true;
    });

    for (let i = 0; i < sections.length; i++) {
      const section = tempDiv.querySelector(sections[i]) as HTMLElement;
      if (section) {
        const canvas = await html2canvas(section, {
          scale: 4,
          useCORS: true,
          allowTaint: true,
          backgroundColor: '#ffffff',
          width: 800,
          height: section.scrollHeight,
          scrollX: 0,
          scrollY: 0,
          logging: false,
          removeContainer: true
        });

        const imgData = canvas.toDataURL('image/png', 1.0);
        const imgWidth = 210;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;

        if (i > 0) { pdf.addPage(); }
        pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      }
    }
    document.body.removeChild(tempDiv);

    const fileName = `SCM_진단보고서_${companyName}_${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('PDF 생성 중 오류 발생:', error);
    throw new Error('PDF 생성에 실패했습니다.');
  }
}; 