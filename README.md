# AI-Powered Parametric Income Insurance for Food Delivery Workers

> DEVTrails 2026 | Team: Segmentation Fault | Persona: Food Delivery

---

### CONTENTS

1. Persona Based Scenarios and Workflow of our Application.
2. Working of weekly premium model
3. Integrating AI/ML into the workflow
4. Technological Stack and Development Plan

---

## 1. Problem Statement

India's food delivery ecosystem runs on an estimated 5–7 million gig workers employed by platforms like Zomato and Swiggy. These workers are classified as independent contractors i.e. they have no employment protections, no sick leave, and critically, **no income safety net when external conditions prevent them from working**.

A single afternoon of heavy rain, a high-AQI smog event, or a local curfew can eliminate 100% of a worker's daily earnings which is entirely outside their control. Studies suggest gig workers lose **20–30% of monthly income** to such disruptions annually.

**No existing insurance product in India** is designed for the weekly earning cycle of a gig worker, nor does any product provide automatic, zero-claim payouts tied to real-world disruption data.

Our solution solves this by building a **parametric income insurance platform** — one that monitors external disruption events and automatically initiates payouts to affected workers when a pre-agreed threshold is crossed. No claim form. No paperwork.

---

## 2. Persona & Scenarios

### Primary Persona: Food Delivery Partner

| Attribute | Details |
|---|---|
| Platform | Zomato / Swiggy |
| Device | smartphone |
| Connectivity | mobile data (patchy during deliveries) |
| Weekly earnings | estimated ₹3,000 – ₹7,000 |
| Earning cycle | Weekly platform payout |
| Pain point | No income protection during uncontrollable disruptions |
| Digital literacy | Comfortable with UPI, mobile app-based workflows |

### Scenario A — Heavy Rain/Flood Event

> Person A is a Swiggy delivery partner in Bangalore. On an afternoon rainfall exceeds the threshold. The platform sees a significant drop in order volume and he cannot safely ride. This app detects the rain threshold being crossed in A's zone and automatically creates a claim against his active weekly policy (after anti-spoofing and fraud checks), approves it, and records the calculated compensation against his weekly settlement ledger. At the end of the week, the confirmed payout is credited to his UPI — without Person A doing anything.

### Scenario B — High AQI/Pollution

> Person B delivers for Zomato. A severe smog event pushes AQI to hazardous levels in her zone. The app's event monitor detects the threshold breach, identifies active policies in the zone, runs the anti-spoofing and fraud scoring pipeline, and records approved payout entitlements. B receives a notification: "Your zone is under pollution disruption. Rs. X has been added to your weekly payout — credited this Sunday."


### Scenario C — Local Curfew / Strike

> A sudden order is imposed around a delivery hub. Our app's social disruption flag is triggered and the event is verified in the background. All workers with active policies in that zone receive automatic claims.

### Scenario D — Fraud Attempt

> Worker attempts to claim for a weather event in Zone A but the anti-spoofing engine detects inconsistencies: GPS trace shows he was in Zone B, accelerometer data shows no movement consistent with riding in rain, device battery drain is atypically low for outdoor operation, and his claim velocity is anomalous relative to his zone cohort. The claim is automatically blocked, queued for human adjuster review, and the worker receives a transparent notification explaining the flag.

---

## 3. Application Workflow

### End-to-End Flow

```
Worker onboards (3 steps: OTP → work profile → UPI)
        ↓
Worker selects preferred language
        ↓
Worker activates weekly policy (dynamic premium from ML model)
        ↓
Synthetic disruption engine monitors zone events periodically
        ↓
Threshold crossed → disruption event record created
        ↓
System finds all active policies(who, when, how much, trigger) in affected zone
        ↓
Claim records auto-created (status: validating)
        ↓
Fraud scoring: Isolation Forest scores each claim 0–100
        ↓
  Condition based scenarios:
  - Auto-approve →  Payout ledger entry recorded (status: pending_settlement)
  - Human adjuster queue + Gemini API brief
  - Auto-block + worker notification
        ↓
Worker receives push notification with payout confirmation
        ↓
WEEKLY SETTLEMENT RUN:
  BullMQ batch job aggregates all approved payout ledger entries for the week
  - Razorpay UPI bulk credit to all eligible workers
  - Worker receives final settlement notification with itemised breakdown
        ↓
Admin analytics dashboard updates necessary data
```

