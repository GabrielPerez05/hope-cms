# GitHub Branching and Protection

## Branch Flow

1. Create work branches from `dev`.
2. Use branch names from the Sprint 1 guide, such as `feat/project-scaffold`, `feat/ui-login-page`, `db/initial-schema`, `feat/auth-context`, and `test/sprint1-auth-flows`.
3. Open a Pull Request into `dev`.
4. Require at least one teammate review.
5. Create a release Pull Request from `dev` to `main`.

## Protection Rules to Configure in GitHub

- Protect `main`.
- Protect `dev`.
- Require Pull Requests before merging.
- Require at least one approving review.
- Block direct pushes.
- Keep the `.github/pull_request_template.md` checklist enabled for every PR.
