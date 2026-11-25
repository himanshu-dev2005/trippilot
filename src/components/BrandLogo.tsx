export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex items-center gap-2.5">
      <span
        className={`flex ${iconSize} items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-purple-700 text-white shadow-md shadow-violet-600/25`}
      >
        <svg viewBox="0 0 24 24" className="h-4.5 w-4.5" fill="none" aria-hidden="true">
          <path
            d="M12 2.5C7.858 2.5 4.5 5.858 4.5 10c0 5.6 7.5 11.5 7.5 11.5S19.5 15.6 19.5 10c0-4.142-3.358-7.5-7.5-7.5Z"
            fill="currentColor"
          />
          <circle cx="12" cy="10" r="2.5" className="fill-violet-700" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display ${textSize} font-medium tracking-tight text-foreground`}>
          TripPilot
        </span>
        <span className="mt-0.5 font-mono text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
          Trip Planner · India
        </span>
      </span>
    </span>
  );
}
