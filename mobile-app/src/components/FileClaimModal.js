import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, TextInput, ActivityIndicator, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function FileClaimModal({ visible, onClose, onSubmitLiveClaim }) {
  const [delayMins, setDelayMins] = useState('');
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    await onSubmitLiveClaim(Number(delayMins) || 15);
    setIsSubmitting(false);
    onClose();
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>File Live Claim</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
          
          <Text style={styles.instruction}>Fill out the details below. Our ML pipeline will automatically pair this claim with your real-time GPS coordinates for instant AI fraud scoring.</Text>
          
          <View style={styles.formGroup}>
            <Text style={styles.label}>Estimated Delay Time (Mins)</Text>
            <TextInput 
              style={styles.input} 
              keyboardType="numeric" 
              placeholder="e.g. 45" 
              placeholderTextColor={Colors.textMuted}
              value={delayMins}
              onChangeText={setDelayMins}
            />
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Impact Type</Text>
            <View style={styles.typeGrid}>
               <TouchableOpacity style={[styles.typeBtn, {backgroundColor: 'rgba(41, 121, 255, 0.2)', borderColor: Colors.neonBlue}]}><Text style={[styles.typeText, {color: Colors.neonBlue}]}>Weather</Text></TouchableOpacity>
               <TouchableOpacity style={styles.typeBtn}><Text style={styles.typeText}>Traffic</Text></TouchableOpacity>
               <TouchableOpacity style={styles.typeBtn}><Text style={styles.typeText}>Health</Text></TouchableOpacity>
            </View>
          </View>

          <View style={styles.formGroup}>
            <Text style={styles.label}>Additional Notes (Optional)</Text>
            <TextInput 
              style={[styles.input, styles.textArea]} 
              multiline 
              placeholder="Describe the condition..." 
              placeholderTextColor={Colors.textMuted}
              value={reason}
              onChangeText={setReason}
            />
          </View>

          <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={isSubmitting}>
             {isSubmitting ? (
                 <ActivityIndicator color={Colors.background} />
             ) : (
                 <View style={{flexDirection: 'row', alignItems: 'center'}}>
                    <Ionicons name="location" size={18} color={Colors.background} style={{marginRight: 8}} />
                    <Text style={styles.submitText}>Verify GPS & Submit AI Claim</Text>
                 </View>
             )}
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.8)', justifyContent: 'flex-end' },
  sheet: { backgroundColor: Colors.background, borderTopLeftRadius: 30, borderTopRightRadius: 30, padding: 25, height: '85%', borderColor: Colors.cardBorder, borderWidth: 1 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  title: { fontSize: 24, fontWeight: 'bold', color: Colors.textPrimary },
  instruction: { color: Colors.textSecondary, marginBottom: 25, lineHeight: 20 },
  formGroup: { marginBottom: 20 },
  label: { color: Colors.textPrimary, fontWeight: 'bold', marginBottom: 10, fontSize: 13, textTransform: 'uppercase' },
  input: { backgroundColor: Colors.cardBackground, borderColor: Colors.cardBorder, borderWidth: 1, padding: 15, borderRadius: 12, color: Colors.textPrimary, fontSize: 16 },
  textArea: { height: 100, textAlignVertical: 'top' },
  typeGrid: { flexDirection: 'row', justifyContent: 'space-between' },
  typeBtn: { flex: 1, marginHorizontal: 4, paddingVertical: 12, borderRadius: 10, backgroundColor: Colors.cardBackground, alignItems: 'center', borderColor: Colors.cardBorder, borderWidth: 1 },
  typeText: { color: Colors.textSecondary, fontWeight: 'bold' },
  submitBtn: { backgroundColor: Colors.neonGreen, paddingVertical: 18, borderRadius: 15, alignItems: 'center', marginTop: 'auto', marginBottom: 20 },
  submitText: { color: Colors.background, fontWeight: 'bold', fontSize: 16 }
});
