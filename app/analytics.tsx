import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function AnalyticsScreen() {
  const [stats, setStats] = useState({
    total: 0,
    lowStock: 0,
    expiring: 0,
    wastedValue: 0, // Market Trend: Tracking financial loss from waste
    savedCo2: 0,    // Market Trend: Environmental impact
  });

  const loadAnalytics = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'pantry'));
      let total = 0;
      let lowStock = 0;
      let expiring = 0;

      querySnapshot.forEach((doc) => {
        const item: any = doc.data();
        total++;
        const stock = parseInt(item.stock);
        const expiry = parseInt(item.expiry);

        if (stock <= 1) lowStock++;
        if (expiry <= 3) expiring++;
      });

      setStats({
        total,
        lowStock,
        expiring,
        wastedValue: expiring * 5.5, // Estimation: $5.5 average per item
        savedCo2: (total - expiring) * 0.8, // 0.8kg CO2 saved per item used
      });
    } catch (error) {
      console.error(error);
    }
  };

  useEffect(() => {
    loadAnalytics();
  }, []);

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
      <ScrollView
        style={styles.container}
        testID="analytics-screen"
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.title}>Impact Insights</Text>
        <Text style={styles.subtitle}>Your pantry's financial & eco footprint</Text>

        {/* Financial Loss Warning (New Market Feature) */}
        <View style={[styles.glassCard, { borderColor: '#EF444455' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>At-Risk Value</Text>
            <Ionicons name="trending-down" size={20} color="#EF4444" />
          </View>
          <Text style={[styles.mainValue, { color: '#EF4444' }]}>${stats.wastedValue.toFixed(2)}</Text>
          <Text style={styles.subLabel}>Potential loss if items expire</Text>
        </View>

        {/* Eco Impact (New Market Feature) */}
        <View style={[styles.glassCard, { borderColor: '#10B98155' }]}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardLabel}>CO2 Footprint Saved</Text>
            <Ionicons name="planet" size={20} color="#10B981" />
          </View>
          <Text style={[styles.mainValue, { color: '#10B981' }]}>{stats.savedCo2.toFixed(1)} kg</Text>
          <Text style={styles.subLabel}>Thanks to your smart consumption</Text>
        </View>

        <View style={styles.grid}>
          <SmallCard
            label="In Stock"
            value={stats.total}
            icon="cube-outline"
            color="#3B82F6"
            testID="total-items-card"
          />
          <SmallCard
            label="Low Stock"
            value={stats.lowStock}
            icon="alert-circle-outline"
            color="#F59E0B"
            testID="low-stock-card"
          />
        </View>

        <View style={styles.chartPlaceholder}>
          <Text style={styles.chartTitle}>Consumption Pattern</Text>
          <View style={styles.barRow}>
            <View style={[styles.bar, { height: 40 }]} />
            <View style={[styles.bar, { height: 80 }]} />
            <View style={[styles.bar, { height: 60 }]} />
            <View style={[styles.bar, { height: 100, backgroundColor: '#4F46E5' }]} />
            <View style={[styles.bar, { height: 70 }]} />
            <View style={[styles.bar, { height: 90 }]} />
          </View>
          <View style={styles.monthRow}>
            <Text style={styles.monthText}>Jan</Text>
            <Text style={styles.monthText}>Feb</Text>
            <Text style={styles.monthText}>Mar</Text>
            <Text style={styles.monthText}>Apr</Text>
            <Text style={styles.monthText}>May</Text>
            <Text style={styles.monthText}>Jun</Text>
          </View>
        </View>

        <View style={{ height: 100 }} />
      </ScrollView>
    </LinearGradient>
  );
}

function SmallCard({ label, value, icon, color, testID }: any) {
  return (
    <View style={styles.smallCard} testID={testID}>
      <Ionicons name={icon} size={24} color={color} />
      <Text style={styles.smallValue}>{value}</Text>
      <Text style={styles.smallLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  subtitle: { color: '#94A3B8', fontSize: 14, marginBottom: 30, marginTop: 5 },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  cardLabel: { color: '#94A3B8', fontSize: 16, fontWeight: '500' },
  mainValue: { fontSize: 36, fontWeight: 'bold', marginVertical: 5 },
  subLabel: { color: '#64748B', fontSize: 12 },
  grid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  smallCard: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.05)'
  },
  smallValue: { color: 'white', fontSize: 24, fontWeight: 'bold', marginVertical: 8 },
  smallLabel: { color: '#94A3B8', fontSize: 12 },
  chartPlaceholder: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  chartTitle: { color: 'white', fontSize: 18, fontWeight: 'bold', marginBottom: 25 },
  barRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-around',
    height: 100
  },
  bar: {
    width: 20,
    backgroundColor: 'rgba(255,255,255,0.2)',
    borderRadius: 6
  },
  monthRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: 15 },
  monthText: { color: '#64748B', fontSize: 10 }
});
