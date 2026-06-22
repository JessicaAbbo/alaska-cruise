# Alaska Cruise 2026 — Family Itinerary App

Mobile-first PWA for the Abbo family cruise on *Anthem of the Seas*, Aug 2–12 2026 (round-trip Seattle, 25 people).

---

## 1. Google Sheet Setup — Publish each tab as CSV

For each tab, in Google Sheets:

1. **File → Share → Publish to web**
2. Select the tab name from the first dropdown
3. Select **CSV** from the second dropdown
4. Click **Publish** and copy the URL

Paste each URL into **`src/config/sheets.js`**:

```js
export const SHEET_URLS = {
  roster:     'https://docs.google.com/spreadsheets/d/e/LONG_ID/pub?gid=0&single=true&output=csv',
  itinerary:  'https://docs.google.com/spreadsheets/d/e/LONG_ID/pub?gid=123&single=true&output=csv',
  activities: '...',
  signups:    '...',
  travel:     '...',
  lodging:    '...',
}
```

**Use the Publish-to-web URL** (contains `/pub?`), NOT the `/export?format=csv` URL — the export URL has CORS issues in the browser.

### Column names the parser expects (do not rename these)

| Key         | Tab         | Required columns |
|-------------|-------------|------------------|
| `roster`    | Roster      | Name, Age, Age Group, Family Unit, Dietary, Stateroom, Notes |
| `itinerary` | Itinerary   | Date, Day, Location, Type, Ship Arrival, Ship Departure, Notes |
| `activities`| Activities  | Date, Port, Activity, Tour operator, Meeting time, Start-End, Cost/Person |
| `signups`   | Signups     | Name, Age, then one column per activity (value `1` = signed up) |
| `travel`    | Travel      | Name, Leg, Date, From, To, Depart, Arrive, Carrier/Provider, Confirmation, Notes |
| `lodging`   | Lodging     | Segment, Property/Ship, Room/Stateroom, Occupants, Check-in, Check-out |

---

## 2. Activity ID Mapping (Signups → Activities)

The Signups tab uses short column headers that don't exactly match the Activities `Activity` column. Define the mapping in `src/config/sheets.js`:

```js
export const SIGNUP_COLUMN_MAP = {
  'White Pass Railway (Skagway)': 'white-pass-railway',
  'Sitka Sound Kayak':            'sitka-sound-kayak-adventure',
  // Key = exact Signups column header
  // Value = auto-generated id from Activities tab
}
```

Activity IDs are derived from the `Activity` column: lowercase, spaces→dashes, strip special chars.
Example: `"Sitka Sound Kayak Adventure"` → `"sitka-sound-kayak-adventure"`.

---

## 3. Run locally

```bash
npm install
npm run dev
# open http://localhost:5173
```

---

## 4. Build

```bash
npm run build
# output in dist/
```

---

## 5. Deploy to Netlify

**Via Netlify UI:** Push to GitHub → Netlify "Import project" → build command `npm run build`, publish directory `dist`.

**Via CLI:**
```bash
npm install -g netlify-cli
netlify deploy --build --prod
```

`netlify.toml` handles build settings and caching headers automatically.

---

## 6. PWA / Offline

The service worker caches the full app and data on first load. At sea with no connection, the app shows the last synced version. **Tip:** open the app on port/hotel WiFi before boarding to cache the latest data. Install via "Add to Home Screen" on iOS or Android.

---

## 7. Weather

Auto-fetched from [Open-Meteo](https://open-meteo.com/) (free, no API key). Real forecasts only — shows "not available yet" for dates > ~16 days out. Sea days have no weather. Cached for offline use.

---

## Editing the sheet

- Editing **values** is always safe — app re-fetches on next open.
- Do **not rename** tab names or column headers.
- Adding a new activity: add a `SIGNUP_COLUMN_MAP` entry and redeploy.
