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
alter table public.thread_contents enable row level security;
alter table public.thread_events enable row level security;
alter table public.thread_threads enable row level security;
alter table public.event_contents enable row level security;
alter table public.event_events enable row level security;
alter table public.event_threads enable row level security;
alter table public.content_contents enable row level security;
alter table public.content_events enable row level security;
alter table public.content_threads enable row level security;
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
create policy "Allow read access to thread-thread links"
on public.thread_threads
for select
using (true);
create policy "Allow users to create thread-thread links"
on public.thread_threads
for insert
with check (
  auth.uid() = user_id
  and (select authorize('thread_threads.create'))
);
create policy "Allow users to delete their thread-thread links"
on public.thread_threads
for delete
using (
  auth.uid() = user_id
  and (select authorize('thread_threads.delete'))
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
create policy "Allow read access to event-event links"
on public.event_events
for select
using (true);
create policy "Allow users to create event-event links"
on public.event_events
for insert
with check (
  auth.uid() = user_id
  and (select authorize('event_events.create'))
);
create policy "Allow users to delete their event-event links"
on public.event_events
for delete
using (
  auth.uid() = user_id
  and (select authorize('event_events.delete'))
);
create policy "Allow read access to event-thread links"
on public.event_threads
for select
using (true);
create policy "Allow users to create event-thread links"
on public.event_threads
for insert
with check (
  auth.uid() = user_id
  and (select authorize('event_threads.create'))
);
create policy "Allow users to delete their event-thread links"
on public.event_threads
for delete
using (
  auth.uid() = user_id
  and (select authorize('event_threads.delete'))
);
create policy "Allow read access to content-content links"
on public.content_contents
for select
using (true);
create policy "Allow users to create content-content links"
on public.content_contents
for insert
with check (
  auth.uid() = user_id
  and (select authorize('content_contents.create'))
);
create policy "Allow users to delete their content-content links"
on public.content_contents
for delete
using (
  auth.uid() = user_id
  and (select authorize('content_contents.delete'))
);
create policy "Allow read access to content-event links"
on public.content_events
for select
using (true);
create policy "Allow users to create content-event links"
on public.content_events
for insert
with check (
  auth.uid() = user_id
  and (select authorize('content_events.create'))
);
create policy "Allow users to delete their content-event links"
on public.content_events
for delete
using (
  auth.uid() = user_id
  and (select authorize('content_events.delete'))
);
create policy "Allow read access to content-thread links"
on public.content_threads
for select
using (true);
create policy "Allow users to create content-thread links"
on public.content_threads
for insert
with check (
  auth.uid() = user_id
  and (select authorize('content_threads.create'))
);
create policy "Allow users to delete their content-thread links"
on public.content_threads
for delete
using (
  auth.uid() = user_id
  and (select authorize('content_threads.delete'))
);

