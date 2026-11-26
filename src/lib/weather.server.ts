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

function describeWmoCode(code: number): { condition: string; summary: string; hasRain: boolean } {
  if (code === 0) return { condition: 'Clear', summary: 'Clear sky', hasRain: false };
  if (code <= 2) return { condition: 'Clouds', summary: 'Partly cloudy', hasRain: false };
  if (code === 3) return { condition: 'Clouds', summary: 'Overcast', hasRain: false };
  if (code === 45 || code === 48) return { condition: 'Mist', summary: 'Morning mist', hasRain: false };
  if (code >= 51 && code <= 57) return { condition: 'Drizzle', summary: 'Light drizzle', hasRain: true };
  if (code >= 61 && code <= 67) return { condition: 'Rain', summary: 'Rain showers', hasRain: true };
  if (code >= 71 && code <= 77) return { condition: 'Snow', summary: 'Snowfall', hasRain: false };
  if (code >= 80 && code <= 82) return { condition: 'Rain', summary: 'Passing showers', hasRain: true };
  if (code >= 95) return { condition: 'Thunderstorm', summary: 'Thunderstorm', hasRain: true };
  return { condition: 'Clear', summary: 'Pleasant weather', hasRain: false };
}

async function fetchOpenMeteoForecast(params: {
  coordinates: Coordinates;
  numberOfDays: number;
  startDate?: string;
}): Promise<{ configured: boolean; days: DailyWeatherForecast[] }> {
  try {
    const forecastDays = Math.min(16, Math.max(params.numberOfDays + 2, 7));
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${params.coordinates.lat.toFixed(4)}&longitude=${params.coordinates.lng.toFixed(4)}&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&current=relative_humidity_2m,temperature_2m,wind_speed_10m,weather_code&forecast_days=${forecastDays}&timezone=Asia%2FKolkata`;
    const res = await fetch(url, { signal: AbortSignal.timeout(4500) });
    if (!res.ok) return { configured: false, days: [] };
    const json = (await res.json()) as {
      current?: {
        relative_humidity_2m?: number;
        temperature_2m?: number;
        wind_speed_10m?: number;
        weather_code?: number;
      };
      daily?: {
        time?: string[];
        weather_code?: number[];
        temperature_2m_max?: number[];
        temperature_2m_min?: number[];
        precipitation_probability_max?: number[];
        wind_speed_10m_max?: number[];
      };
    };

    const daily = json.daily;
    if (!daily?.time?.length) return { configured: false, days: [] };

    const byDate = new Map<string, DailyWeatherForecast>();
    const baseHumidity =
      json.current?.relative_humidity_2m !== undefined
        ? Math.round(json.current.relative_humidity_2m)
        : undefined;

    for (let i = 0; i < daily.time.length; i++) {
      const dateStr = daily.time[i]!;
      const code = daily.weather_code?.[i] ?? 0;
      const wmo = describeWmoCode(code);
      const maxT = daily.temperature_2m_max?.[i];
      const minT = daily.temperature_2m_min?.[i];
      const rainProb = daily.precipitation_probability_max?.[i] ?? 0;
      const wind = daily.wind_speed_10m_max?.[i];

      const tempMinC = minT !== undefined ? Math.round(minT) : undefined;
      const tempMaxC = maxT !== undefined ? Math.round(maxT) : undefined;
      const tempC =
        tempMinC !== undefined && tempMaxC !== undefined
          ? Math.round((tempMinC + tempMaxC) / 2)
          : tempMaxC ?? tempMinC;
      const hasRain = wmo.hasRain || rainProb >= 55;

      byDate.set(dateStr, {
        date: dateStr,
        hasRain,
        summary: [tempC !== undefined ? `${tempC}°C` : '', wmo.summary].filter(Boolean).join(' · '),
        ...(tempC !== undefined ? { tempC } : {}),
        ...(tempMinC !== undefined ? { tempMinC } : {}),
        ...(tempMaxC !== undefined ? { tempMaxC } : {}),
        ...(baseHumidity !== undefined ? { humidity: baseHumidity } : {}),
        ...(wind !== undefined ? { windKmh: Math.round(wind) } : {}),
        condition: hasRain ? 'Rain' : wmo.condition,
      });
    }

    const base = params.startDate ? new Date(params.startDate) : new Date();
    const fallbackDay = Array.from(byDate.values())[0];
    const days: DailyWeatherForecast[] = [];
    for (let i = 0; i < params.numberOfDays; i++) {
      const d = new Date(base);
      d.setDate(base.getDate() + i);
      const dateKey = d.toISOString().slice(0, 10);
      const matched = byDate.get(dateKey);
      if (matched) {
        days.push(matched);
      } else if (fallbackDay) {
        days.push({ ...fallbackDay, date: dateKey });
      }
    }
    return { configured: days.length > 0, days };
  } catch {
    return { configured: false, days: [] };
  }
}

export async function getDestinationWeather(params: {
  coordinates: Coordinates;
  numberOfDays: number;
  startDate?: string;
}): Promise<{ configured: boolean; days: DailyWeatherForecast[] }> {
  const apiKey = process.env['OPENWEATHER_API_KEY'];
  if (!apiKey) {
    return fetchOpenMeteoForecast(params);
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
