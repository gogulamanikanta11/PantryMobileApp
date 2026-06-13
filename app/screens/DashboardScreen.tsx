import React from 'react';
import { router } from 'expo-router';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

const { width } = Dimensions.get('window');

export default function DashboardScreen() {
  return (
    <LinearGradient
      colors={['#0F172A', '#1E293B', '#334155']}
      style={{ flex: 1 }}
    >
      <ScrollView
        style={styles.container}
        testID="home-screen"
        showsVerticalScrollIndicator={false}
      >
        {/* Header Section */}
        <View style={styles.header}>
          <View>
            <Text style={styles.welcome}>Hello, Chef! 👋</Text>
            <Text style={styles.title}>Smart Pantry AI</Text>
          </View>
          <TouchableOpacity
            style={styles.profileCircle}
            onPress={() => router.push('/profile')}
          >
            <Text style={{fontSize: 24}}>👤</Text>
          </TouchableOpacity>
        </View>

        {/* New Feature: Sustainability Score Card */}
        <View style={styles.glassCard}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardTitle}>Sustainability Score</Text>
            <Ionicons name="leaf" size={20} color="#22C55E" />
          </View>
          <View style={styles.scoreContainer}>
            <View style={styles.progressBar}>
              <View style={[styles.progressFill, { width: '85%' }]} />
            </View>
            <Text style={styles.scoreText}>85% - Great job reducing waste!</Text>
          </View>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>📦</Text>
            <Text style={styles.statValue}>24</Text>
            <Text style={styles.statLabel}>Total Items</Text>
          </View>
          <View style={styles.statBox}>
            <Text style={styles.statEmoji}>⌛</Text>
            <Text style={styles.statValue}>4</Text>
            <Text style={styles.statLabel}>Expiring</Text>
          </View>
        </View>

        {/* AI Suggested Meal Card (Market Trend: Hyper-Personalization) */}
        <TouchableOpacity
          style={styles.aiMealCard}
          onPress={() => router.push('/recipes')}
        >
          <LinearGradient
            colors={['#4F46E5', '#7C3AED']}
            start={{x: 0, y: 0}}
            end={{x: 1, y: 1}}
            style={styles.aiGradient}
          >
            <View>
              <Text style={styles.aiBadge}>AI SUGGESTION</Text>
              <Text style={styles.aiMealTitle}>Creamy Pasta with Spinach</Text>
              <Text style={styles.aiMealSub}>Uses 3 items expiring soon!</Text>
            </View>
            <Ionicons name="chevron-forward" size={24} color="white" />
          </LinearGradient>
        </TouchableOpacity>

        <Text style={styles.sectionTitle}>Smart Tools</Text>

        <View style={styles.toolsGrid}>
          <ToolButton
            title="Scan & Add"
            icon="camera"
            color="#10B981"
            onPress={() => router.push('/scanner')}
            testID="add-button"
          />
          <ToolButton
            title="Pantry"
            icon="archive"
            color="#3B82F6"
            onPress={() => router.push('/pantry')}
            testID="manage-pantry-button"
          />
          <ToolButton
            title="Analytics"
            icon="bar-chart"
            color="#F59E0B"
            onPress={() => router.push('/analytics')}
            testID="analytics-button"
          />
          <ToolButton
            title="Shopping List"
            icon="cart"
            color="#EC4899"
            onPress={() => router.push('/shopping-list')}
          />
        </View>

        <View style={{height: 100}} />
      </ScrollView>
    </LinearGradient>
  );
}

function ToolButton({ title, icon, color, onPress, testID }: any) {
  return (
    <TouchableOpacity
      style={styles.toolButton}
      onPress={onPress}
      testID={testID}
    >
      <View style={[styles.iconCircle, { backgroundColor: color }]}>
        <Ionicons name={icon} size={24} color="white" />
      </View>
      <Text style={styles.toolText}>{title}</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 30
  },
  welcome: { fontSize: 16, color: '#94A3B8' },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white' },
  profileCircle: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  glassCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 24,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)',
    marginBottom: 20
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  cardTitle: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  scoreContainer: { width: '100%' },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderRadius: 4,
    marginBottom: 10
  },
  progressFill: { height: '100%', backgroundColor: '#22C55E', borderRadius: 4 },
  scoreText: { color: '#94A3B8', fontSize: 14 },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  statBox: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    alignItems: 'center'
  },
  statEmoji: { fontSize: 24, marginBottom: 10 },
  statValue: { color: 'white', fontSize: 24, fontWeight: 'bold' },
  statLabel: { color: '#94A3B8', fontSize: 12 },
  aiMealCard: { borderRadius: 24, overflow: 'hidden', marginBottom: 25 },
  aiGradient: {
    padding: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  aiBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    color: 'white',
    fontSize: 10,
    fontWeight: 'bold',
    alignSelf: 'flex-start',
    marginBottom: 8
  },
  aiMealTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  aiMealSub: { color: 'rgba(255,255,255,0.8)', fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  toolsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  toolButton: {
    width: '48%',
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 15,
    borderRadius: 20,
    alignItems: 'center',
    marginBottom: 15
  },
  iconCircle: {
    width: 50,
    height: 50,
    borderRadius: 15,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  toolText: { color: 'white', fontWeight: '600' }
});
