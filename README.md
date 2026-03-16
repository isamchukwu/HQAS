# Smart Quotation System Starter

This is the Batch 1 starter project for the Smart Quotation System.

## What is included
- Next.js app router scaffold
- Supabase auth/session helpers
- Customer, item, and quote API routes
- Manual quote creation flow
- Quote detail page
- SQL migration for Supabase

## Setup
1. Create a Supabase project.
2. Run the SQL in `db/migrations/0001_init.sql` inside the Supabase SQL editor.
3. Copy `.env.example` to `.env.local` and fill in your Supabase keys.
4. Install dependencies:
   ```bash
   npm install
   ```
5. Start the app:
   ```bash
   npm run dev
   ```
6. Open the local URL shown in the terminal.

## Notes
- Row Level Security policies are not included yet.
- Export to Word/PDF is not included yet in this starter package.
- You should create at least one auth user in Supabase before testing login.
