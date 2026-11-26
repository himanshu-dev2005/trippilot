export type IndianCityEntry = {
  name: string;
  state: string;
  vibe: string;
  aliases?: string[];
  popular?: boolean;
};

export const INDIAN_CITIES: IndianCityEntry[] = [
  // Cities starting with "New" & "Navi"
  { name: 'New Delhi', state: 'Delhi NCR', vibe: 'Mughal heritage, museums & markets', aliases: ['Delhi'], popular: true },
  { name: 'New Tehri', state: 'Uttarakhand', vibe: 'Tehri Lake, Himalayan viewpoints & watersports' },
  { name: 'New Digha', state: 'West Bengal', vibe: 'Quiet coastal beaches & marine park' },
  { name: 'New Jalpaiguri', state: 'West Bengal', vibe: 'Gateway to Darjeeling, Dooars & Sikkim' },
  { name: 'New Town', state: 'West Bengal', vibe: 'Eco Park, museums & modern Kolkata hub', aliases: ['New Town Kolkata'] },
  { name: 'New Raipur', state: 'Chhattisgarh', vibe: 'Planned lakes, jungle safari & cultural parks', aliases: ['Nava Raipur', 'Atal Nagar'] },
  { name: 'New Barrackpore', state: 'West Bengal', vibe: 'Heritage outskirts near Kolkata' },
  { name: 'Navi Mumbai', state: 'Maharashtra', vibe: 'Waterfronts, hills & flamingo sanctuary' },

  // Major Indian Destinations & Metros (alphabetical + rich coverage)
  { name: 'Agartala', state: 'Tripura', vibe: 'Ujjayanta Palace & northeastern heritage' },
  { name: 'Agra', state: 'Uttar Pradesh', vibe: 'Taj Mahal, Agra Fort & Mughal gardens', popular: true },
  { name: 'Ahmedabad', state: 'Gujarat', vibe: 'UNESCO walled city, stepwells & Sabarmati' },
  { name: 'Aizawl', state: 'Mizoram', vibe: 'Hilltop ridges & Mizo cultural trails' },
  { name: 'Ajmer', state: 'Rajasthan', vibe: 'Sufi shrine, Ana Sagar Lake & Pushkar road' },
  { name: 'Alibaug', state: 'Maharashtra', vibe: 'Sea forts & weekend coastal escapes' },
  { name: 'Alleppey', state: 'Kerala', vibe: 'Houseboat backwaters & lagoons', aliases: ['Alappuzha'], popular: true },
  { name: 'Almora', state: 'Uttarakhand', vibe: 'Kumaoni heritage & Kasar Devi ridge' },
  { name: 'Amritsar', state: 'Punjab', vibe: 'Golden Temple, Wagah & culinary trails', popular: true },
  { name: 'Auli', state: 'Uttarakhand', vibe: 'Alpine ski slopes & Nanda Devi views' },
  { name: 'Aurangabad', state: 'Maharashtra', vibe: 'Ajanta & Ellora rock-cut caves', aliases: ['Chhatrapati Sambhajinagar'] },
  { name: 'Ayodhya', state: 'Uttar Pradesh', vibe: 'Ram Janmabhoomi & Sarayu River ghats' },
  { name: 'Badami', state: 'Karnataka', vibe: 'Sandstone cave temples & Agastya Lake' },
  { name: 'Ballari', state: 'Karnataka', vibe: 'Hill forts & gateway to Hampi', aliases: ['Bellary'] },
  { name: 'Belagavi', state: 'Karnataka', vibe: 'Forts, waterfalls & Western Ghats', aliases: ['Belgaum'] },
  { name: 'Bengaluru', state: 'Karnataka', vibe: 'Botanical parks, craft cafés & museums', aliases: ['Bangalore'], popular: true },
  { name: 'Bhopal', state: 'Madhya Pradesh', vibe: 'Upper Lake, museums & Sanchi day trips' },
  { name: 'Bhubaneswar', state: 'Odisha', vibe: 'Ancient Kalinga temples & Udayagiri caves' },
  { name: 'Bidar', state: 'Karnataka', vibe: 'Deccan fort, Bahmani tombs & Bidri craft' },
  { name: 'Bikaner', state: 'Rajasthan', vibe: 'Junagarh Fort, havelis & desert safaris' },
  { name: 'Bodh Gaya', state: 'Bihar', vibe: 'Mahabodhi Temple & international monasteries' },
  { name: 'Chamarajanagar', state: 'Karnataka', vibe: 'Bandipur & BRT wildlife sanctuaries' },
  { name: 'Chandigarh', state: 'Chandigarh', vibe: 'Rock Garden, Sukhna Lake & modernist design' },
  { name: 'Chennai', state: 'Tamil Nadu', vibe: 'Marina Beach, Mylapore temples & art' },
  { name: 'Cherrapunji', state: 'Meghalaya', vibe: 'Living root bridges & canyon waterfalls', aliases: ['Sohra'] },
  { name: 'Chikkaballapur', state: 'Karnataka', vibe: 'Nandi Hills sunrise & vineyards', aliases: ['Chikballapur'] },
  { name: 'Chikmagalur', state: 'Karnataka', vibe: 'Coffee estates & Mullayanagiri peaks' },
  { name: 'Chitradurga', state: 'Karnataka', vibe: 'Seven-tiered stone hill fort' },
  { name: 'Coimbatore', state: 'Tamil Nadu', vibe: 'Western Ghats foothills & Adiyogi' },
  { name: 'Coorg', state: 'Karnataka', vibe: 'Misty coffee plantations & Abbey Falls', aliases: ['Kodagu', 'Madikeri'], popular: true },
  { name: 'Dalhousie', state: 'Himachal Pradesh', vibe: 'Khajjiar meadows & colonial pine walks' },
  { name: 'Daman', state: 'Daman & Diu', vibe: 'Portuguese coastal forts & beaches' },
  { name: 'Dandeli', state: 'Karnataka', vibe: 'Kali River rafting & horn-bill forests' },
  { name: 'Darjeeling', state: 'West Bengal', vibe: 'Tea gardens, toy train & Kanchenjunga', popular: true },
  { name: 'Davanagere', state: 'Karnataka', vibe: 'Heritage temples & famous benne dosa' },
  { name: 'Dehradun', state: 'Uttarakhand', vibe: 'FRI campus, cave shrines & valley springs', popular: true },
  { name: 'Delhi', state: 'Delhi NCR', vibe: 'Old Delhi forts, Lutyens boulevards & food' },
  { name: 'Deoghar', state: 'Jharkhand', vibe: 'Baidyanath temple & Trikut hills' },
  { name: 'Devprayag', state: 'Uttarakhand', vibe: 'Sacred Alaknanda–Bhagirathi confluence' },
  { name: 'Dharamshala', state: 'Himachal Pradesh', vibe: 'McLeod Ganj monasteries & Dhauladhar treks' },
  { name: 'Dharwad', state: 'Karnataka', vibe: 'Classical music heritage & lakeside parks' },
  { name: 'Diu', state: 'Daman & Diu', vibe: 'Island forts & quiet Arabian Sea coves' },
  { name: 'Dwarka', state: 'Gujarat', vibe: 'Coastal temples & Bet Dwarka island' },
  { name: 'Gadag', state: 'Karnataka', vibe: 'Chalukyan temples & Lakkundi ruins' },
  { name: 'Gangtok', state: 'Sikkim', vibe: 'Himalayan monasteries, ropeways & MG Marg' },
  { name: 'Goa', state: 'Goa', vibe: 'Beaches, Latin quarter & spice farms', popular: true },
  { name: 'Gokarna', state: 'Karnataka', vibe: 'Cliffside beaches, Om Beach & temple town' },
  { name: 'Gulmarg', state: 'Jammu & Kashmir', vibe: 'Gondola ridges & alpine meadows' },
  { name: 'Gurugram', state: 'Haryana', vibe: 'Aravalli trails, arts hubs & dining', aliases: ['Gurgaon'] },
  { name: 'Guwahati', state: 'Assam', vibe: 'Kamakhya Temple & Brahmaputra river cruises' },
  { name: 'Gwalior', state: 'Madhya Pradesh', vibe: 'Hilltop citadel & Scindia palace museum' },
  { name: 'Hampi', state: 'Karnataka', vibe: 'UNESCO Vijayanagara boulder ruins & temples', aliases: ['Hospet'], popular: true },
  { name: 'Haridwar', state: 'Uttarakhand', vibe: 'Har Ki Pauri Ganga Aarti & hill shrines' },
  { name: 'Hassan', state: 'Karnataka', vibe: 'Belur & Halebidu Hoysala stone carvings' },
  { name: 'Haveri', state: 'Karnataka', vibe: 'Historic temples & blackbuck sanctuary' },
  { name: 'Hyderabad', state: 'Telangana', vibe: 'Charminar, Golconda Fort & culinary pearls', popular: true },
  { name: 'Imphal', state: 'Manipur', vibe: 'Loktak floating lake & Kangla Fort' },
  { name: 'Indore', state: 'Madhya Pradesh', vibe: 'Rajwada Palace & Sarafa night food bazaar' },
  { name: 'Jabalpur', state: 'Madhya Pradesh', vibe: 'Bhedaghat marble cliffs & Dhuandhar Falls' },
  { name: 'Jaipur', state: 'Rajasthan', vibe: 'Amber Fort, Hawa Mahal & pink bazaars', popular: true },
  { name: 'Jaisalmer', state: 'Rajasthan', vibe: 'Golden sandstone fort & Thar desert dunes' },
  { name: 'Jammu', state: 'Jammu & Kashmir', vibe: 'Bahu Fort, temples & Vaishno Devi route' },
  { name: 'Jodhpur', state: 'Rajasthan', vibe: 'Mehrangarh Fort & blue heritage lanes' },
  { name: 'Kalaburagi', state: 'Karnataka', vibe: 'Gulbarga Fort & Indo-Islamic domes', aliases: ['Gulbarga'] },
  { name: 'Kalimpong', state: 'West Bengal', vibe: 'Orchid nurseries, monasteries & Teesta views' },
  { name: 'Kanchipuram', state: 'Tamil Nadu', vibe: 'Pallava temples & handwoven silk looms' },
  { name: 'Kanpur', state: 'Uttar Pradesh', vibe: 'Ganges ghats, heritage & Bithoor' },
  { name: 'Kanyakumari', state: 'Tamil Nadu', vibe: 'Tri-ocean sunrise & Vivekananda Rock' },
  { name: 'Karwar', state: 'Karnataka', vibe: 'Devbagh island beaches & coastal trails' },
  { name: 'Kasauli', state: 'Himachal Pradesh', vibe: 'Pine ridge walks & colonial cottages' },
  { name: 'Kasol', state: 'Himachal Pradesh', vibe: 'Parvati Valley riverside trails & cafés' },
  { name: 'Kaziranga', state: 'Assam', vibe: 'UNESCO one-horned rhino grasslands' },
  { name: 'Khajuraho', state: 'Madhya Pradesh', vibe: 'UNESCO Chandela temple sculptures' },
  { name: 'Kochi', state: 'Kerala', vibe: 'Fort Kochi, Chinese fishing nets & art cafés', aliases: ['Cochin'], popular: true },
  { name: 'Kodaikanal', state: 'Tamil Nadu', vibe: 'Star lake, shola forests & misty cliffs' },
  { name: 'Kohima', state: 'Nagaland', vibe: 'Dzükou Valley treks & Naga heritage' },
  { name: 'Kolar', state: 'Karnataka', vibe: 'Antaragange caves & historic gold fields' },
  { name: 'Kolkata', state: 'West Bengal', vibe: 'Victoria Memorial, trams & heritage cafés', aliases: ['Calcutta'], popular: true },
  { name: 'Konark', state: 'Odisha', vibe: 'Sun Temple chariot carvings & Chandrabhaga' },
  { name: 'Koppal', state: 'Karnataka', vibe: 'Ancient boulder forts & Tungabhadra dam' },
  { name: 'Kota', state: 'Rajasthan', vibe: 'Chambal Riverfront, forts & stepwells' },
  { name: 'Kovalam', state: 'Kerala', vibe: 'Lighthouse beach & cliffside Ayurvedic spas' },
  { name: 'Kozhikode', state: 'Kerala', vibe: 'Malabar spice coast & Kappad Beach', aliases: ['Calicut'] },
  { name: 'Kullu', state: 'Himachal Pradesh', vibe: 'Beas Valley rafting, temples & orchards' },
  { name: 'Kumarakom', state: 'Kerala', vibe: 'Vembanad Lake bird sanctuary & resorts' },
  { name: 'Kutch', state: 'Gujarat', vibe: 'White salt desert & artisan craft villages', aliases: ['Bhuj', 'Rann of Kutch'] },
  { name: 'Lansdowne', state: 'Uttarakhand', vibe: 'Quiet oak forests & Garhwal hills' },
  { name: 'Leh', state: 'Ladakh', vibe: 'Pangong Lake, monasteries & high passes', aliases: ['Ladakh'], popular: true },
  { name: 'Lonavala', state: 'Maharashtra', vibe: 'Sahyadri waterfalls, forts & Karla caves' },
  { name: 'Lucknow', state: 'Uttar Pradesh', vibe: 'Bara Imambara, Nawabi gardens & kebabs' },
  { name: 'Madurai', state: 'Tamil Nadu', vibe: 'Meenakshi Amman Temple & vibrant markets' },
  { name: 'Mahabalipuram', state: 'Tamil Nadu', vibe: 'UNESCO Shore Temple & granite reliefs', aliases: ['Mamallapuram'] },
  { name: 'Mahabaleshwar', state: 'Maharashtra', vibe: 'Strawberry farms, valleys & Venna Lake' },
  { name: 'Manali', state: 'Himachal Pradesh', vibe: 'Solang Valley, cedar temples & snow peaks', popular: true },
  { name: 'Mandya', state: 'Karnataka', vibe: 'Ranganathittu bird sanctuary & river islands' },
  { name: 'Mangaluru', state: 'Karnataka', vibe: 'Coastal temples, beaches & seafood', aliases: ['Mangalore'] },
  { name: 'Matheran', state: 'Maharashtra', vibe: 'Car-free forest hill station & red trails' },
  { name: 'Mathura', state: 'Uttar Pradesh', vibe: 'Yamuna ghats & historic Krishna temples' },
  { name: 'Mount Abu', state: 'Rajasthan', vibe: 'Dilwara marble temples & Nakki Lake' },
  { name: 'Mumbai', state: 'Maharashtra', vibe: 'Gateway of India, Art Deco & marine drives', aliases: ['Bombay'], popular: true },
  { name: 'Munnar', state: 'Kerala', vibe: 'Emerald tea hills & Eravikulam National Park' },
  { name: 'Mussoorie', state: 'Uttarakhand', vibe: 'Camel’s Back Road, falls & valley views' },
  { name: 'Mysuru', state: 'Karnataka', vibe: 'Mysore Palace, Chamundi Hill & silk markets', aliases: ['Mysore'], popular: true },
  { name: 'Nagpur', state: 'Maharashtra', vibe: 'Tiger reserve gateway & Deekshabhoomi' },
  { name: 'Nainital', state: 'Uttarakhand', vibe: 'Naini Lake boating & Kumaon ridges' },
  { name: 'Nashik', state: 'Maharashtra', vibe: 'Sula vineyards, Trimbakeshwar & Godavari' },
  { name: 'Noida', state: 'Uttar Pradesh', vibe: 'Okhla Bird Sanctuary, parks & urban dining' },
  { name: 'Ooty', state: 'Tamil Nadu', vibe: 'Nilgiri mountain railway & botanical gardens', aliases: ['Udhagamandalam'] },
  { name: 'Orchha', state: 'Madhya Pradesh', vibe: 'Betwa River cenotaphs & Bundela palaces' },
  { name: 'Pahalgam', state: 'Jammu & Kashmir', vibe: 'Betaab Valley, Lidder River & pine trails' },
  { name: 'Patna', state: 'Bihar', vibe: 'Bihar Museum, Golghar & Ganges riverfront' },
  { name: 'Pelling', state: 'Sikkim', vibe: 'Skywalk, Pemayangtse & mountain panoramas' },
  { name: 'Pondicherry', state: 'Puducherry', vibe: 'French Quarter boulevards, Auroville & cafés', aliases: ['Puducherry'], popular: true },
  { name: 'Port Blair', state: 'Andaman & Nicobar', vibe: 'Coral islands, Cellular Jail & turquoise coves' },
  { name: 'Prayagraj', state: 'Uttar Pradesh', vibe: 'Triveni Sangam & historic riverside forts', aliases: ['Allahabad'] },
  { name: 'Pune', state: 'Maharashtra', vibe: 'Shaniwar Wada, hill forts & café culture' },
  { name: 'Puri', state: 'Odisha', vibe: 'Jagannath Temple, golden beach & Chilika Lake' },
  { name: 'Pushkar', state: 'Rajasthan', vibe: 'Sacred lake ghats, bazaars & camel hills' },
  { name: 'Raichur', state: 'Karnataka', vibe: 'Historic hill fort & Krishna river valley' },
  { name: 'Ramanagara', state: 'Karnataka', vibe: 'Granite boulder hills & silk cocoon market', aliases: ['Ramnagaram'] },
  { name: 'Rameswaram', state: 'Tamil Nadu', vibe: 'Pamban Bridge, corridors & Dhanushkodi' },
  { name: 'Ranchi', state: 'Jharkhand', vibe: 'Hundru & Dassam waterfalls and hill temples' },
  { name: 'Ranthambore', state: 'Rajasthan', vibe: 'Tiger reserve safaris & hilltop fort' },
  { name: 'Rishikesh', state: 'Uttarakhand', vibe: 'Ganga rafting, suspension bridges & yoga ashrams', popular: true },
  { name: 'Shillong', state: 'Meghalaya', vibe: 'Umiam Lake, waterfalls & live music cafés' },
  { name: 'Shimla', state: 'Himachal Pradesh', vibe: 'The Ridge, heritage architecture & cedar hills' },
  { name: 'Shivamogga', state: 'Karnataka', vibe: 'Jog Falls, rainforests & river sanctuaries', aliases: ['Shimoga'] },
  { name: 'Siliguri', state: 'West Bengal', vibe: 'Foothills gateway to Sikkim & Darjeeling' },
  { name: 'Spiti Valley', state: 'Himachal Pradesh', vibe: 'Key Monastery & high-altitude desert villages', aliases: ['Kaza'] },
  { name: 'Srinagar', state: 'Jammu & Kashmir', vibe: 'Dal Lake shikaras & terraced Mughal gardens', popular: true },
  { name: 'Surat', state: 'Gujarat', vibe: 'Historic Dutch gardens, textiles & street food' },
  { name: 'Tawang', state: 'Arunachal Pradesh', vibe: 'Himalayan monastery & Sela Pass lakes' },
  { name: 'Thanjavur', state: 'Tamil Nadu', vibe: 'Brihadeeswarar UNESCO Chola temple & bronze art' },
  { name: 'Thekkady', state: 'Kerala', vibe: 'Periyar lake wildlife & spice hills' },
  { name: 'Thiruvananthapuram', state: 'Kerala', vibe: 'Padmanabhaswamy Temple & coastal museums', aliases: ['Trivandrum'] },
  { name: 'Tirupati', state: 'Andhra Pradesh', vibe: 'Tirumala hills & ancient temple architecture' },
  { name: 'Tumakuru', state: 'Karnataka', vibe: 'Devarayanadurga hills & historic shrines', aliases: ['Tumkur'] },
  { name: 'Udaipur', state: 'Rajasthan', vibe: 'Lake Pichola palaces & Aravalli sunsets', popular: true },
  { name: 'Udupi', state: 'Karnataka', vibe: 'Malpe beaches, St. Mary’s Island & temples' },
  { name: 'Ujjain', state: 'Madhya Pradesh', vibe: 'Mahakaleshwar Temple & Shipra River ghats' },
  { name: 'Vadodara', state: 'Gujarat', vibe: 'Laxmi Vilas Palace & Champaner UNESCO ruins' },
  { name: 'Varanasi', state: 'Uttar Pradesh', vibe: 'Sunrise river ghats, alleys & temples', popular: true },
  { name: 'Varkala', state: 'Kerala', vibe: 'Red laterite beach cliffs & seaside cafés' },
  { name: 'Vijayapura', state: 'Karnataka', vibe: 'Gol Gumbaz dome & Adil Shahi monuments', aliases: ['Bijapur'] },
  { name: 'Visakhapatnam', state: 'Andhra Pradesh', vibe: 'RK Beach, Araku Valley & coastal hills', aliases: ['Vizag'] },
  { name: 'Wayanad', state: 'Kerala', vibe: 'Edakkal caves, misty peaks & spice forests' },
  { name: 'Ziro', state: 'Arunachal Pradesh', vibe: 'Pine valleys, paddy fields & Apatani culture' },
];