### Architecture

| App | Users | Platform |
|---|---|---|
| Worker app | Delivery partners | React Native |


---

## 4. Weekly Premium Model

### Why Weekly?

Food delivery workers receive platform payouts on a weekly cycle, Zomato and Swiggy both settle earnings Monday to Sunday. The coverage architecture mirrors this exactly. Each policy record is scoped to a Monday-to-Sunday window, meaning disruption monitoring, claim eligibility, and payout calculations are all bounded to the same 7-day period. When a new week starts, a new coverage window activates. There is no premium charged to the worker — the weekly cycle exists purely to align the coverage window with the worker's earning rhythm, so that income loss is always measured and compensated against the week it actually occurred in.

### Payout Settlement Model

Approved claim payouts are NOT transferred immediately at the moment of claim approval. Instead, they are recorded as confirmed ledger entries in the worker's payout_ledger table (status: pending_settlement). This design change serves three purposes:

    • Mirrors the worker's existing weekly earning rhythm — one consolidated payout, not micro-credits throughout the week that are confusing to track
    • Reduces payment processing fees by batching Razorpay UPI calls
    • Provides a settlement review window where the anti-spoofing engine can flag late-detected anomalies before money moves

Every Sunday night, a BullMQ batch job aggregates all pending_settlement entries for that policy week, calculates the final net payout per worker, and dispatches a single UPI credit via Razorpay. The worker receives an itemised weekly summary notification in their preferred language.


### How It Works

The weekly premium is calculated dynamically per worker using an **XGBoost regression model** served by a FastAPI microservice. It is not a flat rate — two workers in different zones with different histories will receive different quotes.

**Model inputs (8 features):**

| Feature | Description |
|---|---|
| `zone_flood_risk` | Historical flood/waterlogging score for the worker's zone (0–1) |
| `zone_aqi_avg` | 30-day rolling AQI average for the zone |
| `season` | Current season encoded as integer (0=winter, 1=spring, 2=monsoon, 3=post-monsoon) |
| `worker_tenure_weeks` | How long the worker has been on the platform |
| `worker_claim_count_90d` | Number of claims in the last 90 days |
| `city_avg_disruptions_30d` | City-level disruption frequency in the past month |
| `platform` | Zomato (0) or Swiggy (1) |
| `weekly_earnings_est` | Self-declared weekly earnings at onboarding |

**Model output:** Weekly premium in ₹
**Base Payout formula:** `payout = hours_disrupted × (weekly_earnings_est / 70)`

The divisor 70 represents a standard 10-hour working day × 7 days. The maximum payout per policy week is capped at `weekly_earnings_est × 0.8`.


## 5. Parametric Triggers

Our app uses **synthetic event data** for disruption monitoring. A Node.js cron engine generates and validates disruption events — this replaces live weather APIs for the PoC and enables reliable demo control.

### Trigger Matrix

| # | Trigger Type | Threshold | Income Impact | Source |
|---|---|---|---|---|
| 1 | Heavy rain | > 35mm/hr sustained for 30+ min | Outdoor work halted | Synthetic rain generator |
| 2 | Extreme heat | > 42°C for 2+ hours | Heat safety halt | Synthetic temp generator |
| 3 | High AQI / pollution | AQI index > 300 | Respiratory safety | Synthetic AQI generator |
| 4 | Local curfew / Section 144 | Zone flagged by admin | Zone inaccessible | Manual admin flag |
| 5 | Platform app outage | Swiggy/Zomato mock API returns 503 for 15+ min | Cannot accept orders | Mock platform webhook |

### How Triggers Fire

