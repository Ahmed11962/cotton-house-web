import { NextRequest, NextResponse } from 'next/server';
import { getAdmin } from '@/lib/auth';
import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
export const runtime = 'nodejs';
export async function POST(request: NextRequest) {
  if (!(await getAdmin()))
    return NextResponse.json({ error: 'Sign in first' }, { status: 401 });
  const expected = new URL(process.env.APP_URL || request.url).origin;
  if (request.headers.get('origin') !== expected)
    return NextResponse.json(
      { error: 'Invalid request origin' },
      { status: 403 },
    );
  if (Number(request.headers.get('content-length') || 0) > 7 * 1024 * 1024)
    return NextResponse.json({ error: 'File is too large' }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (
      !(file instanceof File) ||
      file.size > 6 * 1024 * 1024 ||
      !['image/jpeg', 'image/png', 'image/webp'].includes(file.type)
    )
      return NextResponse.json(
        { error: 'Choose a JPEG, PNG or WebP image up to 6 MB' },
        { status: 400 },
      );
    const data = await sharp(Buffer.from(await file.arrayBuffer()), {
      limitInputPixels: 40_000_000,
    })
      .rotate()
      .resize({
        width: 2000,
        height: 2000,
        fit: 'inside',
        withoutEnlargement: true,
      })
      .webp({ quality: 86 })
      .toBuffer();
    const dir = path.resolve(process.env.UPLOAD_DIR || 'uploads');
    await mkdir(dir, { recursive: true });
    const filename = `${randomUUID()}.webp`;
    await writeFile(path.join(dir, filename), data);
    return NextResponse.json({ url: `/api/media/${filename}` });
  } catch {
    return NextResponse.json(
      { error: 'Unable to read image. Use a valid JPEG, PNG or WebP.' },
      { status: 400 },
    );
  }
}
