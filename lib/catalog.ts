export type Locale = 'en' | 'ar';
export function localeOf(s: string): Locale {
  return s === 'ar' ? 'ar' : 'en';
}
export function localized(o: object, key: string, locale: Locale): string {
  return String(
    (o as Record<string, unknown>)[`${key}${locale === 'ar' ? 'Ar' : 'En'}`] ??
      '',
  );
}
export function whatsappLink(
  number: string,
  name?: string,
  sku?: string,
  locale: Locale = 'en',
) {
  const text = name
    ? locale === 'ar'
      ? `مرحباً بيت قطن، أود الاستفسار عن ${name} (SKU: ${sku}).`
      : `Hello Cotton House, I'd like to ask about ${name} (SKU: ${sku}).`
    : locale === 'ar'
      ? 'مرحباً بيت قطن، أود الاستفسار عن منتجاتكم وزيارة المتجر.'
      : 'Hello Cotton House, I would like to ask about your products and visiting the store.';
  return `https://wa.me/${number.replace(/\D/g, '')}?text=${encodeURIComponent(text)}`;
}
export function priceLabel(price: number | null, mode: string, locale: Locale) {
  if (mode === 'HIDDEN') return '';
  if (mode !== 'SHOW' || price === null)
    return locale === 'ar' ? 'استفسر عن السعر' : 'Inquire for price';
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-SA' : 'en-SA', {
    style: 'currency',
    currency: 'SAR',
    maximumFractionDigits: 2,
  }).format(price);
}
export const words = {
  en: {
    home: 'Home',
    catalog: 'Our collection',
    about: 'Our story',
    visit: 'Visit our store',
    search: 'Search the collection',
    discover: 'Discover the collection',
    view: 'View product',
    inquire: 'Ask about this product',
    new: 'New arrival',
    featured: 'Featured',
    demo: 'Demo product',
    all: 'All products',
    available: 'Available in store',
    unavailable: 'Currently unavailable',
    askAvailability: 'Ask about availability',
    similar: 'You may also like',
    directions: 'Get directions',
    contact: 'Chat on WhatsApp',
    hours: 'Opening hours',
    hoursUnknown: 'Contact us for current opening hours',
    addressUnknown: 'Find our store using the directions below',
    filter: 'Explore by category',
    empty: 'No products found. Try a different search or category.',
    sizes: 'Sizes',
    colors: 'Colors',
    collection: 'The collection',
    demoNote:
      'A preview of what’s possible. Sample products and editorial imagery are for demonstration; contact the store for the current selection.',
  },
  ar: {
    home: 'الرئيسية',
    catalog: 'تشكيلتنا',
    about: 'قصتنا',
    visit: 'زوروا متجرنا',
    search: 'ابحث في التشكيلة',
    discover: 'اكتشف التشكيلة',
    view: 'عرض المنتج',
    inquire: 'استفسر عن هذا المنتج',
    new: 'وصل حديثاً',
    featured: 'مختاراتنا',
    demo: 'منتج تجريبي',
    all: 'جميع المنتجات',
    available: 'متوفر في المتجر',
    unavailable: 'غير متوفر حالياً',
    askAvailability: 'استفسر عن التوفر',
    similar: 'قد يعجبك أيضاً',
    directions: 'الاتجاهات',
    contact: 'تواصل عبر واتساب',
    hours: 'ساعات العمل',
    hoursUnknown: 'تواصل معنا لمعرفة ساعات العمل الحالية',
    addressUnknown: 'اعثر على متجرنا من خلال رابط الاتجاهات أدناه',
    filter: 'تصفح حسب الفئة',
    empty: 'لا توجد منتجات. جرّب بحثاً أو فئة أخرى.',
    sizes: 'المقاسات',
    colors: 'الألوان',
    collection: 'التشكيلة',
    demoNote:
      'معاينة تجريبية. المنتجات والصور المعروضة للتوضيح؛ تواصل مع المتجر لمعرفة التشكيلة الحالية.',
  },
};
