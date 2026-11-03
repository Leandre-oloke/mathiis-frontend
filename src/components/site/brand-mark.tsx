// The Mathiis logo mark (from the brand file), drawn as a mask so it takes the site's ink colour (black by default).
// Used on the home page (and anything scoped under .accueil-page), which keeps the noir et blanc identity.
export function BrandMark({ className = '' }: { className?: string }) {
  const url = 'url(/logo-mathiis.png)';
  return <span aria-hidden="true" className={`brand-mark ${className}`} style={{ WebkitMaskImage: url, maskImage: url }} />;
}

// The Mathiis logo recoloured to the brand's indigo (--primary) -- used
// everywhere outside the home page's noir et blanc identity. Drawn as a
// mask (same technique as BrandMark) rather than the raw colour JPG, so it
// matches the site's indigo token exactly instead of the file's own blue.
export function BrandMarkColor({ className = '' }: { className?: string }) {
  const url = 'url(/logo-mathiis.png)';
  return <span aria-hidden="true" className={`brand-mark brand-mark-indigo ${className}`} style={{ WebkitMaskImage: url, maskImage: url }} />;
}
