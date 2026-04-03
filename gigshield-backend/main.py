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

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- 1. INITIALIZE FIREBASE ---
try:
    cred = credentials.Certificate("serviceAccountKey.json")
    firebase_admin.initialize_app(cred)
    db = firestore.client()
    print("🔥 Firebase connected successfully!")
except Exception as e:
    print(f"⚠️ Firebase Error: {e}. Ensure serviceAccountKey.json is in the folder.")

# --- 2. LOAD NEURAL NETWORK ---
try:
    # FIXED: Now looking for the correct .keras file!
    premium_model = tf.keras.models.load_model('models/premium_nn.keras')
    print("🧠 Neural Network loaded successfully!")
except Exception as e:
    print(f"⚠️ Neural Network Error: {e}")
    premium_model = None

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

@app.post("/premium/calculate")
async def calculate_premium(worker: WorkerProfile):
    if premium_model is None:
        return {"error": "Model not trained yet."}
    
    features = np.array([[
        worker.flood_risk, worker.heat_risk, worker.aqi_risk, 
        worker.weekly_earnings, worker.active_days, worker.forecast_risk, 
        worker.city_tier, worker.season_index
    ]])
    
    premium = premium_model.predict(features)[0][0]
    
    if db:
        policy_data = {
            "worker_id": worker.worker_id,
            "premium": float(premium),
            "status": "quoted",
            "timestamp": datetime.datetime.now()
        }
        db.collection("policies").add(policy_data)

    return {"weekly_premium": round(float(premium), 2)}

def monitor_triggers():
    print(f"[{datetime.datetime.now()}] 🔍 Background Job: Checking APIs for disruptions...")

scheduler = BackgroundScheduler()
scheduler.add_job(monitor_triggers, 'interval', minutes=30)
scheduler.start()

@app.get("/")
def read_root():
    return {"status": "GigShield API Active"}