import { NextResponse } from 'next/server';
import { query, queryOne, execute } from '../../../lib/db';

// GET: 설문 질문 목록 조회
export async function GET() {
  try {
    const questions = await query(
      'SELECT * FROM category_question ORDER BY category_id ASC, question_id ASC'
    );

    const categories = await query('SELECT * FROM category ORDER BY id ASC');

    return NextResponse.json({ success: true, questions, categories });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// POST: 새 질문 추가
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { question_id, category_id, question, weight } = body;

    if (!question_id || !category_id || !question) {
      return NextResponse.json({ success: false, message: '필수 항목을 입력해주세요.' }, { status: 400 });
    }

    const data = await queryOne(
      `INSERT INTO category_question (question_id, category_id, question, weight, isactive)
       VALUES ($1, $2, $3, $4, true) RETURNING *`,
      [question_id, Number(category_id), question, weight || 3]
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// PUT: 질문 수정
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { question_id, category_id, question, weight, isactive } = body;

    if (!question_id) {
      return NextResponse.json({ success: false, message: 'question_id가 필요합니다.' }, { status: 400 });
    }

    const setClauses: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (category_id !== undefined) { setClauses.push(`category_id = $${idx++}`); values.push(Number(category_id)); }
    if (question !== undefined) { setClauses.push(`question = $${idx++}`); values.push(question); }
    if (weight !== undefined) { setClauses.push(`weight = $${idx++}`); values.push(weight); }
    if (isactive !== undefined) { setClauses.push(`isactive = $${idx++}`); values.push(isactive); }

    if (setClauses.length === 0) {
      return NextResponse.json({ success: false, message: '수정할 데이터가 없습니다.' }, { status: 400 });
    }

    values.push(question_id);
    const data = await queryOne(
      `UPDATE category_question SET ${setClauses.join(', ')} WHERE question_id = $${idx} RETURNING *`,
      values
    );

    return NextResponse.json({ success: true, data });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}

// DELETE: 질문 삭제 (비활성화)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');

    if (!questionId) {
      return NextResponse.json({ success: false, message: 'question_id가 필요합니다.' }, { status: 400 });
    }

    await execute(
      'UPDATE category_question SET isactive = false WHERE question_id = $1',
      [questionId]
    );

    return NextResponse.json({ success: true, message: '질문이 비활성화되었습니다.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
