
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import tensorflow as tf
import numpy as np
from apscheduler.schedulers.background import BackgroundScheduler
import datetime
import os
import requests
import razorpay
from dotenv import load_dotenv

load_dotenv()
WEATHER_API_KEY = os.getenv("OPENWEATHERMAP_API_KEY")
RZP_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
RZP_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")

rzp_client = None
if RZP_KEY_ID and RZP_KEY_SECRET and RZP_KEY_ID != "test_key_here":
    try:
        rzp_client = razorpay.Client(auth=(RZP_KEY_ID, RZP_KEY_SECRET))
    except Exception as e:
        print("Razorpay Init Error:", e)

def process_sandbox_payout(payout_amount, worker_bank_account="fa_test_bank_account"):
    print(f"🔄 Interfacing with RazorpayX Sandbox for ₹{payout_amount}...")
    import time
    time.sleep(1.5) # Simulate slight network delay
    
    mock_payout_id = f"pout_{int(time.time())}"
    print(f"💰 Razorpay Payout SUCCESS! ID: {mock_payout_id} -> Transferred to {worker_bank_account}")
    
    return {
        "id": mock_payout_id,
        "amount": int(payout_amount * 100),
        "status": "processed"
    }

# Our target zones (mock city coordinates)
ZONES = [
    {"id": "Z-CHENNAI-01", "lat": 13.0827, "lon": 80.2707, "city": "Chennai", "threshold_mm": 10},
    {"id": "Z-BANGALORE-01", "lat": 12.9716, "lon": 77.5946, "city": "Bangalore", "threshold_mm": 10}
]

app = FastAPI()

app.add_middleware(
    CORSMiddleware, allow_origins=["*"], allow_methods=["*"], allow_headers=["*"],
)

# --- 1. INITIALIZE FIREBASE ---
db = None
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase connected successfully!")
except Exception as e:
    print(f"⚠️ Firebase Error: {e}")

# --- 2. LOAD BOTH NEURAL NETWORKS ---
try:
    premium_model = tf.keras.models.load_model('models/premium_nn.keras')
    fraud_autoencoder = tf.keras.models.load_model('models/fraud_autoencoder.keras')
    print("🧠 Premium & Fraud AI Models loaded successfully!")
except Exception as e:
    print(f"⚠️ Neural Network Error: {e}")
    premium_model, fraud_autoencoder = None, None

# --- MODELS (Data Structures) ---
class WorkerProfile(BaseModel):
    worker_id: str
    zone_id: str = "Z-CHENNAI-01"
    flood_risk: float = 0.5
    heat_risk: float = 0.3
    aqi_risk: float = 0.6
    weekly_earnings: int = 5000
    active_days: int = 6
    city_tier: float = 1.0
    season_index: float = 0.8

class ClaimSubmission(BaseModel):
    worker_id: str
    event_id: str
    gps_match: bool
    time_delay_mins: float
    gps_match_score: float
    recent_claims: int
    app_activity: float
    account_age_days: int

# --- 3. ENDPOINTS ---

@app.post("/premium/calculate")
async def calculate_premium(worker: WorkerProfile):
    # 1. Fetch live 5-day forecast for the zone
    forecast_risk = 0.4 # Default fallback
    zone = next((z for z in ZONES if z["id"] == worker.zone_id), ZONES[0])
    
    if WEATHER_API_KEY and WEATHER_API_KEY != "your_openweather_key_here":
        try:
            url = f"https://api.openweathermap.org/data/2.5/forecast?lat={zone['lat']}&lon={zone['lon']}&appid={WEATHER_API_KEY}"
            res = requests.get(url).json()
            # Calculate what % of the next 40 intervals (5 days) have rain
            rain_count = sum(1 for item in res.get("list", []) if "rain" in item)
            forecast_risk = min(rain_count / 10.0, 1.0) # Scale it down to 0.0 - 1.0 for the ML model
        except Exception as e:
            print("Forecast API Error:", e)

    # 2. Feed it into the Keras Model!
    features = np.array([[
        worker.flood_risk, worker.heat_risk, worker.aqi_risk, 
        worker.weekly_earnings, worker.active_days, forecast_risk, 
        worker.city_tier, worker.season_index
    ]])
    premium = premium_model.predict(features, verbose=0)[0][0]
    return {"weekly_premium": round(float(premium), 2), "forecast_risk_used": forecast_risk}

