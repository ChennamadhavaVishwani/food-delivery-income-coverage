import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';
import LiveRiskMeter from './LiveRiskMeter';

export default function PredictionModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>Live Disruption AI</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
          
          <LiveRiskMeter riskScore={0.72} />

          <View style={styles.details}>
             <View style={styles.row}>
                <Ionicons name="rainy" size={20} color={Colors.neonBlue} style={{width: 30}}/>
                <Text style={styles.detailText}>Heavy Monsoon Rain approaching Zone 4 in approx 45 mins.</Text>
             </View>
             <View style={styles.row}>
                <Ionicons name="trending-down" size={20} color={Colors.neonRed} style={{width: 30}}/>
                <Text style={styles.detailText}>Projected 40% drop in active deliveries due to waterlogging.</Text>
             </View>
             <View style={styles.row}>
                <Ionicons name="shield-checkmark" size={20} color={Colors.neonGreen} style={{width: 30}}/>
                <Text style={styles.detailText}>Your GigShield parametric policy active. If earnings fall below minimum bound, difference will be auto-settled.</Text>
             </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: Colors.background, borderRadius: 25, padding: 25, borderColor: Colors.neonRed, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.neonRed },
  details: { marginTop: 20, backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 15 },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 15 },
  detailText: { color: Colors.textPrimary, flex: 1, lineHeight: 20 }
});
