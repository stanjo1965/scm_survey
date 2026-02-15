// SCM 개선 프레임워크 - SCOR 모델 기반 종합 개선 항목 데이터

export interface ImprovementItem {
  id: string;
  area: string;        // 대영역
  areaKey: string;     // 대영역 키
  category: string;    // 중분류
  categoryKey: string; // 중분류 키 (survey 카테고리와 매핑)
  title: string;       // 개선 항목 제목
  description: string; // 상세 설명
  actions: string[];   // 구체적 실행 항목
  kpis: string[];      // 핵심 성과 지표
  priority: 'high' | 'medium' | 'low';
  scoreThreshold: number; // 이 점수 이하면 권장
}

export interface ImprovementArea {
  key: string;
  title: string;
  description: string;
  icon: string;
  items: ImprovementItem[];
}

// 1. 핵심 프로세스 및 운영 효율화 (SCOR 모델 기반)
const scorProcessItems: ImprovementItem[] = [
  // Plan (계획)
  {
    id: 'scor_plan_01',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '계획 (Plan)',
    categoryKey: 'planning',
    title: '수요 예측 정확도 향상',
    description: '수요와 공급의 균형을 맞추기 위한 수요 예측 체계를 고도화합니다.',
    actions: [
      '과거 판매 데이터 기반 통계적 예측 모델 도입',
      '시장 트렌드 및 외부 변수를 고려한 예측 시나리오 수립',
      '예측 오차율 모니터링 체계 구축 (MAPE, MAD 지표 활용)',
      '수요 예측 회의 주기적 개최 (주간/월간)',
      'AI/ML 기반 수요 예측 솔루션 검토'
    ],
    kpis: ['수요 예측 정확도 (MAPE)', '재고 부족률', '과잉 재고 비율'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_plan_02',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '계획 (Plan)',
    categoryKey: 'planning',
    title: 'S&OP 프로세스 체계화',
    description: 'Sales & Operations Planning 프로세스를 체계적으로 운영하여 부서 간 정렬을 강화합니다.',
    actions: [
      'S&OP 월간 회의체 구성 및 운영 규칙 수립',
      '판매, 생산, 구매, 물류 부서 간 데이터 공유 체계 구축',
      '수요-공급 Gap 분석 프로세스 정립',
      'S&OP 의사결정 에스컬레이션 기준 마련',
      '통합 대시보드를 통한 실시간 모니터링'
    ],
    kpis: ['S&OP 계획 달성률', '부서 간 계획 일치율', '의사결정 소요 시간'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_plan_03',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '계획 (Plan)',
    categoryKey: 'planning',
    title: '재고 계획 최적화',
    description: '적정 재고 수준을 유지하고 재고 비용을 최소화하는 계획 체계를 수립합니다.',
    actions: [
      'ABC 분류 기반 차별적 재고 관리 정책 수립',
      '안전 재고(Safety Stock) 산정 기준 마련',
      '재주문점(ROP) 자동 산출 시스템 도입',
      '재고 회전율 목표 설정 및 모니터링',
      '유휴 재고 및 불용 재고 관리 프로세스 정립'
    ],
    kpis: ['재고 회전율', '재고 보유일수', '재고 정확도'],
    priority: 'medium',
    scoreThreshold: 3.0
  },

  // Source (조달)
  {
    id: 'scor_source_01',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '조달 (Source)',
    categoryKey: 'procurement',
    title: '공급업체 관리 체계 구축',
    description: '공급업체 평가, 선정, 관리를 위한 체계적인 프로세스를 구축합니다.',
    actions: [
      '공급업체 평가 기준 수립 (품질, 가격, 납기, 서비스)',
      '공급업체 정기 평가 체계 운영 (분기/반기)',
      '핵심 공급업체 전략적 파트너십 프로그램 운영',
      '공급업체 리스크 평가 및 대응 체계 마련',
      '신규 공급업체 발굴 및 등록 프로세스 표준화'
    ],
    kpis: ['공급업체 납기 준수율', '공급업체 품질 합격률', '공급업체 다변화 비율'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_source_02',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '조달 (Source)',
    categoryKey: 'procurement',
    title: '구매 프로세스 표준화',
    description: '구매 요청부터 결제까지의 프로세스를 표준화하고 자동화합니다.',
    actions: [
      'P2P(Procure-to-Pay) 프로세스 표준 정의',
      '전자 구매 시스템(e-Procurement) 도입 검토',
      '구매 승인 권한 및 결재 기준 마련',
      '계약 관리 체계(CLM) 도입',
      '구매 비용 분석 및 절감 목표 설정'
    ],
    kpis: ['구매 리드타임', '구매 비용 절감율', 'PO 자동화율'],
    priority: 'medium',
    scoreThreshold: 3.0
  },
  {
    id: 'scor_source_03',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '조달 (Source)',
    categoryKey: 'procurement',
    title: '멀티 소싱 전략 수립',
    description: '공급 리스크를 분산하기 위한 다변화 조달 전략을 수립합니다.',
    actions: [
      '핵심 품목별 듀얼/멀티 소싱 정책 수립',
      '지역별 공급 기반 분석 및 다각화',
      '근거리 소싱(Near-shoring) 가능성 검토',
      '대체 공급원 데이터베이스 구축',
      '긴급 조달 프로세스 마련'
    ],
    kpis: ['단일 소싱 비율', '공급 중단 발생 횟수', '대체 공급원 확보율'],
    priority: 'medium',
    scoreThreshold: 3.0
  },

  // Make (생산)
  {
    id: 'scor_make_01',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '생산 (Make)',
    categoryKey: 'production',
    title: '생산 일정 관리 고도화',
    description: '생산 계획 준수율을 높이고 리드 타임을 단축합니다.',
    actions: [
      '생산 계획 대비 실적 모니터링 체계 구축',
      '병목(Bottleneck) 공정 분석 및 개선',
      '작업 지시 시스템(MES) 도입 또는 고도화',
      '생산 리드타임 단축을 위한 공정 개선',
      '설비 가동률(OEE) 모니터링 및 개선'
    ],
    kpis: ['생산 계획 준수율', '제조 리드타임', '설비 가동률(OEE)'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_make_02',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '생산 (Make)',
    categoryKey: 'production',
    title: '품질 관리 체계 강화',
    description: '제품 품질을 보장하기 위한 체계적인 품질 관리 프로세스를 구축합니다.',
    actions: [
      '입고 검사, 공정 검사, 출하 검사 기준 정립',
      'SPC(통계적 공정관리) 도입',
      '불량 원인 분석(5Why, 특성요인도) 프로세스 정립',
      '품질 비용(COQ) 측정 및 관리',
      '협력업체 품질 관리 프로그램 운영'
    ],
    kpis: ['불량률', '공정 불량률', '고객 클레임 건수', '품질 비용 비율'],
    priority: 'medium',
    scoreThreshold: 3.0
  },

  // Deliver (배송/물류)
  {
    id: 'scor_deliver_01',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '배송 (Deliver)',
    categoryKey: 'logistics',
    title: '배송 정시율 향상',
    description: '주문 관리, 운송 및 유통 프로세스를 최적화하여 정시 배송률을 높입니다.',
    actions: [
      '주문-배송 프로세스(OTC) 표준화',
      '배송 추적 시스템(TMS) 도입 또는 고도화',
      '배송 루트 최적화',
      '라스트 마일 배송 효율화',
      '배송 지연 원인 분석 및 개선 체계 구축'
    ],
    kpis: ['정시 배송률(OTIF)', '주문-배송 리드타임', '배송 비용 비율'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_deliver_02',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '배송 (Deliver)',
    categoryKey: 'logistics',
    title: '물류 비용 절감',
    description: '운송, 보관, 하역 등 물류 비용을 체계적으로 분석하고 절감합니다.',
    actions: [
      '물류 비용 항목별 분석 체계 구축',
      '운송 모드(모달) 최적화',
      '창고 운영 효율화 (WMS 도입)',
      '물류 아웃소싱(3PL) 효과성 평가',
      '통합 물류 비용 관리 대시보드 구축'
    ],
    kpis: ['매출 대비 물류비 비율', '운송 비용 단가', '창고 활용률'],
    priority: 'medium',
    scoreThreshold: 3.0
  },

  // Enable (통합/지원)
  {
    id: 'scor_enable_01',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '통합 지원 (Enable)',
    categoryKey: 'integration',
    title: 'SCM 통합 정보 시스템 구축',
    description: '공급망 전반을 아우르는 통합 정보 시스템을 구축하여 가시성을 확보합니다.',
    actions: [
      'ERP 시스템 SCM 모듈 활용도 평가 및 개선',
      '부서 간 데이터 연동 체계(API/EDI) 구축',
      '실시간 공급망 가시성(Visibility) 대시보드 구축',
      '마스터 데이터 관리(MDM) 체계 정립',
      'SCM 컨트롤 타워 구성 및 운영'
    ],
    kpis: ['시스템 통합률', '데이터 정확도', '정보 조회 응답 시간'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'scor_enable_02',
    area: '핵심 프로세스 최적화',
    areaKey: 'scor',
    category: '통합 지원 (Enable)',
    categoryKey: 'integration',
    title: '비즈니스 규칙 및 규정 준수 관리',
    description: '공급망 운영 관련 비즈니스 규칙과 규정 준수를 체계적으로 관리합니다.',
    actions: [
      'SCM 운영 규정 및 SOP 문서화',
      '규정 준수 체크리스트 운영',
      '내부 감사 프로그램 수립 및 실행',
      '무역/관세 규정 준수 체계 구축',
      '데이터 보안 및 개인정보 보호 정책 수립'
    ],
    kpis: ['규정 준수율', '감사 지적 건수', 'SOP 준수율'],
    priority: 'low',
    scoreThreshold: 2.5
  }
];

// 2. 데이터 기반 문제 해결
const dataAnalysisItems: ImprovementItem[] = [
  {
    id: 'data_rca_01',
    area: '데이터 기반 문제 해결',
    areaKey: 'data',
    category: '근본 원인 분석',
    categoryKey: 'logistics',
    title: '배송 지연 근본 원인 분석 체계 구축',
    description: '공급업체 병목, 부정확한 리드 타임, 문서 흐름 비효율 등 배송 지연의 근본 원인을 분석하고 해결합니다.',
    actions: [
      '배송 지연 유형별 분류 및 데이터 수집 체계 구축',
      '공급업체 리드타임 정확도 모니터링',
      '주문-출하 프로세스 병목 구간 분석',
      '문서 흐름(통관, 인보이스 등) 디지털화',
      '지연 발생 시 에스컬레이션 프로세스 마련'
    ],
    kpis: ['배송 지연 발생률', '지연 원인별 비율', '평균 지연 해소 시간'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'data_rca_02',
    area: '데이터 기반 문제 해결',
    areaKey: 'data',
    category: '근본 원인 분석',
    categoryKey: 'planning',
    title: '재고 부족(Stockout) 방지 체계',
    description: '수요 계획 실패나 공급 조정 문제로 발생하는 품절을 방지하는 체계를 구축합니다.',
    actions: [
      '재고 부족 발생 이력 데이터 분석',
      '수요 변동성 분석 및 안전 재고 재산정',
      '공급업체 납기 변동 모니터링',
      '재고 가시성 시스템 구축 (다계층)',
      '자동 재주문 알림 시스템 도입'
    ],
    kpis: ['품절 발생 빈도', '서비스 수준(Fill Rate)', '재고 부족 비용'],
    priority: 'high',
    scoreThreshold: 3.0
  },
  {
    id: 'data_rca_03',
    area: '데이터 기반 문제 해결',
    areaKey: 'data',
    category: '근본 원인 분석',
    categoryKey: 'planning',
    title: '예측 오류 개선',
    description: '부정확한 수요 예측으로 인한 비용 증가 및 서비스 수준 저하를 방지합니다.',
    actions: [
      '예측 오차 측정 체계(MAPE, Bias) 정립',
      '예측 오차 원인 분류 및 분석',
      '예측 모델 정기 검토 및 업데이트',
      '협업 예측(Collaborative Forecasting) 도입',
      '신제품/프로모션 예측 프로세스 별도 수립'
    ],
    kpis: ['예측 정확도(MAPE)', '예측 편향(Bias)', '예측 부가 가치(FVA)'],
    priority: 'medium',
    scoreThreshold: 3.5
  },
  {
    id: 'data_dash_01',
    area: '데이터 기반 문제 해결',
    areaKey: 'data',
    category: '대시보드 모니터링',
    categoryKey: 'integration',
    title: 'SCM 성과 대시보드 구축',
    description: '공급망 핵심 지표를 실시간으로 모니터링할 수 있는 대시보드를 구축합니다.',
    actions: [
      '핵심 KPI 정의 및 데이터 소스 연결',
      '공급업체 성과 대시보드 (PO수, 납기, 리드타임)',
      '재고 현황 대시보드 (기초/기말 재고, 지역별)',
      '배송 성과 대시보드 (정시율, 비용)',
      '이상 징후 알림(Alert) 기능 구현'
    ],
    kpis: ['대시보드 활용 빈도', '이상 징후 탐지율', 'KPI 달성률'],
    priority: 'medium',
    scoreThreshold: 3.0
  }
];

// 3. ESG 및 공급망 리스크 관리
const esgRiskItems: ImprovementItem[] = [
  {
    id: 'esg_eval_01',
    area: 'ESG 및 리스크 관리',
    areaKey: 'esg',
    category: '공급망 ESG 평가',
    categoryKey: 'procurement',
    title: '협력사 ESG 평가 체계 구축',
    description: '협력사의 환경, 사회, 지배구조 리스크를 평가하고 개선을 지원합니다.',
    actions: [
      '협력사 ESG 평가 기준 및 체크리스트 개발',
      '환경(폐기물, 유해물질) 관리 수준 평가',
      '사회(노동, 인권, 안전보건) 리스크 진단',
      '지배구조(윤리경영, 반부패) 평가',
      'ESG 개선 가이드라인 제공 및 교육 지원'
    ],
    kpis: ['협력사 ESG 평가 완료율', '고위험 협력사 비율', 'ESG 개선 이행률'],
    priority: 'medium',
    scoreThreshold: 3.0
  },
  {
    id: 'esg_carbon_01',
    area: 'ESG 및 리스크 관리',
    areaKey: 'esg',
    category: '탄소 배출량 관리',
    categoryKey: 'integration',
    title: 'Scope 1/2/3 탄소 배출량 관리',
    description: '공급망 전반의 탄소 배출량을 측정하고 감축 목표를 수립합니다.',
    actions: [
      'Scope 1 (직접 배출) 현황 측정',
      'Scope 2 (간접 배출 - 전력) 현황 측정',
      'Scope 3 (가치사슬 배출) 현황 파악',
      '탄소 감축 목표 설정 (SBTi 기준)',
      '주요 협력사 탄소 배출 데이터 수집 체계 구축'
    ],
    kpis: ['총 탄소 배출량', '탄소 배출 감축률', 'Scope 3 데이터 수집 범위'],
    priority: 'medium',
    scoreThreshold: 3.0
  },
  {
    id: 'esg_resilience_01',
    area: 'ESG 및 리스크 관리',
    areaKey: 'esg',
    category: '회복탄력성 강화',
    categoryKey: 'procurement',
    title: '공급망 리스크 관리 및 BCP 수립',
    description: '재난, 팬데믹 등 공급망 중단에 대비한 회복탄력성을 강화합니다.',
    actions: [
      '공급망 리스크 맵핑 및 시나리오 분석',
      '업무 연속성 계획(BCP) 수립',
      '안전 재고 정책 재검토',
      '멀티 소싱 및 지역화(Near-shoring) 전략 실행',
      '공급망 중단 시뮬레이션 훈련 실시'
    ],
    kpis: ['리스크 식별 건수', 'BCP 테스트 횟수', '공급 중단 복구 시간(RTO)'],
    priority: 'high',
    scoreThreshold: 3.5
  },
  {
    id: 'esg_transparency_01',
    area: 'ESG 및 리스크 관리',
    areaKey: 'esg',
    category: '투명성 확보',
    categoryKey: 'integration',
    title: '공급망 가치사슬 투명성 확보',
    description: '전체 가치 사슬에 걸쳐 정보를 투명하게 관리하고 이해관계자와 정렬합니다.',
    actions: [
      '공급망 다계층 맵핑 (Tier 1, 2, 3)',
      '이해관계자 커뮤니케이션 체계 구축',
      '공급망 정보 공유 플랫폼 구축',
      '공급망 추적성(Traceability) 시스템 도입',
      '정기 공급망 투명성 보고서 발행'
    ],
    kpis: ['공급망 맵핑 완료율 (Tier별)', '정보 공유 적시율', '추적 가능 품목 비율'],
    priority: 'low',
    scoreThreshold: 2.5
  }
];

// 4. 전략적 성숙도 및 인프라 고도화
const strategicItems: ImprovementItem[] = [
  {
    id: 'strat_maturity_01',
    area: '전략적 성숙도 제고',
    areaKey: 'strategic',
    category: '성숙도 로드맵',
    categoryKey: 'integration',
    title: 'SCM 성숙도 로드맵 수립',
    description: 'IT 시스템, 협업, 성과 관리 등 다양한 영역에서 성숙도를 진단하고 로드맵을 수립합니다.',
    actions: [
      'As-Is 성숙도 진단 결과 분석 및 갭 파악',
      'To-Be 성숙도 목표 수준 설정',
      '단기(6개월), 중기(1년), 장기(3년) 로드맵 수립',
      '영역별 성숙도 향상 과제 도출 및 우선순위 설정',
      '분기별 성숙도 재진단을 통한 개선 효과 측정'
    ],
    kpis: ['성숙도 레벨 변화', '과제 달성률', '투자 대비 성과(ROI)'],
    priority: 'high',
    scoreThreshold: 4.0
  },
  {
    id: 'strat_talent_01',
    area: '전략적 성숙도 제고',
    areaKey: 'strategic',
    category: '인재 확보 및 역량 강화',
    categoryKey: 'integration',
    title: 'SCM 전문 인재 확보 및 교육 체계 수립',
    description: '디지털 기술 역량과 SCM 전문성을 갖춘 인재를 확보하고 육성합니다.',
    actions: [
      'SCM 직무별 역량 모델(Competency Model) 정의',
      'SCM 전문 교육 프로그램 개발 (내부/외부)',
      '디지털 SCM 역량 강화 교육 (AI, 데이터분석 등)',
      'SCM 전문 자격증 취득 지원 (APICS CSCP/CPIM 등)',
      '핵심 인재 유지를 위한 경력개발 경로 설계'
    ],
    kpis: ['교육 이수율', '역량 평가 점수 향상률', '핵심 인재 이직률'],
    priority: 'medium',
    scoreThreshold: 3.0
  },
  {
    id: 'strat_automation_01',
    area: '전략적 성숙도 제고',
    areaKey: 'strategic',
    category: '프로세스 마이닝 및 자동화',
    categoryKey: 'integration',
    title: '프로세스 마이닝 및 자동화 도입',
    description: '병목 구간이나 대기 시간 등 운영상의 제약 사항을 자동으로 탐지하고 개선합니다.',
    actions: [
      '핵심 프로세스(주문처리, 조달, 배송) 마이닝 분석',
      '병목(Bottleneck) 및 대기 시간 자동 탐지',
      'RPA(로봇 프로세스 자동화) 도입 대상 선정',
      '워크플로우 자동화 구현',
      '프로세스 효율성 지속 모니터링 체계 구축'
    ],
    kpis: ['프로세스 사이클 타임', '자동화율', '프로세스 효율 개선율'],
    priority: 'medium',
    scoreThreshold: 3.0
  },
  {
    id: 'strat_digital_01',
    area: '전략적 성숙도 제고',
    areaKey: 'strategic',
    category: '디지털 전환',
    categoryKey: 'integration',
    title: 'SCM 디지털 전환 전략 수립',
    description: 'AI, IoT, 블록체인 등 디지털 기술을 활용한 공급망 고도화 전략을 수립합니다.',
    actions: [
      '디지털 전환 현황 진단 및 갭 분석',
      'AI/ML 활용 영역 식별 (수요예측, 품질관리 등)',
      'IoT 기반 실시간 모니터링 도입 검토',
      '블록체인 기반 추적성 도입 검토',
      '디지털 전환 투자 우선순위 및 로드맵 수립'
    ],
    kpis: ['디지털 성숙도 레벨', '디지털 기술 활용 프로세스 비율', 'IT 투자 대비 성과'],
    priority: 'low',
    scoreThreshold: 2.5
  }
];

// 전체 프레임워크 정의
export const scmImprovementAreas: ImprovementArea[] = [
  {
    key: 'scor',
    title: '핵심 프로세스 최적화 (SCOR 모델)',
    description: 'SCOR(Supply Chain Operations Reference) 모델 기반 6대 핵심 프로세스 최적화',
    icon: 'process',
    items: scorProcessItems
  },
  {
    key: 'data',
    title: '데이터 기반 문제 해결',
    description: '근본 원인 분석(Root Cause Analysis) 및 대시보드 모니터링을 통한 문제 해결',
    icon: 'data',
    items: dataAnalysisItems
  },
  {
    key: 'esg',
    title: 'ESG 및 공급망 리스크 관리',
    description: '환경·사회·지배구조(ESG) 평가 및 공급망 회복탄력성 강화',
    icon: 'esg',
    items: esgRiskItems
  },
  {
    key: 'strategic',
    title: '전략적 성숙도 제고',
    description: '성숙도 로드맵 수립, 인재 육성, 프로세스 자동화 및 디지털 전환',
    icon: 'strategy',
    items: strategicItems
  }
];

// 전체 항목 통합
export const allImprovementItems: ImprovementItem[] = [
  ...scorProcessItems,
  ...dataAnalysisItems,
  ...esgRiskItems,
  ...strategicItems
];

// 진단 점수 기반 추천 항목 생성
export function getRecommendedItems(
  categoryScores: Record<string, number>,
  totalScore: number
): ImprovementItem[] {
  const recommended: ImprovementItem[] = [];

  for (const item of allImprovementItems) {
    const categoryScore = categoryScores[item.categoryKey];
    if (categoryScore !== undefined && categoryScore <= item.scoreThreshold) {
      // 점수가 낮을수록 우선순위 높게 조정
      const adjustedPriority = categoryScore <= 2.0 ? 'high' :
        categoryScore <= 3.0 ? (item.priority === 'low' ? 'medium' : item.priority) :
        item.priority;
      recommended.push({ ...item, priority: adjustedPriority });
    }
  }

  // 전체 평균 점수가 낮으면 전략적 항목도 추가
  if (totalScore <= 3.0) {
    const strategicRecommendations = strategicItems.filter(
      item => !recommended.find(r => r.id === item.id)
    );
    recommended.push(...strategicRecommendations.map(item => ({ ...item, priority: 'high' as const })));
  }

  // 우선순위 정렬: high -> medium -> low
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommended.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return recommended;
}

// 카테고리키 -> 한글 매핑
export const categoryKeyMap: Record<string, string> = {
  planning: '계획 관리',
  procurement: '조달 관리',
  inventory: '재고 관리',
  production: '생산 관리',
  logistics: '물류 관리',
  integration: '통합 관리'
};
