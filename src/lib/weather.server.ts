import type { Coordinates } from '@/lib/optimizer';

export type DailyWeatherForecast = {
  date: string;
  hasRain: boolean;
  summary: string;
};

type OpenWeatherForecastResponse = {
  list?: Array<{
    dt_txt: string;
    main?: { temp?: number };
    weather?: Array<{ main?: string; description?: string }>;
  }>;
};

type OpenWeatherCurrentResponse = {
  main?: { temp?: number };
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

  let currentFallback: { hasRain: boolean; summary: string } | null = null;
  if (currentRes.ok) {
    const cur = (await currentRes.json()) as OpenWeatherCurrentResponse;
    const w = cur.weather?.[0];
    const hasRain = RAIN_CONDITIONS.has((w?.main ?? '').toLowerCase());
    const temp = cur.main?.temp !== undefined ? `${Math.round(cur.main.temp)}°C` : '';
    const desc = w?.description || w?.main || 'Clear';
    currentFallback = {
      hasRain,
      summary: [temp, desc].filter(Boolean).join(' · '),
    };
  }

  const byDate = new Map<string, { hasRain: boolean; descriptions: Set<string>; temps: number[] }>();
  if (forecastRes.ok) {
    const data = (await forecastRes.json()) as OpenWeatherForecastResponse;
    for (const entry of data.list ?? []) {
      const dateKey = entry.dt_txt.slice(0, 10);
      const current = byDate.get(dateKey) ?? {
        hasRain: false,
        descriptions: new Set<string>(),
        temps: [],
      };
      if (entry.main?.temp !== undefined) current.temps.push(entry.main.temp);
      for (const w of entry.weather ?? []) {
        const main = (w.main ?? '').toLowerCase();
        if (RAIN_CONDITIONS.has(main)) current.hasRain = true;
        if (w.description) current.descriptions.add(w.description);
      }
      byDate.set(dateKey, current);
    }
  }

  const base = params.startDate ? new Date(params.startDate) : new Date();
  const days: DailyWeatherForecast[] = [];
  for (let i = 0; i < params.numberOfDays; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const info = byDate.get(dateKey);
    if (info) {
      const avgTemp =
        info.temps.length > 0
          ? `${Math.round(info.temps.reduce((a, b) => a + b, 0) / info.temps.length)}°C`
          : '';
      const desc = Array.from(info.descriptions).slice(0, 1)[0] || 'Clear';
      days.push({
        date: dateKey,
        hasRain: info.hasRain,
        summary: [avgTemp, desc].filter(Boolean).join(' · '),
      });
    } else {
      days.push({
        date: dateKey,
        hasRain: currentFallback?.hasRain ?? false,
        summary: currentFallback?.summary ?? 'Forecast unavailable',
      });
    }
  }

  return { configured: true, days };
}
