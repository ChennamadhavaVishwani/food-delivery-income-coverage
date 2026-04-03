import React from 'react';
import { View, Text, StyleSheet, Dimensions } from 'react-native';
import Svg, { Defs, LinearGradient, Stop, Path } from 'react-native-svg';
import { Colors } from '../theme/colors';

export default function HeroCard({ premium, earnings, mockData }) {
  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Today's Earnings</Text>
          <Text style={styles.bigNumber}>₹{earnings || "1,240"}</Text>
          <Text style={styles.subtext}>+₹320 vs yesterday</Text>
        </View>
        <View style={styles.protectedOverlay}>
          <Text style={styles.protectedText}>Protected: ₹{premium ? (premium * 1.5).toFixed(0) : "280"}</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <View style={styles.chartHeader}>
           <Text style={styles.chartLegendText}>10am</Text>
           <Text style={styles.chartLegendText}>12pm</Text>
           <Text style={styles.chartLegendText}>3pm</Text>
           <Text style={styles.chartLegendText}>Now</Text>
        </View>
        
        {/* Custom Ultra-Premium Glowing Area Chart directly using SVG */}
        <Svg height="140" width="100%" viewBox="0 0 350 140" preserveAspectRatio="none" style={styles.svgGraph}>
          <Defs>
            <LinearGradient id="grad" x1="0" y1="0" x2="0" y2="1">
              <Stop offset="0" stopColor={Colors.neonGreen} stopOpacity="0.4" />
              <Stop offset="1" stopColor={Colors.neonGreen} stopOpacity="0.0" />
            </LinearGradient>
            <LinearGradient id="strokeGrad" x1="0" y1="0" x2="1" y2="0">
              <Stop offset="0" stopColor={Colors.neonBlue} stopOpacity="0.8" />
              <Stop offset="1" stopColor={Colors.neonGreen} stopOpacity="1" />
            </LinearGradient>
          </Defs>
          {/* Fill Area */}
          <Path d="M0 120 C 50 110, 80 80, 150 75 C 220 70, 270 30, 350 10 L 350 140 L 0 140 Z" fill="url(#grad)" />
          {/* Glowing Stroke */}
          <Path d="M0 120 C 50 110, 80 80, 150 75 C 220 70, 270 30, 350 10" fill="none" stroke="url(#strokeGrad)" strokeWidth="4" />
          
          {/* Data Points */}
          <Path d="M 0 120 A 4 4 0 1 1 0 119.9 Z" fill={Colors.neonBlue} />
          <Path d="M 150 75 A 4 4 0 1 1 150 74.9 Z" fill={Colors.neonGreen} />
          <Path d="M 350 10 A 5 5 0 1 1 350 9.9 Z" fill="#FFF" />
        </Svg>
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
    shadowColor: Colors.neonGreen,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  title: { color: Colors.textSecondary, fontSize: 14, fontWeight: 'bold', textTransform: 'uppercase' },
  bigNumber: { color: Colors.textPrimary, fontSize: 36, fontWeight: '900', marginTop: 4 },
  subtext: { color: Colors.neonGreen, fontSize: 14, marginTop: 4, fontWeight: '600' },
  protectedOverlay: {
    backgroundColor: 'rgba(41, 121, 255, 0.1)',
    borderColor: Colors.neonBlue,
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  protectedText: { color: Colors.neonBlue, fontSize: 12, fontWeight: 'bold' },
  chartContainer: { marginTop: 25, height: 160, width: '100%' },
  chartHeader: { flexDirection: 'row', justifyContent: 'space-between', paddingHorizontal: 10, marginBottom: -15, zIndex: 1 },
  chartLegendText: { color: Colors.textSecondary, fontSize: 11, fontWeight: 'bold' },
  svgGraph: { marginTop: 15 }
});
