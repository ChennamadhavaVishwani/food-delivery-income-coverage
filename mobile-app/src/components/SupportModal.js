import React, { useState } from 'react';
import { View, Text, StyleSheet, Modal, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../theme/colors';

export default function SupportModal({ visible, onClose }) {
  const [inputText, setInputText] = useState('');
  const [messages, setMessages] = useState([
    { id: 1, text: "Hi User, I am your active AI Policy Assistant. How can I help you regarding your recent protection, claim filing, or app tracking?", isAi: true }
  ]);

  const sendMessage = (text = inputText) => {
    if (!text.trim()) return;
    
    // Add User Message
    const userMsg = { id: Date.now(), text, isAi: false };
    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    // Simulate AI Response Delay
    setTimeout(() => {
      const aiResponse = { 
        id: Date.now() + 1, 
        text: "I understand you have a question. Since I am an AI Demo, I can't look deep into your specific database right now. Please use the Contact GigShield button below, and a human agent will assist you instantly!", 
        isAi: true 
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1200);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.header}>
            <Text style={styles.title}>GigShield Support</Text>
            <TouchableOpacity onPress={onClose}><Ionicons name="close" size={28} color={Colors.textPrimary} /></TouchableOpacity>
          </View>
          
          <ScrollView style={styles.chatArea} contentContainerStyle={{ paddingBottom: 20 }}>
             {messages.map((msg) => (
               <View key={msg.id} style={[styles.bubbleWrapper, msg.isAi ? styles.aiWrapper : styles.userWrapper]}>
                  {msg.isAi && <Ionicons name="hardware-chip-outline" size={20} color={Colors.neonBlue} style={{marginRight: 8, marginTop: 12}}/>}
                  <View style={[styles.bubble, msg.isAi ? styles.aiBubble : styles.userBubble]}>
                    <Text style={[styles.msgText, msg.isAi ? styles.aiText : styles.userText]}>{msg.text}</Text>
                  </View>
               </View>
             ))}
             
             {messages.length === 1 && (
               <View style={styles.actionGrid}>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => sendMessage("Check Claim Status")}>
                   <Text style={styles.actionBtnText}>Check Claim Status</Text>
                 </TouchableOpacity>
                 <TouchableOpacity style={styles.actionBtn} onPress={() => sendMessage("How is my premium calculated?")}>
                   <Text style={styles.actionBtnText}>How is my premium calculated?</Text>
                 </TouchableOpacity>
               </View>
             )}
          </ScrollView>

          <View style={styles.inputArea}>
            <TextInput 
              style={styles.input} 
              placeholderTextColor={Colors.textMuted} 
              placeholder="Ask AI Assistant..." 
              value={inputText}
              onChangeText={setInputText}
              onSubmitEditing={() => sendMessage()}
            />
            <TouchableOpacity style={styles.sendBtn} onPress={() => sendMessage()}>
               <Ionicons name="send" size={20} color="#fff" />
            </TouchableOpacity>
          </View>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.contactCard}>
             <Ionicons name="call" size={24} color={Colors.neonGreen} />
             <View style={{marginLeft: 15}}>
               <Text style={styles.contactTitle}>Contact GigShield Directly</Text>
               <Text style={styles.contactSub}>Speak with a human agent (Wait time: ~2m)</Text>
             </View>
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
  chatArea: { flex: 1 },
  bubbleWrapper: { flexDirection: 'row', marginBottom: 15 },
  aiWrapper: { justifyContent: 'flex-start' },
  userWrapper: { justifyContent: 'flex-end' },
  bubble: { padding: 15, borderRadius: 15, maxWidth: '85%' },
  aiBubble: { backgroundColor: 'rgba(41, 121, 255, 0.1)', borderColor: Colors.neonBlue, borderWidth: 1 },
  userBubble: { backgroundColor: Colors.cardBackground, borderColor: Colors.cardBorder, borderWidth: 1 },
  msgText: { lineHeight: 22, fontSize: 14 },
  aiText: { color: Colors.textPrimary },
  userText: { color: Colors.textSecondary },
  actionGrid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginTop: 15 },
  actionBtn: { backgroundColor: Colors.cardBackground, borderColor: Colors.cardBorder, borderWidth: 1, padding: 12, borderRadius: 20, width: '48%', marginBottom: 10 },
  actionBtnText: { color: Colors.neonGreen, fontSize: 13, textAlign: 'center', fontWeight: 'bold' },
  inputArea: { flexDirection: 'row', alignItems: 'center', marginVertical: 15 },
  input: { flex: 1, backgroundColor: Colors.cardBackground, padding: 15, borderRadius: 25, color: Colors.textPrimary, borderColor: Colors.cardBorder, borderWidth: 1 },
  sendBtn: { backgroundColor: Colors.neonBlue, width: 50, height: 50, borderRadius: 25, alignItems: 'center', justifyContent: 'center', marginLeft: 10 },
  divider: { height: 1, backgroundColor: Colors.cardBorder, marginVertical: 15 },
  contactCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: Colors.cardBackground, padding: 20, borderRadius: 15, borderColor: Colors.neonGreen, borderWidth: 1 },
  contactTitle: { color: Colors.textPrimary, fontSize: 16, fontWeight: 'bold' },
  contactSub: { color: Colors.textSecondary, fontSize: 13, marginTop: 4 }
});
