-- SCM Survey Database Schema for AWS RDS PostgreSQL
-- Run this to initialize the scm database

CREATE TABLE IF NOT EXISTS category (
    id SERIAL PRIMARY KEY,
    key VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(200) NOT NULL
);

CREATE TABLE IF NOT EXISTS category_question (
    question_id VARCHAR(50) PRIMARY KEY,
    category_id INTEGER REFERENCES category(id),
    question TEXT NOT NULL,
    weight INTEGER DEFAULT 3,
    isactive BOOLEAN DEFAULT true
);

CREATE TABLE IF NOT EXISTS survey_results (
    id SERIAL PRIMARY KEY,
    user_email VARCHAR(255) DEFAULT '',
    user_name VARCHAR(200) DEFAULT '게스트',
    company_id VARCHAR(200),
    total_score NUMERIC(5,2) DEFAULT 0,
    industry VARCHAR(100),
    company_size VARCHAR(100),
    ai_analysis_json JSONB,
    ai_generated_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS survey_answers (
    id SERIAL PRIMARY KEY,
    survey_result_id INTEGER REFERENCES survey_results(id) ON DELETE CASCADE,
    question_id VARCHAR(50),
    answer_value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS category_analysis (
    id SERIAL PRIMARY KEY,
    survey_result_id INTEGER REFERENCES survey_results(id) ON DELETE CASCADE,
    category VARCHAR(50) NOT NULL,
    score NUMERIC(5,2) DEFAULT 0,
    max_score NUMERIC(5,2) DEFAULT 5,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS improvement_plans (
    id SERIAL PRIMARY KEY,
    survey_result_id INTEGER,
    framework_item_id VARCHAR(100),
    area VARCHAR(200),
    area_key VARCHAR(100),
    category VARCHAR(200),
    category_key VARCHAR(100),
    title VARCHAR(500),
    description TEXT,
    actions JSONB,
    kpis JSONB,
    priority VARCHAR(20) DEFAULT 'medium',
    priority_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    start_date DATE,
    end_date DATE,
    assigned_to VARCHAR(200) DEFAULT '',
    notes TEXT DEFAULT '',
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_improvement_plans (
    id SERIAL PRIMARY KEY,
    survey_result_id INTEGER,
    phase VARCHAR(20),
    phase_label VARCHAR(100),
    category_key VARCHAR(100),
    title VARCHAR(500),
    description TEXT,
    actions JSONB,
    kpis JSONB,
    expected_outcomes JSONB,
    priority VARCHAR(20) DEFAULT 'medium',
    estimated_budget VARCHAR(200),
    estimated_effort VARCHAR(200),
    order_index INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'pending',
    progress INTEGER DEFAULT 0,
    checked_actions JSONB,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_sessions (
    id SERIAL PRIMARY KEY,
    survey_result_id INTEGER,
    title VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ai_chat_messages (
    id SERIAL PRIMARY KEY,
    session_id INTEGER REFERENCES ai_chat_sessions(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(500),
    content TEXT,
    author VARCHAR(200),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_survey_answers_result ON survey_answers(survey_result_id);
CREATE INDEX IF NOT EXISTS idx_category_analysis_result ON category_analysis(survey_result_id);
CREATE INDEX IF NOT EXISTS idx_category_question_category ON category_question(category_id);
CREATE INDEX IF NOT EXISTS idx_survey_results_email_company ON survey_results(user_email, company_id);
CREATE INDEX IF NOT EXISTS idx_improvement_plans_result ON improvement_plans(survey_result_id);
CREATE INDEX IF NOT EXISTS idx_ai_improvement_plans_result ON ai_improvement_plans(survey_result_id);
CREATE INDEX IF NOT EXISTS idx_ai_chat_messages_session ON ai_chat_messages(session_id);
