export function BrandLogo({ size = 'md' }: { size?: 'sm' | 'md' }) {
  const iconSize = size === 'sm' ? 'h-8 w-8' : 'h-9 w-9';
  const textSize = size === 'sm' ? 'text-lg' : 'text-xl';

  return (
    <span className="inline-flex shrink-0 items-center gap-2.5 whitespace-nowrap">
      <span
        className={`flex ${iconSize} shrink-0 items-center justify-center rounded-full border-2 border-zinc-800 bg-white text-[#38d67a] dark:border-zinc-200 dark:bg-zinc-900`}
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" aria-hidden="true">
          <path
            d="M12 2.5C7.858 2.5 4.5 5.858 4.5 10c0 5.6 7.5 11.5 7.5 11.5S19.5 15.6 19.5 10c0-4.142-3.358-7.5-7.5-7.5Z"
            fill="currentColor"
          />
          <circle cx="12" cy="10" r="2.5" fill="white" />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={`font-display ${textSize} font-bold tracking-tight text-[#38d67a]`}>
          TripPilot
        </span>
        <span className="text-[10px] font-medium text-muted-foreground">Let&apos;s Plan</span>
      </span>
    </span>
  );
}
