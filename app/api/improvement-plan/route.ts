import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '../../lib/db';
import { getRecommendedItems } from '../../lib/scm-framework';

// GET: 개선계획 조회 (survey_result_id 기반)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const resultId = searchParams.get('result_id');

    if (resultId) {
      const plans = await query(
        'SELECT * FROM improvement_plans WHERE survey_result_id = $1 ORDER BY priority_order ASC',
        [resultId]
      );
      return NextResponse.json({ success: true, plans });
    }

    const plans = await query('SELECT * FROM improvement_plans ORDER BY created_at DESC');
    return NextResponse.json({ success: true, plans });
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
      if (!categoryScores || totalScore === undefined) {
        return NextResponse.json({ success: false, message: '진단 데이터가 필요합니다.' }, { status: 400 });
      }

      const recommended = getRecommendedItems(categoryScores, totalScore);
      const priorityOrder: Record<string, number> = { high: 1, medium: 2, low: 3 };

      // 기존 자동 생성 계획 삭제
      if (survey_result_id) {
        await execute('DELETE FROM improvement_plans WHERE survey_result_id = $1', [survey_result_id]);
      }

      if (recommended.length > 0) {
        const values: any[] = [];
        const placeholders: string[] = [];
        let idx = 1;
        for (let i = 0; i < recommended.length; i++) {
          const item = recommended[i];
          placeholders.push(
            `($${idx}, $${idx+1}, $${idx+2}, $${idx+3}, $${idx+4}, $${idx+5}, $${idx+6}, $${idx+7}, $${idx+8}, $${idx+9}, $${idx+10}, $${idx+11}, $${idx+12})`
          );
          values.push(
            survey_result_id || null, item.id, item.area, item.areaKey,
            item.category, item.categoryKey, item.title, item.description,
            JSON.stringify(item.actions), JSON.stringify(item.kpis),
            item.priority, (priorityOrder[item.priority] || 2) * 100 + i,
            new Date().toISOString()
          );
          idx += 13;
        }
        try {
          await execute(
            `INSERT INTO improvement_plans (survey_result_id, framework_item_id, area, area_key, category, category_key, title, description, actions, kpis, priority, priority_order, created_at) VALUES ${placeholders.join(', ')}`,
            values
          );
        } catch (e) {
          return NextResponse.json({
            success: true,
            plans: recommended,
            storage: 'local',
            message: '테이블 미생성 - 로컬 데이터 반환'
          });
        }
      }

      return NextResponse.json({
        success: true,
        plans: recommended,
        count: recommended.length,
        storage: 'database'
      });
    }

    if (action === 'add' && plan) {
      const data = await queryOne(
        `INSERT INTO improvement_plans (survey_result_id, title, description, actions, kpis, priority, status, progress, assigned_to, notes, created_at)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *`,
        [
          plan.survey_result_id || null, plan.title, plan.description,
          JSON.stringify(plan.actions || []), JSON.stringify(plan.kpis || []),
          plan.priority || 'medium', plan.status || 'pending', plan.progress || 0,
          plan.assigned_to || '', plan.notes || '', new Date().toISOString()
        ]
      );
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
    const { id, ...updateFields } = body;

    if (!id) {
      return NextResponse.json({ success: false, message: 'ID가 필요합니다.' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    for (const [key, value] of Object.entries(updateFields)) {
      if (key === 'actions' || key === 'kpis') {
        setClauses.push(`${key} = $${idx++}`);
        values.push(JSON.stringify(value));
      } else {
        setClauses.push(`${key} = $${idx++}`);
        values.push(value);
      }
    }
    setClauses.push(`updated_at = $${idx++}`);
    values.push(new Date().toISOString());
    values.push(id);

    const data = await queryOne(
      `UPDATE improvement_plans SET ${setClauses.join(', ')} WHERE id = $${idx} RETURNING *`,
      values
    );

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

    await execute('DELETE FROM improvement_plans WHERE id = $1', [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
