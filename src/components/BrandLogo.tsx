export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-10 w-10';
  const textSize = size === 'sm' ? 'text-lg' : 'text-2xl';

  return (
    <span className="inline-flex shrink-0 items-center gap-3 whitespace-nowrap">
      {/* Purple circle with white paper plane & dotted curved trail */}
      <svg
        viewBox="0 0 64 64"
        className={`${iconSize} shrink-0`}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="30" fill="#6C3FE4" />
        {/* Dotted flight trail */}
        <path
          d="M14 50C17 44 22 40 28 37"
          stroke="#FFFFFF"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeDasharray="1.5 6.5"
        />
        {/* Paper plane */}
        <path
          d="M49 16L17 31L29 35L35 47L49 16Z"
          fill="#FFFFFF"
        />
        <path
          d="M49 16L29 35L33 43L49 16Z"
          fill="#E5DCFF"
        />
      </svg>

      <span className="flex flex-col leading-none">
        <span className={`font-display ${textSize} font-medium tracking-tight`}>
          <span className="text-foreground">Trip</span>
          <span className="text-[#7C5CFF]">Pilot</span>
        </span>
        <span className="mt-0.5 text-[9px] font-medium uppercase tracking-[0.26em] text-muted-foreground">
          Itinerary Planner
        </span>
      </span>
    </span>
  );
}
