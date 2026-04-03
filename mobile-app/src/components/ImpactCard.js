import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Colors } from '../theme/colors';

export default function ImpactCard({ loss }) {
  const earned = 1240;
  const missed = loss || 300;
  
  return (
    <View style={styles.card}>
      <Text style={styles.title}>Today's Impact</Text>
      
      <View style={styles.barContainer}>
        <View style={styles.barRow}>
          <Text style={styles.barLabel}>Earned</Text>
          <Text style={styles.barValue}>₹{earned}</Text>
        </View>
        <View style={[styles.bar, { width: '80%', backgroundColor: Colors.neonGreen }]} />
      </View>

      <View style={styles.barContainer}>
        <View style={styles.barRow}>
          <Text style={[styles.barLabel, { color: Colors.neonRed }]}>Weather Loss</Text>
          <Text style={[styles.barValue, { color: Colors.neonRed }]}>₹{missed}</Text>
        </View>
        <View style={[styles.bar, { width: '30%', backgroundColor: Colors.neonRed }]} />
      </View>

      <View style={styles.alertBox}>
        <Text style={styles.alertText}>⚡ You're protected for this loss by your active AI policy.</Text>
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
    borderColor: Colors.cardBorder,
    borderWidth: 1,
  },
  title: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 15 },
  barContainer: { marginBottom: 15 },
  barRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  barLabel: { color: Colors.textPrimary, fontSize: 15, fontWeight: '600' },
  barValue: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  bar: { height: 10, borderRadius: 5, backgroundColor: Colors.cardBorder },
  alertBox: {
    marginTop: 10,
    backgroundColor: 'rgba(255, 61, 0, 0.1)',
    padding: 12,
    borderRadius: 8,
    borderColor: 'rgba(255, 61, 0, 0.3)',
    borderWidth: 1,
  },
  alertText: { color: Colors.neonRed, fontSize: 13, fontWeight: '600' }
});
