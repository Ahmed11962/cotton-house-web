# Deployment

## Hosting model

Use a Node.js host with a persistent writable disk and PostgreSQL (for example a VPS or a service with an attached persistent volume). This application is server-rendered and cannot run on GitHub Pages or a static-only host. The repository upload is not a public website deployment.

1. Provision PostgreSQL with a dedicated least-privilege application user. Use the provider's verified TLS connection settings; do not disable certificate verification.
2. Configure private `DATABASE_URL`, public `APP_URL` (the canonical HTTPS origin), and an absolute persistent `UPLOAD_DIR` such as `/var/lib/cotton-house/uploads`. `.env.example` lists the variables. Do not publish `.env` or `.local` files.
3. Install all dependencies during the release/build step, then generate the client and apply the committed SQL migrations:

   ```sh
   npm ci
   npm run db:generate
   npm run db:migrate
   npm run db:seed
   npm run build
   npm start
   ```

4. Seed once to create store settings and categories; it also creates clearly labeled demos. Remove or hide demo products and the demo promotion through the admin before launch. Subsequent seeds preserve existing records, but may recreate deleted demo records, so do not seed on every release.
5. Create the admin with private `ADMIN_EMAIL` and `ADMIN_PASSWORD`, run `npm run admin:create`, then remove those bootstrap variables. Password hashes are stored with bcrypt cost 12. No credentials are committed.
6. Put the process behind an HTTPS reverse proxy. Set a 7 MB request body limit at the proxy, plus request/connection rate limits for `/admin/login`, Server Action POST requests and `/api/upload`. Preserve the original Host and Origin correctly. Enable HSTS at the HTTPS edge. `APP_URL` must match the browser origin for uploads.
7. The app issues random 256-bit session tokens; only their SHA-256 hashes are stored in PostgreSQL. Cookies are HttpOnly, SameSite=Lax, Secure in production, and expire after eight hours. Logout revokes the session. Login attempts are throttled in PostgreSQL by email and source. `TRUST_PROXY=1` is appropriate only when your proxy replaces untrusted X-Forwarded-For headers. Otherwise the source limiter is shared.
8. Supervise `npm start` with your host's process manager and restart it after deploying a new build. Keep database and media storage persistent across releases. Do not expose the PostgreSQL port publicly.

## Media and backups

Image uploads require authentication and same-origin requests. JPEG, PNG and WebP are decoded, bounded by file size and pixel count, stripped/re-encoded as WebP, and given random filenames. SVG uploads are rejected. Public media is served by `/api/media/[name]` with immutable caching. Product removal does not remove image files because images may be reused; retain backups and perform orphan cleanup only after checking all product/category/promotion/settings references.

Back up PostgreSQL **and the upload volume** together. Test restoration before launch. For several web replicas, all must share the same media volume or the storage implementation must be replaced with an object-store adapter. Ephemeral serverless storage is unsupported by the included upload implementation.

## Launch review

- Replace or hide every demo product/campaign; upload actual product photos and confirm both languages.
- Review the redrawn logo, confirm the opening hours and supply the address, and configure the Google Maps embed URL and genuine social links.
- Confirm the provided WhatsApp number and directions link on a real phone.
- Verify `/en`, `/ar`, category/search filters, hidden products/prices, product inquiries, and admin create/edit/upload/delete on the production host.
- Check HTML language and direction, keyboard navigation, responsive layouts and image loading.
- Confirm the sitemap uses the correct HTTPS domain. Hidden and demo products are excluded; demo product pages carry noindex. Admin pages carry noindex.
- Run lint, typecheck, unit tests and the production build. Run browser mutation tests only against a separate seeded test database.

## Operational notes

The development PostgreSQL helper is for local/cloud development; prefer a managed or professionally maintained PostgreSQL service in production. Dependency and lockfile updates should be reviewed and validated regularly. There is no email password-reset provider; an administrator with database access can revoke all sessions and rotate an account password using a trusted maintenance script. Never create a public bootstrap route.
