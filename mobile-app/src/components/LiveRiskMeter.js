import React from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import CircularProgressIndicator from 'react-native-circular-progress-indicator';
import { Colors } from '../theme/colors';

export default function LiveRiskMeter({ riskScore }) {
  // Translate dummy riskScore 0-1 to 0-100%
  const value = riskScore !== undefined ? Math.round(riskScore * 100) : 72;
  
  // Dynamic color based on AI risk out
  const activeColor = value > 70 ? Colors.neonRed : value > 40 ? Colors.warningYellow : Colors.neonGreen;
  const subtext = value > 70 ? "High chance of rain disruption" : value > 40 ? "Moderate weather risk" : "Clear conditions expected";

  return (
    <View style={styles.card}>
      <View style={styles.content}>
        <View style={styles.textData}>
          <Text style={styles.label}>Next 6h Disruption Risk</Text>
          <Text style={[styles.subtext, { color: activeColor }]}>{subtext}</Text>
        </View>
        {Platform.OS === 'web' ? (
          <View style={styles.webFallbackRing}>
            <Text style={[styles.webFallbackRingValue, { color: Colors.textPrimary }]}>{value}%</Text>
          </View>
        ) : (
          <CircularProgressIndicator
            value={value}
            radius={45}
            duration={1500}
            progressValueColor={Colors.textPrimary}
            maxValue={100}
            title={'%'}
            titleColor={Colors.textSecondary}
            titleStyle={{fontWeight: 'bold', fontSize: 14}}
            activeStrokeColor={activeColor}
            inActiveStrokeColor={Colors.cardBorder}
            inActiveStrokeOpacity={0.5}
            inActiveStrokeWidth={10}
            activeStrokeWidth={10}
            dashedStrokeConfig={{ count: 30, width: 4 }}
          />
        )}
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
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  textData: {
    flex: 1,
    paddingRight: 15,
  },
  label: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 5 },
  subtext: { fontSize: 14, fontWeight: '500', marginTop: 10 },
  webFallbackRing: { width: 90, height: 90, borderRadius: 45, borderWidth: 8, borderColor: Colors.cardBorder, alignItems: 'center', justifyContent: 'center' },
  webFallbackRingValue: { fontSize: 22, fontWeight: 'bold' }
});
