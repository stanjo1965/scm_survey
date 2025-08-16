// scripts/initSupabase.ts
import { createTables } from '../lib/supabase.ts';

async function initSupabase() {
  try {
    console.log('Supabase 초기화 중...');
    await createTables();
    console.log('✅ Supabase 테이블 생성 완료');
  } catch (err) {
    console.error('❌ Supabase 초기화 실패:', err);
    process.exit(1);
  }
}

initSupabase();