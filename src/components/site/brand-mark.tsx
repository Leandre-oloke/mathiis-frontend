// The Mathiis logo mark (from the brand file), drawn as a mask so it takes the site's ink colour (black by default).
export function BrandMark({ className = '' }: { className?: string }) {
  const url = 'url(/logo-mathiis.png)';
  return <span aria-hidden="true" className={`brand-mark ${className}`} style={{ WebkitMaskImage: url, maskImage: url }} />;
}
