create table notification_settings (
  id uuid primary key default uuid_generate_v4(),
  user_id uuid references auth.users not null,
  enabled_types text[] not null default array['system', 'learning', 'quiz'],
  sound_enabled boolean not null default true,
  vibration_enabled boolean not null default true,
  email_notifications boolean not null default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id)
);

-- Trigger to update updated_at timestamp
create or replace function update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger update_notification_settings_updated_at
  before update on notification_settings
  for each row
  execute function update_updated_at_column();
