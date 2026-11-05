import { loadEnvConfig } from '@next/env';
import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
loadEnvConfig(process.cwd());
const db = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL }),
});
async function main() {
  await db.storeSettings.upsert({
    where: { id: 'store' },
    update: {},
    create: {
      id: 'store',
      hoursEn: '9:00 AM – 12:00 midnight',
      hoursAr: 'من ٩:٠٠ صباحاً إلى ١٢:٠٠ منتصف الليل',
      heroTitleEn: 'Everyday essentials.\nExtraordinary finds.',
      heroTitleAr: 'أساسيات يومية.\nواكتشافات مميزة.',
      heroTextEn:
        'A little style. A little comfort. A world of discoveries for you and your family, all under one roof.',
      heroTextAr: 'أناقة وراحة واختيارات لك ولعائلتك، كلها تحت سقف واحد.',
      heroImage: '/images/hero.jpg',
      aboutEn:
        'Welcome to Cotton House, a multi-category retail store in Saudi Arabia. Explore clothing for the family, shoes, toys, perfumes, and everyday accessories. Browse our catalog, then visit us to find your favorites.',
      aboutAr:
        'أهلاً بكم في بيت قطن، متجر متنوع في المملكة العربية السعودية. اكتشفوا ملابس العائلة والأحذية والألعاب والعطور والإكسسوارات اليومية. تصفحوا التشكيلة ثم زورونا لاختيار ما تحبون.',
    },
  });
  const cats = [
    ['men', 'Men’s Clothing', 'ملابس رجالية'],
    ['women', 'Women’s Clothing', 'ملابس نسائية'],
    ['kids', 'Kids’ Clothing', 'ملابس أطفال'],
    ['shoes', 'Shoes', 'أحذية'],
    ['toys', 'Toys', 'ألعاب'],
    ['perfumes', 'Perfumes', 'عطور'],
    ['undergarments', 'Undergarments', 'ملابس داخلية'],
    ['accessories', 'Accessories', 'إكسسوارات'],
    ['other', 'Other Products', 'منتجات أخرى'],
  ];
  const products = [
    ['Soft cotton shirt', 'قميص قطني ناعم'],
    ['Everyday flowing dress', 'فستان يومي انسيابي'],
    ['Little explorer set', 'طقم المستكشف الصغير'],
    ['Everyday suede sneakers', 'حذاء يومي مريح'],
    ['A little teddy companion', 'دب دمية صغير'],
    ['Amber notes fragrance', 'عطر بنفحات العنبر'],
    ['Cotton comfort essentials', 'أساسيات قطنية مريحة'],
    ['The everyday tote', 'حقيبة يومية'],
    ['Soft cotton towel set', 'طقم مناشف قطنية ناعمة'],
  ];
  for (let i = 0; i < cats.length; i++) {
    const [slug, nameEn, nameAr] = cats[i];
    const c = await db.category.upsert({
      where: { slug },
      update: {},
      create: {
        id: `category-${i}`,
        slug,
        nameEn,
        nameAr,
        image: `/images/catalog.jpg#tile-${i}`,
      },
    });
    await db.product.upsert({
      where: { sku: `DEMO-${String(i + 1).padStart(3, '0')}` },
      update: {},
      create: {
        slug: `demo-${slug}`,
        sku: `DEMO-${String(i + 1).padStart(3, '0')}`,
        nameEn: products[i][0],
        nameAr: products[i][1],
        descriptionEn:
          'Demonstration product for the Cotton House catalog. This sample illustrates how product details, photography, and inquiries appear. It does not represent confirmed store inventory. Ask our team about the current selection.',
        descriptionAr:
          'منتج تجريبي لعرض طريقة ظهور التفاصيل والصور والاستفسارات في موقع بيت قطن. لا يمثل مخزوناً مؤكداً في المتجر. تواصل مع فريقنا لمعرفة التشكيلة الحالية.',
        categoryId: c.id,
        priceMode: 'INQUIRE',
        availability: 'INQUIRE',
        images: [`/images/catalog.jpg#tile-${i}`],
        sizes: i < 3 ? ['S', 'M', 'L', 'XL'] : [],
        colors: i < 3 ? ['Sage / أخضر هادئ', 'Ivory / عاجي'] : [],
        featured: [0, 1, 3, 5].includes(i),
        newArrival: [2, 4, 7, 8].includes(i),
        demo: true,
      },
    });
  }
  await db.promotion.upsert({
    where: { id: 'demo-seasonal' },
    update: {},
    create: {
      id: 'demo-seasonal',
      titleEn: 'A fresh perspective on everyday.',
      titleAr: 'نظرة جديدة لكل يوم.',
      descriptionEn:
        'A sample seasonal edit. Discover the collection and ask us what’s new in store.',
      descriptionAr:
        'عرض موسمي تجريبي. اكتشف التشكيلة واسألنا عن الجديد في المتجر.',
      demo: true,
    },
  });
  console.log(
    'Seed complete. Existing products and store settings preserved. All sample products are labeled DEMO.',
  );
}
main()
  .catch((e) => {
    console.error(e);
    process.exitCode = 1;
  })
  .finally(() => db.$disconnect());
