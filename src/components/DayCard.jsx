import { useState } from 'react'
import WeatherLine from './WeatherLine.jsx'
import ActivityModal from './ActivityModal.jsx'

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

function parseTimeMinutes(raw) {
  if (!raw) return Infinity
  const s = raw.trim()
  let startStr = s
  let suffix = ''
  const rangeMatch = s.match(/^(.+?)[-–](.+)$/)
  if (rangeMatch) {
    startStr = rangeMatch[1].trim()
    if (!/[AaPp][Mm]/.test(startStr)) {
      const endSuffix = rangeMatch[2].trim().match(/[AaPp][Mm]$/)
      if (endSuffix) suffix = ' ' + endSuffix[0]
    }
  }
  const timeStr = (startStr + suffix).trim()
  const m = timeStr.match(/^(\d{1,2}):(\d{2})(?::\d{2})?\s*([AaPp][Mm])?$/)
  if (!m) return Infinity
  let hours = parseInt(m[1], 10)
  const minutes = parseInt(m[2], 10)
  const ampm = (m[3] || '').toUpperCase()
  if (ampm === 'PM' && hours !== 12) hours += 12
  if (ampm === 'AM' && hours === 12) hours = 0
  return hours * 60 + minutes
}

function buildScheduleItems(tourIds, activitiesMap, dayFlights) {
  const items = []
  tourIds.forEach(id => {
    const act = activitiesMap[id]
    if (!act) return
    const sortTime = parseTimeMinutes(act.meetingTime) !== Infinity
      ? parseTimeMinutes(act.meetingTime)
      : parseTimeMinutes((act.startEnd || '').split(/[-–]/)[0])
    items.push({ type: 'tour', act, sortTime })
  })
  dayFlights.forEach((f, i) => {
    items.push({ type: 'flight', flight: f, sortTime: parseTimeMinutes(f.depart), key: i })
  })
  items.sort((a, b) => a.sortTime - b.sortTime)
  return items
}

export default function DayCard({ day, personTours, activitiesMap, weather, flights, activityParticipants, signupIds }) {
  const [selectedAct, setSelectedAct] = useState(null)

  const d = new Date(day.date + 'T12:00:00')
  const month = MONTH_NAMES[d.getMonth()]
  const num = d.getDate()

  const tourIds = personTours || []
  const dayFlights = (flights || []).filter(f => f.date === day.date)
  const scheduleItems = buildScheduleItems(tourIds, activitiesMap, dayFlights)

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
            {day.arrival && <span className="ship-time-item">Arrives <strong>{day.arrival}</strong></span>}
            {day.departure && <span className="ship-time-item">Departs <strong>{day.departure}</strong></span>}
          </div>
        )}

        <div>
          <div className="tours-label">My schedule</div>

          {scheduleItems.length === 0 && (
            <p className="no-tours">Free day — no flights or tours.</p>
          )}

          {scheduleItems.map((item, i) => {
            if (item.type === 'flight') {
              const f = item.flight
              return (
                <div className="tour-item tour-item--flight" key={`flight-${item.key}`}>
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
              )
            }
            const act = item.act
            return (
              <button
                className="tour-item tour-item--tappable"
                key={act.id}
                onClick={() => setSelectedAct(act)}
              >
                <div className="tour-name">
                  {act.name}
                  <span className="tour-tap-hint">›</span>
                </div>
                {act.operator && <div className="tour-operator">{act.operator}</div>}
                {(act.meetingTime || act.startEnd) && (
                  <div className="tour-time">
                    {act.meetingTime && <>Meet {act.meetingTime}</>}
                    {act.meetingTime && act.startEnd && ' · '}
                    {act.startEnd}
                  </div>
                )}
              </button>
            )
          })}
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

      {selectedAct && (
        <ActivityModal
          act={selectedAct}
          isOptIn={signupIds?.has(selectedAct.id)}
          participants={activityParticipants?.[selectedAct.id]}
          onClose={() => setSelectedAct(null)}
        />
      )}
    </div>
  )
}
