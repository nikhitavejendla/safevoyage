app link: https://wander-wise-safe.lovable.app
SafeVoyage
> Real Time Crisis Communication & Safety Management for Tourists During Extreme Weather Events
->Context & Problem Statement
When localized extreme weather events occur such as sudden flash floods,cyclones or landslides foreign tourists are extremely vulnerable due to a lack of local geographic knowledge and language barriers. 

-Fragmented broadcasts: Local weather warnings and emergency declarations are rarely translated or localized for international travelers.
-Unverified information: Travelers struggle to verify active flood zones or safe shelters, forcing them to rely on unverified social media rumors.
-Rescue lag: Emergency response teams lack centralized visibility into isolated or stranded foreign tourists during critical windows.

SafeVoyage bridges this communication gap by providing a 9platform that seamlessly connects tourists in distress with local municipal command centers.

->Solution Overview

SafeVoyage is a 9responsive web application designed with an urgent yet accessible UI (featuring colours adress to emotions like blue=safe and red=alert). The platform provides two main views togglable in real time:

1. Tourist Mobile App View: Simulates a localized smartphone experience for travelers, offering translated alerts, safe zone navigation, SOS broadcasting, and verified news feeds.
2. Emergency Command Center View: Simulates a high level dispatch dashboard for municipal responders to trigger live broadcasts and manage incoming emergency beacons.

->Key Features

1.Tourist Mobile App View
* Emergency Alert & Translation Banner:
  * Real time warning banners with urgent status indicators (e.g., "Flash Flood Warning in Sector 4").
  * Instant Language Translation: One tap drop down selector supporting Spanish, French, Japanese, Hindi, and German.
  * Text to Speech (TTS): Audio playback simulation for clear audio alerts in the user's native language.
* Interactive Safe Zone Map:
  * Visual spatial map featuring high risk flood polygons (red) and safe shelters/embassies (green).
  * Interactive filter toggles for "Open Shelters", "Medical Camps", and "Evacuation Routes".
* Rumor Buster & Official Feed:
  * Dual tab news feed separating Official Broadcasts (blue checkmarks) from Crowdsourced Ground Reports.
  * Crowd reporting modal allowing tourists to submit tagged ground updates.
* SOS Beacon & Offline Survival Kit:
  * One Tap SOS Button: Simulates broadcasting live GPS coordinates directly to rescue authorities.
  * Offline Toolkit: Collapsible repository of embassy contacts, emergency numbers, and first-aid checklists.

->Emergency Command Center View
* Live Incident Map & Dispatcher Panel:
  * Central control panel allowing municipal authorities to trigger region-wide extreme weather alerts in real time.
* SOS Dispatcher Tracking Table:
  * Real time monitoring feed tracking incoming distress beacons, GPS coordinates, timestamps, and safety statuses ("Safe" or "Needs Rescue").

->Tech Stack

* Frontend: React.js / Next.js, Tailwind CSS
* Icons & UI Elements: Lucide React, Framer Motion
* Maps & Visualization: Leaflet.js / Mapbox GL / Custom Canvas SVG
* State Management: React Context API / Zustand
* Deployment: Vercel / Netlify

->Clone the Repository
   ```bash
   git clone [https://github.com/nikhitavejendla/wander-wise-safe](https://github.com/nikhitavejendla/wander-wise-safe)
   cd SafeVoyage
