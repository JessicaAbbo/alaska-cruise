// Replace these with your actual Publish-to-web CSV URLs from Google Sheets.
// File → Share → Publish to web → select the tab → CSV → Copy link
export const SHEET_URLS = {
  roster:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=246496868&single=true&output=csv',
  itinerary: 'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=131829092&single=true&output=csv',
  activities:'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=1248132044&single=true&output=csv',
  signups:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=1582335442&single=true&output=csv',
  travel:    'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=396334645&single=true&output=csv',
  lodging:   'https://docs.google.com/spreadsheets/d/e/2PACX-1vTQfiFlEOdp7NM0sP_VjonVNJRkDEYHKHx0TgDgV3pNGPlAKEG2_qhYju_iDa-Jq8xLyzA5gNLWELbd/pub?gid=1744045321&single=true&output=csv',
}

// Explicit mapping: Signups column header → activityId (assigned below in activities config)
// Update this whenever a new activity is added to the sheet.
export const SIGNUP_COLUMN_MAP = {
  'Wildlife Catamaran':         'wildlife-on-catamaran',
  'Sitka Sound Kayak':          'sitka-sound-kayak-adventure',
  'Bears and Totem':            'fortress-of-the-bear-and-totem-park',
  'White Pass Railway':         'white-pass-scenic-railway',
  'Helicopter ride':            'helicopter-ride',
  'Dog Musher':                 'mushers-camp-and-sled-dog-adventure',
  'Whale Watching':             'whale-watching-and-mendenhall-glacier',
  'Butchart Gardens':           'butchart-and-butterfly-gardens',
  'Self-guided Inner Harbour':  'inner-harbour-walk',
  'Boeing Factory':             'boeing-factory-tour',
}
