import { NextResponse } from 'next/server';
import { supabase } from '../../lib/supabase';
import { getRecommendedItems, allImprovementItems } from '../../lib/scm-framework';

// GET: 개선계획 조회 (survey_result_id 기반)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('result_id');

    if (resultId) {
      // 특정 진단 결과에 대한 개선계획 조회
      const { data: plans, error } = await supabase
        .from('improvement_plans')
        .select('*')
        .eq('survey_result_id', resultId)
        .order('priority_order', { ascending: true });

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, plans });
    }

    // 전체 개선계획 조회
    const { data: plans, error } = await supabase
      .from('improvement_plans')
      .select('*')
      .order('created_at', { ascending: false });

    return NextResponse.json({ success: true, plans: plans || [] });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// POST: 개선계획 생성 (진단 결과 기반 자동 생성 또는 수동 추가)
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { action, survey_result_id, categoryScores, totalScore, plan } = body;

    if (action === 'generate') {
      // 진단 결과 기반 자동 생성
      if (!categoryScores || totalScore === undefined) {
        return NextResponse.json({ success: false, message: '진단 데이터가 필요합니다.' }, { status: 400 });
      }

      const recommended = getRecommendedItems(categoryScores, totalScore);
      const priorityOrder = { high: 1, medium: 2, low: 3 };

      const planRows = recommended.map((item, index) => ({
        survey_result_id: survey_result_id || null,
        framework_item_id: item.id,
        area: item.area,
        area_key: item.areaKey,
        category: item.category,
        category_key: item.categoryKey,
        title: item.title,
        description: item.description,
        actions: JSON.stringify(item.actions),
        kpis: JSON.stringify(item.kpis),
        priority: item.priority,
        priority_order: priorityOrder[item.priority] * 100 + index,
        status: 'pending',
        progress: 0,
        start_date: null,
        end_date: null,
        assigned_to: '',
        notes: '',
        created_at: new Date().toISOString()
      }));

      // 기존 자동 생성 계획 삭제 (같은 survey_result_id)
      if (survey_result_id) {
        await supabase
          .from('improvement_plans')
          .delete()
          .eq('survey_result_id', survey_result_id);
      }

      if (planRows.length > 0) {
        const { error } = await supabase
          .from('improvement_plans')
          .insert(planRows);

        if (error) {
          // 테이블이 없는 경우 localStorage 기반으로 반환
          return NextResponse.json({
            success: true,
            plans: recommended,
            storage: 'local',
            message: 'Supabase 테이블 미생성 - 로컬 데이터 반환'
          });
        }
      }

      return NextResponse.json({
        success: true,
        plans: recommended,
        count: recommended.length,
        storage: 'supabase'
      });
    }

    if (action === 'add' && plan) {
      // 수동 계획 추가
      const { data, error } = await supabase
        .from('improvement_plans')
        .insert({
          ...plan,
          created_at: new Date().toISOString()
        })
        .select()
        .single();

      if (error) {
        return NextResponse.json({ success: false, message: error.message }, { status: 500 });
      }

      return NextResponse.json({ success: true, data });
    }

    return NextResponse.json({ success: false, message: '잘못된 요청' }, { status: 400 });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// PUT: 개선계획 업데이트
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { id, ...updateData } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID가 필요합니다.' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('improvement_plans')
      .update({ ...updateData, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// DELETE: 개선계획 삭제
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('improvement_plans')
      .delete()
      .eq('id', id);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
