export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-7 w-7' : 'h-8 w-8';
  const textSize = size === 'sm' ? 'text-base' : 'text-lg';

  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      <span
        className={`flex ${iconSize} shrink-0 items-center justify-center rounded-lg bg-foreground text-background`}
      >
        <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" aria-hidden="true">
          <path
            d="M12 2.5C7.858 2.5 4.5 5.858 4.5 10c0 5.6 7.5 11.5 7.5 11.5S19.5 15.6 19.5 10c0-4.142-3.358-7.5-7.5-7.5Z"
            fill="currentColor"
          />
          <circle cx="12" cy="10" r="2.5" className="fill-background" />
        </svg>
      </span>
      <span className={`font-display ${textSize} font-extrabold tracking-tight text-foreground`}>
        TripPilot
      </span>
    </span>
  );
}
