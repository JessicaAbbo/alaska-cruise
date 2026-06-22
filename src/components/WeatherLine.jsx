import { PORT_COORDS } from '../config/weather.js'

export default function WeatherLine({ date, weather }) {
  const hasPort = Boolean(PORT_COORDS[date])
  if (!hasPort) return null

  const w = weather?.[date]

  if (!w) {
    return (
      <div className="weather-row">
        <span className="weather-label weather-na">🌡️ Forecast not available yet — check back closer to the date.</span>
      </div>
    )
  }

  return (
    <div className="weather-row">
      <span className="weather-emoji">{w.emoji}</span>
      <span className="weather-temps">{w.high}°/{w.low}°F</span>
      <span className="weather-label">{w.label}</span>
      {w.precipChance != null && (
        <span className="weather-precip">💧 {w.precipChance}%</span>
      )}
    </div>
  )
}
