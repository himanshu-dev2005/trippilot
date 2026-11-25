import type { Coordinates } from '@/lib/optimizer';

export type DailyWeatherForecast = {
  date: string;
  hasRain: boolean;
  summary: string;
};

type OpenWeatherForecastResponse = {
  list?: Array<{
    dt_txt: string;
    weather?: Array<{ main?: string; description?: string }>;
  }>;
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

  const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${params.coordinates.lat}&lon=${params.coordinates.lng}&units=metric&appid=${encodeURIComponent(apiKey)}`;
  const res = await fetch(url);
  if (!res.ok) {
    return { configured: true, days: [] };
  }

  const data = (await res.json()) as OpenWeatherForecastResponse;
  const byDate = new Map<string, { hasRain: boolean; descriptions: Set<string> }>();

  for (const entry of data.list ?? []) {
    const dateKey = entry.dt_txt.slice(0, 10);
    const current = byDate.get(dateKey) ?? { hasRain: false, descriptions: new Set<string>() };
    for (const w of entry.weather ?? []) {
      const main = (w.main ?? '').toLowerCase();
      if (RAIN_CONDITIONS.has(main)) current.hasRain = true;
      if (w.description) current.descriptions.add(w.description);
    }
    byDate.set(dateKey, current);
  }

  const base = params.startDate ? new Date(params.startDate) : new Date();
  const days: DailyWeatherForecast[] = [];
  for (let i = 0; i < params.numberOfDays; i++) {
    const d = new Date(base);
    d.setDate(base.getDate() + i);
    const dateKey = d.toISOString().slice(0, 10);
    const info = byDate.get(dateKey);
    days.push({
      date: dateKey,
      hasRain: info?.hasRain ?? false,
      summary: info ? Array.from(info.descriptions).slice(0, 2).join(', ') || 'Clear' : 'Forecast unavailable',
    });
  }

  return { configured: true, days };
}
