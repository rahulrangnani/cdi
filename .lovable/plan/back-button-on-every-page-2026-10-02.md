# Back button on every page

Goal: every screen (portal and admin) has a visible "Back" button that returns to the previous page the user was on, so nobody gets stuck.

## What changes
- A shared Back button is added to the top bar of both the portal layout and the admin layout, next to the page title. It appears on every page except the very first home screen (no drill-down) and the login/signup screens.
- Clicking it goes to the last page visited. If there is no earlier page in this app (e.g. opened via a direct link), it falls back to a sensible parent: portal pages go to Home, admin pages go to the Admin Dashboard.
- Home drill-down (Bucket / Category / Product steps) already lives in the address, so Back steps out one level at a time.
- Existing per-page back arrows (admin forms, Settings, initiative detail) that are hard-wired to a fixed page are switched to "go to last page" with the same fallback, so behaviour is consistent. Their look stays the same.
- The 404 page gets a Back button plus a "Go Home" link.

## Technical details
- New `src/components/BackButton.tsx`: uses `useNavigate`; checks `window.history.state?.idx > 0` to decide between `navigate(-1)` and the fallback path prop.
- Insert into `TopBar` in `MainLayout.tsx` and the header in `AdminLayout.tsx`; hide when pathname is `/` with no search params, or `/admin` index.
- Replace fixed `Link to=...` back arrows in BucketForm, CategoryForm, InitiativeForm, PartnerForm, InitiativePartnerForm, InitiativePartnersManagement, Settings with `BackButton` (same fallback target).
- Update `NotFound.tsx`.
- No data or functionality changes otherwise.
