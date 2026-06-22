import { useState } from 'react'

export default function Flights({ flights }) {
  const [open, setOpen] = useState(false)
  if (!flights || flights.length === 0) return null

  return (
    <div className="flights-section">
      <button className={`collapsible-header${open ? ' open' : ''}`} onClick={() => setOpen(o => !o)}>
        ✈️ My Flights ({flights.length} leg{flights.length !== 1 ? 's' : ''})
        <span className={`chevron${open ? ' open' : ''}`}>▾</span>
      </button>
      {open && (
        <div className="flight-card">
          {flights.map((f, i) => (
            <div className="flight-row" key={i}>
              <div className="flight-leg">{f.leg || `Leg ${i + 1}`}</div>
              <div className="flight-info">
                <div className="flight-route">{f.from} → {f.to}</div>
                {(f.depart || f.arrive) && (
                  <div className="flight-times">{f.date} · {f.depart}{f.arrive ? ` → ${f.arrive}` : ''}</div>
                )}
                {f.carrier && <div className="flight-carrier">{f.carrier}</div>}
                {f.confirmation && <div className="flight-conf">Conf: {f.confirmation}</div>}
                {f.note && <div className="flight-conf">{f.note}</div>}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
