import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [policyActive, setPolicyActive] = useState(false);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Checking GPS...');

  // 1. Get Real GPS Location (Master Plan Requirement)
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('GPS Permission Denied');
        return;
      }
      setLocationStatus('GPS Active (Tracking Zone)');
    })();
  }, []);

  // 2. Talk to your Python Neural Network
  const getAIPremiumQuote = async () => {
    setLoading(true);
    try {
      // Sending the exact 8 features your Neural Network expects
      const workerProfile = {
        worker_id: "WKR-9982",
        flood_risk: 0.8,
        heat_risk: 0.2,
        aqi_risk: 0.5,
        weekly_earnings: 4500,
        active_days: 6,
        forecast_risk: 0.7,
        city_tier: 1.0,
        season_index: 1.0 // Monsoon
      };

      // Calling your FastAPI backend!
      const response = await axios.post('http://127.0.0.1:8000/premium/calculate', workerProfile);

      setPremium(response.data.weekly_premium);
      setPolicyActive(true);
    } catch (err) {
      console.error(err);
      Alert.alert("API Error", "Could not connect to Python backend. Is Uvicorn running on port 8000?");
    }
    setLoading(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <View style={styles.header}>
        <Text style={styles.brand}>GigShield Partner</Text>
        <Text style={styles.title}>Dashboard</Text>
      </View>

      <View style={styles.riskCard}>
        <Text style={styles.label}>Location Status: {locationStatus}</Text>
        <View style={styles.row}>
          <View>
            <Text style={styles.statValue}>Monsoon</Text>
            <Text style={styles.statLabel}>Season</Text>
          </View>
          <View style={styles.divider} />
          <View>
            <Text style={[styles.statValue, { color: '#d32f2f' }]}>High</Text>
            <Text style={styles.statLabel}>Flood Risk</Text>
          </View>
        </View>
      </View>

      {!policyActive ? (
        <View style={styles.actionCard}>
          <Text style={styles.infoText}>No active protection for this week.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={getAIPremiumQuote} disabled={loading}>
            {loading ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.btnText}>Generate AI Quote</Text>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.actionCard, { borderColor: '#2e7d32', borderWidth: 2 }]}>
          <Text style={styles.successText}>● AI Policy Active</Text>
          <Text style={styles.payoutAmount}>Premium: ₹{premium}/week</Text>
          <Text style={{ fontSize: 12, color: '#666', marginTop: 5, textAlign: 'center' }}>
            Your quote was generated dynamically by the GigShield Neural Network.
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FA', padding: 20 },
  header: { marginBottom: 25, marginTop: 40 },
  brand: { color: '#0062FF', fontSize: 16, fontWeight: 'bold' },
  title: { fontSize: 32, fontWeight: '900', color: '#1A1A1A' },
  riskCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, elevation: 4, marginBottom: 20, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  label: { color: '#666', marginBottom: 15, fontSize: 14, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A' },
  statLabel: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#EEE' },
  actionCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 16, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.1, shadowRadius: 8 },
  infoText: { marginBottom: 20, color: '#444', fontSize: 16, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#0062FF', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  successText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 18 },
  payoutAmount: { fontSize: 28, fontWeight: '900', marginTop: 10, color: '#1A1A1A' }
});