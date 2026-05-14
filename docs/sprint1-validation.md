# Sprint 1 Validation Status

Validated on 2026-05-14 against the local HOPE-CMS workspace.

## Local Automated Checks

- `npm.cmd test` passes with 1 test file and 6 Sprint 1 auth/route/rights tests.
- `npm.cmd run lint` passes.
- `npm.cmd run build` passes.

## Database Seeding Verification

Verified in Supabase SQL Editor on 2026-05-14:

| Table | Expected | Found in seed SQL | Status |
| --- | ---: | ---: | --- |
| `customer` | 82 | 82 | Pass |
| `sales` | 124 | 124 | Pass |
| `salesDetail` | ~250 | 313 | Pass, accepted live count |
| `product` | 52 | 57 | Pass, accepted live count |
| `priceHist` | ~70 | 79 | Pass, accepted live count |

Notes:

- `db/migrations/verify_seed.sql` was run in Supabase after seeding.
- Relationship checks returned `0` invalid rows for seeded business data.
- The repo uses singular table names in SQL: `customer` and `product`, not `customers` and `products`.

## Authentication Testing

Covered locally by `src/test/sprint1-auth-flows.test.jsx`:

- Google OAuth starts through Supabase with `/auth/callback` redirect.
- Email signup with verification required shows a "Check your email" state.
- Active email/password login stores the normalized user in `AuthProvider` state.
- OAuth callback exchanges `code` for a session and redirects to `/customers`.

Still requires live browser/Supabase validation:

- Real email delivery and verification link flow.
- Real Google OAuth provider configuration and consent screen.
- Browser refresh persistence against a real Supabase session.
- Token refresh after expiry.

## User Rights Verification

Covered locally:

- `UserRightsProvider` loads the 9 Sprint 1 rights from `user_rights`.
- Components can consume `hasRight`, `canEdit`, and `isAdmin`.
- Provisioning trigger now inserts `CUST_DEL` instead of the unrelated `REC_DEL` right.
- Rights provider now reads the trigger column `right_value`.

Verified in Supabase:

- `jcesperanza@neu.edu.ph` exists in Supabase Auth.
- `jcesperanza@neu.edu.ph` has all 9 rights set to `1`.
- `public."user"`, `public.user_module`, and `public.user_rights` were created successfully.
- `public.provision_new_user()` trigger was installed for new auth users.

## Protected Routes And E2E

Covered locally:

- Unauthenticated users are redirected away from protected routes.
- Authenticated callback redirects to `/customers`.
- Navbar user display is backed by `currentUser` from `AuthProvider`.
- Logout clears local auth state through Supabase `signOut` in the app shell.

Still requires live browser/Supabase validation:

- Full login to page navigation to logout flow.
- Session persistence across real page reloads.
- Auto refresh behavior when Supabase access tokens expire.
