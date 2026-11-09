# Green Concrete — PMV Command Center

A secure, responsive **Next.js 15 + Supabase** web application for the Green Concrete PMV team. Designed for deployment on **Vercel**.

## Implemented

- Supabase email/password authentication with signup, email verification, password reset, and sign out
- Pending-approval access gate (new signups get `viewer` / disabled)
- Four roles: `admin`, `manager`, `editor`, `viewer`
- Site-scoped authorization enforced **in the database** with Row Level Security (not only in UI)
- Administrator page to approve accounts, change roles, and grant site access
- Overview: equipment KPIs, running fleet, project-site distribution, asset-type chart, condition report, workforce/shift totals, job-card weekly trends
- Assets: server-backed register, searchable Excel-like multi-select filters for site/type/status, CSV export, add/edit
- Manpower: server-backed personnel register, day/night shifts, copy employee ID, CSV export, add/edit, charts
- Job cards: maintenance tracking, open/closed/waiting states, maintenance type, analytics, CSV export, add/edit
- Server-authenticated dashboard and scoped Supabase queries
- Responsive layout for desktop and mobile
- Change audit table (DB triggers log write operation, actor, entity, ID and time)
- Health check at `/api/health`

## Connected Supabase project

Project URL: `https://zatngqezscflkxzmsmxt.supabase.co`

Already created in this project with RLS: `profiles`, `site_access`, `assets`, `manpower`, `job_cards`, `audit_events`.

### Configuration files — exact requirements

Create `.env.local` **only for local development** (copy `.env.example`):

```
NEXT_PUBLIC_SUPABASE_URL=https://zatngqezscflkxzmsmxt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=<the sb_publishable_ key from Supabase Settings > API Keys>
```

Both are intentionally frontend-safe publishable credentials. The key **does not bypass RLS**. Do **not** add `service_role`, `sb_secret_` or a Postgres password to any client-exposed variables.

In Vercel → Project → Settings → Environment Variables, add the **same two** variable names for Production, Preview, and Development. No other secret environment variables are needed for this app as implemented.

Files: `.env.example` is safe to commit; `.env.local` must never be committed. `.gitignore` excludes all `.env` files and private import data.

## First administrator — required one-time setup

1. In Supabase → Authentication → URL Configuration, add `http://localhost:3000/auth/callback` and the deployed URL, e.g. `https://YOUR-VERCEL-DOMAIN.vercel.app/auth/callback` to allowed redirect URLs. Set Site URL to your production URL when live.
2. Create your own account via the **Request account** tab on the login page. Verify your email if confirmation is enabled.
3. Supabase SQL Editor: **replace the placeholder with your exact login email** and execute:

```sql
update public.profiles
set role = 'admin', enabled = true
where user_id = (select id from auth.users where lower(email) = lower('YOUR_LOGIN_EMAIL@COMPANY.COM'));
```

This can only be done by the database owner through the SQL Editor. A regular signup cannot self-grant Admin.
4. Sign in again. The **User Access** page is now available. Approve colleagues and assign their permitted site(s).

Roles: Admin → all sites, CRUD, user control; Manager/Editor → CRUD in assigned sites; Viewer → read-only in assigned sites; disabled users → no access. The UI intentionally has no delete buttons (data deletion is protected by RLS but administrative deletion via API is still technically permitted for managers/editors in their sites; see note below).

## Load existing PMV data

The original offline HTML was parsed into exactly **628 asset rows** and **88 manpower assignment rows** (7 site groups, day/night), keeping the original source values.

The import SQL contains internal employee names and IDs, so it is **distributed separately and excluded from GitHub**. After a private backup, run `PMV_Private_Data_Import.sql` in Supabase SQL Editor. It uses a unique `source_key`, and repeating it updates those same legacy rows rather than creating duplicates.

**Important:** The live DB initially contains no imported assets/manpower; counts will show zero until you execute that separate import. The legacy source HTML itself is not served from Vercel, because it embeds workforce records and lacks authentication.

## Develop and test locally

Requires Node 20.9+ and npm.

```bash
npm install
cp .env.example .env.local
# edit .env.local to paste your publishable key
npm run dev
```

Open http://localhost:3000; run `npm run typecheck` and `npm run build` before deploying. The deployable app has no custom server and uses the Vercel-supported Next.js App Router.

## Deploy to Vercel with GitHub

1. Upload this project’s **source files** to your repository `Ishan342/pmv-` on `main`. In Vercel, click **Add New → Project → Import Git Repository** and select `Ishan342/pmv-`.
2. Framework: **Next.js** (auto-detected). Root Directory: repository root (if files are at repo root). Build: `npm run build`; output: Next.js default.
3. Add the two `NEXT_PUBLIC_...` environment variables in Vercel before deploying.
4. Deploy, then add the production callback URL in Supabase Auth URL Configuration.
5. Register your admin account, promote it in SQL Editor as shown above, and optionally import private SQL data.

After initial setup, commits to `main` automatically trigger production deployments through Vercel Git integration (if enabled).

## Privacy and access precautions

- The original PMV employee data file and the private data-import SQL must **never** be committed to the public `pmv-` repository.
- Do not allow public signup indefinitely unless new accounts truly need to request access. All new signups are disabled in the DB, but they can still create Auth user records; consider disabling self-signup in Supabase Auth once staff invitations are in place.
- Publishable key can appear in frontend source and is not itself a secret. Data security depends on Supabase RLS policies and staff authentication.
- The database currently allows Manager/Editor to delete rows via API in authorized sites. The UI intentionally does not offer deletion; tighten RLS delete policies to Admin-only if irreversible deletion must be prohibited to those roles.
- The audit log is a **basic change ledger**, not a full before/after revision history. Backups and recovery should be configured in Supabase for production.
- Legacy asset statuses and site spellings were preserved as-is, including variants. Normalization can be implemented later without losing source detail.

## Further development before company-wide rollout

Recommended next: site aliases, full action-level audit with before/after changes, asset transfer history, job-card time calculations (RFR vs JC), supervisor approvals, import UI, automated tests, granular permissions for deletion, and monitoring/alerting.

## Verification note

Supabase: the six tables were created and checked for RLS. The Supabase security advisor reported no remaining warnings after revoking access to an existing privileged public function.

The application source is prepared for Vercel. A complete `npm install`, `npm run build` and authenticated browser end-to-end test still need to succeed before marking the deployment production-ready.
