import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Colors } from '../theme/colors';

export default function ClaimStatusCard({ claimData }) {
  if (!claimData) return null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>Active Claim</Text>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{claimData.ai_evaluation?.status || "Processing"}</Text>
        </View>
      </View>
      <Text style={styles.subtext}>₹{claimData.payout_amount} will be credited to your wallet shortly.</Text>
      
      <View style={styles.timeline}>
        {['Detected', 'Validated', 'Approved', 'Settled'].map((step, index) => {
          const isActive = index <= 2; // Hardcoding Approved for demo based on claimData
          return (
            <View key={step} style={styles.timelineStep}>
              <View style={[styles.timelineNode, isActive && styles.timelineNodeActive]} />
              <Text style={[styles.timelineText, isActive && styles.timelineTextActive]}>{step}</Text>
            </View>
          )
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.cardBackground,
    borderRadius: 20,
    padding: 20,
    marginVertical: 10,
    borderColor: Colors.neonBlue,
    borderWidth: 1,
  },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { color: Colors.neonBlue, fontSize: 16, fontWeight: 'bold', textTransform: 'uppercase' },
  badge: { backgroundColor: 'rgba(41, 121, 255, 0.2)', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12 },
  badgeText: { color: Colors.neonBlue, fontWeight: 'bold', fontSize: 12 },
  subtext: { color: Colors.textPrimary, fontSize: 16, marginTop: 10, fontWeight: '500' },
  timeline: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 20 },
  timelineStep: { alignItems: 'center', width: '25%' },
  timelineNode: { width: 14, height: 14, borderRadius: 7, backgroundColor: Colors.textMuted, marginBottom: 8, zIndex: 2 },
  timelineNodeActive: { backgroundColor: Colors.neonBlue, shadowColor: Colors.neonBlue, shadowOffset: {height:0, width:0}, shadowRadius: 6, shadowOpacity: 1, elevation: 4 },
  timelineText: { color: Colors.textMuted, fontSize: 11, fontWeight: 'bold' },
  timelineTextActive: { color: Colors.textPrimary }
});
