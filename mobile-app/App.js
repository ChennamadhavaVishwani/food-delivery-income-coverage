import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, SafeAreaView, StatusBar, ActivityIndicator, Alert } from 'react-native';
import * as Location from 'expo-location';
import axios from 'axios';

export default function App() {
  const [policyActive, setPolicyActive] = useState(false);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Checking GPS...');

  // New States for Phase 3
  const [claimData, setClaimData] = useState(null);
  const [simulating, setSimulating] = useState(false);

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

  const getAIPremiumQuote = async () => {
    setLoading(true);
    try {
      const workerProfile = {
        worker_id: "WKR-9982", flood_risk: 0.8, heat_risk: 0.2, aqi_risk: 0.5,
        weekly_earnings: 4500, active_days: 6, forecast_risk: 0.7, city_tier: 1.0, season_index: 1.0
      };
      const response = await axios.post('http://127.0.0.1:8000/premium/calculate', workerProfile);
      setPremium(response.data.weekly_premium);
      setPolicyActive(true);
    } catch (err) {
      Alert.alert("API Error", "Could not connect to Python backend.");
    }
    setLoading(false);
  };

  // Phase 3: Simulate the Weather Disruption
  const triggerWeatherEvent = async () => {
    setSimulating(true);
    try {
      const response = await axios.post('http://127.0.0.1:8000/simulate-disruption');
      setClaimData(response.data);
    } catch (err) {
      Alert.alert("Error", "Failed to trigger event.");
    }
    setSimulating(false);
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
            {loading ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>Generate AI Quote</Text>}
          </TouchableOpacity>
        </View>
      ) : !claimData ? (
        <View style={[styles.actionCard, { borderColor: '#2e7d32', borderWidth: 2 }]}>
          <Text style={styles.successText}>● AI Policy Active (₹{premium}/wk)</Text>
          <Text style={{ fontSize: 14, color: '#666', marginTop: 10, textAlign: 'center', marginBottom: 20 }}>
            Monitoring weather and AQI...
          </Text>
          <TouchableOpacity style={styles.dangerBtn} onPress={triggerWeatherEvent} disabled={simulating}>
            {simulating ? <ActivityIndicator color="#FFF" /> : <Text style={styles.btnText}>🌧️ Simulate Heavy Rain</Text>}
          </TouchableOpacity>
        </View>
      ) : (
        <View style={[styles.actionCard, { backgroundColor: '#e8f5e9', borderColor: '#4caf50', borderWidth: 2 }]}>
          <Text style={[styles.successText, { fontSize: 22 }]}>💸 Payout Processed!</Text>
          <Text style={styles.payoutAmount}>+ ₹{claimData.payout_amount}</Text>

          <View style={{ marginTop: 15, width: '100%', backgroundColor: '#fff', padding: 15, borderRadius: 10 }}>
            <Text style={{ fontWeight: 'bold', color: '#333' }}>Event: {claimData.event_detected}</Text>
            <Text style={{ color: '#666', marginTop: 5 }}>AI Fraud Score: <Text style={{ fontWeight: 'bold' }}>{claimData.ai_evaluation.fraud_score}</Text></Text>
            <Text style={{ color: claimData.ai_evaluation.status === 'APPROVED' ? 'green' : 'red', marginTop: 5, fontWeight: 'bold' }}>
              Status: {claimData.ai_evaluation.status}
            </Text>
          </View>
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
  riskCard: { backgroundColor: '#FFF', padding: 20, borderRadius: 16, elevation: 4, marginBottom: 20 },
  label: { color: '#666', marginBottom: 15, fontSize: 14, fontWeight: '500' },
  row: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center' },
  statValue: { fontSize: 20, fontWeight: 'bold', textAlign: 'center', color: '#1A1A1A' },
  statLabel: { fontSize: 13, color: '#888', textAlign: 'center', marginTop: 4 },
  divider: { width: 1, height: 40, backgroundColor: '#EEE' },
  actionCard: { backgroundColor: '#FFF', padding: 25, borderRadius: 16, alignItems: 'center' },
  infoText: { marginBottom: 20, color: '#444', fontSize: 16, textAlign: 'center' },
  primaryBtn: { backgroundColor: '#0062FF', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  dangerBtn: { backgroundColor: '#d32f2f', paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  btnText: { color: '#FFF', fontWeight: 'bold', fontSize: 16 },
  successText: { color: '#2e7d32', fontWeight: 'bold', fontSize: 18 },
  payoutAmount: { fontSize: 32, fontWeight: '900', marginTop: 10, color: '#2e7d32' }
});

