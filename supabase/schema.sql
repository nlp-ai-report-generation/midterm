-- Supabase DB 스키마: AI 강의 분석 리포트

-- 사용자 설정
create table if not exists user_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  role text check (role in ('operator', 'instructor')),
  instructor_name text,
  api_key_hash text, -- 암호화된 API 키
  model text default 'gpt-4o-mini',
  temperature real default 0.1,
  chunk_minutes int default 30,
  overlap_minutes int default 5,
  use_calibrator boolean default true,
  custom_prompt text default '',
  created_at timestamptz default now(),
  updated_at timestamptz default now(),
  unique(user_id)
);

-- 평가 결과
create table if not exists evaluations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  lecture_date text not null,
  model text not null, -- gpt4o-mini, opus, sonnet
  weighted_average real,
  weighted_total real,
  category_averages jsonb default '{}',
  category_results jsonb default '[]',
  strengths jsonb default '[]',
  improvements jsonb default '[]',
  recommendations jsonb default '[]',
  report_markdown text default '',
  metadata jsonb default '{}',
  created_at timestamptz default now()
);

-- 연동 토큰 (Google Drive, Notion)
create table if not exists integrations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade,
  provider text not null check (provider in ('google_drive', 'notion')),
  access_token text,
  refresh_token text,
  extra jsonb default '{}', -- notion_database_id 등
  connected_at timestamptz default now(),
  unique(user_id, provider)
);

-- RLS 정책: 사용자는 자기 데이터만 접근
alter table user_settings enable row level security;
alter table evaluations enable row level security;
alter table integrations enable row level security;

create policy "Users can manage own settings" on user_settings
  for all using (auth.uid() = user_id);

create policy "Users can manage own evaluations" on evaluations
  for all using (auth.uid() = user_id);

create policy "Users can manage own integrations" on integrations
  for all using (auth.uid() = user_id);
