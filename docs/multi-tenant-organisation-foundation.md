# Multi-Tenant Organisation Foundation

This stage moves VisionTech from one shared organisation dashboard toward route-based tenancy:

```text
/organisation/:organisationSlug
/organisation/:organisationSlug/members
/organisation/:organisationSlug/cohorts
/organisation/:organisationSlug/interventions
/organisation/:organisationSlug/opportunities
/organisation/:organisationSlug/reports
/organisation/:organisationSlug/settings
```

Legacy `/organisation/*` routes now redirect to the active organisation slug so existing links keep working.

## Supabase

Apply `supabase/migrations/202607290001_multi_tenant_organisation_foundation.sql` before enabling tenant-specific production data.

The migration creates:

- `organisations`
- `organisation_memberships`
- `organisation_branding`
- `organisation_settings`
- RLS helper functions for active members and organisation admins
- RLS policies for member visibility and admin-only configuration updates
- Indexes for slug lookup, membership checks, and RLS performance

## FastAPI / Render

The backend should add tenant-aware endpoints that match the frontend context:

```text
GET /organisations/current
GET /organisations/slug/{organisation_slug}
GET /organisations/{organisation_id}/members
GET /organisations/{organisation_id}/overview
PATCH /organisations/{organisation_id}/branding
PATCH /organisations/{organisation_id}/settings
```

Every tenant endpoint must verify:

```text
authenticated user -> active organisation membership -> required role -> tenant-scoped query
```

Do not trust an organisation slug or ID from the frontend without checking `organisation_memberships`.

## Vercel

No new frontend environment variable is required for this PR. Keep:

```text
VITE_API_BASE_URL
VITE_SUPABASE_URL
VITE_SUPABASE_ANON_KEY
```

After the Render backend exposes slug-aware endpoints, deploy the frontend normally and verify each tenant route resolves under the same Vercel app.
