const TRIP_START = new Date('2026-08-02T00:00:00')
const TRIP_END   = new Date('2026-08-12T23:59:59')

export default function Countdown() {
  const now = new Date()

  if (now > TRIP_END) return null

  if (now >= TRIP_START) {
    return (
      <div className="countdown-card countdown-card--active">
        <span className="countdown-label">🚢 Best Trip Ever</span>
      </div>
    )
  }

  const msPerDay = 1000 * 60 * 60 * 24
  const days = Math.ceil((TRIP_START - now) / msPerDay)

  return (
    <div className="countdown-card">
      <span className="countdown-num">{days}</span>
      <span className="countdown-label">day{days !== 1 ? 's' : ''} until Alaska</span>
    </div>
  )
}