1. Synthetic engine inserts a row into `disruption_events` with `zone_id`, `event_type`, `intensity_value`, and timestamps.
2. Node.js EventEmitter fires `disruption.new`.
3. Listener queries all active policies in that zone with the relevant trigger type enabled.
4. Claim records are created automatically — one per affected policy.
5. Each claim enters the fraud scoring pipeline before any payout is made.

> **Demo note:** A `POST /api/admin/trigger` endpoint allows manual event injection — enabling a reliable live demo without waiting for the cron timer.

---

## 6. Platform Choice — Mobile App

### Decision: React Native (worker app) + React 18 web (admin portal)

**Worker app → React Native + Expo**

The primary users of Our app are delivery workers on ₹8,000–₹15,000 Android phones with intermittent 4G connectivity. A web app is the wrong choice for this persona because:

- Workers need **push notifications on the lock screen** when a disruption triggers in their zone — not possible on a browser
- **Auto-read OTP from SMS** via Expo reduces friction for a demographic that values speed
- **Offline caching** (MMKV) means the app remains functional during patchy connectivity
- **Background GPS** access for fraud validation requires native device permissions
- The Razorpay React Native SDK provides a **native UPI payment sheet** — not a webview redirect

**Admin portal → React 18 + Vite (web)**

Insurance operations staff work on desktop computers and need data-dense views: fraud evidence drawers, loss ratio charts, zone heatmaps, and adjuster queues. These are desktop-native interaction patterns.

---

## 7. AI/ML Integration

### ML Architecture Overview

All ML models are served from a dedicated **FastAPI microservice** (Python 3.12) running separately from the Node.js API. The Node.js backend calls FastAPI endpoints as internal HTTP requests.

---

### M1 — XGBoost Premium Regression

**Purpose:** Calculate personalised weekly premium per worker.

**How it's built:**
- Training data: synthetic worker-week rows generated by `/synthetic/data_gen/premium_data.py`
- Algorithm: `XGBRegressor` from the `xgboost` library
- Saved as `premium_model.joblib`
- Served at `POST /ml/premium`

---

### M2 — Isolation Forest Fraud Anomaly Scoring

**Purpose:** Score every auto-generated claim for fraud risk before any payout is made.

**Where it appears:** Claim lifecycle - invisible to worker, visible to admin.

**How it's built:**
- Training data: synthetic claim rows — 85% clean, 15% labelled fraudulent
- Algorithm: `IsolationForest` from `scikit-learn`, `contamination=0.15`
- Score normalised to 0–100
- Saved as `fraud_model.joblib`
- Served at `POST /ml/fraud-score`

**Six fraud features scored:**

| Feature | What it detects |
|---|---|
| `gps_delta_km` | GPS spoofing — claimed zone vs actual location |
| `weather_consensus_gap` | Claim for event that didn't occur in the zone |
| `claim_velocity_7d` | Abnormal claim frequency vs zone cohort |
| `account_link_count` | Duplicate accounts sharing KYC device ID or phone |
| `platform_activity_during_event` | Deliveries completed during claimed disruption window |
| `days_since_policy_start` | New accounts claiming immediately after signup |

**Decision rules:**

Score vs Action based decision

---

### M3 — LSTM Disruption Forecaster

**Purpose:** Predict disruption probability for the next 6 hours per zone. Displayed as a risk meter on the worker dashboard.

**How it's built:**
- Input: rolling 48-hour synthetic event history per zone (hourly time steps)
- Architecture: `LSTM(64) → Dense(32) → Dense(1, sigmoid)` using Keras/TensorFlow
- Served at `GET /ml/forecast/:zone_id`
- Result cached in Redis for 30 minutes

---

### M4 — Google gemini API Adjuster Brief

**Purpose:** For borderline claims (fraud score 40–70), generate a structured 3-sentence recommendation for human adjusters to act on.

**How it's built:**
- Not a trained model — a prompt call to `gemini` API
- Input: structured JSON of claim details, fraud score, feature breakdown
- Output stored in `claims.adjuster_brief` and displayed in the admin fraud console
- Called only when fraud score is in the review band

---

## 8. Tech Stack

### Worker App (React Native + Expo)

