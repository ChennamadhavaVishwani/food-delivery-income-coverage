import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras.layers import Dense, Dropout, Input

def generate_and_train():
    print("1. Generating synthetic data...")
    np.random.seed(42)
    rows = 5000
    
    # 8 Input Features based on your spec
    data = {
        'flood_risk': np.random.rand(rows),
        'heat_risk': np.random.rand(rows),
        'aqi_risk': np.random.rand(rows),
        'weekly_earnings': np.random.randint(2000, 8000, rows),
        'active_days': np.random.randint(3, 8, rows),
        'forecast_risk': np.random.rand(rows),
        'city_tier': np.random.choice([0.3, 0.6, 1.0], rows),
        'season_index': np.random.choice([0.3, 0.8, 1.0], rows)
    }
    
    df = pd.DataFrame(data)
    
    # Target Variable: Premium (Non-linear calculation for the NN to learn)
    df['premium'] = (
        39 + 
        (df['flood_risk'] * 40) + 
        (df['forecast_risk'] * 20) + 
        (df['city_tier'] * 15) + 
        (df['weekly_earnings'] / 500)
    ).clip(39, 129)

    X = df.drop('premium', axis=1).values
    y = df['premium'].values

    print("2. Building Neural Network...")
    model = keras.Sequential([
        Input(shape=(8,)), # Fixed the Input Warning
        Dense(64, activation='relu'),
        Dropout(0.2),
        Dense(32, activation='relu'),
        Dropout(0.2),
        Dense(16, activation='relu'),
        Dense(1, activation='linear')
    ])

    model.compile(optimizer='adam', loss='mse')

    print("3. Training Model (this takes a few seconds)...")
    model.fit(X, y, epochs=50, batch_size=32, validation_split=0.2, verbose=0)

    # Create models folder and save
    if not os.path.exists('models'):
        os.makedirs('models')
    
    # FIXED: Saved in the modern native Keras format
    model.save('models/premium_nn.keras')
    print("✅ Model trained and saved to models/premium_nn.keras")

if __name__ == "__main__":
    generate_and_train()