import heroSigiriyaImg from '@/assets/images/hero_sigiriya.jpg';
import jaipurFallback from '@/assets/images/circuit_jaipur_1795697908494.jpg';
import varanasiFallback from '@/assets/images/circuit_varanasi_1795697909580.jpg';
import keralaFallback from '@/assets/images/circuit_kerala_1795697913226.jpg';
import dehradunFallback from '@/assets/images/circuit_dehradun_1795697913835.jpg';
import manaliFallback from '@/assets/images/circuit_manali_1795697910374.jpg';
import goaFallback from '@/assets/images/circuit_goa_1795697911466.jpg';
import udaipurFallback from '@/assets/images/circuit_udaipur_1795697914260.jpg';
import ladakhFallback from '@/assets/images/circuit_ladakh_1795697914814.jpg';
import delhiFallback from '@/assets/images/circuit_delhi_1795697914750.jpg';

export type FeaturedCircuit = {
  city: string;
  title: string;
  subtitle: string;
  region: string;
  regionGroup: 'North & Himalayas' | 'Rajasthan' | 'Coast & Backwaters' | 'Heritage & Spiritual';
  days: number;
  budget: number;
  rating: string;
  image: string;
  fallbackImage: string;
  interests: string[];
};

// Real high-resolution travel photography (with local bundled fallbacks)
export const CIRCUIT_IMAGES = {
  hero: heroSigiriyaImg,
  jaipur: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=85',
  varanasi: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=85',
  kerala: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=85',
  dehradun: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=85',
  manali: 'https://images.unsplash.com/photo-1571401835393-8c5f35328320?auto=format&fit=crop&w=1200&q=85',
  goa: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=85',
  udaipur: 'https://images.unsplash.com/photo-1599661046289-e31897846e41?auto=format&fit=crop&w=1200&q=85',
  ladakh: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=85',
  delhi: 'https://images.unsplash.com/photo-1587474260584-136574528ed5?auto=format&fit=crop&w=1200&q=85',
} as const;