| Category | Technology | Purpose |
|---|---|---|
| Framework | React Native + Expo SDK | Cross-platform Android/iOS from one codebase |
| Navigation | Expo Router | File-based routing, deep linking for push notifications |
| Styling | NativeWind | Tailwind utility classes on native components |
| Animation | React Native Reanimated | 60fps claim status transitions |
| State | Zustand | Auth token, worker profile |
| Server state | TanStack Query (React Query) | API caching, background refetch |
| Local storage | MMKV | 10x faster than AsyncStorage for offline caching |
| Offline DB | Expo SQLite | Draft claims when connectivity drops |
| Push alerts | Expo Notifications | Lock-screen disruption alerts |
| GPS | Expo Location | Background zone tracking for fraud validation |
| Auth | Firebase Auth / Expo SMS | Auto-read OTP from SMS |
| Payments | Razorpay React Native SDK | Native UPI payout sheet |
| Charts | Recharts/Victory Native XL/powerBI/seaborn | Earnings protection graph |
| Maps | react-native-maps/leaflet | Zone disruption overlay |
| Language Support | i18next + react-i18next + expo-localization | Multi-language support |


### Admin Portal (React 18 + Vite)

| Category | Technology | Purpose |
|---|---|---|
| Framework | React 18 + Vite | Fast builds, optimised bundle |
| Routing | React Router | Role-based route guards |
| Styling | Tailwind CSS + shadcn/ui | Data-dense admin tables and drawers |
| Animation | Framer Motion | Fraud alert transitions |
| State | Zustand + TanStack Query | UI state + server data |
| Charts | Recharts/Victory Native XL/powerBI/seaborn/ | Loss ratio, claims trend |
| Maps | Mapbox GL JS | Zone risk heatmap |
| Graph | D3.js | Account linkage fraud graph |

### Backend API (Node.js + FastAPI)

| Category | Technology | Purpose |
|---|---|---|
| API server | Node.js + Express | All business logic, auth, payout orchestration |
| ML service | FastAPI (Python 3) + Uvicorn | Premium calculation, fraud scoring, forecasting |
| Real-time | Socket.IO | Push disruption alerts and claim updates to worker app |
| Job queue | BullMQ + Redis | Payout dispatch with retries |
| Auth | JWT (access + refresh) | Stateless auth on all protected routes |
| OTP | Firebase Auth / Twilio mock | SMS OTP delivery |
| Security | Helmet.js + express-rate-limit | API hardening |

### Data Layer

| Technology | Role |
|---|---|
| PostgreSQL | All transactional data: workers, policies, claims, payouts |
| Redis | BullMQ job queue + ML forecast cache|

### AI / ML

| Technology | Role |
|---|---|
| XGBoost | Weekly premium regression model |
| scikit-learn | Isolation Forest fraud anomaly scoring |
| TensorFlow / Keras | LSTM disruption forecasting |
| Google Gemini API | Adjuster brief generation (gemini) |

### External Integrations

| Integration | Type | Purpose |
|---|---|---|
| Synthetic event engine | Internal Node.js cron | Generates disruption events for demo |
| Swiggy/Zomato mock webhook | Simulated | Worker platform activity validation |
| Razorpay test mode | Sandbox | Mock UPI payouts with real transaction IDs |

---

## 9. Development Plan

### Ideation & Foundation

**Milestone 1**
- Finalise persona and parametric trigger matrix
- Draft complete PostgreSQL schema


**Milestone 2**
- `docker-compose` with PostgreSQL + Redis running
- Run all DB migrations, seed zones table
- Node.js Express boilerplate with JWT auth
- FastAPI health endpoint running


---

### Worker Protection

**Milestone 1**
- XGBoost: generate synthetic training data → train → FastAPI `/ml/premium` live
- Node.js: auth routes + `/api/workers/onboard` + `/api/zones`
- React Native: onboarding screen + worker dashboard screen
- Socket.IO: room setup per `worker_id`, disruption alert broadcast
- Synthetic event engine: cron + `POST /api/admin/trigger`

