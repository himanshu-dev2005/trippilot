import type { AttractionCandidate, Coordinates } from '@/lib/optimizer';

export const TRAVEL_RECOMMENDATION_REPO_URL =
  'https://github.com/arshiyaaftab/travel-recommendation-system/blob/master/place_2.csv';

export type ImportedPlaceEntry = {
  name: string;
  rating: number;
  rawType: string;
  category: string;
  isOutdoor: boolean;
  cost: number;
  duration: number;
};

export type ImportedCityCatalog = {
  city: string;
  state: string;
  country: string;
  center: Coordinates;
  places: ImportedPlaceEntry[];
};

const CITY_ALIASES: Record<string, string> = {
  bangalore: 'Bangalore',
  bengaluru: 'Bangalore',
  belgaum: 'Belgaum',
  belagavi: 'Belgaum',
  bellary: 'Bellary',
  ballari: 'Bellary',
  bijapur: 'Bijapur',
  vijayapura: 'Bijapur',
  chikballapur: 'Chikballapur',
  chikkaballapur: 'Chikballapur',
  chikmagalur: 'Chikmagalur',
  chikkamagaluru: 'Chikmagalur',
  coorg: 'Coorg',
  kodagu: 'Coorg',
  madikeri: 'Coorg',
  gulbarga: 'Gulbarga',
  kalaburagi: 'Gulbarga',
  hospet: 'Hospet',
  hosapete: 'Hospet',
  hampi: 'Hospet',
  mangalore: 'Mangalore',
  mangaluru: 'Mangalore',
  mysore: 'Mysore',
  mysuru: 'Mysore',
  ramnagaram: 'Ramnagaram',
  ramanagara: 'Ramnagaram',
  shimoga: 'Shimoga',
  shivamogga: 'Shimoga',
  tumkur: 'Tumkur',
  tumakuru: 'Tumkur',
};

