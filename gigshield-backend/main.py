# modified version from initial commit

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
    gps_match: bool  # Rule-based hard check
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
    # STEP 1: Rule-Based Hard Checks (Fast Rejection)
    if not claim.gps_match:
        status = "REJECTED"
        reason = "GPS mismatch. Worker not in disruption zone."
        fraud_score = 1.0
    elif claim.recent_claims > 5:
        status = "REJECTED"
        reason = "Too many claims in the last 30 days."
        fraud_score = 1.0
    else:
        # STEP 2: Autoencoder Anomaly Detection
        # Normalize inputs for the network
        features = np.array([[
            claim.time_delay_mins / 120,
            claim.gps_match_score,
            claim.recent_claims / 10,
            claim.app_activity,
            claim.account_age_days / 365
        ]])
        
        # Predict (Reconstruct) and calculate Mean Squared Error
        reconstruction = fraud_autoencoder.predict(features, verbose=0)
        mse = np.mean(np.power(features - reconstruction, 2))
        
        # Scale the error into a risk score (0 to 1)
        fraud_score = min(mse * 10, 1.0) 

        # Decision Thresholds
        if fraud_score > 0.6:
            status = "FLAGGED"
            reason = "High anomaly score. Manual review required."
        else:
            status = "APPROVED"
            reason = "Passed AI validation."

    # Save claim outcome to Firebase
    if db:
        claim_data = {
            "worker_id": claim.worker_id,
            "event_id": claim.event_id,
            "status": status,
            "reason": reason,
            "fraud_score": float(fraud_score),
            "timestamp": datetime.datetime.now()
        }
        db.collection("claims").add(claim_data)

    return {
        "status": status, 
        "fraud_score": round(fraud_score, 3), 
        "reason": reason
    }

def monitor_triggers():
    print(f"[{datetime.datetime.now()}] 🔍 Background Job Running...")

scheduler = BackgroundScheduler()
scheduler.add_job(monitor_triggers, 'interval', minutes=30)
scheduler.start()

@app.get("/")
def read_root():
    return {"status": "GigShield API Active"}