import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

import HeroCard from '../components/HeroCard';
import LiveRiskMeter from '../components/LiveRiskMeter';
import ImpactCard from '../components/ImpactCard';
import ClaimStatusCard from '../components/ClaimStatusCard';
import SupportModal from '../components/SupportModal';
import EarningsModal from '../components/EarningsModal';
import PredictionModal from '../components/PredictionModal';
import PolicyModal from '../components/PolicyModal';
import FileClaimModal from '../components/FileClaimModal';
import NotificationsModal from '../components/NotificationsModal';

export default function HomeScreen({
  locationStatus,
  policyActive,
  premium,
  loading,
  simulating,
  claimData,
  onGenerateQuote,
  onTriggerEvent,
  onSubmitLiveClaim
}) {
  const [supportVisible, setSupportVisible] = useState(false);
  const [earningsVisible, setEarningsVisible] = useState(false);
  const [predictionVisible, setPredictionVisible] = useState(false);
  const [policyVisible, setPolicyVisible] = useState(false);
  const [fileClaimVisible, setFileClaimVisible] = useState(false);
  const [inboxVisible, setInboxVisible] = useState(false);

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 40 }}>
      {/* Top Section */}
      <View style={styles.header}>
        <View>
          <Text style={styles.greeting}>Hi User</Text>
          <View style={styles.zoneRow}>
            <Ionicons name="location-sharp" size={12} color={Colors.textSecondary} />
            <Text style={styles.zoneText}>Hyderabad – Zone 4 ({locationStatus})</Text>
          </View>
        </View>
        <View style={styles.rightIcons}>
          <View style={styles.riskBadge}>
            <Text style={styles.riskBadgeText}>Rain Risk: HIGH</Text>
          </View>
          <TouchableOpacity onPress={() => setInboxVisible(true)} style={{ marginLeft: 15 }}>
            <View style={styles.bellBadge} />
            <Ionicons name="notifications-outline" size={24} color={Colors.textPrimary} />
          </TouchableOpacity>
        </View>
      </View>

      {/* Hero Card / Earnings */}
      <HeroCard premium={premium} earnings={claimData ? "940" : "1,240"} />

      {/* Live Risk Meter */}
      <LiveRiskMeter riskScore={0.72} />

      {/* Conditional UI based on state */}
      {!policyActive ? (
        <View style={styles.actionCard}>
          <Text style={styles.infoText}>You are currently unprotected against weather disruptions.</Text>
          <TouchableOpacity style={styles.primaryBtn} onPress={onGenerateQuote} disabled={loading}>
            {loading ? <ActivityIndicator color={Colors.background} /> : <Text style={styles.btnText}>ACTIVATE</Text>}
          </TouchableOpacity>
        </View>
      ) : !claimData ? (
        <View style={styles.actionCard}>
          <Text style={styles.successText}>● Shield Active (₹{premium}/wk)</Text>

          <TouchableOpacity style={styles.simulateBtn} onPress={onTriggerEvent} disabled={simulating}>
            {simulating ? <ActivityIndicator color={Colors.background} /> : (
              <View style={styles.row}>
                <Ionicons name="cloud-download-outline" size={20} color={Colors.textPrimary} style={{ marginRight: 8 }} />
                <Text style={styles.btnText}>Simulate Heavy Rain</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {/* Smart Notification Strip */}
          <View style={styles.smartNotification}>
            <Ionicons name="warning" size={20} color={Colors.neonRed} />
            <View style={{ flex: 1, marginLeft: 10 }}>
              <Text style={styles.smartTitle}>Heavy rain detected in your zone</Text>
              <Text style={styles.smartSub}>You're covered automatically</Text>
            </View>
            <TouchableOpacity onPress={() => setPredictionVisible(true)}>
              <Text style={{ color: Colors.neonBlue, fontWeight: 'bold' }}>View</Text>
            </TouchableOpacity>
          </View>

          {/* Impact and Claim Cards */}
          <ImpactCard loss={300} />
          <ClaimStatusCard claimData={claimData} />
        </>
      )}

      {/* Quick Actions */}
      <Text style={styles.sectionTitle}>Quick Actions</Text>
      <View style={styles.quickActionsGrid}>
        {['Earnings History', 'Policy Details', 'File Live Claim', 'Support'].map(action => (
          <TouchableOpacity
            key={action}
            style={styles.pillBtn}
            onPress={() => {
              if (action === 'File Live Claim') {
                if (policyActive) {
                  setFileClaimVisible(true);
                } else {
                  Alert.alert("No Active Policy", "Please activate GigShield before filing a claim.");
                }
              } else if (action === 'Policy Details') {
                setPolicyVisible(true);
              } else if (action === 'Support') {
                setSupportVisible(true);
              } else if (action === 'Earnings History') {
                setEarningsVisible(true);
              }
            }}
          >
            <Text style={styles.pillText}>{action}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* RENDER MODALS OUTSIDE NORMAL FLOW */}
      <SupportModal visible={supportVisible} onClose={() => setSupportVisible(false)} />
      <EarningsModal visible={earningsVisible} onClose={() => setEarningsVisible(false)} />
      <PredictionModal visible={predictionVisible} onClose={() => setPredictionVisible(false)} />
      <PolicyModal visible={policyVisible} onClose={() => setPolicyVisible(false)} />
      <FileClaimModal visible={fileClaimVisible} onClose={() => setFileClaimVisible(false)} onSubmitLiveClaim={onSubmitLiveClaim} />
      <NotificationsModal visible={inboxVisible} onClose={() => setInboxVisible(false)} />

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background, padding: 20 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 },
  greeting: { color: Colors.textPrimary, fontSize: 24, fontWeight: 'bold' },
  zoneRow: { flexDirection: 'row', alignItems: 'center', marginTop: 4 },
  zoneText: { color: Colors.textSecondary, fontSize: 13, marginLeft: 4, width: 140 },
  rightIcons: { flexDirection: 'row', alignItems: 'center' },
  bellBadge: { position: 'absolute', top: -2, right: -2, width: 8, height: 8, borderRadius: 4, backgroundColor: Colors.neonRed, zIndex: 10 },
  riskBadge: { backgroundColor: 'rgba(255, 61, 0, 0.15)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderColor: Colors.neonRed, borderWidth: 1 },
  riskBadgeText: { color: Colors.neonRed, fontSize: 11, fontWeight: 'bold' },
  actionCard: { backgroundColor: Colors.cardBackground, padding: 25, borderRadius: 20, alignItems: 'center', borderColor: Colors.neonBlue, borderWidth: 1, marginVertical: 10 },
  infoText: { marginBottom: 20, color: Colors.textSecondary, fontSize: 14, textAlign: 'center' },
  primaryBtn: { backgroundColor: Colors.neonGreen, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center' },
  simulateBtn: { backgroundColor: Colors.cardBorder, paddingVertical: 16, borderRadius: 12, width: '100%', alignItems: 'center', marginTop: 15, borderColor: Colors.textMuted, borderWidth: 1 },
  btnText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 },
  successText: { color: Colors.neonGreen, fontWeight: 'bold', fontSize: 16 },
  row: { flexDirection: 'row', alignItems: 'center' },
  smartNotification: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 12, borderColor: Colors.neonRed, borderWidth: 1, marginVertical: 10 },
  smartTitle: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 14 },
  smartSub: { color: Colors.textSecondary, fontSize: 12, marginTop: 2 },
  sectionTitle: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginTop: 25, marginBottom: 15 },
  quickActionsGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  pillBtn: { width: '48%', backgroundColor: Colors.cardBackground, paddingVertical: 14, borderRadius: 25, alignItems: 'center', marginBottom: 15, borderColor: Colors.cardBorder, borderWidth: 1 },
  pillText: { color: Colors.textPrimary, fontWeight: 'bold', fontSize: 14 }
});
