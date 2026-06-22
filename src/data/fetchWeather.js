import { PORT_COORDS, describeWeatherCode } from '../config/weather.js'

const WEATHER_CACHE_KEY = 'cruise_weather_v1'

function loadWeatherCache() {
  try {
    return JSON.parse(localStorage.getItem(WEATHER_CACHE_KEY) || '{}')
  } catch {
    return {}
  }
}

function saveWeatherCache(cache) {
  try {
    localStorage.setItem(WEATHER_CACHE_KEY, JSON.stringify(cache))
  } catch (_) {}
}

export async function fetchWeather() {
  const cache = loadWeatherCache()
  const dates = Object.keys(PORT_COORDS).filter(d => PORT_COORDS[d])
  const result = { ...cache }

  // Batch by unique coordinates to reduce API calls
  const coordGroups = {}
  dates.forEach(date => {
    const c = PORT_COORDS[date]
    if (!c) return
    const key = `${c.lat},${c.lng}`
    if (!coordGroups[key]) coordGroups[key] = { lat: c.lat, lng: c.lng, dates: [] }
    coordGroups[key].dates.push(date)
  })

  await Promise.allSettled(
    Object.entries(coordGroups).map(async ([, { lat, lng, dates: coordDates }]) => {
      const startDate = coordDates[0]
      const endDate = coordDates[coordDates.length - 1]
      const url =
        `https://api.open-meteo.com/v1/forecast?` +
        `latitude=${lat}&longitude=${lng}` +
        `&daily=weathercode,temperature_2m_max,temperature_2m_min,precipitation_probability_max` +
        `&temperature_unit=fahrenheit&timezone=America%2FLos_Angeles` +
        `&start_date=${startDate}&end_date=${endDate}`

      const res = await fetch(url)
      if (!res.ok) return
      const json = await res.json()
      const daily = json.daily
      if (!daily) return
      daily.time.forEach((d, i) => {
        result[d] = {
          high: Math.round(daily.temperature_2m_max[i]),
          low: Math.round(daily.temperature_2m_min[i]),
          precipChance: daily.precipitation_probability_max[i],
          code: daily.weathercode[i],
          ...describeWeatherCode(daily.weathercode[i]),
          fetchedAt: new Date().toISOString(),
        }
      })
    })
  )

  saveWeatherCache(result)
  return result
}
