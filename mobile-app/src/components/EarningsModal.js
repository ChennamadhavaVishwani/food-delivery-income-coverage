import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function EarningsModal({ visible, onClose }) {
  const days = [
    { name: "Today", earnings: 1240, protected: 1500, active: true },
    { name: "Yesterday", earnings: 920, protected: 1500, active: false },
    { name: "Wed", earnings: 1450, protected: 1500, active: false },
    { name: "Tue", earnings: 800, protected: 1500, active: false },
    { name: "Mon", earnings: 1100, protected: 1500, loss: 400, active: false }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Earnings History</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={Colors.textPrimary} /></TouchableOpacity>
          </View>

          <View style={styles.overviewCard}>
             <Text style={{color: Colors.textSecondary}}>7-Day Total</Text>
             <Text style={{color: Colors.textPrimary, fontSize: 36, fontWeight: 'bold'}}>₹5,510</Text>
             <Text style={{color: Colors.neonBlue, marginTop: 5}}>AI Shield Protection active all week.</Text>
          </View>

          <Text style={styles.subtitle}>Daily Breakdown</Text>
          <ScrollView>
            {days.map((d, i) => (
              <View key={i} style={[styles.dayRow, d.active && styles.activeDay]}>
                 <View>
                   <Text style={[styles.dayName, d.active && {color: Colors.neonGreen}]}>{d.name}</Text>
                   {d.loss && <Text style={{color: Colors.neonRed, fontSize: 12}}>Weather Loss: ₹{d.loss}</Text>}
                 </View>
                 <View style={{alignItems: 'flex-end'}}>
                   <Text style={[styles.amount, d.active && {color: Colors.neonGreen}]}>₹{d.earnings}</Text>
                   <Text style={{color: Colors.textMuted, fontSize: 12}}>Covered up to ₹{d.protected}</Text>
                 </View>
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '80%', borderColor: Colors.cardBorder, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  overviewCard: { backgroundColor: Colors.cardBackground, padding: 20, borderRadius: 20, borderColor: Colors.neonBlue, borderWidth: 1, marginBottom: 25 },
  subtitle: { fontSize: 16, fontWeight: 'bold', color: Colors.textSecondary, marginBottom: 15 },
  dayRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 15, borderBottomColor: Colors.cardBorder, borderBottomWidth: 1 },
  activeDay: { backgroundColor: 'rgba(0, 230, 118, 0.05)', paddingHorizontal: 15, borderRadius: 10, borderBottomWidth: 0 },
  dayName: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  amount: { color: Colors.textPrimary, fontSize: 18, fontWeight: 'bold' }
});
