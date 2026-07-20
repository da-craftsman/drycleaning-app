# Supabase setup

This app runs entirely on local mock data (`src/lib/data/*.mock.ts`) until
`VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are set in `.env`. Nothing
here needs to run for local development.

To connect a real project:

1. Create a project at supabase.com.
2. Run `schema.sql` against it — either paste it into the SQL editor, or with
   the CLI:
   ```
   supabase link --project-ref <your-project-ref>
   supabase db push
   ```
3. Create two Storage buckets: `thumbnails` and `stain_photos`. The bucket
   policies are included as commented SQL at the bottom of `schema.sql` —
   uncomment and run them after the buckets exist.
4. Create an admin user: sign up normally via the app, then in the SQL
   editor run `update profiles set role = 'admin' where email = '...';`.
5. Copy `.env.example` to `.env` and fill in the project URL and anon key.

Once those env vars are set, `src/lib/data/*` automatically switches from
the mock adapters to real Supabase queries — no other code changes needed.
