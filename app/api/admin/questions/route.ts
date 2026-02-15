import { NextResponse } from 'next/server';
import { supabase } from '../../../lib/supabase';

// GET: 설문 질문 목록 조회
export async function GET() {
  try {
    const { data: questions, error } = await supabase
      .from('category_question')
      .select('*')
      .order('category_id', { ascending: true })
      .order('question_id', { ascending: true });

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    const { data: categories, error: catError } = await supabase
      .from('category')
      .select('*')
      .order('id', { ascending: true });

    if (catError) {
      return NextResponse.json({ success: false, message: catError.message }, { status: 500 });
    }

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

    const { data, error } = await supabase
      .from('category_question')
      .insert({
        question_id,
        category_id: Number(category_id),
        question,
        weight: weight || 3,
        isactive: true
      })
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

// PUT: 질문 수정
export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const { question_id, category_id, question, weight, isactive } = body;

    if (!question_id) {
      return NextResponse.json({ success: false, message: 'question_id가 필요합니다.' }, { status: 400 });
    }

    const updateData: any = {};
    if (category_id !== undefined) updateData.category_id = Number(category_id);
    if (question !== undefined) updateData.question = question;
    if (weight !== undefined) updateData.weight = weight;
    if (isactive !== undefined) updateData.isactive = isactive;

    const { data, error } = await supabase
      .from('category_question')
      .update(updateData)
      .eq('question_id', question_id)
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

// DELETE: 질문 삭제 (비활성화)
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const questionId = searchParams.get('question_id');

    if (!questionId) {
      return NextResponse.json({ success: false, message: 'question_id가 필요합니다.' }, { status: 400 });
    }

    const { error } = await supabase
      .from('category_question')
      .update({ isactive: false })
      .eq('question_id', questionId);

    if (error) {
      return NextResponse.json({ success: false, message: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true, message: '질문이 비활성화되었습니다.' });
  } catch (error) {
    return NextResponse.json({ success: false, message: '서버 오류' }, { status: 500 });
  }
}
