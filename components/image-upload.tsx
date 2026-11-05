'use client';
import { useState } from 'react';
import { Photo } from './photo';
export function ImageUpload({
  initial = [],
  name = 'images',
  single = false,
}: {
  initial?: string[];
  name?: string;
  single?: boolean;
}) {
  const [images, setImages] = useState(initial),
    [busy, setBusy] = useState(false),
    [error, setError] = useState('');
  async function upload(files: FileList | null) {
    if (!files) return;
    setBusy(true);
    setError('');
    try {
      const added: string[] = [];
      for (const file of Array.from(files)) {
        const body = new FormData();
        body.set('file', file);
        const r = await fetch('/api/upload', { method: 'POST', body });
        const data = await r.json();
        if (!r.ok) throw new Error(data.error || 'Upload failed');
        added.push(data.url);
      }
      setImages((old) =>
        single ? added.slice(-1) : [...old, ...added].slice(0, 12),
      );
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="upload-box">
      <label className="field">
        <span>
          {single ? 'Image' : 'Product images'} · JPEG, PNG, WebP, up to 6 MB
          each
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple={!single}
          disabled={busy}
          onChange={(e) => upload(e.target.files)}
        />
      </label>
      {busy && <p role="status">Uploading… wait before saving.</p>}
      {error && <p role="alert">{error}</p>}
      <div className="upload-previews">
        {images.map((src, i) => (
          <div key={`${src}-${i}`}>
            <Photo src={src} alt={`Image ${i + 1}`} />
            <button
              type="button"
              onClick={() => setImages((old) => old.filter((_, n) => n !== i))}
            >
              Remove
            </button>
          </div>
        ))}
      </div>
      <label className="field">
        <span>
          {single
            ? 'Image URL'
            : 'Image URLs (one per line; first image is the cover)'}
        </span>
        <textarea
          name={name}
          value={images.join('\n')}
          onChange={(e) => setImages(e.target.value.split('\n'))}
          rows={single ? 2 : 3}
        />
      </label>
    </div>
  );
}
