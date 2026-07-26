import React, { useEffect, useState } from 'react';
import {
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  View,
  Platform
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../backend/firebase/config';
import { generateRecipe } from '../backend/services/openrouter';
import { Ionicons } from '@expo/vector-icons';

interface ParsedRecipe {
  name: string;
  time: string;
  ingredients: string[];
  steps: string[];
}

export default function RecipeScreen() {
  const [recipe, setRecipe] = useState('');
  const [loading, setLoading] = useState(true);
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [parsedRecipe, setParsedRecipe] = useState<ParsedRecipe | null>(null);

  const parseRecipeText = (text: string): ParsedRecipe | null => {
    try {
      if (!text || text.includes('No pantry items found') || text.includes('Failed to generate')) {
        return null;
      }
      
      const lines = text.split('\n');
      let name = '';
      let time = '';
      let ingredientsString = '';
      let steps: string[] = [];
      let isReadingSteps = false;

      lines.forEach(line => {
        const cleanLine = line.trim();
        if (cleanLine.toLowerCase().includes('recipe name:')) {
          name = cleanLine.replace(/[\*#🍽]/g, '').replace(/recipe name:/i, '').trim();
        } else if (cleanLine.toLowerCase().includes('cooking time:')) {
          time = cleanLine.replace(/[\*#⏱]/g, '').replace(/cooking time:/i, '').trim();
        } else if (cleanLine.toLowerCase().includes('ingredients used:')) {
          ingredientsString = cleanLine.replace(/[\*#🥕]/g, '').replace(/ingredients used:/i, '').trim();
        } else if (cleanLine.toLowerCase().includes('step-by-step instructions:')) {
          isReadingSteps = true;
        } else if (isReadingSteps && cleanLine.length > 0 && !cleanLine.startsWith('_') && !cleanLine.startsWith('*')) {
          const stepText = cleanLine.replace(/^\d+[\.\s\-]+/, '').trim();
          if (stepText.length > 0) {
            steps.push(stepText);
          }
        }
      });

      if (!name && !time && steps.length === 0) {
        return null;
      }

      const ingredientsList = ingredientsString 
        ? ingredientsString.split(',').map(i => i.trim()).filter(Boolean) 
        : [];

      return {
        name: name || 'Custom Pantry Recipe',
        time: time || '15 mins',
        ingredients: ingredientsList,
        steps: steps.length > 0 ? steps : ['Cook ingredients together and serve hot.']
      };
    } catch (e) {
      console.log('Error parsing recipe text:', e);
      return null;
    }
  };

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
        setParsedRecipe(null);
        return;
      }

      const aiRecipe = await generateRecipe(items);
      setRecipe(aiRecipe);
      setParsedRecipe(parseRecipeText(aiRecipe));
    } catch (error: any) {
      console.error(error);
      setRecipe(error?.message || 'Failed to generate recipe.');
      setParsedRecipe(null);
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
      setParsedRecipe(parseRecipeText(aiRecipe));
    } catch (error: any) {
      console.error(error);
      setRecipe('Failed to generate surprise recipe.');
      setParsedRecipe(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecipes();
  }, []);

  return (
    <LinearGradient colors={['#090D1A', '#0F1626', '#172033']} style={{ flex: 1 }}>
      <ScrollView style={styles.container} testID="recipes-screen" showsVerticalScrollIndicator={false}>
        {/* Chef Avatar Icon Badge */}
        <View style={styles.avatarContainer}>
          <LinearGradient colors={['#3B82F6', '#8B5CF6']} style={styles.glowBadge}>
            <Ionicons name="restaurant" size={32} color="white" />
          </LinearGradient>
          <Text style={styles.title}>AI Chef Console</Text>
          <Text style={styles.subtitle}>Curates gourmet culinary recipes from your stock</Text>
        </View>

        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#6366F1" />
            <Text style={styles.loadingText}>Generating recipes...</Text>
          </View>
        ) : (
          <View testID="recipe-container" style={styles.contentContainer}>
            {parsedRecipe ? (
              <View style={styles.recipeCard}>
                {/* Recipe Header info */}
                <View style={styles.recipeHeaderCard}>
                  <Text style={styles.recipeName}>{parsedRecipe.name}</Text>
                  <View style={styles.timeBadge}>
                    <Ionicons name="time-outline" size={16} color="#818CF8" />
                    <Text style={styles.timeText}>{parsedRecipe.time}</Text>
                  </View>
                </View>

                {/* Ingredients tag list */}
                {parsedRecipe.ingredients.length > 0 && (
                  <View style={styles.sectionCard}>
                    <Text style={styles.sectionTitle}>
                      <Ionicons name="nutrition-outline" size={18} color="#10B981" /> Ingredients Needed
                    </Text>
                    <View style={styles.tagContainer}>
                      {parsedRecipe.ingredients.map((ing, idx) => (
                        <View key={idx} style={styles.tagChip}>
                          <Text style={styles.tagText}>{ing}</Text>
                        </View>
                      ))}
                    </View>
                  </View>
                )}

                {/* Preparation steps timeline list */}
                <View style={styles.sectionCard}>
                  <Text style={styles.sectionTitle}>
                    <Ionicons name="list-outline" size={18} color="#F59E0B" /> Preparation Steps
                  </Text>
                  {parsedRecipe.steps.map((step, idx) => (
                    <View key={idx} style={styles.stepRow}>
                      <View style={styles.stepNumberBadge}>
                        <Text style={styles.stepNumberText}>{idx + 1}</Text>
                      </View>
                      <Text style={styles.stepText}>{step}</Text>
                    </View>
                  ))}
                </View>
              </View>
            ) : (
              // Fallback default view
              <View style={styles.fallbackBox}>
                <Text style={styles.recipeText} testID="recipe-content-text">
                  {recipe}
                </Text>
              </View>
            )}

            {/* Premium Action Button */}
            <TouchableOpacity
              testID="surprise-me-button"
              style={styles.surpriseButton}
              onPress={surpriseMe}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['#F59E0B', '#D97706']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.btnGradient}
              >
                <Ionicons name="shuffle" size={20} color="white" />
                <Text style={styles.buttonText}>Surprise Me</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity style={styles.reloadBtn} onPress={loadItems => loadRecipes()}>
              <Ionicons name="refresh" size={16} color="#94A3B8" />
              <Text style={styles.reloadText}>Regenerate Recipe</Text>
            </TouchableOpacity>
          </View>
        )}
        <View style={{ height: 60 }} />
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 20 },
  avatarContainer: { alignItems: 'center', marginTop: 50, marginBottom: 25 },
  glowBadge: {
    width: 64,
    height: 64,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    shadowColor: '#8B5CF6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 8
  },
  title: { fontSize: 26, fontWeight: 'bold', color: 'white', letterSpacing: 0.5 },
  subtitle: { fontSize: 13, color: '#94A3B8', marginTop: 6, textAlign: 'center', paddingHorizontal: 20 },
  loadingContainer: { alignItems: 'center', marginTop: 80 },
  loadingText: { color: '#94A3B8', fontSize: 15, marginTop: 15 },
  contentContainer: { spaceY: 20 },
  recipeCard: { gap: 15 },
  recipeHeaderCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    gap: 12
  },
  recipeName: { fontSize: 22, fontWeight: 'bold', color: 'white', lineHeight: 28 },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(99, 102, 241, 0.1)',
    alignSelf: 'flex-start',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(99, 102, 241, 0.15)',
    gap: 6
  },
  timeText: { color: '#818CF8', fontSize: 12, fontWeight: '600' },
  sectionCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)'
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: 'white', marginBottom: 15, flexDirection: 'row', alignItems: 'center', gap: 8 },
  tagContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  tagChip: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.15)',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 10
  },
  tagText: { color: '#10B981', fontSize: 13, fontWeight: '600' },
  stepRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 15 },
  stepNumberBadge: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(245, 158, 11, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2
  },
  stepNumberText: { color: '#F59E0B', fontSize: 12, fontWeight: 'bold' },
  stepText: { flex: 1, color: '#D1D5DB', fontSize: 14, lineHeight: 22 },
  fallbackBox: {
    backgroundColor: 'rgba(255,255,255,0.05)',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.1)'
  },
  recipeText: { fontSize: 15, lineHeight: 26, color: '#D1D5DB' },
  surpriseButton: { borderRadius: 16, overflow: 'hidden', marginTop: 25 },
  btnGradient: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 16,
    gap: 8
  },
  buttonText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  reloadBtn: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 15,
    gap: 6
  },
  reloadText: { color: '#94A3B8', fontSize: 14 }
});
