import WeatherLine from './WeatherLine.jsx'

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']

function typeClass(type) {
  const t = (type || '').toLowerCase()
  if (t.includes('port') || t.includes('stop')) return 'type-port'
  if (t.includes('sea')) return 'type-sea'
  if (t.includes('land') || t.includes('hotel')) return 'type-land'
  if (t.includes('embark') || t.includes('board')) return 'type-embark'
  if (t.includes('debark') || t.includes('disembark')) return 'type-debark'
  return 'type-default'
}

export default function DayCard({ day, personTours, activitiesMap, weather, flights }) {
  const d = new Date(day.date + 'T12:00:00')
  const month = MONTH_NAMES[d.getMonth()]
  const num = d.getDate()

  const tourIds = personTours || []
  const dayFlights = (flights || []).filter(f => f.date === day.date)
  const hasContent = tourIds.length > 0 || dayFlights.length > 0

  return (
    <div className="day-card">
      <div className="day-card-header">
        <div className="day-date-block">
          <div className="day-month">{month}</div>
          <div className="day-num">{num}</div>
          <div className="day-dow">{day.dow || d.toLocaleDateString('en-US', { weekday: 'short' })}</div>
        </div>
        <div className="day-port-block">
          <div className="day-port">{day.port || 'At Sea'}</div>
          {day.type && (
            <span className={`day-type-badge ${typeClass(day.type)}`}>{day.type}</span>
          )}
        </div>
      </div>

      <div className="day-card-body">
        {(day.arrival || day.departure) && (
          <div className="ship-times">
            {day.arrival && (
              <span className="ship-time-item">Arrives <strong>{day.arrival}</strong></span>
            )}
            {day.departure && (
              <span className="ship-time-item">Departs <strong>{day.departure}</strong></span>
            )}
          </div>
        )}

        <div>
          <div className="tours-label">My schedule</div>

          {dayFlights.map((f, i) => (
            <div className="tour-item tour-item--flight" key={`flight-${i}`}>
              <div className="tour-name">✈️ {f.from} → {f.to}</div>
              {f.carrier && <div className="tour-operator">{f.carrier}</div>}
              {(f.depart || f.arrive) && (
                <div className="tour-time">
                  {f.depart}{f.arrive ? ` → ${f.arrive}` : ''}
                  {f.confirmation ? ` · Conf: ${f.confirmation}` : ''}
                </div>
              )}
              {f.note && <div className="tour-operator">{f.note}</div>}
            </div>
          ))}

          {tourIds.map(id => {
            const act = activitiesMap[id]
            if (!act) return null
            return (
              <div className="tour-item" key={id}>
                <div className="tour-name">{act.name}</div>
                {act.operator && <div className="tour-operator">{act.operator}</div>}
                {(act.meetingTime || act.startEnd) && (
                  <div className="tour-time">
                    {act.meetingTime && <>Meet {act.meetingTime}</>}
                    {act.meetingTime && act.startEnd && ' · '}
                    {act.startEnd}
                  </div>
                )}
              </div>
            )
          })}

          {!hasContent && (
            <p className="no-tours">Free day — no flights or tours.</p>
          )}
        </div>

        <WeatherLine date={day.date} weather={weather} />

        <div className="notes-row">
          <div className="notes-label">Notes</div>
          {day.notes ? (
            <div>{day.notes}</div>
          ) : (
            <div className="notes-empty">No notes for this day.</div>
          )}
        </div>
      </div>
    </div>
  )
}
