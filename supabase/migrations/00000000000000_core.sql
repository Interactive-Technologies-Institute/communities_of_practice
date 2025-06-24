/* CORE */
create extension if not exists moddatetime schema extensions;
create type public.moderation_status as enum (
	'pending',
	'changes_requested',
	'approved',
	'rejected'
);
create extension if not exists pg_cron;