export type CitySearchResult = {
  city: IndianCityEntry;
  matchType: 'exact' | 'prefix' | 'alias-prefix' | 'word-prefix' | 'state' | 'fuzzy';
};

/**
 * Strict prefix-first city search.
 * When the user types e.g. "new", returns ONLY cities starting with "New"
 * (New Delhi, New Tehri, New Digha, New Jalpaiguri, New Town, New Raipur...).
 * Falls back to state/word/fuzzy matches only when zero prefix matches exist.
 */
export function searchIndianCities(rawQuery: string, limit = 8): CitySearchResult[] {
  const q = rawQuery.trim().toLowerCase();

  if (!q) {
    return INDIAN_CITIES.filter((c) => c.popular)
      .slice(0, limit)
      .map((city) => ({ city, matchType: 'prefix' as const }));
  }

  const exactMatches: CitySearchResult[] = [];
  const namePrefixMatches: CitySearchResult[] = [];
  const aliasPrefixMatches: CitySearchResult[] = [];

  for (const city of INDIAN_CITIES) {
    const nameLower = city.name.toLowerCase();
    if (nameLower === q) {
      exactMatches.push({ city, matchType: 'exact' });
    } else if (nameLower.startsWith(q)) {
      namePrefixMatches.push({ city, matchType: 'prefix' });
    } else if (city.aliases?.some((a) => a.toLowerCase().startsWith(q))) {
      aliasPrefixMatches.push({ city, matchType: 'alias-prefix' });
    }
  }

  const sortPrefix = (list: CitySearchResult[]) =>
    list.sort((a, b) => {
      const popDiff = Number(Boolean(b.city.popular)) - Number(Boolean(a.city.popular));
      if (popDiff !== 0) return popDiff;
      return a.city.name.localeCompare(b.city.name);
    });

  const prefixCombined = [
    ...exactMatches,
    ...sortPrefix(namePrefixMatches),
    ...sortPrefix(aliasPrefixMatches),
  ];

  // Strict prefix rule: if any city starts with the typed prefix, return ONLY prefix matches
  if (prefixCombined.length > 0) {
    return prefixCombined.slice(0, limit);
  }

  // Secondary fallback only when zero cities start with the typed text (e.g. state name or typo)
  const wordOrStateMatches: CitySearchResult[] = [];
  for (const city of INDIAN_CITIES) {
    const words = city.name.toLowerCase().split(/\s+/);
    if (words.some((w) => w.startsWith(q))) {
      wordOrStateMatches.push({ city, matchType: 'word-prefix' });
    } else if (city.state.toLowerCase().startsWith(q) || city.state.toLowerCase().includes(q)) {
      wordOrStateMatches.push({ city, matchType: 'state' });
    }
  }

  if (wordOrStateMatches.length > 0) {
    return sortPrefix(wordOrStateMatches).slice(0, limit);
  }

  // Gentle typo tolerance (prefix distance <= 2 for queries >= 4 chars)
  if (q.length >= 4) {
    const scored: Array<{ city: IndianCityEntry; dist: number }> = [];
    for (const city of INDIAN_CITIES) {
      const target = city.name.toLowerCase();
      const slice = target.slice(0, Math.min(target.length, q.length + 1));
      const d = editDistance(q, slice);
      if (d <= 2) scored.push({ city, dist: d });
    }
    scored.sort((a, b) => a.dist - b.dist || a.city.name.localeCompare(b.city.name));
    return scored.slice(0, limit).map(({ city }) => ({ city, matchType: 'fuzzy' as const }));
  }

  return [];
}

function editDistance(a: string, b: string): number {
  const dp = Array.from({ length: a.length + 1 }, (_, i) =>
    Array.from({ length: b.length + 1 }, (_, j) => (i === 0 ? j : j === 0 ? i : 0)),
  );
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      dp[i]![j] = Math.min(dp[i - 1]![j]! + 1, dp[i]![j - 1]! + 1, dp[i - 1]![j - 1]! + cost);
    }
  }
  return dp[a.length]![b.length]!;
}
