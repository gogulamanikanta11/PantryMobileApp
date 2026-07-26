import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { generateMealPlan } from '../backend/services/openrouter';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export default function MealPlannerScreen() {
  const [selectedDay, setSelectedDay] = useState('Mon');
  const [loading, setLoading] = useState(false);
  const [plans, setPlans] = useState<any>({
    Mon: { breakfast: 'Oatmeal', lunch: 'Salad', dinner: 'Pasta' },
    Tue: { breakfast: 'Smoothie', lunch: 'Leftover Pasta', dinner: 'Stir Fry' },
  });

  const handleAIFill = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'pantry'));
      const items: string[] = [];
      querySnapshot.forEach((doc) => {
        const data: any = doc.data();
        if (data.name) items.push(data.name);
      });

      if (items.length === 0) {
        const msg = 'No pantry items found. Please add items to your pantry first!';
        if (Platform.OS === 'web') window.alert(msg);
        else Alert.alert('Pantry Empty', msg);
        setLoading(false);
        return;
      }

      const rawPlan = await generateMealPlan(items);
      let parsedPlan: any = null;
      try {
        parsedPlan = JSON.parse(rawPlan);
      } catch (err) {
        // Strip markdown if AI returned markdown JSON wrapper ```json ... ```
        const jsonMatch = rawPlan.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          parsedPlan = JSON.parse(jsonMatch[0]);
        }
      }

      if (parsedPlan && typeof parsedPlan === 'object') {
        setPlans(parsedPlan);
        const successMsg = 'Successfully generated a weekly meal plan with AI Chef!';
        if (Platform.OS === 'web') window.alert(successMsg);
        else Alert.alert('Success', successMsg);
      } else {
        throw new Error('Invalid JSON format returned from AI Chef.');
      }
    } catch (error: any) {
      console.error(error);
      const errMsg = 'Failed to generate AI meal plan. Reverting to smart mock generation.';
      if (Platform.OS === 'web') window.alert(errMsg);
      else Alert.alert('AI Error', errMsg);

      // Fallback generation logic
      const fallbackPlans = {
        Mon: { breakfast: "🍳 Fried Eggs & Toast", lunch: "🥗 Tomato Salad Bowl", dinner: "🍚 Golden Vegetable Fried Rice" },
        Tue: { breakfast: "🥞 Pancake Bites", lunch: "🍗 Savory Chicken Curry", dinner: "🥔 Crispy Roasted Potatoes" },
        Wed: { breakfast: "🥣 Oatmeal Porridge", lunch: "🥪 Egg & Cheese Sandwich", dinner: "🍛 Pantry Veggie Curry" },
        Thu: { breakfast: "🥑 Avocado Slices on Toast", lunch: "🍚 Golden Vegetable Fried Rice", dinner: "🍗 Savory Pantry Chicken Curry" },
        Fri: { breakfast: "🍳 Fluffy Egg Scramble", lunch: "🥗 Fresh Tomato Salad", dinner: "🥔 Herbed Roasted Potatoes" },
        Sat: { breakfast: "🥞 Golden Waffles", lunch: "🍗 Chicken Curry Rice", dinner: "🍲 Chef's Pantry Stew" },
        Sun: { breakfast: "🍌 Fruit Bowl & Oats", lunch: "🍛 Vegetable Curry Mix", dinner: "🍳 Baked Frittata Slice" }
      };
      setPlans(fallbackPlans);
    } finally {
      setLoading(false);
    }
  };

  const handleAddPlan = (mealType: string) => {
    const savePlan = (val: string) => {
      if (val && val.trim().length > 0) {
        setPlans((prev: any) => ({
          ...prev,
          [selectedDay]: {
            ...(prev[selectedDay] || {}),
            [mealType]: val
          }
        }));
      }
    };

    if (Platform.OS === 'web') {
      const val = window.prompt(`What are you having for ${mealType} on ${selectedDay}?`, plans[selectedDay]?.[mealType] || '');
      if (val !== null) {
        savePlan(val);
      }
    } else {
      Alert.prompt(
        `Plan ${mealType}`,
        `What are you having for ${mealType} on ${selectedDay}?`,
        [
          { text: 'Cancel', style: 'cancel' },
          {
            text: 'Save',
            onPress: (val) => {
              if (val) savePlan(val);
            }
          }
        ],
        'plain-text',
        plans[selectedDay]?.[mealType] || ''
      );
    }
  };

  return (
    <LinearGradient colors={['#0F172A', '#1E293B']} style={{ flex: 1 }}>
      <View style={styles.container}>
        <Text style={styles.title}>Meal Planner</Text>

        {/* Horizontal Day Selector */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelector}>
          {DAYS.map(day => (
            <TouchableOpacity
              key={day}
              onPress={() => setSelectedDay(day)}
              style={[styles.dayButton, selectedDay === day && styles.selectedDay]}
            >
              <Text style={[styles.dayText, selectedDay === day && styles.selectedDayText]}>{day}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <ScrollView showsVerticalScrollIndicator={false} style={styles.planContainer}>
          <MealCard
            type="Breakfast"
            title={plans[selectedDay]?.breakfast || 'Not planned'}
            icon="sunny-outline"
            onPress={() => handleAddPlan('breakfast')}
          />
          <MealCard
            type="Lunch"
            title={plans[selectedDay]?.lunch || 'Not planned'}
            icon="fast-food-outline"
            onPress={() => handleAddPlan('lunch')}
          />
          <MealCard
            type="Dinner"
            title={plans[selectedDay]?.dinner || 'Not planned'}
            icon="moon-outline"
            onPress={() => handleAddPlan('dinner')}
          />

          <TouchableOpacity
            style={[styles.aiGenBtn, loading && { opacity: 0.7 }]}
            onPress={handleAIFill}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" />
                <Text style={styles.aiGenText}>Auto-Fill Week with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </ScrollView>
      </View>
    </LinearGradient>
  );
}

function MealCard({ type, title, icon, onPress }: any) {
  return (
    <TouchableOpacity style={styles.mealCard} onPress={onPress}>
      <View style={styles.mealHeader}>
        <Ionicons name={icon} size={24} color="#4F46E5" />
        <Text style={styles.mealType}>{type}</Text>
      </View>
      <Text style={[styles.mealTitle, title === 'Not planned' && { color: '#64748B' }]}>{title}</Text>
      <Ionicons name="pencil" size={16} color="#94A3B8" style={styles.editIcon} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, paddingTop: 60 },
  title: { fontSize: 28, fontWeight: 'bold', color: 'white', marginBottom: 20 },
  daySelector: { marginBottom: 25, maxHeight: 60 },
  dayButton: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 15,
    backgroundColor: 'rgba(255,255,255,0.05)',
    marginRight: 10,
    height: 45
  },
  selectedDay: { backgroundColor: '#4F46E5' },
  dayText: { color: '#94A3B8', fontWeight: 'bold' },
  selectedDayText: { color: 'white' },
  planContainer: { flex: 1 },
  mealCard: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    padding: 20,
    borderRadius: 24,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  mealHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  mealType: { color: '#94A3B8', fontSize: 14, marginLeft: 10, fontWeight: 'bold' },
  mealTitle: { color: 'white', fontSize: 20, fontWeight: 'bold' },
  editIcon: { position: 'absolute', right: 20, top: 20 },
  aiGenBtn: {
    flexDirection: 'row',
    backgroundColor: '#7C3AED',
    padding: 18,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 40
  },
  aiGenText: { color: 'white', fontWeight: 'bold', marginLeft: 10, fontSize: 16 }
});
