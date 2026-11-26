import jaipurImg from '@/assets/images/circuit_jaipur_1795697908494.jpg';
import varanasiImg from '@/assets/images/circuit_varanasi_1795697909580.jpg';
import keralaImg from '@/assets/images/circuit_kerala_1795697913226.jpg';
import dehradunImg from '@/assets/images/circuit_dehradun_1795697913835.jpg';
import manaliImg from '@/assets/images/circuit_manali_1795697910374.jpg';
import goaImg from '@/assets/images/circuit_goa_1795697911466.jpg';
import udaipurImg from '@/assets/images/circuit_udaipur_1795697914260.jpg';
import ladakhImg from '@/assets/images/circuit_ladakh_1795697914814.jpg';
import delhiImg from '@/assets/images/circuit_delhi_1795697914750.jpg';

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
  interests: string[];
};

export const CIRCUIT_IMAGES = {
  jaipur: jaipurImg,
  varanasi: varanasiImg,
  kerala: keralaImg,
  dehradun: dehradunImg,
  manali: manaliImg,
  goa: goaImg,
  udaipur: udaipurImg,
  ladakh: ladakhImg,
  delhi: delhiImg,
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
    image: delhiImg,
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
    image: jaipurImg,
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
    image: varanasiImg,
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
    image: keralaImg,
    interests: ['Nature & Parks', 'Food & Cafés'],
  },
  {
    city: 'Dehradun',
    title: 'Dehradun',
    subtitle: 'Colonial heritage, monasteries & valley springs',
    region: 'Uttarakhand',
    regionGroup: 'North & Himalayas',
    days: 3,
    budget: 5000,
    rating: '4.8',
    image: dehradunImg,
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
    image: udaipurImg,
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
    image: manaliImg,
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
    image: goaImg,
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
    image: ladakhImg,
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

  if (dest.includes('delhi')) return delhiImg;
  if (dest.includes('jaipur') || dest.includes('jodhpur') || dest.includes('jaisalmer')) return jaipurImg;
  if (dest.includes('udaipur')) return udaipurImg;
  if (dest.includes('varanasi') || dest.includes('rishikesh') || dest.includes('haridwar')) return varanasiImg;
  if (dest.includes('goa') || dest.includes('gokarna') || dest.includes('pondicherry') || dest.includes('udupi')) return goaImg;
  if (dest.includes('alleppey') || dest.includes('kochi') || dest.includes('munnar') || dest.includes('kerala')) return keralaImg;
  if (dest.includes('leh') || dest.includes('ladakh') || dest.includes('spiti')) return ladakhImg;
  if (dest.includes('manali') || dest.includes('shimla') || dest.includes('dharamshala') || dest.includes('srinagar')) return manaliImg;
  if (dest.includes('dehradun') || dest.includes('mussoorie') || dest.includes('nainital')) return dehradunImg;

  if (cat.includes('beach') || cat.includes('coast')) return goaImg;
  if (cat.includes('history') || cat.includes('fort') || cat.includes('palace') || cat.includes('museum')) return delhiImg;
  if (cat.includes('spiritual') || cat.includes('temple') || cat.includes('culture')) return varanasiImg;
  if (cat.includes('adventure') || cat.includes('trek')) return manaliImg;
  if (cat.includes('nature') || cat.includes('park') || cat.includes('lake')) return keralaImg;

  return jaipurImg;
}
