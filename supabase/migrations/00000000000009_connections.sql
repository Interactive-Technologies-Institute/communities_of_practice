create table public.thread_contents (
    thread_id bigint references public.forum_threads on delete cascade not null,
    annexed_id bigint references public.contents on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (thread_id, annexed_id)
);
create table public.thread_events (
    thread_id bigint references public.forum_threads on delete cascade not null,
    annexed_id bigint references public.events on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (thread_id, annexed_id)
);
create table public.thread_threads (
    thread_id bigint references public.forum_threads on delete cascade not null,
    annexed_id bigint references public.forum_threads on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (thread_id, annexed_id)
);
create table public.event_threads (
    event_id bigint references public.events on delete cascade not null,
    annexed_id bigint references public.forum_threads on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (event_id, annexed_id)
);

create table public.event_contents (
    event_id bigint references public.events on delete cascade not null,
    annexed_id bigint references public.contents on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (event_id, annexed_id)
);

create table public.event_events (
    event_id bigint references public.events on delete cascade not null,
    annexed_id bigint references public.events on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (event_id, annexed_id)
);

create table public.content_threads (
    content_id bigint references public.contents on delete cascade not null,
    annexed_id bigint references public.forum_threads on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (content_id, annexed_id)
);

create table public.content_events (
    content_id bigint references public.contents on delete cascade not null,
    annexed_id bigint references public.events on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (content_id, annexed_id)
);

create table public.content_contents (
    content_id bigint references public.contents on delete cascade not null,
    annexed_id bigint references public.contents on delete cascade not null,
    user_id uuid references public.profiles not null,
    inserted_at timestamptz not null default timezone('utc', now()),
    primary key (content_id, annexed_id)
);

alter type public.user_permission add value if not exists 'thread_contents.create';
alter type public.user_permission add value if not exists 'thread_contents.delete';
alter type public.user_permission add value if not exists 'thread_events.create';
alter type public.user_permission add value if not exists 'thread_events.delete';
alter type public.user_permission add value if not exists 'event_contents.create';
alter type public.user_permission add value if not exists 'event_contents.delete';
insert into public.role_permissions (role, permission)
values 
('user', 'thread_contents.create'),
('user', 'thread_contents.delete'),
('user', 'thread_events.create'),
('user', 'thread_events.delete'),
('user', 'event_contents.create'),
('user', 'event_contents.delete');
insert into public.role_permissions (role, permission)
values 
('moderator', 'thread_contents.create'),
('moderator', 'thread_contents.delete'),
('moderator', 'thread_events.create'),
('moderator', 'thread_events.delete'),
('moderator', 'event_contents.create'),
('moderator', 'event_contents.delete');

insert into public.role_permissions (role, permission)
values 
('admin', 'thread_contents.create'),
('admin', 'thread_contents.delete'),
('admin', 'thread_events.create'),
('admin', 'thread_events.delete'),
('admin', 'event_contents.create'),
('admin', 'event_contents.delete');
alter table public.thread_contents enable row level security;
alter table public.thread_events enable row level security;
alter table public.event_contents enable row level security;
create policy "Allow read access to thread-content links"
on public.thread_contents
for select
using (true);
create policy "Allow users to create thread-content links"
on public.thread_contents
for insert
with check (
  auth.uid() = user_id
  and (select authorize('thread_contents.create'))
);
create policy "Allow users to delete their thread-content links"
on public.thread_contents
for delete
using (
  auth.uid() = user_id
  and (select authorize('thread_contents.delete'))
);
create policy "Allow read access to thread-event links"
on public.thread_events
for select
using (true);
create policy "Allow users to create thread-event links"
on public.thread_events
for insert
with check (
  auth.uid() = user_id
  and (select authorize('thread_events.create'))
);
create policy "Allow users to delete their thread-event links"
on public.thread_events
for delete
using (
  auth.uid() = user_id
  and (select authorize('thread_events.delete'))
);
create policy "Allow read access to event-content links"
on public.event_contents
for select
using (true);
create policy "Allow users to create event-content links"
on public.event_contents
for insert
with check (
  auth.uid() = user_id
  and (select authorize('event_contents.create'))
);
create policy "Allow users to delete their event-content links"
on public.event_contents
for delete
using (
  auth.uid() = user_id
  and (select authorize('event_contents.delete'))
);

