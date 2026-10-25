# iORA Supabase Schema

This directory contains the database and storage schema for the iORA interior design website.

## Files
- [`schema.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/schema.sql): Complete SQL migration script covering:
  - **Tables**: `admin_users`, `portfolio_projects`, `shop_products`
  - **Indexes**: Query performance indexes for public filtering and ordering
  - **Triggers**: Automatic `updated_at` timestamps
  - **Row Level Security (RLS)**: Public read for published items, admin-only write/edit/delete
  - **Storage Buckets**: `portfolio` and `shop` public buckets with admin upload permissions

---

## How to Apply

1. Open your [Supabase Project Dashboard](https://supabase.com/dashboard).
2. Go to the **SQL Editor** tab from the left sidebar.
3. Click **New query**, paste the entire contents of [`schema.sql`](file:///Users/adil/KTs%20Works/adil/iORA/supabase/schema.sql), and click **Run**.
4. Confirm that the `portfolio` and `shop` buckets appear in **Storage** and the tables appear in **Table Editor**.

---

## Adding Your First Admin User

1. In Supabase Dashboard, create an account under **Authentication** -> **Users** (or sign up via the app).
2. Copy the user's `User UID` from the dashboard.
3. In the SQL Editor, grant admin access by running:
   ```sql
   insert into public.admin_users (user_id, email, role)
   values ('<PASTE-USER-UID-HERE>', '<user-email@example.com>', 'admin');
   ```
