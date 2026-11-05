import { test, expect } from '@playwright/test';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { hash } from 'bcryptjs';
import { randomBytes } from 'node:crypto';
import { readFile } from 'node:fs/promises';
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
const suffix = randomBytes(6).toString('hex'),
  email = `test-${suffix}@example.invalid`,
  password = randomBytes(20).toString('hex');
const slug = `test-${suffix}`;
test.beforeAll(async () => {
  await db.admin.create({
    data: { email, passwordHash: await hash(password, 12) },
  });
});
test.afterAll(async () => {
  await db.product.deleteMany({ where: { slug } });
  await db.admin.deleteMany({ where: { email } });
  await db.$disconnect();
});
test('homepage, mobile navigation, Arabic RTL and no ecommerce controls', async ({
  page,
}) => {
  await page.goto('/en');
  await expect(
    page.getByRole('heading', { name: /Everyday essentials/ }),
  ).toBeVisible();
  await expect(
    page.getByRole('link', { name: 'Get directions' }),
  ).toHaveAttribute('href', 'https://maps.app.goo.gl/MD14LFgMYh3eGas79');
  await expect(
    page.getByRole('button', { name: /cart|checkout|buy now/i }),
  ).toHaveCount(0);
  await page.setViewportSize({ width: 390, height: 844 });
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
  await page.getByRole('button', { name: 'Toggle menu' }).click();
  await expect(page.locator('#mobile-menu')).toBeVisible();
  await page.getByRole('link', { name: 'العربية', exact: true }).click();
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
  await expect(page.locator('html')).toHaveAttribute('lang', 'ar');
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBeTruthy();
});
test('catalog search, categories, details and inquiry link', async ({
  page,
}) => {
  await page.goto('/en/catalog?q=DEMO-001');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.locator('.product-card h3').click();
  await expect(
    page.getByRole('heading', { name: 'Soft cotton shirt', exact: true }),
  ).toBeVisible();
  const href = await page
    .getByRole('link', { name: 'Ask about this product', exact: true })
    .getAttribute('href');
  expect(href).toContain('wa.me/966552271417');
  expect(decodeURIComponent(href!)).toContain('DEMO-001');
  await page.goto('/en/catalog?category=perfumes');
  await expect(page.locator('.product-card')).toHaveCount(1);
  await page.goto('/en/catalog?q=does-not-exist-19074');
  await expect(
    page.getByText('No products found.', { exact: false }),
  ).toBeVisible();
});
test('unauthenticated admin and upload requests are denied', async ({
  page,
  request,
}) => {
  await page.goto('/admin/settings');
  await expect(page).toHaveURL(/\/admin\/login/);
  const response = await request.post('/api/upload');
  expect(response.status()).toBe(401);
  expect((await request.get('/api/media/invalid.svg')).status()).toBe(404);
});
test('admin creates, uploads, edits, hides and deletes a bilingual product', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill(password);
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  const cookie = (await page.context().cookies()).find(
    (c) => c.name === 'ch_session',
  );
  expect(cookie?.httpOnly).toBe(true);
  expect(cookie?.sameSite).toBe('Lax');
  expect(
    (
      await page.request.post('/api/upload', {
        headers: { origin: 'https://evil.invalid' },
      })
    ).status(),
  ).toBe(403);
  await page.getByRole('link', { name: '+ Add product' }).click();
  await page
    .getByLabel('Name · English', { exact: true })
    .fill('Browser test shirt');
  await page.getByLabel('الاسم · العربية', { exact: true }).fill('قميص اختبار');
  await page.getByLabel('URL slug').fill(slug);
  await page.getByLabel('SKU / product code').fill(`TEST-${suffix}`);
  await page
    .getByLabel('Description · English', { exact: true })
    .fill('A real persistence test.');
  await page
    .getByLabel('الوصف · العربية', { exact: true })
    .fill('اختبار حفظ المنتج.');
  await page.getByLabel('Price in SAR').fill('149');
  await page.getByLabel('Price visibility').selectOption('SHOW');
  await page.locator('input[type=file]').setInputFiles({
    name: 'test.png',
    mimeType: 'image/png',
    buffer: await readFile('public/brand/logo.png'),
  });
  await expect(page.locator('.upload-previews>div')).toHaveCount(1);
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(page.getByText('Changes saved.')).toBeVisible();
  const product = await db.product.findUniqueOrThrow({ where: { slug } });
  expect(product.images).toHaveLength(1);
  expect(
    (await page.request.get(product.images[0])).headers()['content-type'],
  ).toBe('image/webp');
  await page.goto(`/en/products/${slug}`);
  await expect(page.locator('.detail-price')).toContainText('149');
  await page.goto(`/ar/products/${slug}`);
  await expect(
    page.getByRole('heading', { name: 'قميص اختبار', exact: true }),
  ).toBeVisible();
  await page.goto(`/admin/products/${product.id}`);
  await page.getByLabel('Price visibility').selectOption('HIDDEN');
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(page.getByText('Changes saved.')).toBeVisible();
  await page.goto(`/en/products/${slug}`);
  await expect(page.locator('.detail-price')).toBeEmpty();
  await page.goto(`/admin/products/${product.id}`);
  await page.getByLabel('Visible on website').uncheck();
  await page.getByRole('button', { name: 'Save product', exact: true }).click();
  await expect(page.getByText('Changes saved.')).toBeVisible();
  const hidden = await page.goto(`/en/products/${slug}`);
  expect(hidden?.status()).toBe(404);
  await page.goto(`/admin/products/${product.id}`);
  page.once('dialog', (dialog) => dialog.accept());
  await page.getByRole('button', { name: 'Delete', exact: true }).click();
  await expect(page).toHaveURL(/\/admin$/);
  expect(await db.product.findUnique({ where: { slug } })).toBeNull();
  await page.getByRole('button', { name: 'Sign out' }).click();
  await expect(page).toHaveURL(/login/);
});
test('wrong password is rejected without creating a session', async ({
  page,
}) => {
  await page.goto('/admin/login');
  await page.getByLabel('Email address').fill(email);
  await page.getByLabel('Password', { exact: true }).fill('invalid-password');
  await page.getByRole('button', { name: 'Sign in', exact: true }).click();
  await expect(page.locator('.notice.error')).toHaveText(
    'Email or password is incorrect.',
  );
  expect(
    (await page.context().cookies()).some((c) => c.name === 'ch_session'),
  ).toBe(false);
});
test('admin manages category trees, promotions and bilingual store settings', async ({
  page,
}) => {
  const original = await db.storeSettings.findUniqueOrThrow({
    where: { id: 'store' },
  });
  try {
    await page.goto('/admin/login');
    await page.getByLabel('Email address').fill(email);
    await page.getByLabel('Password', { exact: true }).fill(password);
    await page.getByRole('button', { name: 'Sign in', exact: true }).click();
    await expect(page).toHaveURL(/\/admin$/);
    await page.goto('/admin/categories');
    let form = page.locator('details').first();
    await form
      .getByLabel('Name · English', { exact: true })
      .fill('Test subcategory');
    await form
      .getByLabel('الاسم · العربية', { exact: true })
      .fill('فئة تجريبية');
    await form.getByLabel('URL slug').fill(slug);
    await form.getByLabel('Parent category').selectOption('category-0');
    await form
      .getByRole('button', { name: 'Save category', exact: true })
      .click();
    await expect(page.getByText('Changes saved.')).toBeVisible();
    const cat = await db.category.findUniqueOrThrow({ where: { slug } });
    expect(cat.parentId).toBe('category-0');
    await page.goto('/admin/promotions');
    form = page.locator('details').first();
    await form
      .getByLabel('Title · English', { exact: true })
      .fill(`Test campaign ${suffix}`);
    await form
      .getByLabel('العنوان · العربية', { exact: true })
      .fill('حملة اختبار');
    await form.getByLabel('Demo campaign').check();
    await form
      .getByRole('button', { name: 'Save promotion', exact: true })
      .click();
    await expect(page.getByText('Changes saved.')).toBeVisible();
    await page.goto('/en');
    await expect(
      page.getByRole('heading', { name: `Test campaign ${suffix}` }),
    ).toBeVisible();
    await page.goto('/admin/settings');
    await page
      .getByLabel('Opening hours · English', { exact: true })
      .fill('9:00 AM – 12:00 midnight');
    await page
      .getByRole('button', { name: 'Save store settings', exact: true })
      .click();
    await expect(page.getByText('Changes saved.')).toBeVisible();
    expect(
      (await db.storeSettings.findUniqueOrThrow({ where: { id: 'store' } }))
        .hoursEn,
    ).toBe('9:00 AM – 12:00 midnight');
    await page.goto('/admin/categories');
    const existing = page.locator('details').filter({
      has: page.locator('summary', { hasText: 'Test subcategory' }),
    });
    await existing.locator('summary').click();
    page.once('dialog', (dialog) => dialog.accept());
    await existing.getByRole('button', { name: 'Delete', exact: true }).click();
    await expect(page).toHaveURL(/\/admin\/categories$/);
    expect(await db.category.findUnique({ where: { slug } })).toBeNull();
  } finally {
    await db.category.deleteMany({ where: { slug } });
    await db.promotion.deleteMany({
      where: { titleEn: `Test campaign ${suffix}` },
    });
    await db.storeSettings.update({ where: { id: 'store' }, data: original });
  }
});
