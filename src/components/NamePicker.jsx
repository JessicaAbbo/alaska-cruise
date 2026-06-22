function AlaskaLogo() {
  return (
    <svg viewBox="0 0 320 300" xmlns="http://www.w3.org/2000/svg" className="picker-logo-svg" aria-hidden="true">
      {/* Sun/circle backdrop */}
      <circle cx="160" cy="130" r="105" fill="#A8D4F5" />
      {/* Horizontal cloud streaks */}
      <g fill="#C8E8FA" opacity="0.85">
        <rect x="68"  y="90"  width="185" height="7"  rx="3.5" />
        <rect x="60"  y="108" width="200" height="6"  rx="3" />
        <rect x="72"  y="125" width="176" height="6"  rx="3" />
        <rect x="80"  y="142" width="160" height="5"  rx="2.5" />
        <rect x="90"  y="157" width="140" height="5"  rx="2.5" />
        <rect x="100" y="171" width="120" height="4"  rx="2" />
      </g>
      {/* Mountains */}
      {/* Far left small peak */}
      <polygon points="52,220 88,148 110,185" fill="#3B5EC6" />
      {/* Left mid peak */}
      <polygon points="78,220 124,118 158,175" fill="#3B5EC6" />
      {/* Centre tallest peak */}
      <polygon points="118,220 160,68 202,220" fill="#4169CC" />
      {/* Snow highlight centre */}
      <polygon points="160,68 172,100 148,100" fill="#C8E8FA" opacity="0.6" />
      {/* Right mid peak */}
      <polygon points="162,220 196,118 240,220" fill="#3B5EC6" />
      {/* Snow highlight right */}
      <polygon points="196,118 206,142 186,142" fill="#C8E8FA" opacity="0.5" />
      {/* Far right small peak */}
      <polygon points="210,220 232,158 268,220" fill="#3B5EC6" />
      {/* Base ground bar */}
      <rect x="52" y="218" width="216" height="8" rx="2" fill="#3B5EC6" />

      {/* Arched "RAY RAK TRIP" text along top of circle */}
      <defs>
        <path id="arcTop" d="M 68,130 A 92,92 0 0,1 252,130" />
      </defs>
      <text fontFamily="'Arial Black', Arial, sans-serif" fontWeight="900" fontSize="18" fill="#3B5EC6" letterSpacing="3">
        <textPath href="#arcTop" startOffset="50%" textAnchor="middle">RAY RAK TRIP</textPath>
      </text>
    </svg>
  )
}

export default function NamePicker({ people, onSelect }) {
  const groups = {}
  people.forEach(p => {
    const g = p.familyUnit || 'Other'
    if (!groups[g]) groups[g] = []
    groups[g].push(p)
  })

  return (
    <div className="picker-page">
      <div className="picker-hero">
        <AlaskaLogo />
        <div className="picker-title-block">
          <div className="picker-family">Michaan Family Trip</div>
          <h1 className="picker-h1">Alaska 2026</h1>
          <div className="picker-ship">Anthem of the Seas</div>
          <div className="picker-dates">August 2 – 12, 2026</div>
        </div>
      </div>
      <p className="picker-prompt">Who are you? Tap your name to see your personal itinerary.</p>
      {Object.entries(groups).map(([family, members]) => (
        <div className="family-group" key={family}>
          <h2>{family}</h2>
          {members.map(p => (
            <button key={p.name} className="name-btn" onClick={() => onSelect(p.name)}>
              <span>👤</span>
              <span>{p.name}</span>
              {p.age && <span className="name-age">Age {p.age}</span>}
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
