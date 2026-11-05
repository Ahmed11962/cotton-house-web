export function Photo({
  src,
  alt,
  className = '',
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}) {
  const match = src.match(/#tile-(\d)$/);
  if (match) {
    const i = Number(match[1]);
    return (
      <div
        role={alt ? 'img' : undefined}
        aria-label={alt || undefined}
        className={`tile-photo ${className}`}
        style={{
          backgroundImage: `url('${src.split('#')[0]}')`,
          backgroundSize: '300% 300%',
          backgroundPosition: `${(i % 3) * 50}% ${Math.floor(i / 3) * 50}%`,
        }}
      />
    );
  }
  return (
    <img
      className={className}
      src={src || '/images/placeholder.svg'}
      alt={alt}
      loading={priority ? 'eager' : 'lazy'}
      fetchPriority={priority ? 'high' : undefined}
      width={600}
      height={720}
    />
  );
}