**Milestone 2**
- Policy management screen + `/api/policies/quote` + `/api/policies`
- Complete claim lifecycle: event → find policies → create claims → fraud score → BullMQ → Razorpay mock
- Claims center screen: status timeline + evidence drawer
- Full end-to-end test: onboard → buy policy → trigger rain → claim → payout


---

### Scale & Optimise

**Milestone 1**
- Isolation Forest: generate fraud-labelled training data → train → FastAPI `/ml/fraud-score` live
- All 5 fraud checks implemented in claim service
- Gemini API adjuster brief on borderline claims
- Admin fraud console screen (React web)
- Payout engine screen + BullMQ transaction log

**Milestone 2**
- Analytics dashboard: loss ratio charts, zone heatmap, predictive forecast
- LSTM disruption forecaster (or XGBoost stub)
- Demo rehearsal × 2: fire rain event → claim → fraud score → payout (under 5 min)
- Final pitch deck


---

## 10. Constraints & Scope

### Non-Negotiable Constraints

| Constraint | Rule |
|---|---|
| Coverage scope | **Income loss only.** No vehicle repair, health, accident, or life coverage. |
| Pricing model | **Weekly only.** Premiums, coverage windows, and payouts are on a 7-day cycle. |
| Persona | **Food delivery** |
| Language | App UI and notifications rendered in worker's selected language |

### PoC Scope

- All weather and disruption data is **synthetic** — real weather API integration is a post-hackathon extension.
- Swiggy/Zomato platform API is **mocked** — a simulated webhook returns delivery activity data.
- Payouts are processed via **Razorpay test mode** — no real money moves.
- ML models are trained on **synthetic data** — production would require real historical claim datasets.

### Future Extensibility

- Live weather APIs (OpenWeatherMap, IMD MAUSAM, Tomorrow.io) can replace the synthetic engine with a configuration flag
- Platform API integration via real Swiggy/Zomato partner webhooks
- BGC parameter tracking, glider, and buoy data integration for coastal delivery zones


## 11. Adversarial Defense & Anti-Spoofing Strategy

GPS coordinates alone are insufficient — a spoofed device looks identical to a genuine one at the coordinate level. Our defense uses sensor fusion: five signals are cross-checked per claim. A real stranded rider produces a correlated physical signature (GPS micro-jitter, two-wheeler vibration on accelerometer, mobile data on a field cell tower, elevated battery drain, no active orders). A spoofer at home produces flat accelerometer readings, WiFi connectivity, a home cell tower ID, and low battery drain — all contradicting the claimed GPS zone.

### The Differentiation
| Signal            | Genuine Worker                                      | GPS Spoofer                                      |
|------------------|-----------------------------------------------------|--------------------------------------------------|
| GPS trace        | Zone-consistent with natural micro-jitter           | Static, smooth, or teleportation artifacts       |
| Accelerometer    | Vibration consistent with riding a two-wheeler      | Near-zero / desk-level movement                  |
| Cell tower       | Tower ID matches claimed zone                       | Home tower contradicts GPS zone                  |
| Battery drain    | Elevated — outdoor GPS + rain signal loss           | Low — device likely plugged in at home           |
| Platform activity| No order acceptances (genuine disruption)           | Active orders or scripted sudden stop            |

- These signals feed a new POST /ml/antispoofing endpoint (spoofing_confidence 0-100) and four new features in the Isolation Forest (M2): cell_tower_match, accelerometer_anomaly_score, battery_drain_deviation, network_type_mismatch. For coordinated rings: 10+ claims in the same zone within a 2-minute window with anomalous sensor profiles triggers a ring_fraud flag, escalating the entire batch to adjuster review as a grouped entity.

### The UX Balance
A claim is blocked only when BOTH spoofing_confidence AND fraud_score exceed thresholds — a single anomalous signal is never sufficient. GPS gaps up to 8 minutes and cell tower ambiguity in pre-mapped poor-coverage areas are ignored. Flagged workers receive a translated notification with a clear reason and ETA (never a generic rejection), adjuster review is capped at 4 hours (auto-escalates, never auto-denies), and only the disputed claim is held — all other approved claims proceed to Sunday settlement normally.
