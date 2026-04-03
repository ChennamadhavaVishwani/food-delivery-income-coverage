import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function PolicyModal({ visible, onClose }) {
  return (
    <Modal visible={visible} animationType="fade" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          <View style={styles.header}>
            <Text style={styles.title}>AI Policy Profile</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={24} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
          
          <View style={styles.activeBanner}>
             <Ionicons name="shield-checkmark" size={24} color={Colors.background} />
             <Text style={styles.bannerText}>GigShield Premium Coverage Active</Text>
          </View>

          <Text style={styles.subTitle}>Dynamic Premium Factors</Text>
          <View style={styles.factorGrid}>
             <View style={styles.factorCell}>
               <Text style={styles.factorValue}>0.8x</Text>
               <Text style={styles.factorLabel}>Flood Risk</Text>
             </View>
             <View style={styles.factorCell}>
               <Text style={styles.factorValue}>0.5x</Text>
               <Text style={styles.factorLabel}>AQI Risk</Text>
             </View>
             <View style={styles.factorCell}>
               <Text style={styles.factorValue}>0.7x</Text>
               <Text style={styles.factorLabel}>Forecast Risk</Text>
             </View>
             <View style={styles.factorCell}>
               <Text style={styles.factorValue}>Tier 1</Text>
               <Text style={styles.factorLabel}>City Group</Text>
             </View>
          </View>
          
          <Text style={styles.paragraph}>
            Your premium is calculated dynamically using the variables above. Because your delivery zone (Zone 4) has a high weather propensity, you are protected against earnings anomalies caused by localized disruptions without manual insurance checks.
          </Text>
          
          <TouchableOpacity style={styles.downloadBtn}>
             <Text style={styles.downloadText}>Download Policy PDF</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.85)', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: Colors.background, borderRadius: 25, padding: 25, borderColor: Colors.neonBlue, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 20, fontWeight: 'bold', color: Colors.neonBlue },
  activeBanner: { backgroundColor: Colors.neonGreen, flexDirection: 'row', alignItems: 'center', padding: 15, borderRadius: 12, marginBottom: 25 },
  bannerText: { color: Colors.background, fontWeight: 'bold', marginLeft: 10, fontSize: 16 },
  subTitle: { color: Colors.textSecondary, fontSize: 13, textTransform: 'uppercase', fontWeight: 'bold', marginBottom: 15 },
  factorGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between' },
  factorCell: { width: '48%', backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 10, borderColor: Colors.cardBorder, borderWidth: 1 },
  factorValue: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' },
  factorLabel: { color: Colors.textMuted, fontSize: 11, marginTop: 5 },
  paragraph: { color: Colors.textSecondary, lineHeight: 20, marginTop: 15, fontSize: 13 },
  downloadBtn: { marginTop: 20, paddingVertical: 15, borderRadius: 12, borderColor: Colors.textMuted, borderWidth: 1, alignItems: 'center' },
  downloadText: { color: Colors.textPrimary, fontWeight: 'bold' }
});
