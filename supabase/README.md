# iORA Supabase Schema & Maintenance

This directory contains the database and storage schema for the iORA interior design website.

## Files
- [`fix_rls_and_auth.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/fix_rls_and_auth.sql): **One-click synchronization fix** covering:
  - Row Level Security (RLS) policies allowing admin inserts, updates, and permanent deletes to sync to all visitors.
  - Storage bucket public upload/delete permissions for `portfolio` and `shop` buckets.
  - Repair of `auth.users` for `ksidanbasheer@gmail.com` (clears NULL tokens preventing 500 schema scan errors).
- [`add_homepage_tables.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/add_homepage_tables.sql): Tables and RLS policies for Homepage Carousel (`narrative_slides`) and What We Do (`what_we_do_services`).
- [`schema.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/schema.sql): Complete base schema definitions for all tables, indexes, triggers, and buckets.
- [`admin_auth_setup.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/admin_auth_setup.sql): Admin auth table definitions.

---

## Applying the Sync Fix (Recommended)

To ensure that portfolios and shop items uploaded or deleted through the admin panel are permanently synchronized and visible to all visitors:

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Click **New query**, paste the entire contents of [`fix_rls_and_auth.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/fix_rls_and_auth.sql), and click **Run**.
4. Confirm that the notice `iORA RLS and Admin Auth repaired successfully!` appears in the query results.