export const KARNATAKA_CITY_CATALOG: ImportedCityCatalog[] = [
  {
    "city": "Bangalore",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.9716,
      "lng": 77.5946
    },
    "places": [
      {
        "name": "Art Focus Creativity Art Gallery",
        "rating": 5.0,
        "rawType": "Art Gallery",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Chikka Tirupathi Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Dodda Ganapathi Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Don Bosco Church Church",
        "rating": 5.0,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jai Durga Maa Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mahalingeshwara Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mantri Square Mall",
        "rating": 5.0,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Pyramid Valley International Architectural Building",
        "rating": 5.0,
        "rawType": "Architectural Building",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Raja Rajeshwari Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Saint Anthony's Friary Church Church",
        "rating": 5.0,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bangalore Airport",
        "rating": 4.9,
        "rawType": "Airport",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Breakout - Real Life Escape Games Entertainment Centre",
        "rating": 4.9,
        "rawType": "Entertainment Centre",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Karnatak Chitrakala Parishath Craft",
        "rating": 4.9,
        "rawType": "Craft",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Skandagiri Hills (Kalavara Durga) Hill",
        "rating": 4.8,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Savandurga Hill",
        "rating": 4.7,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Visvesvaraya Industrial And Technological Museum Museum",
        "rating": 4.7,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Art Of Living International Center Ashram",
        "rating": 4.6,
        "rawType": "Ashram",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Avalabetta Fort Hill",
        "rating": 4.6,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kempfort Shiva Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Siddaganga Mutt Religious Place",
        "rating": 4.6,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Venkataramanaswamy Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "HAL Heritage Centre And Aerospace Museum Museum",
        "rating": 4.5,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "ISKCON Bangalore, Sri Sri Lakshmi Narasimha Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jawaharlal Nehru Planetarium Planetarium",
        "rating": 4.5,
        "rawType": "Planetarium",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Jumma Masjid Mosque",
        "rating": 4.5,
        "rawType": "Mosque",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mookambika Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Phoenix Market City Mall",
        "rating": 4.5,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Surayanarayana Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Vikasa Soudha Offbeat Attraction",
        "rating": 4.5,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Wonder La Theme Park",
        "rating": 4.5,
        "rawType": "Theme Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bull Temple Nandi Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Devi Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gavi Gangadhareshwara Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "ISKCON Sri Radha Krishna-Chandra Mandir Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "MG Road Boulevard Craft",
        "rating": 4.4,
        "rawType": "Craft",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "National Gallery Of Modern Art Art Gallery",
        "rating": 4.4,
        "rawType": "Art Gallery",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Ragigudda Prasanna Anjaneya Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "St. Marys Basilica Church",
        "rating": 4.4,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bangalore Palace Palace",
        "rating": 4.3,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bannerghatta National Park National Park",
        "rating": 4.3,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bugle Rock Rock",
        "rating": 4.3,
        "rawType": "Rock",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Commercial Street Street",
        "rating": 4.3,
        "rawType": "Street",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Four Square Gospel Church Church",
        "rating": 4.3,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Fun World Theme Park",
        "rating": 4.3,
        "rawType": "Theme Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Good Shepherd CSI Church Church",
        "rating": 4.3,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jaganath Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kempegowda Tower 2 Historic Place",
        "rating": 4.3,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Madivala Lake Lake",
        "rating": 4.3,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Meenakshi Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mini Forest Park",
        "rating": 4.3,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Mukambikey Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Om Shakthi Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Dakshinamukha Nandi Tirtha Kalyani Kshetra Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Thattekere Lake",
        "rating": 4.3,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Thippagondanahalli Reservoir Reservoir",
        "rating": 4.3,
        "rawType": "Reservoir",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Venkatappa Art Gallery Art Gallery",
        "rating": 4.3,
        "rawType": "Art Gallery",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Vidhana Soudha Historic Place",
        "rating": 4.3,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Attara Kacheri Offbeat Attraction",
        "rating": 4.2,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Cubbon Park Park",
        "rating": 4.2,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Hebbal Lake Lake",
        "rating": 4.2,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Lal Bagh Garden",
        "rating": 4.2,
        "rawType": "Garden",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Miracle Centre Church Church",
        "rating": 4.2,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shivasamudram Falls Water Fall",
        "rating": 4.2,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shree Mukti Naga Kshetra Religious Place",
        "rating": 4.2,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bangalore Turf Club Club",
        "rating": 4.1,
        "rawType": "Club",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Chunchi Falls Water Fall",
        "rating": 4.1,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Forum Mall Mall",
        "rating": 4.1,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Garuda Mall Mall",
        "rating": 4.1,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Indira Gandhi Musical Fountain Park",
        "rating": 4.1,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Mahatma Gandhi (MG) Road Street",
        "rating": 4.1,
        "rawType": "Street",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Oralakallu Teertha Historic Place",
        "rating": 4.1,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Sankey Tank Lake",
        "rating": 4.1,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Ulsoor Lake Lake",
        "rating": 4.1,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Aquarium Bangalore Aquarium",
        "rating": 4.0,
        "rawType": "Aquarium",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Bangalore Fort Fort",
        "rating": 4.0,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Brigade Road Street",
        "rating": 4.0,
        "rawType": "Street",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Chikkabanavara Lake Lake",
        "rating": 4.0,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Dodda Alada Mara (Big Banyan Tree) Park",
        "rating": 4.0,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Food Street, V V Puram Street",
        "rating": 4.0,
        "rawType": "Street",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Government Of Karnataka Museum Museum",
        "rating": 4.0,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Kempegowda International Airport Airport",
        "rating": 4.0,
        "rawType": "Airport",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Seshadari Iyer Memorial Memorial",
        "rating": 4.0,
        "rawType": "Memorial",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Tipu Sultan Palace Palace",
        "rating": 4.0,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Devanahalli Fort Fort",
        "rating": 3.9,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Kashmir Art Gallery Art Gallery",
        "rating": 3.9,
        "rawType": "Art Gallery",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Kerala Art Gallery Art Gallery",
        "rating": 3.9,
        "rawType": "Art Gallery",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Lumbini Gardens Garden",
        "rating": 3.9,
        "rawType": "Garden",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shanmuga Temple Temple",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Lakes Lake",
        "rating": 3.8,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Manchinbele Dam Dam",
        "rating": 3.8,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Snow City Entertainment Centre",
        "rating": 3.8,
        "rawType": "Entertainment Centre",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Innovative Film City Theme Park",
        "rating": 3.7,
        "rawType": "Theme Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Anthargange Walkway",
        "rating": 3.6,
        "rawType": "Walkway",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Cauvery Karnataka State Arts & Crafts Emporium Art Emporium",
        "rating": 3.6,
        "rawType": "Art Emporium",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Deer Park Park",
        "rating": 3.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Rangoli Metro Art Center Craft",
        "rating": 3.6,
        "rawType": "Craft",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Sri Kaadu Mallikarjunaswamy Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Vani Science Park Museum",
        "rating": 3.6,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Kempegowda Tower 3 Historic Place",
        "rating": 2.9,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "New Testament Church Church",
        "rating": 2.5,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Belgaum",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.8497,
      "lng": 74.4977
    },
    "places": [
      {
        "name": "Kote Keri (Fort Lake) Lake",
        "rating": 5.0,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kapileshwara Temple Temple",
        "rating": 4.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kamala Basti Heritage Site",
        "rating": 4.6,
        "rawType": "Heritage Site",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ramkrishna Ashrama Ashram",
        "rating": 4.6,
        "rawType": "Ashram",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Military Durga Devi Mandir Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Belgaum Fort Fort",
        "rating": 4.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Rakaskop Cave",
        "rating": 4.3,
        "rawType": "Cave",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Sural Falls Water Fall",
        "rating": 4.3,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Mahadev Temple Temple",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Naviltirtha Valley",
        "rating": 3.6,
        "rawType": "Valley",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Sri Hanuman Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kittur Fort And Palace Fort",
        "rating": 3.2,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Bellary",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.1394,
      "lng": 76.9214
    },
    "places": [
      {
        "name": "Bellary Fort Fort",
        "rating": 4.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bellary Zoo Zoo",
        "rating": 4.4,
        "rawType": "Zoo",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "British Colonial Buildings Historic Place",
        "rating": 4.4,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Kumbara Gudda Hill",
        "rating": 4.4,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kuntegadda Park And Kaategudda Park Park",
        "rating": 4.4,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Lower Fort Fort",
        "rating": 4.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Mailarlinga Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Other Hills Hill",
        "rating": 4.4,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "The Rocks Mountain",
        "rating": 4.4,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Turkish Martyrs Graveyard Historic Place",
        "rating": 4.4,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Upper Fort Fort",
        "rating": 4.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Bidar",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 17.9104,
      "lng": 77.5199
    },
    "places": [
      {
        "name": "Bahmani Tombs Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bidar Fort Fort",
        "rating": 4.5,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Chaubara Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Chaukhandi Of Hazrat Khalil Ullah Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Gurudwara Nanak Jhira Sahib Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mohamad Gawan Madarsa Religious Place",
        "rating": 4.5,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Narasimha Jhira Cave Temple Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Papnash Shiva Temple Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Rangin Mahal Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Solah Khamba Mosque Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Bijapur",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 16.8302,
      "lng": 75.71
    },
    "places": [
      {
        "name": "Almatti Dam Dam",
        "rating": 4.5,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Archaeological Museum Bijapur Museum",
        "rating": 4.5,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Bara Dari (Cook Palace) Heritage Site",
        "rating": 4.5,
        "rawType": "Heritage Site",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bara Kaman Historic Place",
        "rating": 4.5,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bijapur Castle Fort",
        "rating": 4.5,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bijpaur Fort Fort",
        "rating": 4.5,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Gol Gumbaz Historic Place",
        "rating": 4.5,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ibrahim Rauza Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Jama Masjid Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jod Gumbaz Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Jumma Masjid Mosque",
        "rating": 4.5,
        "rawType": "Mosque",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kudalasangama Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Lotus Lake Lake",
        "rating": 4.5,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Malik-e-Maidan Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Sat Manzil Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Shivgiri Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shri Shiddeshwar Temple Place of Worship",
        "rating": 4.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Taj Bawdi Offbeat Attraction",
        "rating": 4.5,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Upli Burj Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Uppali Buruz Monument",
        "rating": 4.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Mehtar Mahal Palace",
        "rating": 3.3,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Csi Church Church",
        "rating": 3.2,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Basanta Vana Place of Worship",
        "rating": 3.1,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sherza Burj Historic Place",
        "rating": 3.0,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Afzal Khan Cenotaph Monument",
        "rating": 2.9,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Gajanana Temple Place of Worship",
        "rating": 2.9,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jala Manzil Palace",
        "rating": 2.9,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ambabai Temple Temple",
        "rating": 2.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Ayyappa Swamy Temple Temple",
        "rating": 2.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gagan Mahal Palace",
        "rating": 2.8,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Shri Prasanna Ganesh Temple Craft",
        "rating": 2.8,
        "rawType": "Craft",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Asar Mahal Monument",
        "rating": 2.7,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Narasimha Temple Place of Worship",
        "rating": 2.7,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Navaraspura Entertainment Centre",
        "rating": 2.7,
        "rawType": "Entertainment Centre",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Sangeeta Mahal Entertainment Centre",
        "rating": 2.7,
        "rawType": "Entertainment Centre",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Anand Mahal Palace",
        "rating": 2.6,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bhairamgarh Sanctuary Sanctuary",
        "rating": 2.6,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Pangarh Fort Fort",
        "rating": 2.6,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Chand Bawadi Historic Place",
        "rating": 2.5,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "The Citadel Monument",
        "rating": 2.5,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Chamarajanagar",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 11.9261,
      "lng": 76.9437
    },
    "places": [
      {
        "name": "Dargah Of Peer Hazarath Sayyaduna Hazarath Murdana Gayib Religious Place",
        "rating": 5.0,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bara Chukki Offbeat Attraction",
        "rating": 4.4,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Suvarnavathi Reservoir Offbeat Attraction",
        "rating": 3.8,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Chamarajeshwara Temple Place of Worship",
        "rating": 3.7,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gopalaswamy Betta Hill",
        "rating": 3.7,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kanakagiri Hill Hill",
        "rating": 3.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      }
    ]
  },
  {
    "city": "Chikballapur",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.4355,
      "lng": 77.7315
    },
    "places": [
      {
        "name": "Chintamani",
        "rating": 3.6,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Nandi Hills",
        "rating": 3.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kaivara",
        "rating": 3.4,
        "rawType": "Mountain",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "The Ranganatha Swamy temple",
        "rating": 3.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Vivekanand Falls",
        "rating": 3.4,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bhoganandeeshwara Temple",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Muddenahalli",
        "rating": 3.1,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Trekking",
        "rating": 3.1,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Chikmagalur",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.3161,
      "lng": 75.772
    },
    "places": [
      {
        "name": "Madagadakere Lake Lake",
        "rating": 5.0,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Torana Ganapati Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Amruteshvara Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Annapurneshwari Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Ayyanakere Lake Lake",
        "rating": 4.5,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Baba Budan Giri Hills Hill",
        "rating": 4.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bhadra Wildlife Sanctuary Sanctuary",
        "rating": 4.5,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Charmadi Ghat (Mudigere) Ghat",
        "rating": 4.5,
        "rawType": "Ghat",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Coffee Museum Museum",
        "rating": 4.5,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Hanumana Gundi Falls Water Fall",
        "rating": 4.5,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Hebbe Falls Water Fall",
        "rating": 4.5,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Inam Dattatreya Peetha Religious Place",
        "rating": 4.5,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jerry Falls Water Fall",
        "rating": 4.5,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kemmanagundi Hill",
        "rating": 4.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kudremukh National Park National Park",
        "rating": 4.5,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Mullaiyanagiri Hill",
        "rating": 4.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Mullayanagiri Hill",
        "rating": 4.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Rajendra Hill Hill",
        "rating": 4.5,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Sharadamba Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Parsawanath Tirthankara Jain Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sringeri Mutt Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sringeri Sharada Peetha Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kodanda Ramaswamy Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Manikyadhara Falls Water Fall",
        "rating": 3.9,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Malayala Brahma Temple Temple",
        "rating": 3.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Central Coffee Research Institution Offbeat Attraction",
        "rating": 3.7,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Vidyasankara Temple Temple",
        "rating": 3.7,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gangamoola Hill Hill",
        "rating": 3.6,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kere Anjaneya Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Lakya Dam Dam",
        "rating": 3.5,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kalahatti Falls Water Fall",
        "rating": 3.4,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Muthodi Wildlife Sanctuary Sanctuary",
        "rating": 2.9,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Rock Garden Garden",
        "rating": 2.9,
        "rawType": "Garden",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Thirumaleguppi Mountain",
        "rating": 2.1,
        "rawType": "Mountain",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Mahatama Gandhi Park. Park",
        "rating": 1.4,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Chitradurga",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 14.2251,
      "lng": 76.398
    },
    "places": [
      {
        "name": "Hiriyur Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jogimatti Religious Place",
        "rating": 5.0,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Chandravalli Caves Historic Place",
        "rating": 4.6,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Chitradurga Fort Fort",
        "rating": 4.5,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Vani Vilas Sagar Dam",
        "rating": 4.2,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kallina Kote Fort",
        "rating": 4.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Adumalleshwara Temple Place of Worship",
        "rating": 3.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Coorg",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.4244,
      "lng": 75.7382
    },
    "places": [
      {
        "name": "Mandalpatti View Point View point",
        "rating": 5.0,
        "rawType": "View point",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Brahmagiri Peak Hill",
        "rating": 4.8,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Karada Monument",
        "rating": 4.8,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Shri Shringeri Shankar Math, Siddapura Religious Place",
        "rating": 4.8,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Veerabhoomi Tourist Village Village",
        "rating": 4.8,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Tadiandamol Peak Mountain",
        "rating": 4.7,
        "rawType": "Mountain",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Valnur Fishing Camp Sanctuary",
        "rating": 4.7,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Chettalli, Madikeri Village",
        "rating": 4.6,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Nehru Mantap Picnic Spot",
        "rating": 4.6,
        "rawType": "Picnic Spot",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Harangi Dam Dam",
        "rating": 4.5,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Mandalpatti Mountain",
        "rating": 4.5,
        "rawType": "Mountain",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Padi Iggutappa Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Honnamana Kere Lake",
        "rating": 4.4,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Iruppu Falls Water Fall",
        "rating": 4.4,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Tibetian Monastery Monastery",
        "rating": 4.4,
        "rawType": "Monastery",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Chomamale Hill Hill",
        "rating": 4.3,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Namdroling Monastery (Little Tibet) Monastery",
        "rating": 4.3,
        "rawType": "Monastery",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Talakaveri Wildlife Sanctuary Sanctuary",
        "rating": 4.3,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bhagamandala Temple",
        "rating": 4.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "St. Anne's Church Church",
        "rating": 4.2,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bylakuppe Heritage Site",
        "rating": 4.1,
        "rawType": "Heritage Site",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Clock Tower Clock Tower",
        "rating": 4.1,
        "rawType": "Clock Tower",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Mallalli Falls Water Fall",
        "rating": 4.1,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Nalknad Palace Palace",
        "rating": 4.1,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Pushpagiri Wildlife Sanctuary Sanctuary",
        "rating": 4.1,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Barapole Rafting Sport",
        "rating": 4.0,
        "rawType": "Sport",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Burude Falls, Siddapura Water Fall",
        "rating": 4.0,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Dargah Sharif Of Yemmemadu Dargah",
        "rating": 4.0,
        "rawType": "Dargah",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gaddige Tomb",
        "rating": 4.0,
        "rawType": "Tomb",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Thadiyandamol Hills Hill",
        "rating": 4.0,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Abbi Falls Water Fall",
        "rating": 3.9,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Dubare Elephant Camp Sanctuary",
        "rating": 3.9,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Omkareshwara Temple Temple",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Somwarpet Offbeat Attraction",
        "rating": 3.9,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Nagarhole Park National Park",
        "rating": 3.8,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Raja's Seat View point",
        "rating": 3.8,
        "rawType": "View point",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Cauvery Nisargadhama Picnic Spot",
        "rating": 3.7,
        "rawType": "Picnic Spot",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Veerabhoomi, Dubare Village",
        "rating": 3.7,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Nisargadhama Forest Forest",
        "rating": 3.4,
        "rawType": "Forest",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Dandeli",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.2667,
      "lng": 74.6167
    },
    "places": [
      {
        "name": "Dandelappa Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kavala Caves Cave",
        "rating": 4.8,
        "rawType": "Cave",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "River Kali River",
        "rating": 4.5,
        "rawType": "River",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shivaji Fort Fort",
        "rating": 4.3,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Sykes Point View point",
        "rating": 3.9,
        "rawType": "View point",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Syntheri Rock Rock",
        "rating": 3.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Anshi National Park National Park",
        "rating": 3.7,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Shiroli Peak Hill",
        "rating": 3.6,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Sri Mallikarjuna Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Dandeli Wildlife Sanctuary Sanctuary",
        "rating": 3.5,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kulgi Nature Camp Offbeat Attraction",
        "rating": 3.5,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Supa Dam Dam",
        "rating": 3.5,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Davanagere",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 14.4644,
      "lng": 75.9218
    },
    "places": [
      {
        "name": "Bagali",
        "rating": 3.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Kunduvada Kere",
        "rating": 3.4,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Sri Anjaneya Swamy Temple",
        "rating": 3.4,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Anekonda",
        "rating": 3.1,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "B S Channa Basappa and Sons",
        "rating": 3.1,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Bathi Gudda",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Betur",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Comprehensive Water Supply Tank",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Eshwara Temple",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Karanji Mantapa",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sulekere",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "The Loot",
        "rating": 3.1,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Shopping in Davanagere",
        "rating": 3.0,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      }
    ]
  },
  {
    "city": "Dharwad",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.4589,
      "lng": 75.0078
    },
    "places": [
      {
        "name": "Urban Oasis Mall Mall",
        "rating": 5.0,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Sadhankere Lake",
        "rating": 4.3,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Unkal Lake Lake",
        "rating": 4.3,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Nrupatunga Betta Picnic Spot",
        "rating": 3.9,
        "rawType": "Picnic Spot",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Ulavi Basaveshwar Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kelgeri Lake Lake",
        "rating": 2.9,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Gadag",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.4315,
      "lng": 75.6355
    },
    "places": [
      {
        "name": "Nagakunda, Sudi Taluka Heritage Site",
        "rating": 5.0,
        "rawType": "Heritage Site",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Lakkundi Religious Place",
        "rating": 4.6,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Trikuteshwara Temple Place of Worship",
        "rating": 4.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Veer Narayana Temple Place of Worship",
        "rating": 3.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Dambala Temple Place of Worship",
        "rating": 3.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Gulbarga",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 17.3297,
      "lng": 76.8343
    },
    "places": [
      {
        "name": "Chandralamba Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Deval Ghanagapur Village",
        "rating": 5.0,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Khwaja Bande Nawaz Dargah Dargah",
        "rating": 4.4,
        "rawType": "Dargah",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gulbarga Fort Fort",
        "rating": 4.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Jama Masjid Mosque",
        "rating": 4.0,
        "rawType": "Mosque",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sannati Village",
        "rating": 3.9,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Hassan",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.0033,
      "lng": 76.1004
    },
    "places": [
      {
        "name": "Bisle Ghat Or Bisle Reserve Forest Sanctuary",
        "rating": 4.6,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Veeranarayana Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Gorur Dam Dam",
        "rating": 4.2,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shettihalli Church Church",
        "rating": 3.8,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Hulikere Pond Pond",
        "rating": 3.6,
        "rawType": "Pond",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Hasanamba Temple Temple",
        "rating": 3.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "District Museum Museum",
        "rating": 2.9,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Haveri",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 14.7951,
      "lng": 75.3991
    },
    "places": [
      {
        "name": "Ranebennur Blackbuck Sanctuary Sanctuary",
        "rating": 5.0,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Tarakeshwara Temple Place of Worship",
        "rating": 4.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bankapura Peacock Sanctuary Sanctuary",
        "rating": 4.5,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Siddeshwara Temple Place of Worship",
        "rating": 3.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Hospet",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.2689,
      "lng": 76.3909
    },
    "places": [
      {
        "name": "Royal Palace Palace",
        "rating": 4.6,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Tungabhadra Dam Dam",
        "rating": 4.3,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "The Archaeological Museum Museum",
        "rating": 4.1,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Queen's Bath Historic Place",
        "rating": 3.9,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Chakra Vana Park",
        "rating": 3.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Nandanavana Park Park",
        "rating": 3.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shri Ramulu Park Park",
        "rating": 2.9,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Karwar",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 14.8185,
      "lng": 74.1416
    },
    "places": [
      {
        "name": "Sajjeshswara Temple",
        "rating": 4.4,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Anashi Waterfall",
        "rating": 4.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Devbagh Beach",
        "rating": 4.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Karwar beach",
        "rating": 4.1,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Binaga Beach",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Tilmati Beach",
        "rating": 3.9,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Karwar Aquarium",
        "rating": 3.8,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kali Bridge",
        "rating": 3.7,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Maruti Temple Karwar",
        "rating": 3.5,
        "rawType": "View point",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Guddalli Peak",
        "rating": 3.4,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kurumgad island",
        "rating": 3.4,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Majali beach",
        "rating": 3.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Dargah of Peer Shan Shamsuddin Kharobat",
        "rating": 3.1,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Durga Temple Karwar",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Koodi bagh beach",
        "rating": 3.1,
        "rawType": "River",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kot Shiveshwar",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Naganath temple",
        "rating": 3.1,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Narasimha Temple",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Oyster Rock Lighthouse",
        "rating": 3.1,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Sadashivgadh Hill Fort",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Venkataramana temple",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shopping in Karwar",
        "rating": 3.0,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Warship Museum",
        "rating": 0.0,
        "rawType": "Cave",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      }
    ]
  },
  {
    "city": "Kolar",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.1362,
      "lng": 78.1291
    },
    "places": [
      {
        "name": "Kolaramma Temple Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bethamangala Lake",
        "rating": 4.3,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Chikka Tirupati Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kotilingeshwara Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kurudumale Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Someshwara Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Avani Offbeat Attraction",
        "rating": 3.8,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Bangaru Tirupati Place of Worship",
        "rating": 3.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Antara Gange Offbeat Attraction",
        "rating": 3.2,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Bangarapet Offbeat Attraction",
        "rating": 2.5,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Koppal",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 15.3505,
      "lng": 76.1548
    },
    "places": [
      {
        "name": "Huligemma Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Munirabad Dam",
        "rating": 4.3,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Anegundi Village",
        "rating": 3.6,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Navabrindavanam Tomb",
        "rating": 3.6,
        "rawType": "Tomb",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Mandya",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.5218,
      "lng": 76.8951
    },
    "places": [
      {
        "name": "Sri Ranganathaswamy Temple Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Tonnur Kere Lake",
        "rating": 5.0,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Lakshminarayana Temple Place of Worship",
        "rating": 4.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shivanasamudra Falls Water Fall",
        "rating": 4.6,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Krishna Raja Sagara Dam And Brindavan Gardens Park",
        "rating": 4.4,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Basaralu Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Ganjam Historic Place",
        "rating": 3.9,
        "rawType": "Historic Place",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Gumbaz Fort",
        "rating": 3.9,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Kokkare Bellur Village",
        "rating": 3.6,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Sri Saumyakeshava Temple Temple",
        "rating": 3.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kuntibetta Hill",
        "rating": 3.0,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Kokrebellur Pelicanry Village",
        "rating": 2.9,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Mangalore",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.9141,
      "lng": 74.856
    },
    "places": [
      {
        "name": "Mahatma Gandhi Museum Museum",
        "rating": 5.0,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Sammilan Shetty'S Butterfly Park Park",
        "rating": 5.0,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Rosario Cathedral Church",
        "rating": 4.8,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kateel Temple",
        "rating": 4.7,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Durga Parameshwari Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kudroli Sri Gokarnanatheshwara Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Polali Rajarajeshwari Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shri Manjunatha Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "St. Mary'S Islands Island",
        "rating": 4.6,
        "rawType": "Island",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kadri Manjunatha Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Light House Hill Garden Garden",
        "rating": 4.5,
        "rawType": "Garden",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shri Sharavu Mahaganapathi Temple Temple",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "St. Aloysious Chapel Church",
        "rating": 4.4,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kudroli Gokarnath Temple Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Panambur Beach Beach",
        "rating": 4.3,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Someshwar Beach Beach",
        "rating": 4.3,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Tannirubhavi Beach Beach",
        "rating": 4.3,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Pilikula Nisargadhama Theme Park",
        "rating": 4.2,
        "rawType": "Theme Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Thousand Pillars Jain Temple Temple",
        "rating": 4.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mangalore Beach Beach",
        "rating": 4.1,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Milagres Church Church",
        "rating": 4.1,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Ullal Offbeat Attraction",
        "rating": 4.1,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Mangaladevi Temple Temple",
        "rating": 4.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kadri Hill Park Park",
        "rating": 3.9,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Masjid Zeenath Baksh(Jumma Masjid) Mosque",
        "rating": 3.9,
        "rawType": "Mosque",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kudupu Sri Anantha Padmanabha Temple Temple",
        "rating": 3.8,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Pilikula Park And Golf Course Park",
        "rating": 3.7,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Mangala Stadium Cricket stadium",
        "rating": 3.6,
        "rawType": "Cricket stadium",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "New Mangalore Port Port",
        "rating": 3.6,
        "rawType": "Port",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Mysore",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.2958,
      "lng": 76.6394
    },
    "places": [
      {
        "name": "Mysore Palace",
        "rating": 4.4,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Mysore Zoo",
        "rating": 4.3,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "St Philomena s Church",
        "rating": 4.3,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Brindavan Gardens",
        "rating": 4.2,
        "rawType": "Gardens",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Chamundeshwari Temple",
        "rating": 4.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "GRS Fantasy Park",
        "rating": 4.2,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Jaganmohan Palace",
        "rating": 4.2,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Talakadu",
        "rating": 4.2,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Karanji Lake",
        "rating": 3.8,
        "rawType": "Lake",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Nanjangud",
        "rating": 3.7,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Rail Museum Mysore",
        "rating": 3.7,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Somanathapura Temple",
        "rating": 3.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "City Shopping",
        "rating": 3.4,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      },
      {
        "name": "Lingambudhi Park",
        "rating": 3.4,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Folklore Museum",
        "rating": 3.2,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Melukote Temples",
        "rating": 3.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Srikanteswara Temple",
        "rating": 3.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Trinesvaraswamy Temple",
        "rating": 3.2,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bonsai Garden",
        "rating": 3.1,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Lalitha Mahal Palace",
        "rating": 3.1,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mysore Mandala Yoga Shala",
        "rating": 3.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ashtanga Yoga Institute",
        "rating": 3.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Mysore Dasara",
        "rating": 3.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shuka Vana",
        "rating": 3.0,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Chunchanakatte Falls",
        "rating": 2.8,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Freedom Fighter s Park",
        "rating": 2.8,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Cheluvamba Park",
        "rating": 2.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Sanjeevini Park",
        "rating": 2.5,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Balmuri Waterfalls",
        "rating": 2.3,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Dr Ambedkar s Park",
        "rating": 2.0,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Javaregowda Park",
        "rating": 1.0,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Raichur",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 16.212,
      "lng": 77.3439
    },
    "places": [
      {
        "name": "Bala Hisar Offbeat Attraction",
        "rating": 5.0,
        "rawType": "Offbeat Attraction",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Koormagadde Village",
        "rating": 5.0,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Raichur Fort Fort",
        "rating": 3.3,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Kallur Village",
        "rating": 3.1,
        "rawType": "Village",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Manvi Place of Worship",
        "rating": 2.9,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Tomb Of Pir Sailani Shah Monument",
        "rating": 2.9,
        "rawType": "Monument",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ek Minar Ki Masjid Place of Worship",
        "rating": 2.5,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Ramnagaram",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 12.715,
      "lng": 77.2814
    },
    "places": [
      {
        "name": "Janapada Loka",
        "rating": 3.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Ramadevarabetta hills",
        "rating": 3.4,
        "rawType": "Hills",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Ramdevara Temple",
        "rating": 3.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Ramnagara Hills",
        "rating": 3.4,
        "rawType": "Hills",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Bird watching in Ramnagara",
        "rating": 3.1,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Savandurga",
        "rating": 3.1,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "City Shopping",
        "rating": 3.0,
        "rawType": "Mall",
        "category": "Shopping",
        "isOutdoor": false,
        "cost": 200,
        "duration": 2.0
      }
    ]
  },
  {
    "city": "Shimoga",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.9299,
      "lng": 75.5681
    },
    "places": [
      {
        "name": "Shiva Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Kalikaparmeswari Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kodachadri Hill",
        "rating": 4.8,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Gandhi Park Park",
        "rating": 4.6,
        "rawType": "Park",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Jog Falls Water Fall",
        "rating": 4.6,
        "rawType": "Water Fall",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shivappanaika Palace Museum Museum",
        "rating": 4.6,
        "rawType": "Museum",
        "category": "Museum",
        "isOutdoor": false,
        "cost": 150,
        "duration": 2.0
      },
      {
        "name": "Sri Raghavendra Swamy Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Bhadra River Project Dam Dam",
        "rating": 4.5,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kundadri Mountain",
        "rating": 4.5,
        "rawType": "Mountain",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Tavarekoppa Tiger And Lion Safari National Park",
        "rating": 4.4,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Gudavi Bird Sanctuary Sanctuary",
        "rating": 4.2,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Madhugiri Fort Fort",
        "rating": 4.1,
        "rawType": "Fort",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Ganpati Temple Temple",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Keladi Temple",
        "rating": 3.9,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sakrebayalu Elephant Camp National Park",
        "rating": 3.9,
        "rawType": "National Park",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Sharavati River River",
        "rating": 3.9,
        "rawType": "River",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Tyavarekoppa Picnic Spot",
        "rating": 3.7,
        "rawType": "Picnic Spot",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Gajanur Dam Dam",
        "rating": 3.6,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Sacred Heart Church Church",
        "rating": 3.6,
        "rawType": "Church",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shivappa Naik Palace Palace",
        "rating": 3.2,
        "rawType": "Palace",
        "category": "History",
        "isOutdoor": true,
        "cost": 200,
        "duration": 2.5
      },
      {
        "name": "Linganmakki Dam Dam",
        "rating": 2.9,
        "rawType": "Dam",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  },
  {
    "city": "Tumkur",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.3379,
      "lng": 77.1173
    },
    "places": [
      {
        "name": "Aralaguppe Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kalleshwara Temple Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kote Anjeneya Swami Statue Statue",
        "rating": 5.0,
        "rawType": "Statue",
        "category": "Sightseeing",
        "isOutdoor": true,
        "cost": 100,
        "duration": 2.0
      },
      {
        "name": "Siddara Betta Place of Worship",
        "rating": 5.0,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Venugopala Swamy Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Yoganarasimha Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Devarayanadurga State Forest Sanctuary",
        "rating": 4.6,
        "rawType": "Sanctuary",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Namada Chilume Water spring",
        "rating": 4.6,
        "rawType": "Water spring",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Basadi BettaMandaragiri Temple",
        "rating": 4.3,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Devarayanadurga Hill",
        "rating": 4.3,
        "rawType": "Hill",
        "category": "Adventure",
        "isOutdoor": true,
        "cost": 250,
        "duration": 3.0
      },
      {
        "name": "Gulur Ganesh Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Madhugiri Bhagawan Mallinatha Temple Place of Worship",
        "rating": 4.3,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Lakshmi Narasimha Swamy Temple Place of Worship",
        "rating": 3.9,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Shiva Ganga Religious Place",
        "rating": 3.9,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sree Siddaganga Mutt Religious Place",
        "rating": 3.9,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Yediyur Siddhalingeshwara Temple Place of Worship",
        "rating": 3.6,
        "rawType": "Place of Worship",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      }
    ]
  },
  {
    "city": "Udupi",
    "state": "Karnataka",
    "country": "India",
    "center": {
      "lat": 13.3409,
      "lng": 74.7421
    },
    "places": [
      {
        "name": "Durga Parameshwari Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Jomlu Theertha Falls Water Fall",
        "rating": 5.0,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Prasanna Ganapati Temple Temple",
        "rating": 5.0,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Shani Temple Temple",
        "rating": 5.0,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Hood Beach Beach",
        "rating": 4.6,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Manipal Lake Lake",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Sri Krishna Temple Temple",
        "rating": 4.6,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Udyavara Ganapathi Temple Temple",
        "rating": 4.6,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Kamalashile Brahmi Durgaparameshwari Temple Temple",
        "rating": 4.5,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Udupi Sri Krishna Matha Religious Place",
        "rating": 4.5,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Jumadi Islands Island",
        "rating": 4.4,
        "rawType": "Temple",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kaup Beach Beach",
        "rating": 4.4,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Chandramauleshvara Temple Temple",
        "rating": 4.3,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Iskon Temple Temple",
        "rating": 4.3,
        "rawType": "Religious Place",
        "category": "Culture",
        "isOutdoor": false,
        "cost": 0,
        "duration": 1.5
      },
      {
        "name": "Kodi Beach Beach",
        "rating": 4.0,
        "rawType": "Beach",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      },
      {
        "name": "Pajaka Village Village",
        "rating": 3.2,
        "rawType": "Island",
        "category": "Nature",
        "isOutdoor": true,
        "cost": 50,
        "duration": 2.5
      }
    ]
  }
];

/** Resolve a destination name or alias to its imported Karnataka city catalog entry. */
export function findImportedCityCatalog(destination: string): ImportedCityCatalog | undefined {
  const normalized = destination.trim().toLowerCase();
  if (!normalized) return undefined;
  const canonical = CITY_ALIASES[normalized] ?? normalized;
  return KARNATAKA_CITY_CATALOG.find(
    (entry) => entry.city.toLowerCase() === canonical.toLowerCase(),
  );
}

function slugify(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

/** Convert imported dataset entries for a city into TripPilot AttractionCandidate records. */
export function getImportedAttractionsForCity(
  destination: string,
  interests: string[] = [],
  limit = 18,
): { center: Coordinates; attractions: AttractionCandidate[] } | null {
  const catalog = findImportedCityCatalog(destination);
  if (!catalog) return null;

  const interestTokens = interests.map((i) => i.toLowerCase());
  const ranked = [...catalog.places].sort((a, b) => {
    const aMatch = interestTokens.some((tok) => tok.includes(a.category.toLowerCase()) || a.category.toLowerCase().includes(tok)) ? 0.4 : 0;
    const bMatch = interestTokens.some((tok) => tok.includes(b.category.toLowerCase()) || b.category.toLowerCase().includes(tok)) ? 0.4 : 0;
    return (b.rating + bMatch) - (a.rating + aMatch);
  });

  const attractions: AttractionCandidate[] = ranked.slice(0, limit).map((place) => ({
    attractionId: `trs-${slugify(catalog.city)}-${slugify(place.name)}`,
    name: place.name,
    coordinates: { ...catalog.center },
    category: place.category,
    isOutdoor: place.isOutdoor,
    rating: place.rating,
    duration: place.duration,
    cost: place.cost,
    openingHours: { open: 9, close: 18 },
    note: `${place.rawType} in ${catalog.city}, ${catalog.state} (source: travel-recommendation-system)`,
  }));

  return { center: { ...catalog.center }, attractions };
}
