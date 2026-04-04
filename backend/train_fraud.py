import os
import pandas as pd
import numpy as np
import tensorflow as tf
from tensorflow import keras
from keras.layers import Dense, Input
from keras.models import Model

def train_autoencoder():
    print("1. Generating normal 'Legitimate Claim' data...")
    np.random.seed(42)
    rows = 5000
    
    # 5 features that define a claim (normalized 0 to 1 for the neural net)
    data = {
        'time_delay_mins': np.random.uniform(5, 60, rows) / 120, # Filed within an hour
        'gps_match_score': np.random.uniform(0.8, 1.0, rows),    # High GPS match
        'recent_claims': np.random.randint(0, 2, rows) / 10,     # Very few recent claims
        'app_activity': np.random.uniform(0.5, 1.0, rows),       # Active before claim
        'account_age_days': np.random.uniform(30, 365, rows) / 365 # Established accounts
    }
    
    df = pd.DataFrame(data)
    X = df.values

    print("2. Building Autoencoder Architecture...")
    # Input Layer (5 features)
    input_layer = Input(shape=(5,))
    
    # Encoder (Compresses the data)
    encoded = Dense(3, activation='relu')(input_layer)
    encoded = Dense(2, activation='relu')(encoded) # Bottleneck
    
    # Decoder (Reconstructs the data)
    decoded = Dense(3, activation='relu')(encoded)
    decoded = Dense(5, activation='sigmoid')(decoded) # Output matches input size
    
    autoencoder = Model(input_layer, decoded)
    autoencoder.compile(optimizer='adam', loss='mse')

    print("3. Training Autoencoder to recognize 'Normal' patterns...")
    autoencoder.fit(X, X, epochs=30, batch_size=32, validation_split=0.2, verbose=0)

    if not os.path.exists('models'):
        os.makedirs('models')
    
    autoencoder.save('models/fraud_autoencoder.keras')
    print("✅ Fraud Autoencoder trained and saved to models/fraud_autoencoder.keras")

if __name__ == "__main__":
    train_autoencoder()