@app.post("/claim/evaluate")
async def evaluate_claim(claim: ClaimSubmission):
    if not claim.gps_match:
        status, reason, fraud_score = "REJECTED", "GPS mismatch.", 1.0
    elif claim.recent_claims > 5:
        status, reason, fraud_score = "REJECTED", "Excessive recent claims.", 1.0
    else:
        features = np.array([[
            claim.time_delay_mins / 120, claim.gps_match_score,
            claim.recent_claims / 10, claim.app_activity, claim.account_age_days / 365
        ]])
        reconstruction = fraud_autoencoder.predict(features, verbose=0)
        mse = np.mean(np.power(features - reconstruction, 2))
        fraud_score = min(mse * 10, 1.0) 

        if fraud_score > 0.6:
            status, reason = "FLAGGED", "Anomaly detected. Manual review."
        else:
            status, reason = "APPROVED", "Passed AI validation."
            process_sandbox_payout(450)

    if db:
        db.collection("claims").add({
            "worker_id": claim.worker_id, "event_id": claim.event_id,
            "status": status, "reason": reason, "fraud_score": float(fraud_score),
            "timestamp": datetime.datetime.now()
        })
    return {"status": status, "fraud_score": round(fraud_score, 3), "reason": reason}

# --- NEW: DEMO TRIGGER ---
@app.post("/simulate-disruption")
async def simulate_disruption():
    # 1. Simulate a weather API triggering a rainstorm
    event_id = f"RAIN-{int(datetime.datetime.now().timestamp())}"

    # 2. Automatically generate a claim for our test worker
    # We make the stats look "normal" so it passes the Autoencoder
    test_claim = ClaimSubmission(
        worker_id="WKR-9982",
        event_id=event_id,
        gps_match=True,
        time_delay_mins=10.0,
        gps_match_score=0.98,
        recent_claims=0,
        app_activity=0.9,
        account_age_days=200
    )

    # 3. Run it through the Fraud AI
    ai_result = await evaluate_claim(test_claim)

    return {
        "event_detected": "Severe Monsoon Rain",
        "payout_amount": 450, 
        "ai_evaluation": ai_result
    }

def _auto_trigger_claims_sync(zone_id: str, event_type: str):
    print(f"⚙️ Auto-triggering claims for active policies in {zone_id}...")
    event_id = f"{event_type}-{int(datetime.datetime.now().timestamp())}"
    
    if db:
        db.collection("claims").add({
            "worker_id": "WKR-9982",
            "event_id": event_id,
            "status": "APPROVED",
            "reason": f"Parametric Trigger ({event_type})",
            "fraud_score": 0.0,
            "timestamp": datetime.datetime.now(),
            "payout_amount": 450
        })
        print(f"✅ Auto-Claim successful for WKR-9982! Initiating Razorpay Payout...")
        process_sandbox_payout(450)

def monitor_triggers():
    print(f"[{datetime.datetime.now()}] 🔍 Running Weather Trigger Automation...")
    if not WEATHER_API_KEY or WEATHER_API_KEY == "your_openweather_key_here":
        print("⚠️ No WEATHER_API_KEY set. Skipping execution.")
        return

    for zone in ZONES:
        try:
            url = f"https://api.openweathermap.org/data/2.5/weather?lat={zone['lat']}&lon={zone['lon']}&appid={WEATHER_API_KEY}&units=metric"
            response = requests.get(url)
            data = response.json()

            # Check for Rain in the last 1 hour
            rain_1h = 0
            if "rain" in data and "1h" in data["rain"]:
                rain_1h = data["rain"]["1h"]

            temp = data.get("main", {}).get("temp", 0)
            print(f"📍 {zone['city']} ({zone['id']}) - Temp: {temp}°C | Rain (1h): {rain_1h}mm")

            # Check if thresholds are broken
            if rain_1h > zone["threshold_mm"]:
                print(f"🚨 ALERT! Heavy rain detected in {zone['city']} ({rain_1h}mm). Auto-initiating claims pipeline...")
                _auto_trigger_claims_sync(zone["id"], "HEAVY_RAIN")
            elif temp > 43:
                 print(f"🚨 ALERT! Extreme heat detected in {zone['city']} ({temp}°C). Auto-initiating claims pipeline...")
                 _auto_trigger_claims_sync(zone["id"], "EXTREME_HEAT")
                 
        except Exception as e:
            print(f"⚠️ Error fetching weather for {zone['city']}: {e}")

scheduler = BackgroundScheduler()
scheduler.add_job(monitor_triggers, 'interval', minutes=30)
scheduler.start()

@app.get("/")
def read_root():
    return {"status": "GigShield API Active"}