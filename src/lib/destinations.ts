import forestPhoto from '@/assets/dehradun/forest-research-institute.jpg.asset.json';
import templePhoto from '@/assets/dehradun/tibetan-buddhist-temple.jpg.asset.json';
import shivPhoto from '@/assets/dehradun/shiv-mandir.jpg.asset.json';
import mallPhoto from '@/assets/dehradun/pacific-mall.jpg.asset.json';
import parkPhoto from '@/assets/dehradun/lacchiwalla-nature-park.jpg.asset.json';
import museumPhoto from '@/assets/dehradun/subir-raha-oil-museum.jpg.asset.json';

export type Spot = {
  name: string;
  type: string;
  hours: number;
  note: string;
  lat: number;
  lng: number;
  image?: string;
  sourceUrl?: string;
  rating?: number;
  reviewCount?: number;
};
export type Destination = {
  id: string;
  name: string;
  country: string;
  tagline: string;
  lat: number;
  lng: number;
  spots: Spot[];
  image?: string;
  sourceUrl?: string;
};

export const destinations: Destination[] = [
  { id: 'dehradun', name: 'Dehradun', country: 'India', tagline: 'Uttarakhand · Temples, museums & nature', lat: 30.3165, lng: 78.0322, image: forestPhoto.url,
    sourceUrl: 'https://www.tripadvisor.in/Attractions-g297687-Activities-Dehradun_Dehradun_District_Uttarakhand.html',
    spots: [
      { name: 'Forest Research Institute', type: 'Education', hours: 3, lat: 30.3438, lng: 77.9996, note: 'Explore the institute’s architecture and green campus.', image: forestPhoto.url, rating: 4.5, reviewCount: 710, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d3423751-Reviews-Forest_Research_Institute-Dehradun_Dehradun_District_Uttarakhand.html' },
      { name: 'Tibetan Buddhist Temple', type: 'Culture', hours: 2, lat: 30.2643, lng: 77.9951, note: 'A Buddhist temple with a stupa and decorative artwork.', image: templePhoto.url, rating: 4.5, reviewCount: 369, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d3705692-Reviews-Tibetan_Buddhist_Temple-Dehradun_Dehradun_District_Uttarakhand.html' },
      { name: 'Shiv Mandir', type: 'Culture', hours: 1, lat: 30.3911, lng: 78.0815, note: 'Visit the Shiva temple on the Dehradun–Mussoorie route.', image: shivPhoto.url, rating: 4.5, reviewCount: 89, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d12615658-Reviews-Shiv_Mandir-Dehradun_Dehradun_District_Uttarakhand.html' },
      { name: 'Pacific Mall', type: 'Shopping', hours: 2, lat: 30.3626, lng: 78.0679, note: 'Browse shops and stop for a meal.', image: mallPhoto.url, rating: 4.1, reviewCount: 145, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d7103794-Reviews-Pacific_Mall-Dehradun_Dehradun_District_Uttarakhand.html' },
      { name: 'Lacchiwalla Nature Park', type: 'Nature', hours: 3, lat: 30.2145, lng: 78.1331, note: 'Spend time outdoors; check current access to water areas.', image: parkPhoto.url, rating: 3.9, reviewCount: 84, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d3735498-Reviews-Lacchiwalla_Nature_Park-Dehradun_Dehradun_District_Uttarakhand.html' },
      { name: 'Subir Raha Oil Museum', type: 'Museum', hours: 2, lat: 30.3358, lng: 78.0195, note: 'Discover exhibits about petroleum and the oil industry.', image: museumPhoto.url, rating: 4.5, reviewCount: 26, sourceUrl: 'https://www.tripadvisor.in/Attraction_Review-g297687-d7011005-Reviews-Subir_Raha_Oil_Museum-Dehradun_Dehradun_District_Uttarakhand.html' },
    ],
  },
  { id: "goa", name: "Goa", country: "India", tagline: "Beaches, forts & spice farms", lat: 15.4909, lng: 73.8278, spots: [
    { name: "Baga & Calangute Beach", type: "Beach", hours: 4, lat: 15.5553, lng: 73.7517, note: "Water sports and shacks" },
    { name: "Fort Aguada", type: "History", hours: 2, lat: 15.4922, lng: 73.7737, note: "17th-century Portuguese fort" },
    { name: "Old Goa Churches", type: "Culture", hours: 3, lat: 15.5009, lng: 73.9116, note: "Basilica of Bom Jesus" },
    { name: "Dudhsagar Falls", type: "Nature", hours: 6, lat: 15.3144, lng: 74.3143, note: "Jeep safari to a 310m waterfall" },
    { name: "Anjuna Flea Market", type: "Shopping", hours: 3, lat: 15.5736, lng: 73.7407, note: "Wednesdays only" },
    { name: "Spice Plantation Tour", type: "Food", hours: 3, lat: 15.4241, lng: 74.0067, note: "Lunch included at most farms" },
    { name: "Palolem Beach", type: "Beach", hours: 5, lat: 15.01, lng: 74.0232, note: "Quiet south Goa, kayaking" },
    { name: "Fontainhas, Panaji", type: "Culture", hours: 2, lat: 15.4968, lng: 73.8295, note: "Colourful Latin quarter walk" },
  ]},
  { id: "jaipur", name: "Jaipur", country: "India", tagline: "The Pink City of forts", lat: 26.9124, lng: 75.7873, spots: [
    { name: "Amber Fort", type: "History", hours: 4, lat: 26.9855, lng: 75.8513, note: "Go early to beat crowds" },
    { name: "Hawa Mahal", type: "History", hours: 1, lat: 26.9239, lng: 75.8267, note: "Best seen at sunrise" },
    { name: "City Palace", type: "Culture", hours: 3, lat: 26.9258, lng: 75.8237, note: "Royal residence & museum" },
    { name: "Jantar Mantar", type: "Science", hours: 1, lat: 26.9248, lng: 75.8246, note: "UNESCO astronomical site" },
    { name: "Nahargarh Fort", type: "Viewpoint", hours: 3, lat: 26.9373, lng: 75.8155, note: "Sunset over the city" },
    { name: "Johari & Bapu Bazaar", type: "Shopping", hours: 3, lat: 26.9188, lng: 75.8243, note: "Gems, textiles, juttis" },
    { name: "Chokhi Dhani", type: "Food", hours: 4, lat: 26.7689, lng: 75.8371, note: "Rajasthani village dinner" },
  ]},
  { id: "manali", name: "Manali", country: "India", tagline: "Mountains, snow & cafés", lat: 32.2432, lng: 77.1892, spots: [
    { name: "Solang Valley", type: "Adventure", hours: 5, lat: 32.3164, lng: 77.1574, note: "Paragliding, ropeway" },
    { name: "Hadimba Temple", type: "Culture", hours: 1, lat: 32.2484, lng: 77.1806, note: "Cedar forest temple" },
    { name: "Old Manali", type: "Food", hours: 3, lat: 32.2557, lng: 77.1801, note: "Cafés and riverside walks" },
    { name: "Atal Tunnel & Sissu", type: "Nature", hours: 6, lat: 32.4783, lng: 77.1319, note: "Permit-free scenic drive" },
    { name: "Jogini Falls Trek", type: "Adventure", hours: 4, lat: 32.2753, lng: 77.1959, note: "Easy-moderate hike" },
    { name: "Vashisht Hot Springs", type: "Relax", hours: 2, lat: 32.2654, lng: 77.1879, note: "Natural sulphur baths" },
    { name: "Rohtang Pass", type: "Nature", hours: 7, lat: 32.3716, lng: 77.2466, note: "Needs permit, seasonal" },
  ]},
];

/** Compute great-circle distance in kilometers between two coordinates. */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const R = 6371;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

/** Split spots into days, max ~8 hours of activities per day. */
export function planTrip(spots: Spot[], days: number, maxHours = 8): Spot[][] {
  const plan: Spot[][] = Array.from({ length: days }, () => []);
  const load = new Array(days).fill(0);
  const sorted = [...spots].sort((a, b) => b.hours - a.hours);
  for (const s of sorted) {
    let best = -1;
    for (let d = 0; d < days; d++) if (load[d] + s.hours <= maxHours && (best < 0 || load[d] < load[best])) best = d;
    if (best < 0) continue;
    const day = plan[best];
    if (!day) continue;
    day.push(s);
    load[best] += s.hours;
  }
  return plan;
}