export const FEATURED_CIRCUITS: FeaturedCircuit[] = [
  {
    city: 'New Delhi',
    title: 'New Delhi',
    subtitle: 'Mughal tombs, boulevards & old bazaars',
    region: 'Delhi NCR',
    regionGroup: 'Heritage & Spiritual',
    days: 3,
    budget: 6000,
    rating: '4.9',
    image: CIRCUIT_IMAGES.delhi,
    fallbackImage: delhiFallback,
    interests: ['History & Forts', 'Culture & Heritage', 'Food & Cafés'],
  },
  {
    city: 'Jaipur',
    title: 'Jaipur',
    subtitle: 'Hilltop forts, pink facades & craft bazaars',
    region: 'Rajasthan',
    regionGroup: 'Rajasthan',
    days: 4,
    budget: 8000,
    rating: '4.9',
    image: CIRCUIT_IMAGES.jaipur,
    fallbackImage: jaipurFallback,
    interests: ['History & Forts', 'Culture & Heritage', 'Shopping & Markets'],
  },
  {
    city: 'Varanasi',
    title: 'Varanasi',
    subtitle: 'Dawn river ghats, alleys & sacred temples',
    region: 'Uttar Pradesh',
    regionGroup: 'Heritage & Spiritual',
    days: 3,
    budget: 5000,
    rating: '4.9',
    image: CIRCUIT_IMAGES.varanasi,
    fallbackImage: varanasiFallback,
    interests: ['Spiritual & Temples', 'Culture & Heritage', 'Food & Cafés'],
  },
  {
    city: 'Alleppey',
    title: 'Alleppey & Munnar',
    subtitle: 'Palm-lined backwaters & tea estates',
    region: 'Kerala',
    regionGroup: 'Coast & Backwaters',
    days: 5,
    budget: 10000,
    rating: '4.9',
    image: CIRCUIT_IMAGES.kerala,
    fallbackImage: keralaFallback,
    interests: ['Nature & Parks', 'Food & Cafés'],
  },
  {
    city: 'Dehradun',
    title: 'Dehradun',
    subtitle: 'Foothill valleys, monasteries & forest trails',
    region: 'Uttarakhand',
    regionGroup: 'North & Himalayas',
    days: 3,
    budget: 5000,
    rating: '4.8',
    image: CIRCUIT_IMAGES.dehradun,
    fallbackImage: dehradunFallback,
    interests: ['Nature & Parks', 'Culture & Heritage'],
  },
  {
    city: 'Udaipur',
    title: 'Udaipur',
    subtitle: 'Lake Pichola palaces & Aravalli sunsets',
    region: 'Rajasthan',
    regionGroup: 'Rajasthan',
    days: 4,
    budget: 8500,
    rating: '4.9',
    image: CIRCUIT_IMAGES.udaipur,
    fallbackImage: udaipurFallback,
    interests: ['History & Forts', 'Culture & Heritage'],
  },
  {
    city: 'Manali',
    title: 'Manali',
    subtitle: 'Snow passes, cedar forests & riverside cafés',
    region: 'Himachal Pradesh',
    regionGroup: 'North & Himalayas',
    days: 4,
    budget: 9000,
    rating: '4.8',
    image: CIRCUIT_IMAGES.manali,
    fallbackImage: manaliFallback,
    interests: ['Adventure & Treks', 'Nature & Parks', 'Food & Cafés'],
  },
  {
    city: 'Goa',
    title: 'North & South Goa',
    subtitle: 'Crescent bays, Portuguese forts & spice farms',
    region: 'Goa',
    regionGroup: 'Coast & Backwaters',
    days: 4,
    budget: 9500,
    rating: '4.9',
    image: CIRCUIT_IMAGES.goa,
    fallbackImage: goaFallback,
    interests: ['Nature & Parks', 'Culture & Heritage', 'Food & Cafés'],
  },
  {
    city: 'Leh',
    title: 'Leh & Ladakh',
    subtitle: 'Turquoise alpine lakes & high monasteries',
    region: 'Ladakh',
    regionGroup: 'North & Himalayas',
    days: 5,
    budget: 15000,
    rating: '4.9',
    image: CIRCUIT_IMAGES.ladakh,
    fallbackImage: ladakhFallback,
    interests: ['Adventure & Treks', 'Nature & Parks', 'Spiritual & Temples'],
  },
];

/**
 * Returns a local editorial fallback photo tailored to the destination or attraction category
 * so no stop ever renders a broken image frame or crude placeholder.
 */
export function getFallbackStopImage(destination?: string, category?: string): string {
  const dest = (destination ?? '').toLowerCase();
  const cat = (category ?? '').toLowerCase();

  if (dest.includes('delhi')) return delhiFallback;
  if (dest.includes('jaipur') || dest.includes('jodhpur') || dest.includes('jaisalmer')) return jaipurFallback;
  if (dest.includes('udaipur')) return udaipurFallback;
  if (dest.includes('varanasi') || dest.includes('rishikesh') || dest.includes('haridwar')) return varanasiFallback;
  if (dest.includes('goa') || dest.includes('gokarna') || dest.includes('pondicherry') || dest.includes('udupi')) return goaFallback;
  if (dest.includes('alleppey') || dest.includes('kochi') || dest.includes('munnar') || dest.includes('kerala')) return keralaFallback;
  if (dest.includes('leh') || dest.includes('ladakh') || dest.includes('spiti')) return ladakhFallback;
  if (dest.includes('manali') || dest.includes('shimla') || dest.includes('dharamshala') || dest.includes('srinagar')) return manaliFallback;
  if (dest.includes('dehradun') || dest.includes('mussoorie') || dest.includes('nainital')) return dehradunFallback;

  if (cat.includes('beach') || cat.includes('coast')) return goaFallback;
  if (cat.includes('history') || cat.includes('fort') || cat.includes('palace') || cat.includes('museum')) return delhiFallback;
  if (cat.includes('spiritual') || cat.includes('temple') || cat.includes('culture')) return varanasiFallback;
  if (cat.includes('adventure') || cat.includes('trek')) return manaliFallback;
  if (cat.includes('nature') || cat.includes('park') || cat.includes('lake')) return keralaFallback;

  return jaipurFallback;
}
