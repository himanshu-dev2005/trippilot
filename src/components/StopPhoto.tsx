import { useEffect, useState } from 'react';
import { Compass, Mountain, Utensils, Landmark, ShoppingBag } from 'lucide-react';
import { fetchPlacePhotoDataUrl } from '@/lib/trips';

export function StopPhoto({
  name,
  category,
  destination,
  photoReference,
  className,
}: {
  name: string;
  category: string;
  destination?: string;
  photoReference?: string;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    setDataUrl(null);
    void fetchPlacePhotoDataUrl({
      data: {
        ...(photoReference ? { photoReference } : {}),
        ...(destination ? { destination } : {}),
        placeName: name,
      },
    })
      .then((res) => {
        if (active && res.dataUrl) setDataUrl(res.dataUrl);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [photoReference, name, destination]);

  const sizeClass = className ?? 'h-24 w-24 shrink-0 rounded-md sm:h-28 sm:w-28';

  if (dataUrl) {
    return (
      <img
        src={dataUrl}
        alt={name}
        loading="lazy"
        referrerPolicy="no-referrer"
        onError={() => setDataUrl(null)}
        className={`${sizeClass} bg-muted object-cover`}
      />
    );
  }

  const lower = category.toLowerCase();
  let Icon = Compass;
  let gradient = 'from-emerald-800 to-teal-700';
  if (lower.includes('nature') || lower.includes('park') || lower.includes('adventure')) {
    Icon = Mountain;
    gradient = 'from-teal-800 to-emerald-600';
  } else if (lower.includes('food') || lower.includes('cafe')) {
    Icon = Utensils;
    gradient = 'from-amber-800 to-orange-600';
  } else if (lower.includes('history') || lower.includes('culture') || lower.includes('museum')) {
    Icon = Landmark;
    gradient = 'from-stone-800 to-amber-700';
  } else if (lower.includes('shop')) {
    Icon = ShoppingBag;
    gradient = 'from-indigo-800 to-purple-600';
  }

  return (
    <div
      className={`flex flex-col items-center justify-center bg-gradient-to-br ${gradient} p-2 text-white ${sizeClass}`}
    >
      <Icon className="size-6 opacity-90" />
      <span className="mt-1 truncate text-[10px] font-mono uppercase opacity-90">{category}</span>
    </div>
  );
}
