# Saved opportunity matching

Paired backend feature: `feature/persisted-opportunity-matches` in YTE-Platform.
Apply backend migration `20261030_0024` and deploy its matching endpoints before
deploying this frontend. The backend PR documents migration and rollback details.

- Page loads use tenant `GET /organisations/{id}/opportunity-matches` to retrieve
  a saved run without generating one.
- Generate/Refresh uses POST on that endpoint with `force_refresh: true`.
- Backend run IDs/timestamps and stale metadata survive service adaptation.
- Missing runs have no fabricated ID/date and show a Generate action. Existing
  runs can be explicitly refreshed even when currently fresh.
- Both learner and organisation views display stale guidance and disable refresh
  while a request is running. Failures remain visible for retry.
- Context changes clear prior results and discard late responses from earlier
  organisation requests. Learner requests are also scoped to the signed-in user.
- Legacy response mapping is retained, but coordinated deployment is required:
  an older backend does not implement tenant POST matching.

This increment does not add the missing public/non-tenant matching backend. Existing
non-tenant service requests remain unchanged. It also does not introduce real-world
eligibility decisions or verified-competence claims.
