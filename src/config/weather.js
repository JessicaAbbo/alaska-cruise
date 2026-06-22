// Coordinates for each date's port. Sea days have no coordinates.
export const PORT_COORDS = {
  '2026-08-02': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  '2026-08-03': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  '2026-08-04': null, // At sea
  '2026-08-05': { lat: 57.0531, lng: -135.3300, name: 'Sitka, AK' },
  '2026-08-06': { lat: 59.4583, lng: -135.3139, name: 'Skagway, AK' },
  '2026-08-07': { lat: 58.3019, lng: -134.4197, name: 'Juneau, AK' },
  '2026-08-08': null, // At sea (Shabbat)
  '2026-08-09': { lat: 48.4284, lng: -123.3656, name: 'Victoria, BC' },
  '2026-08-10': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  '2026-08-11': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
  '2026-08-12': { lat: 47.6062, lng: -122.3321, name: 'Seattle, WA' },
}

// WMO weather code → { label, emoji }
export function describeWeatherCode(code) {
  if (code == null) return null
  if (code === 0) return { label: 'Clear sky', emoji: '☀️' }
  if (code <= 2)  return { label: 'Partly cloudy', emoji: '⛅' }
  if (code === 3) return { label: 'Overcast', emoji: '☁️' }
  if (code <= 49) return { label: 'Foggy', emoji: '🌫️' }
  if (code <= 55) return { label: 'Drizzle', emoji: '🌦️' }
  if (code <= 65) return { label: 'Rain', emoji: '🌧️' }
  if (code <= 77) return { label: 'Snow', emoji: '🌨️' }
  if (code <= 82) return { label: 'Rain showers', emoji: '🌦️' }
  if (code <= 86) return { label: 'Snow showers', emoji: '🌨️' }
  return { label: 'Thunderstorm', emoji: '⛈️' }
}
