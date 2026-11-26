export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      {/* TripPilot compass/map-pin icon in brand teal */}
      <span
        className={`flex ${iconSize} shrink-0 items-center justify-center rounded-xl bg-primary text-white shadow-md`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 2C8.134 2 5 5.134 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.866-3.134-7-7-7Z"
            fill="currentColor"
            opacity="0.9"
          />
          <circle cx="12" cy="9" r="2.5" fill="white" />
        </svg>
      </span>
      <span className={`font-display ${textSize} font-bold tracking-tight`}>
        <span className="text-primary">Trip</span>
        <span className="text-foreground">Pilot</span>
      </span>
    </span>
  );
}
