export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const textSize = size === 'sm' ? 'text-xl' : 'text-2xl';

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex ${iconSize} items-center justify-center rounded-xl bg-gradient-to-br from-primary to-primary/80 text-primary-foreground shadow-sm`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 2.5C7.858 2.5 4.5 5.858 4.5 10c0 5.6 7.5 11.5 7.5 11.5S19.5 15.6 19.5 10c0-4.142-3.358-7.5-7.5-7.5Z"
            fill="currentColor"
          />
          <circle cx="12" cy="10" r="2.75" className="fill-accent" />
        </svg>
      </span>
      <span className={`font-display ${textSize} tracking-tight text-foreground`}>TripPilot</span>
    </span>
  );
}
