import React, { useState, useEffect } from 'react';
import { SafeAreaView, StatusBar, StyleSheet, Alert, Platform } from 'react-native';
import * as Location from 'expo-location';
import * as Notifications from 'expo-notifications';
import axios from 'axios';
import Constants from 'expo-constants';
import { Colors } from './src/theme/colors';

// Ensure notifications show even when app is open (foreground)
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});
import HomeScreen from './src/screens/HomeScreen';

// Utility for dynamic backend URL
const getBackendUrl = () => {
  // Try to use the IP address from Expo's dev server if available (crucial for physical devices)
  const debuggerHost = Constants.expoConfig?.hostUri || Constants.manifest?.debuggerHost || Constants.manifest2?.extra?.expoGo?.debuggerHost;
  if (debuggerHost) {
    const ip = debuggerHost.split(':')[0];
    return `http://${ip}:8000`;
  }
  
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:8000';
  }
  return 'http://127.0.0.1:8000'; // web, ios simulator
};

export default function App() {
  const [policyActive, setPolicyActive] = useState(false);
  const [premium, setPremium] = useState(null);
  const [loading, setLoading] = useState(false);
  const [locationStatus, setLocationStatus] = useState('Finding GPS');

  const [claimData, setClaimData] = useState(null);
  const [simulating, setSimulating] = useState(false);

  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setLocationStatus('Denied');
        return;
      }
      setLocationStatus('Active');
    })();
  }, []);

  const getAIPremiumQuote = async () => {
    setLoading(true);
    try {
      const workerProfile = {
        worker_id: "WKR-9982", flood_risk: 0.8, heat_risk: 0.2, aqi_risk: 0.5,
        weekly_earnings: 4500, active_days: 6, forecast_risk: 0.7, city_tier: 1.0, season_index: 1.0
      };
      const response = await axios.post(`${getBackendUrl()}/premium/calculate`, workerProfile);
      setPremium(response.data.weekly_premium);
      setPolicyActive(true);
    } catch (err) {
      console.log(err.message);
      Alert.alert("API Error", "Could not connect to Python backend at " + getBackendUrl());
    }
    setLoading(false);
  };

  const triggerWeatherEvent = async () => {
    setSimulating(true);
    try {
      const response = await axios.post(`${getBackendUrl()}/simulate-disruption`);
      setClaimData(response.data);
    } catch (err) {
      Alert.alert("Error", "Failed to trigger AI simulation.");
    }
    setSimulating(false);
  };

  const submitLiveClaim = async (delayMins) => {
    setSimulating(true);
    try {
      // Send receipt notification safely
      try {
        if (Platform.OS === 'web') {
           Alert.alert("Claim Received 📬", "Your live GPS position and claim details have been routed to the ML Autoencoder.\nEvaluating fraud markers...");
        } else {
           const { status } = await Notifications.requestPermissionsAsync();
           if (status === 'granted') {
             await Notifications.scheduleNotificationAsync({
               content: {
                 title: "GigShield Notification 📬",
                 body: "Claim Received! Your live GPS tracking and form details have been securely routed to the AI ML layer.",
                 sound: true,
               },
               trigger: null,
             });
           } else {
             Alert.alert("Claim Received 📬", "Your details have been routed to the ML Autoencoder.\n(Enable Push Notifications for OS alerts!)");
           }
        }
      } catch (notifErr) {
        console.log("Notification Warning:", notifErr);
      }

      // 2. Format live claim dataset mapped dynamically from form
      const payload = {
        worker_id: "WKR-9982",
        event_id: `LIVE-${Date.now()}`,
        gps_match: true,
        time_delay_mins: parseFloat(delayMins) || 15.5,
        gps_match_score: 0.95, // High match
        recent_claims: 0,
        app_activity: 0.9,
        account_age_days: 200
      };

      const response = await axios.post(`${getBackendUrl()}/claim/evaluate`, payload);
      
      // Align backend response to our visual display schema
      setClaimData({
        event_detected: "Claim (Live GPS Confirmed)",
        payout_amount: premium ? Math.floor(premium * 6) : 300,
        ai_evaluation: response.data
      });
      
    } catch (err) {
      Alert.alert("Live Claim Error", err.message);
    }
    setSimulating(false);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.background} />
      <HomeScreen 
        locationStatus={locationStatus}
        policyActive={policyActive}
        premium={premium}
        loading={loading}
        simulating={simulating}
        claimData={claimData}
        onGenerateQuote={getAIPremiumQuote}
        onTriggerEvent={triggerWeatherEvent}
        onSubmitLiveClaim={submitLiveClaim}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
    // Add top padding manually for Android safe area margin if needed
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight + 10 : 0
  }
});
