import Papa from 'papaparse'
import { SHEET_URLS, SIGNUP_COLUMN_MAP } from '../config/sheets.js'

const CACHE_KEY = 'cruise_data_v1'

function parseCSV(text) {
  const result = Papa.parse(text, { header: true, skipEmptyLines: true })
  return result.data
}

async function fetchTab(name) {
  const url = SHEET_URLS[name]
  if (!url || url.startsWith('PASTE_')) {
    console.warn(`Sheet URL for "${name}" not configured.`)
    return []
  }
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status} fetching ${name}`)
  return parseCSV(await res.text())
}

const CRUISE_YEAR = 2026

function normalizeDate(raw) {
  if (!raw) return ''
  const s = raw.trim()
  // Already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(s)) return s
  // "Aug 2" or "Aug 2," — month-name + day, no year (Google Sheets omits year for current year)
  const monthDay = s.match(/^([A-Za-z]+)\s+(\d{1,2}),?$/)
  if (monthDay) {
    const d = new Date(`${monthDay[1]} ${monthDay[2]}, ${CRUISE_YEAR}`)
    if (!isNaN(d)) {
      const m = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      return `${CRUISE_YEAR}-${m}-${day}`
    }
  }
  const d = new Date(s)
  if (isNaN(d)) return s
  // Use local date parts to avoid UTC midnight timezone shift
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildData(roster, itinerary, activities, signups, travel, lodging) {
  // --- Activities map: id → activity object ---
  const activitiesMap = {}
  activities.forEach(row => {
    const name = (row['Activity'] || '').trim()
    if (!name) return
    // Generate a stable id from name (lowercased, dashes)
    const id = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')
    activitiesMap[id] = {
      id,
      date: normalizeDate(row['Date']),
      port: (row['Port'] || '').trim(),
      name,
      option: (row['Option'] || '').trim(),
      operator: (row['Tour operator'] || '').trim(),
      description: (row['Description'] || '').trim(),
      meetingTime: (row['Meeting time'] || '').trim(),
      startEnd: (row['Start-End'] || '').trim(),
      duration: (row['Duration'] || '').trim(),
      ageRange: (row['Age Range'] || '').trim(),
      cost: (row['Cost/Person'] || '').trim(),
      booked: (row['Booked'] || '').trim(),
      notes: (row['Link/Notes'] || '').trim(),
    }
  })

  // --- Signups: build map of personName → Set of activityIds ---
  const signupMap = {}
  // Find the header row's column names that correspond to activities
  if (signups.length > 0) {
    const activityCols = Object.keys(signups[0]).filter(k => SIGNUP_COLUMN_MAP[k])
    signups.forEach(row => {
      const name = (row['Name'] || '').trim()
      if (!name || name.toLowerCase() === 'total') return
      const ids = []
      activityCols.forEach(col => {
        const val = (row[col] || '').trim()
        if (val === '1') {
          const id = SIGNUP_COLUMN_MAP[col]
          if (id) ids.push(id)
        }
      })
      signupMap[name] = ids
    })
  }

  // --- Travel: build map of personName → flights array ---
  const travelMap = {}
  travel.forEach(row => {
    const name = (row['Name'] || '').trim()
    if (!name) return
    if (!travelMap[name]) travelMap[name] = []
    travelMap[name].push({
      leg: (row['Leg'] || '').trim(),
      date: normalizeDate(row['Date']),
      from: (row['From'] || '').trim(),
      to: (row['To'] || '').trim(),
      depart: (row['Depart'] || '').trim(),
      arrive: (row['Arrive'] || '').trim(),
      carrier: (row['Carrier/Provider'] || '').trim(),
      confirmation: (row['Confirmation'] || '').trim(),
      note: (row['Notes'] || '').trim(),
    })
  })

  // Activities with no Signups column are whole-group — every person attends.
  const signupIds = new Set(Object.values(SIGNUP_COLUMN_MAP))
  const groupActivityIds = Object.keys(activitiesMap).filter(id => !signupIds.has(id))

  // --- People ---
  const people = roster
    .filter(row => (row['Name'] || '').trim())
    .map(row => {
      const name = (row['Name'] || '').trim()
      const lastDayRaw = normalizeDate(row['Last Day'] || '')
      const lastDay = lastDayRaw ? new Date(lastDayRaw + 'T12:00:00') : null
      const tours = {}

      // Whole-group activities for everyone (capped by Last Day when set)
      groupActivityIds.forEach(actId => {
        const act = activitiesMap[actId]
        if (!act || !act.date) return
        if (lastDay && new Date(act.date + 'T12:00:00') > lastDay) return
        if (!tours[act.date]) tours[act.date] = []
        tours[act.date].push(actId)
      })

      // Opt-in activities from Signups tab
      const personSignups = signupMap[name] || []
      personSignups.forEach(actId => {
        const act = activitiesMap[actId]
        if (!act || !act.date) return
        if (!tours[act.date]) tours[act.date] = []
        if (!tours[act.date].includes(actId)) tours[act.date].push(actId)
      })
      return {
        name,
        age: (row['Age'] || '').trim(),
        ageGroup: (row['Age Group'] || '').trim(),
        familyUnit: (row['Family Unit'] || '').trim(),
        dietary: (row['Dietary'] || '').trim(),
        cabin: (row['Stateroom'] || '').trim(),
        reservationId: (row['Reservation ID'] || '').trim(),
        notes: (row['Notes'] || '').trim(),
        lastDay: lastDayRaw || null,
        flights: travelMap[name] || [],
        tours,
      }
    })

  // --- Days ---
  const days = itinerary
    .filter(row => (row['Date'] || '').trim())
    .map(row => ({
      date: normalizeDate(row['Date']),
      dow: (row['Day'] || '').trim(),
      port: (row['Location'] || '').trim(),
      type: (row['Type'] || '').trim(),
      arrival: (row['Ship Arrival'] || '').trim(),
      departure: (row['Ship Departure'] || '').trim(),
      highlights: (row['Highlights'] || '').trim(),
      notes: (row['Notes'] || '').trim(),
    }))

  return {
    people,
    days,
    activities: Object.values(activitiesMap),
    activitiesMap,
    lastUpdated: new Date().toISOString(),
  }
}

export async function loadData() {
  let fromNetwork = false
  let data = null

  try {
    const [roster, itinerary, activities, signups, travel, lodging] = await Promise.all([
      fetchTab('roster'),
      fetchTab('itinerary'),
      fetchTab('activities'),
      fetchTab('signups'),
      fetchTab('travel'),
      fetchTab('lodging'),
    ])
    data = buildData(roster, itinerary, activities, signups, travel, lodging)
    fromNetwork = true
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
    } catch (_) {}
  } catch (err) {
    console.warn('Network fetch failed, falling back to cache:', err)
    const cached = localStorage.getItem(CACHE_KEY)
    if (cached) {
      try {
        data = JSON.parse(cached)
      } catch (_) {}
    }
  }

  return { data, fromNetwork, stale: !fromNetwork }
}
