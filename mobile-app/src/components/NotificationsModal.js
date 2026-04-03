import React from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function NotificationsModal({ visible, onClose }) {
  const notifications = [
    { id: 1, title: 'AI Claim Settlement', body: 'Your recent disruption claim of ₹450 has been approved by the Autoencoder and credited.', time: '2 mins ago', icon: 'checkmark-circle', color: Colors.neonGreen },
    { id: 2, title: 'Weather Alert: Zone 4', body: 'Heavy monsoon rains detected. Your earnings protection bounds are actively monitoring.', time: '1 hr ago', icon: 'rainy', color: Colors.neonBlue },
    { id: 3, title: 'Policy Premium Update', body: 'Your dynamic premium calculation has updated based on lower Tier 1 traffic conditions.', time: 'Yesterday', icon: 'shield', color: Colors.textSecondary },
    { id: 4, title: 'Welcome to GigShield', body: 'Your parametric insurance coverage is ready to protect your daily earnings without manual claims.', time: '2 days ago', icon: 'rocket', color: Colors.neonBlue }
  ];

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>Notifications</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={Colors.textPrimary} /></TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            {notifications.map(item => (
              <View key={item.id} style={styles.card}>
                <View style={[styles.iconBox, { backgroundColor: item.color + '20' }]}>
                  <Ionicons name={item.icon} size={22} color={item.color} />
                </View>
                <View style={styles.textContainer}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemBody}>{item.body}</Text>
                  <Text style={styles.timeText}>{item.time}</Text>
                </View>
              </View>
            ))}
            <TouchableOpacity style={styles.clearBtn}>
               <Text style={styles.clearText}>Clear All Notifications</Text>
            </TouchableOpacity>
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%', borderColor: Colors.cardBorder, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 25 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  card: { flexDirection: 'row', backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 15, marginBottom: 12, borderColor: Colors.cardBorder, borderWidth: 1 },
  iconBox: { width: 45, height: 45, borderRadius: 25, justifyContent: 'center', alignItems: 'center', flexShrink: 0 },
  textContainer: { marginLeft: 15, flex: 1 },
  itemTitle: { color: Colors.textPrimary, fontSize: 15, fontWeight: 'bold' },
  itemBody: { color: Colors.textSecondary, fontSize: 13, marginTop: 4, lineHeight: 18 },
  timeText: { color: Colors.textMuted, fontSize: 11, marginTop: 8, fontStyle: 'italic' },
  clearBtn: { marginTop: 20, paddingVertical: 15, alignItems: 'center', borderRadius: 15, borderWidth: 1, borderColor: Colors.cardBorder },
  clearText: { color: Colors.textMuted, fontWeight: 'bold' }
});
