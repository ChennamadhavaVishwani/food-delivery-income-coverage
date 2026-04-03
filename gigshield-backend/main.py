
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import firebase_admin
from firebase_admin import credentials, firestore
import tensorflow as tf
import numpy as np
from apscheduler.schedulers.background import BackgroundScheduler
import datetime

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
    flood_risk: float = 0.5
    heat_risk: float = 0.3
    aqi_risk: float = 0.6
    weekly_earnings: int = 5000
    active_days: int = 6
    forecast_risk: float = 0.4
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
    features = np.array([[
        worker.flood_risk, worker.heat_risk, worker.aqi_risk, 
        worker.weekly_earnings, worker.active_days, worker.forecast_risk, 
        worker.city_tier, worker.season_index
    ]])
    premium = premium_model.predict(features, verbose=0)[0][0]
    return {"weekly_premium": round(float(premium), 2)}

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

def monitor_triggers():
    print(f"[{datetime.datetime.now()}] 🔍 Background Job Running...")

scheduler = BackgroundScheduler()
scheduler.add_job(monitor_triggers, 'interval', minutes=30)
scheduler.start()

@app.get("/")
def read_root():
    return {"status": "GigShield API Active"}