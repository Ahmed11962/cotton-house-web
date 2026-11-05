# Cotton House · بيت قطن

A bilingual, database-backed retail showcase for a physical Saudi store. Built with Next.js 16 App Router, TypeScript, Tailwind CSS 4, PostgreSQL and Prisma 6. There is no cart, checkout, payment, customer account, shipping or order system.

## Local setup

Use Node.js 22.12+ (validated with Node 24), npm, and PostgreSQL. Work in the existing checkout; each cloud task is isolated, so a Git worktree is unnecessary unless explicitly requested.

```sh
npm ci
npm run db:local
```

Leave the local database running in that terminal. This development helper starts actual PostgreSQL 18 on loopback port 5433, creates a random database password in ignored `.local/db-password`, and creates `.env` only when absent. Existing `.env` and data are preserved. Linux/macOS must run it as a non-root user. For an existing PostgreSQL server, copy `.env.example` to `.env`, supply `DATABASE_URL`, and skip `db:local`.

In a second terminal:

```sh
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

The app serves `/en`, `/ar`, `/en/catalog`, and `/admin`. The seed is repeatable and never overwrites existing settings or products. All nine sample products and the sample campaign are explicitly marked demo; their AI-generated editorial imagery does not depict actual inventory or the physical store.

## Create the administrator

Set `ADMIN_EMAIL` and `ADMIN_PASSWORD` securely in your local `.env` or process environment, then run:

```sh
npm run admin:create
```

Use a unique password of at least 12 characters (maximum 72 UTF-8 bytes). No default admin or shared password is shipped. The command creates an account and will not overwrite an existing one. Remove the bootstrap variables afterward. Login is at `/admin/login`.

The dashboard supports bilingual product CRUD, multiple images, SKU, optional SAR prices, hidden prices, inquiry-only pricing, sizes, colors, availability, hidden products, featured/new-arrival flags, category trees, promotional banners, and editable homepage/store/contact settings. The first product image is the cover; reorder the image URLs to change image order. Category deletion is blocked when it contains products or subcategories.

## Store details

The supplied WhatsApp number is normalized to **966552271417**; the display number is **0552271417**. Product inquiries include localized product name and SKU. The supplied directions link is saved without modification. Opening hours are set to the supplied **9:00 AM–12:00 midnight**, in English and Arabic. No weekly schedule was supplied. Street address and social links are intentionally blank because they were not provided.

For an interactive Google Map, open the store in Google Maps → Share → Embed a map, and copy the iframe's **src URL** into **Store & homepage → Google Maps embed URL**. Until then, the Store Visit section shows the supplied working directions link and a decorative location panel, not a fabricated map pin. The short Maps link could not be resolved in this cloud environment because its host is restricted.

## Verification

```sh
npm run lint
npm run typecheck
npm test
npm run build
# With database and npm run dev running:
npm run test:e2e
```

Browser tests use `/usr/bin/chromium` by default. Set `CHROMIUM_PATH` for another installed Chromium, or install Playwright's browser and set its path. `TEST_BASE_URL` selects a different running test server. Browser tests require a seeded **development/test database**, create temporary randomized admin accounts and a test product, and delete those records afterward. They must never target a live production database. Uploaded test assets may remain in the ignored upload directory.

## Database migrations

`prisma/schema.prisma` defines the models. Runtime queries use Prisma's JavaScript query engine with the official PostgreSQL driver adapter. This avoids a native Prisma engine download. SQL migrations are committed under `prisma/migrations` and applied by `npm run db:migrate` using PostgreSQL transactions, a database advisory lock, and SHA-256 drift checks recorded in `cotton_migrations`.

Use this runner consistently; **do not mix it with `prisma migrate deploy`**, which uses a different migration history table. Prisma 6's experimental JS migration adapter failed on the supplied PostgreSQL 18 instance with a `name` type deserialization error; the runner applies the actual Prisma-generated SQL and preserves transactionality. Prisma's experimental CLI adapter is used only for schema tooling, not application authentication or query execution.

For a future schema change, use a scratch database matching the old schema, generate a SQL diff with Prisma, review it, and add a new timestamped migration directory. Never edit an already applied SQL file. Back up production before migrations.

See [DEPLOYMENT.md](DEPLOYMENT.md) for hosting, backups and release steps and [BRANDING.md](BRANDING.md) for logo provenance.
