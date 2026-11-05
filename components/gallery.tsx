'use client';
import { useState } from 'react';
import { Photo } from './photo';
export function Gallery({ images, name }: { images: string[]; name: string }) {
  const [active, setActive] = useState(0);
  const photos = images.length ? images : ['/images/placeholder.svg'];
  return (
    <div className="gallery">
      <Photo src={photos[active]} alt={name} className="gallery-main" />
      <div className="gallery-thumbnails">
        {photos.map((src, i) => (
          <button
            key={`${src}-${i}`}
            aria-label={`${name} — ${i + 1}`}
            aria-pressed={active === i}
            onClick={() => setActive(i)}
          >
            <Photo src={src} alt="" />
          </button>
        ))}
      </div>
    </div>
  );
}
