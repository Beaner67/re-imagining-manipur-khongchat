# Khongchat

**Walk Manipur, the local way.**

Khongchat ("journey" in Meiteilon) is a travel companion for Manipur. It gives tourists one reliable place to plan a trip: a personalised itinerary, place status verified live by Manipur Tourism, a trip that still opens with no signal, and a craft passport that sends visitors to local artisans.

Built for the **Re-imagining Manipur Hackathon 2026**, organised by the Department of Tourism and the Department of Information Technology, Government of Manipur, with Manipur Technology Innovation Foundation (MTIF) as knowledge partner.

| | |
|---|---|
| Problem statement | PS 1: Smart Manipur Tourism Discovery Platform |
| Also covers (light) | PS 2 (planner), PS 5 (homestays), PS 6 (food), PS 7 (festival calendar) |
| Team number | 2 |
| Team name | Localhosts |
| Team members | Yoihenba Mongjam, Ejualiu Joanna Ringdi |
| Live prototype | https://re-imagining-manipur-khongchat.vercel.app/ |
| Demo video | `02 Demo/brag.mp4` in the submission folder |

---

## 1. The problem

1. **Visits have fallen.** Domestic visits to Manipur fell from 139,500 in 2022 to 58,000 in 2023 (Ministry of Tourism, via CEIC).
2. **The network is unreliable.** Manipur had no internet for 4,374 hours in 2023 (SFLC.in, *Let the Net Work 2.0*). Travel apps that only work online stop working when a tourist needs them most.
3. **Information is scattered.** Places, events, stays, food and permits sit on different sites. Nothing tells a tourist what is open today.

## 2. The solution

| Feature | What it does |
|---|---|
| Personal trip planner | Pick interests (heritage, nature, culture, food, adventure, crafts, sports) and number of days. Get a day-by-day plan. |
| Verified live status | Each place shows Open, Advisory or Closed. Tourism staff set it from a dashboard; tourist pages update at once. |
| Works with no signal | Pages, trip, contacts and the ILP checklist are cached on the phone and open in airplane mode. |
| Craft passport | Scan a QR code at an artisan stall or homestay to collect a stamp. Three stamps unlock a guided village walk. |
| Events and listings | Festival calendar matched to interests. Stays, food, guides, crafts and transport listings. |

## 3. How we built it

### Process

1. **Brief and scoring.** We read the organisers' DOs and DON'Ts, the 10 jury criteria and the 8 problem statements, then chose PS 1.
2. **Research.** We collected tourism, connectivity and permit figures from public sources (section 6) and checked each one.
3. **Concept and demo video.** We storyboarded the core flow and rendered a 23-second concept video from an HTML composition.
4. **Pitch deck.** We filled the organisers' 4-slide template.
5. **Prototype.** We built a static progressive web app (PWA) and a Tourism dashboard page.
6. **Testing.** [Describe tests: planner output, dashboard sync, stamp flow, airplane-mode check.]

### Architecture

```
Tourism dashboard  --(set status)-->  Status store  --(live update)-->  Tourist pages
                                                                            |
                                                              Service worker cache
                                                              (works offline)
```

- **Prototype (this repo):** status is stored in the browser (`localStorage`). Open pages sync instantly through `BroadcastChannel`. This makes the demo work on one laptop with no server and no internet.
- **Production plan:** replace the browser store with a Supabase table and realtime subscriptions, so an update on the dashboard reaches every phone.

### How the planner works (rule-based)

1. Score each place by how many of the tourist's interests it matches.
2. Group places by area (Imphal city; Loktak and Moirang; Thoubal, Kakching and Andro; hill districts).
3. Give each day one area to cut travel time. Imphal comes first because most visitors arrive there.
4. Take the best 3 to 4 stops per day. Hill districts are added only from day 3, as one full-day trip.

No AI model runs inside the app. AI-generated suggestions are on the roadmap.

## 4. What we used

### Languages and platform

| Item | Use | Status |
|---|---|---|
| HTML, CSS, JavaScript | Tourist site, dashboard, passport | Built |
| Service worker + Web App Manifest | Offline mode, install to home screen | Built |
| Supabase (Postgres + Realtime) | Live status across devices | Planned |
| Vercel | Hosting | Claude artifact for the demo; Vercel planned |

### Libraries and assets

