import { z } from 'zod';
export const safeUrl = z
  .string()
  .max(2000)
  .refine(
    (s) =>
      s === '' ||
      /^\/(?!\/)[\w/.-]+(?:#tile-[0-8])?$/.test(s) ||
      /^https:\/\//.test(s),
    'Use a local path or an HTTPS URL',
  );
export const mapUrl = z
  .string()
  .max(2000)
  .refine((s) => {
    if (!s) return true;
    try {
      const u = new URL(s);
      return (
        u.protocol === 'https:' &&
        ['www.google.com', 'maps.google.com'].includes(u.hostname) &&
        (u.pathname.startsWith('/maps/embed') ||
          (u.pathname === '/maps' && u.searchParams.get('output') === 'embed'))
      );
    } catch {
      return false;
    }
  }, 'Use a Google Maps embed URL');
export const productSchema = z
  .object({
    nameEn: z.string().trim().min(1).max(180),
    nameAr: z.string().trim().min(1).max(180),
    slug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(180),
    sku: z.string().trim().min(1).max(80),
    descriptionEn: z.string().max(10000),
    descriptionAr: z.string().max(10000),
    categoryId: z.string().min(1),
    price: z.number().min(0).max(99999999).nullable(),
    priceMode: z.enum(['SHOW', 'HIDDEN', 'INQUIRE']),
    availability: z.enum(['AVAILABLE', 'UNAVAILABLE', 'INQUIRE']),
    sizes: z.array(z.string().max(80)).max(40),
    colors: z.array(z.string().max(80)).max(40),
    images: z.array(safeUrl).max(12),
    featured: z.boolean(),
    newArrival: z.boolean(),
    visible: z.boolean(),
    demo: z.boolean(),
  })
  .refine((p) => p.priceMode !== 'SHOW' || p.price !== null, {
    message: 'Enter a price or select Inquire/Hidden',
    path: ['price'],
  });
