import type { Coordinates } from '@/lib/optimizer';

export type DailyWeatherForecast = {
  date: string;
  hasRain: boolean;
  summary: string;
  tempC?: number;
  tempMinC?: number;
  tempMaxC?: number;
  humidity?: number;
  windKmh?: number;
  condition?: string;
};

type OpenWeatherForecastResponse = {
  list?: Array<{
    dt_txt: string;
    main?: { temp?: number; temp_min?: number; temp_max?: number; humidity?: number };
    wind?: { speed?: number };
    weather?: Array<{ main?: string; description?: string }>;
  }>;
};

type OpenWeatherCurrentResponse = {
  main?: { temp?: number; temp_min?: number; temp_max?: number; humidity?: number };
  wind?: { speed?: number };
  weather?: Array<{ main?: string; description?: string }>;
};

const RAIN_CONDITIONS = new Set(['rain', 'thunderstorm', 'drizzle']);

export async function getDestinationWeather(params: {
  coordinates: Coordinates;
  numberOfDays: number;
  startDate?: string;
}): Promise<{ configured: boolean; days: DailyWeatherForecast[] }> {
  const apiKey = process.env['OPENWEATHER_API_KEY'];
  if (!apiKey) {
    return { configured: false, days: [] };
  }

  const [forecastRes, currentRes] = await Promise.all([
    fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${params.coordinates.lat}&lon=${params.coordinates.lng}&units=metric&appid=${encodeURIComponent(apiKey)}`,
    ),
    fetch(
      `https://api.openweathermap.org/data/2.5/weather?lat=${params.coordinates.lat}&lon=${params.coordinates.lng}&units=metric&appid=${encodeURIComponent(apiKey)}`,
    ),
  ]);

  let currentFallback: Omit<DailyWeatherForecast, 'date'> | null = null;
  if (currentRes.ok) {
    const cur = (await currentRes.json()) as OpenWeatherCurrentResponse;
    const w = cur.weather?.[0];
    const hasRain = RAIN_CONDITIONS.has((w?.main ?? '').toLowerCase());
    const tempC = cur.main?.temp !== undefined ? Math.round(cur.main.temp) : undefined;
    const tempMinC = cur.main?.temp_min !== undefined ? Math.round(cur.main.temp_min) : tempC;
    const tempMaxC = cur.main?.temp_max !== undefined ? Math.round(cur.main.temp_max) : tempC;
    const humidity = cur.main?.humidity !== undefined ? Math.round(cur.main.humidity) : undefined;
    const windKmh = cur.wind?.speed !== undefined ? Math.round(cur.wind.speed * 3.6) : undefined;
    const condition = w?.main || 'Clear';
    const desc = w?.description || condition;
    currentFallback = {
      hasRain,
      summary: [tempC !== undefined ? `${tempC}°C` : '', desc].filter(Boolean).join(' · '),
      ...(tempC !== undefined ? { tempC } : {}),
      ...(tempMinC !== undefined ? { tempMinC } : {}),
      ...(tempMaxC !== undefined ? { tempMaxC } : {}),
      ...(humidity !== undefined ? { humidity } : {}),
      ...(windKmh !== undefined ? { windKmh } : {}),
      condition,
    };
  }

  const byDate = new Map<
    string,
    {
      hasRain: boolean;
      descriptions: Set<string>;
      conditions: Set<string>;
      temps: number[];
      mins: number[];
      maxs: number[];
      humidities: number[];
      winds: number[];
    }
  >();

  if (forecastRes.ok) {
    const data = (await forecastRes.json()) as OpenWeatherForecastResponse;
    for (const entry of data.list ?? []) {
      const dateKey = entry.dt_txt.slice(0, 10);
      const current = byDate.get(dateKey) ?? {
        hasRain: false,
        descriptions: new Set<string>(),
        conditions: new Set<string>(),
        temps: [],
        mins: [],
        maxs: [],
        humidities: [],
        winds: [],
      };
      if (entry.main?.temp !== undefined) current.temps.push(entry.main.temp);
      if (entry.main?.temp_min !== undefined) current.mins.push(entry.main.temp_min);
      if (entry.main?.temp_max !== undefined) current.maxs.push(entry.main.temp_max);
      if (entry.main?.humidity !== undefined) current.humidities.push(entry.main.humidity);
      if (entry.wind?.speed !== undefined) current.winds.push(entry.wind.speed * 3.6);

      for (const w of entry.weather ?? []) {
        const main = (w.main ?? '').toLowerCase();
        if (RAIN_CONDITIONS.has(main)) current.hasRain = true;
        if (w.main) current.conditions.add(w.main);
        if (w.description) current.descriptions.add(w.description);
      }
      byDate.set(dateKey, current);
    }
  }

  const avg = (arr: number[]) =>
    arr.length > 0 ? Math.round(arr.reduce((a, b) => a + b, 0) / arr.length) : undefined;

  const base = params.startDate ? new Date(params.startDate) : new Date();
  const days: DailyWeatherForecast[] = [];
  for (let i = 0; i < params.numberOfDays; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const info = byDate.get(dateKey);
    if (info) {
      const tempC = avg(info.temps);
      const tempMinC = info.mins.length ? Math.round(Math.min(...info.mins)) : tempC;
      const tempMaxC = info.maxs.length ? Math.round(Math.max(...info.maxs)) : tempC;
      const humidity = avg(info.humidities);
      const windKmh = avg(info.winds);
      const condition = info.hasRain ? 'Rain' : Array.from(info.conditions)[0] || 'Clear';
      const desc = Array.from(info.descriptions)[0] || condition;

      days.push({
        date: dateKey,
        hasRain: info.hasRain,
        summary: [tempC !== undefined ? `${tempC}°C` : '', desc].filter(Boolean).join(' · '),
        ...(tempC !== undefined ? { tempC } : {}),
        ...(tempMinC !== undefined ? { tempMinC } : {}),
        ...(tempMaxC !== undefined ? { tempMaxC } : {}),
        ...(humidity !== undefined ? { humidity } : {}),
        ...(windKmh !== undefined ? { windKmh } : {}),
        condition,
      });
    } else {
      days.push({
        date: dateKey,
        hasRain: currentFallback?.hasRain ?? false,
        summary: currentFallback?.summary ?? 'Forecast unavailable',
        ...(currentFallback?.tempC !== undefined ? { tempC: currentFallback.tempC } : {}),
        ...(currentFallback?.tempMinC !== undefined ? { tempMinC: currentFallback.tempMinC } : {}),
        ...(currentFallback?.tempMaxC !== undefined ? { tempMaxC: currentFallback.tempMaxC } : {}),
        ...(currentFallback?.humidity !== undefined ? { humidity: currentFallback.humidity } : {}),
        ...(currentFallback?.windKmh !== undefined ? { windKmh: currentFallback.windKmh } : {}),
        ...(currentFallback?.condition ? { condition: currentFallback.condition } : {}),
      });
    }
  }

  return { configured: true, days };
}
