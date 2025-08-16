import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

console.log("client 생성 전")
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
console.log("client 생성 후")

// 데이터베이스 스키마
export const createTables = async () => {
  // survey_results 테이블
  await supabase.rpc('create_survey_results_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS survey_results (
        id SERIAL PRIMARY KEY,
        user_id VARCHAR(255) NOT NULL,
        company_id VARCHAR(255) NOT NULL,
        total_score DECIMAL(3,2),
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `
  });

  // survey_answers 테이블
  await supabase.rpc('create_survey_answers_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS survey_answers (
        id SERIAL PRIMARY KEY,
        survey_result_id INTEGER REFERENCES survey_results(id),
        question_id VARCHAR(255) NOT NULL,
        answer_value INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
  });

  // category_analysis 테이블
  await supabase.rpc('create_category_analysis_table', {
    sql: `
      CREATE TABLE IF NOT EXISTS category_analysis (
        id SERIAL PRIMARY KEY,
        survey_result_id INTEGER REFERENCES survey_results(id),
        category VARCHAR(255) NOT NULL,
        score DECIMAL(3,2) NOT NULL,
        max_score INTEGER DEFAULT 5,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `
  });
}; 