import { useEffect, useState } from 'react'
import './App.css'
import { loadData } from './data/fetchSheets.js'
import { fetchWeather } from './data/fetchWeather.js'
import NamePicker from './components/NamePicker.jsx'
import SwitchPerson from './components/SwitchPerson.jsx'
import DayCard from './components/DayCard.jsx'
import PackingList from './components/PackingList.jsx'
import Countdown from './components/Countdown.jsx'
import WelcomeModal, { shouldShowWelcome, markWelcomeSeen } from './components/WelcomeModal.jsx'
import RoomMap from './components/RoomMap.jsx'

const PERSON_KEY = 'cruise_active_person'

export default function App() {
  const [status, setStatus] = useState('loading')
  const [tripData, setTripData] = useState(null)
  const [stale, setStale] = useState(false)
  const [weather, setWeather] = useState({})
  const [isOnline, setIsOnline] = useState(navigator.onLine)
  const [activePerson, setActivePerson] = useState(() => localStorage.getItem(PERSON_KEY) || '')
  const [activeTab, setActiveTab] = useState('itinerary') // 'itinerary' | 'packing'
  const [showWelcome, setShowWelcome] = useState(() => shouldShowWelcome())
  const [showMap, setShowMap] = useState(false)

  useEffect(() => {
    const onOnline = () => setIsOnline(true)
    const onOffline = () => setIsOnline(false)
    window.addEventListener('online', onOnline)
    window.addEventListener('offline', onOffline)
    return () => {
      window.removeEventListener('online', onOnline)
      window.removeEventListener('offline', onOffline)
    }
  }, [])

  useEffect(() => {
    loadData().then(({ data, stale: s }) => {
      if (!data) { setStatus('error'); return }
      setTripData(data)
      setStale(s)
      setStatus('ready')
    })
  }, [])

  useEffect(() => {
    if (status !== 'ready') return
    try {
      const cached = JSON.parse(localStorage.getItem('cruise_weather_v1') || '{}')
      setWeather(cached)
    } catch (_) {}
    fetchWeather().then(w => setWeather(w)).catch(() => {})
  }, [status])

  const selectPerson = (name) => {
    setActivePerson(name)
    localStorage.setItem(PERSON_KEY, name)
    setActiveTab('itinerary')
  }

  // Scroll to the appropriate day card after the itinerary renders
  useEffect(() => {
    if (!activePerson || !tripData) return
    // Wait one frame for the DOM to paint
    const raf = requestAnimationFrame(() => {
      const dates = tripData.days.map(d => d.date).sort()
      if (!dates.length) return
      const todayStr = new Date().toLocaleDateString('en-CA') // YYYY-MM-DD in local time
      let target
      if (todayStr < dates[0]) target = dates[0]
      else if (todayStr > dates[dates.length - 1]) target = dates[dates.length - 1]
      else target = dates.find(d => d === todayStr) || dates[0]
      const el = document.getElementById(`day-${target}`)
      if (el) el.scrollIntoView({ behavior: 'instant', block: 'start' })
    })
    return () => cancelAnimationFrame(raf)
  }, [activePerson, tripData])

  if (status === 'loading') {
    return (
      <div className="app">
        <div className="loading-page">
          <div className="spinner" />
          <p style={{ color: 'var(--text-muted)' }}>Loading trip data…</p>
        </div>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="app">
        <div className="loading-page">
          <div className="error-box">
            <p style={{ fontSize: 32 }}>⚠️</p>
            <p style={{ fontWeight: 700, marginTop: 8 }}>Couldn't load trip data</p>
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Make sure you have internet access and the Google Sheet URLs are configured
              in <code>src/config/sheets.js</code>.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const { people, days, activitiesMap, activityParticipants, signupIds } = tripData

  if (!activePerson || !people.find(p => p.name === activePerson)) {
    return (
      <div className="app">
        {!isOnline && <div className="offline-banner">You're offline — showing cached data.</div>}
        <NamePicker people={people} onSelect={selectPerson} onShowMap={() => setShowMap(true)} />
        {showWelcome && (
          <WelcomeModal onDismiss={() => { markWelcomeSeen(); setShowWelcome(false) }} />
        )}
        {showMap && <RoomMap onClose={() => setShowMap(false)} />}
      </div>
    )
  }

  const person = people.find(p => p.name === activePerson)

  return (
    <div className="app">
      {!isOnline && (
        <div className="offline-banner">📵 You're offline — showing last synced data.</div>
      )}
      {isOnline && stale && (
        <div className="stale-banner">⚠️ Showing cached data — couldn't refresh from sheet.</div>
      )}

      <div className="sticky-header">
        <div className="header-top">
          <button className="home-btn" onClick={() => selectPerson('')} aria-label="Home">🏔️</button>
          <div className="header-name">{person.name}</div>
          <SwitchPerson people={people} current={person.name} onSelect={selectPerson} />
        </div>
        <div className="header-meta">
          {person.familyUnit && <span className="badge">👨‍👩‍👧 {person.familyUnit}</span>}
          {person.cabin && <span className="badge badge-cabin">🛏 Cabin {person.cabin}{person.reservationId ? ` · ID ${person.reservationId}` : ''}</span>}
        </div>
      </div>

      <div className="tab-bar">
        <button
          className={`tab-btn${activeTab === 'itinerary' ? ' tab-btn--active' : ''}`}
          onClick={() => setActiveTab('itinerary')}
        >
          🗓 Itinerary
        </button>
        <button
          className={`tab-btn${activeTab === 'packing' ? ' tab-btn--active' : ''}`}
          onClick={() => { setActiveTab('packing'); window.scrollTo({ top: 0, behavior: 'instant' }) }}
        >
          🧳 Packing
        </button>
      </div>

      {activeTab === 'itinerary' && (
        <>
          <div className="days-list">
            {days.map(day => (
              <DayCard
                key={day.date}
                day={day}
                personTours={person.tours?.[day.date] || []}
                activitiesMap={activitiesMap}
                weather={weather}
                flights={person.flights}
                activityParticipants={activityParticipants}
                signupIds={signupIds}
              />
            ))}
          </div>
          <div className="footer">
            <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">Weather by Open-Meteo</a>
            {' · '}
            Anthem of the Seas · Aug 2–12, 2026
            {tripData.lastUpdated && (
              <div>Data synced {new Date(tripData.lastUpdated).toLocaleString()}</div>
            )}
          </div>
        </>
      )}

      {activeTab === 'packing' && (
        <PackingList personId={activePerson} />
      )}
    </div>
  )
}
