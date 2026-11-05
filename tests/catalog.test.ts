import test from 'node:test';
import assert from 'node:assert/strict';
import { whatsappLink, priceLabel } from '../lib/catalog';
import { productSchema, safeUrl, mapUrl } from '../lib/validation';
test('WhatsApp includes exact product name, SKU and international phone', () => {
  const url = new URL(
    whatsappLink('966552271417', 'قميص & cotton', 'CH-123', 'ar'),
  );
  assert.equal(url.pathname, '/966552271417');
  assert.match(url.searchParams.get('text')!, /قميص & cotton.*CH-123/);
});
test('Hidden prices never render and absent prices become inquiries', () => {
  assert.equal(priceLabel(250, 'HIDDEN', 'en'), '');
  assert.equal(priceLabel(null, 'SHOW', 'en'), 'Inquire for price');
  assert.match(priceLabel(125, 'SHOW', 'en'), /125/);
  assert.equal(priceLabel(250, 'INQUIRE', 'ar'), 'استفسر عن السعر');
});
test('Reject unsafe URL schemes and non-Google map embeds', () => {
  assert.equal(safeUrl.safeParse('javascript:alert(1)').success, false);
  assert.equal(safeUrl.safeParse('//evil.test/image').success, false);
  assert.equal(mapUrl.safeParse('https://evil.test/maps/embed').success, false);
  assert.equal(
    mapUrl.safeParse('https://www.google.com/maps/embed?pb=example').success,
    true,
  );
});
test('Product schema rejects shown prices without a price and invalid states', () => {
  const base = {
    nameEn: 'Shirt',
    nameAr: 'قميص',
    slug: 'shirt',
    sku: 'CH-1',
    descriptionEn: '',
    descriptionAr: '',
    categoryId: 'cat',
    price: null,
    priceMode: 'SHOW',
    availability: 'INQUIRE',
    sizes: [],
    colors: [],
    images: [],
    featured: false,
    newArrival: false,
    visible: true,
    demo: false,
  };
  assert.equal(productSchema.safeParse(base).success, false);
  assert.equal(productSchema.safeParse({ ...base, price: 99 }).success, true);
  assert.equal(productSchema.safeParse({ ...base, price: -1 }).success, false);
  assert.equal(
    productSchema.safeParse({ ...base, price: 99, availability: 'SECRET' })
      .success,
    false,
  );
});