| Item | Use | License |
|---|---|---|
| [qrcode-generator](https://github.com/kazuhikoarase/qrcode-generator) by Kazuhiko Arase | QR codes for the craft passport | MIT |
| Hero photo: Loktak Lake by [Leeder Bose](https://unsplash.com/photos/1JCJHh68syo) | Home page hero, cropped and layered | Unsplash License |
| [Fraunces](https://fonts.google.com/specimen/Fraunces) | Display font | SIL Open Font License 1.1 |
| [IBM Plex Sans](https://github.com/IBM/plex) | Body font | SIL Open Font License 1.1 |
| Fonts packaged via [Fontsource](https://fontsource.org/) | Self-hosted font files | MIT (package), OFL (fonts) |

### Demo video

| Item | Use | License |
|---|---|---|
| [/brag](https://github.com/latent-spaces/brag) skill | Planning and storyboard workflow for the video | MIT |
| [Hyperframes](https://hyperframes.heygen.com/) (HeyGen) | Renders HTML compositions to video | Apache 2.0 |
| [GSAP](https://gsap.com/) | Animation timeline in the video | GSAP standard license (free) |
| "Happy Beats / Business Moves Vol. 10" by [ende.app](https://ende.app/en) | Background music | Bundled with /brag. License terms not stated in the repo: [verify with ende.app before public release] |
| [Kenney](https://kenney.nl/) UI and impact sounds | Sound effects | CC0 |
| FFmpeg | Encoding | LGPL/GPL |

### AI tools (disclosure)

We used AI tools as assistants. The team reviewed and edited all of their output.

| Tool | What it helped with |
|---|---|
| Claude (Anthropic) | Idea shortlisting, scoring against the jury criteria, research and source checking, pitch deck, demo video composition, prototype code and this README |
| [Gemini in Antigravity] | [Fill in if used: e.g. extending components] |
| [Other] | [Fill in] |

### Design

Original design. Colours come from the phanek (Manipuri wrap) border: maroon, gold and paper, with a Loktak green. No paid templates or third-party UI kits were used. [Update if any template or component library is added.]

## 5. Data

| Data | Source | Notes |
|---|---|---|
| 15 places, with areas, tags, hours and tips | Public information, checked by the team | Coordinates are approximate |
| 5 festivals | Public information | Dates vary each year. Confirm with Manipur Tourism. |
| Listings (homestays, food, guides, artisans) | **Sample data, invented for the demo** | Every sample is labelled "(sample)" in the app |
| Place status (Open, Advisory, Closed) | **Demo data**, entered from the dashboard | In production this comes from the Tourism Department |

Data lives in `js/data.js`. To add a place or a state, edit that one file.

## 6. Sources for figures used

1. Domestic visits, Manipur, 2022 and 2023: Ministry of Tourism, via [CEIC](https://www.ceicdata.com/en/india/resident-visits-by-states/visitor-arrivals-local-manipur).
2. Foreign visits, Manipur: Ministry of Tourism, via [CEIC](https://www.ceicdata.com/en/india/non-resident-visits-by-states/visitor-arrivals-foreigner-manipur).
3. Internet shutdown hours, Manipur, 2023: SFLC.in *Let the Net Work 2.0*, reported by [The Wire](https://m.thewire.in/article/government/internet-shutdown-manipur-haryana-bihar/amp).
4. Inner Line Permit: [Manipur ILP portal](https://manipurilponline.mn.gov.in/), Government of Manipur.

## 7. Run it locally

No build step and no install.

```bash
# from the project folder
python3 -m http.server 8080
# open http://localhost:8080
```

The service worker (offline mode) needs `http://localhost` or `https://`. It does not run from `file://`.

**Demo flow**

1. Open the site. Pick interests and days. Tap "Open my trip".
2. Open `#/admin` in a second tab (PIN 2026). Change a place's status. The trip page updates instantly.
3. Open `#/stamp/andro` to collect a stamp (this is where the stall QR code points).
4. Turn off the network in developer tools, or switch the phone to airplane mode, and reload the trip page.

## 8. Project structure

One page app with hash routes: `#/` Discover, `#/trip`, `#/passport`, `#/stamp/<id>` (where stall QR codes point), `#/admin` (staff, demo PIN 2026), `#/about`.

```
index.html              App shell (header, footer)
css/style.css           Design system and all styles
js/data.js              Places, events, listings, stamps, contacts, ILP checklist, sources
js/store.js             Status, trip and stamp storage, live sync, rule-based planner
js/app.js               Router and views
js/qrcode.js            QR generator (third-party, MIT)
sw.js                   Service worker for offline mode
manifest.webmanifest    Install to home screen
img/                    Loktak hero photo layers, icon
fonts/                  Self-hosted fonts (OFL)
```

## 9. Limits of the prototype

- Live sync works between tabs in one browser. Cross-device sync needs the Supabase step.
- Listings and status values are demo data.
- The map is a schematic, not a navigation map.
- The staff dashboard uses a client-side demo PIN. Production needs real Tourism Department accounts.

## 10. Roadmap

1. Supabase realtime for status across all devices, with staff login.
2. Meiteilon and Hindi interface.
3. Hill district content and verified partner listings with the Tourism Department.
4. AI suggestions in the planner.
5. Other Northeast states, by swapping the data file.

## 11. Privacy

The prototype stores trip choices, stamps and status only in the visitor's own browser. It sends no personal data to any server and uses no analytics or cookies.

## 12. License

Code: [choose, e.g. MIT] © [Team name], 2026. Third-party libraries, fonts and media keep their own licenses, listed above.
