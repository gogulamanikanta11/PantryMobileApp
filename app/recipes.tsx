import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  View
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { generateRecipe } from '../backend/services/openrouter';

export default function RecipeScreen() {
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);

  const loadRecipes = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'pantry'));
      const items: string[] = [];
      querySnapshot.forEach((doc) => {
        const data: any = doc.data();
        if (data.name) items.push(data.name);
      });

      setIngredients(items);

      if (items.length === 0) {
        setRecipe('No pantry items found. Please add items first.');
        return;
      }

      const aiRecipe = await generateRecipe(items);
      setRecipe(aiRecipe);
    } catch (error: any) {
      console.error(error);
      setRecipe(error?.message || 'Failed to generate recipe.');
    } finally {
      setLoading(false);
    }
  };

  const surpriseMe = async () => {
    try {
      setLoading(true);
      const prompts = [
        'Suggest the best curry using these ingredients.',
        'Suggest the best rice recipe using these ingredients.',
        'Suggest the healthiest recipe using these ingredients.',
        'Suggest the easiest snack using these ingredients.',
        'Suggest one unique surprise recipe using these ingredients.'
      ];
      const randomPrompt = prompts[Math.floor(Math.random() * prompts.length)];
      const aiRecipe = await generateRecipe([...ingredients, randomPrompt]);
      setRecipe(aiRecipe);
    } catch (error: any) {
      console.error(error);
      setRecipe('Failed to generate surprise recipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <LinearGradient colors={['#0B1020', '#151B2F', '#1E293B']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} testID="recipes-screen">
        <Text style={styles.title}>👨‍🍳 AI Chef</Text>
        <Text style={styles.subtitle}>Generate recipes from your pantry items</Text>

        {loading ? (
          <ActivityIndicator size="large" color="#22C55E" style={{ marginTop: 50 }} />
        ) : (
          <View testID="recipe-container">
            <Text style={styles.recipeText} testID="recipe-content-text">
              {recipe}
            </Text>

            <TouchableOpacity
              testID="surprise-me-button"
              style={styles.button}
              onPress={surpriseMe}
            >
              <Text style={styles.buttonText}>🎲 Surprise Me</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 32, fontWeight: 'bold', marginTop: 60, textAlign: 'center', color: 'white' },
  subtitle: { fontSize: 15, textAlign: 'center', color: '#94A3B8', marginTop: 8, marginBottom: 25 },
  recipeText: { fontSize: 17, lineHeight: 28, color: 'white', backgroundColor: 'rgba(255,255,255,0.08)', padding: 20, borderRadius: 20, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  button: { backgroundColor: '#F59E0B', padding: 15, borderRadius: 15, marginTop: 20, marginBottom: 30 },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});
