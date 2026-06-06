-- Ensure the tags table has a colour column.
-- Tags store an optional hex colour (e.g. '#3b82f6'); null falls back to the
-- default accent styling in the UI.
alter table tags add column if not exists color text;
