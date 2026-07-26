import axios from "axios";
import Constants from "expo-constants";

const expoExtra = (Constants as any)?.expoConfig?.extra || (Constants as any)?.manifest?.extra;
const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || process.env.OPENROUTER_API_KEY || expoExtra?.openRouterApiKey;
const MISSING_API_KEY = !API_KEY || API_KEY === "YOUR_OPENROUTER_API_KEY";

const generateMockRecipe = (ingredients: string[]): string => {
  // Find surprise prompt if any
  const prompt = ingredients.find(x => typeof x === 'string' && x.includes('Suggest')) || '';
  const lowerPrompt = prompt.toLowerCase();

  const list = ingredients.filter(x => typeof x === 'string' && x.trim().length > 0 && !x.includes('Suggest') && !x.includes('recipe'));
  const cleanList = list.length > 0 ? list : ['Rice', 'Tomatoes', 'Onions', 'Spices'];
  const lowerIngs = cleanList.map(i => i.toLowerCase());

  let recipeName = "Pantry Special Stir-Fry";
  let time = "15 mins";
  let steps = [
    "Clean and chop the available ingredients into bite-sized pieces.",
    "Heat 1 tbsp of oil in a pan over medium heat.",
    "Add spices and onions, sautéing until fragrant and translucent.",
    "Toss in the remaining ingredients and stir-fry for 8-10 minutes.",
    "Season with salt and pepper to taste, and serve hot!"
  ];

  // Determine recipe type based on prompt first, then fallback to ingredients
  let selectedType = '';
  if (lowerPrompt.includes('curry')) {
    selectedType = 'curry';
  } else if (lowerPrompt.includes('rice')) {
    selectedType = 'rice';
  } else if (lowerPrompt.includes('healthiest')) {
    selectedType = 'healthy';
  } else if (lowerPrompt.includes('snack')) {
    selectedType = 'snack';
  } else if (lowerPrompt.includes('surprise') || lowerPrompt.includes('unique')) {
    // Pick a random type
    const types = ['egg', 'curry', 'rice', 'potato', 'stirfry', 'healthy', 'snack'];
    selectedType = types[Math.floor(Math.random() * types.length)];
  }

  // If not selected by prompt, match by ingredients
  if (!selectedType) {
    if (lowerIngs.some(i => i.includes('egg'))) selectedType = 'egg';
    else if (lowerIngs.some(i => i.includes('chicken') || i.includes('meat'))) selectedType = 'curry';
    else if (lowerIngs.some(i => i.includes('rice'))) selectedType = 'rice';
    else if (lowerIngs.some(i => i.includes('potato') || i.includes('potatoe'))) selectedType = 'potato';
    else if (lowerIngs.some(i => i.includes('tomato'))) selectedType = 'tomato';
  }

  // Apply recipe details
  if (selectedType === 'egg') {
    recipeName = "🍳 Fluffy Egg Scramble";
    time = "10 mins";
    steps = [
      "Whisk eggs in a bowl with a pinch of salt and pepper.",
      "Chop onions, tomatoes, and other available ingredients.",
      "Sauté veggies in a pan with butter/oil for 3 minutes.",
      "Pour in the whisked eggs and stir gently over low heat until cooked.",
      "Garnish with herbs and serve with toasted bread."
    ];
  } else if (selectedType === 'curry') {
    recipeName = "🍗 Savory Pantry Chicken Curry";
    time = "35 mins";
    steps = [
      "Dice the chicken/meat and season with salt, turmeric, and chili powder.",
      "Chop onions and tomatoes.",
      "Sauté onions, ginger, and garlic in oil until golden brown.",
      "Add tomatoes and cook until soft, then stir in the chicken pieces.",
      "Pour in 1/2 cup of water, cover, and simmer for 20-25 minutes until cooked.",
      "Serve hot with rice or bread."
    ];
  } else if (selectedType === 'rice') {
    recipeName = "🍚 Golden Vegetable Fried Rice";
    time = "20 mins";
    steps = [
      "Rinse and cook the rice (or use leftover chilled rice).",
      "Dice all available vegetables (onions, tomatoes, carrots, etc.).",
      "Heat oil in a wok or large pan and sauté onions and garlic.",
      "Add vegetables and stir-fry on high heat for 5 minutes.",
      "Mix in the cooked rice, add soy sauce or seasoning, and toss well.",
      "Garnish with green onions and serve hot."
    ];
  } else if (selectedType === 'potato') {
    recipeName = "🥔 Crispy Herbed Roasted Potatoes";
    time = "25 mins";
    steps = [
      "Wash and cube the potatoes into equal-sized pieces.",
      "Toss with oil, salt, garlic powder, and any available herbs.",
      "Spread in a single layer on a pan or baking sheet.",
      "Roast/pan-fry until golden brown and crispy on all sides.",
      "Serve as a delicious side dish or snack."
    ];
  } else if (selectedType === 'tomato') {
    recipeName = "🍅 Fresh Tomato & Herb Salad";
    time = "12 mins";
    steps = [
      "Chop tomatoes and onions into fine pieces.",
      "Mix with fresh coriander, a splash of lemon juice, and olive oil.",
      "Season with salt and ground black pepper.",
      "Serve immediately as a refreshing salad."
    ];
  } else if (selectedType === 'healthy') {
    recipeName = "🥗 Ultimate Healthy Kitchen Bowl";
    time = "15 mins";
    steps = [
      "Wash and prep all leafy greens and vegetables in your pantry list.",
      "Lightly steam any root vegetables like potatoes or carrots.",
      "Mix all ingredients in a bowl with a dash of olive oil and lemon juice.",
      "Toss with a handful of seeds, salt, and pepper.",
      "Enjoy as a fresh, low-calorie meal!"
    ];
  } else if (selectedType === 'snack') {
    recipeName = "🍿 Easy Pantry Crisps / Bites";
    time = "8 mins";
    steps = [
      "Prepare your dry ingredients and snacks.",
      "Heat a pan and toast any nuts or grains.",
      "Season with chili powder, salt, and a pinch of sugar.",
      "Serve immediately as a crunchy snack alongside tea or coffee."
    ];
  }

  return `🍽 **Recipe Name:** ${recipeName}
⏱ **Cooking Time:** ${time}
🥕 **Ingredients Used:** ${cleanList.join(', ')}

👨‍🍳 **Step-by-Step Instructions:**
${steps.map((s, idx) => `${idx + 1}. ${s}`).join('\n')}

_💡 Tip: You can customize this recipe by adding any other available spices or toppings!_`;
};


export const generateRecipe = async (ingredients: string[]): Promise<string> => {
  if (MISSING_API_KEY) {
    console.warn("OPENROUTER WARNING: Missing API key. Using local AI Chef mock recipe generator.");
    return generateMockRecipe(ingredients);
  }


  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional chef who suggests recipes using pantry ingredients." },
          { role: "user", content: `Available Pantry Ingredients: ${ingredients.join(", ")}. Suggest 5 recipes that can be prepared using these ingredients. For each recipe provide: 🍽 Recipe Name, ⏱ Cooking Time, 🥕 Ingredients Used, 👨‍🍳 Step-by-Step Instructions. Prefer: Curries, Indian Recipes, Rice Dishes, Snacks. Format nicely with emojis.` }
        ]
      },
      { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" } }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.log("OPENROUTER ERROR:", error?.response?.data || error?.message);
    return error?.response?.data?.error?.message || error?.message || "Failed to generate recipe.";
  }
};

export const generateMealPlan = async (ingredients: string[]): Promise<string> => {
  if (MISSING_API_KEY) {
    const mockPlans = {
      Mon: { breakfast: "🍳 Fried Eggs & Toast", lunch: "🥗 Tomato Salad Bowl", dinner: "🍚 Golden Vegetable Fried Rice" },
      Tue: { breakfast: "🥞 Pancake Bites", lunch: "🍗 Savory Chicken Curry", dinner: "🥔 Crispy Roasted Potatoes" },
      Wed: { breakfast: "🥣 Oatmeal Porridge", lunch: "🥪 Egg & Cheese Sandwich", dinner: "🍛 Pantry Veggie Curry" },
      Thu: { breakfast: "🥑 Avocado Slices on Toast", lunch: "🍚 Golden Vegetable Fried Rice", dinner: "🍗 Savory Pantry Chicken Curry" },
      Fri: { breakfast: "🍳 Fluffy Egg Scramble", lunch: "🥗 Fresh Tomato Salad", dinner: "🥔 Herbed Roasted Potatoes" },
      Sat: { breakfast: "🥞 Golden Waffles", lunch: "🍗 Chicken Curry Rice", dinner: "🍲 Chef's Pantry Stew" },
      Sun: { breakfast: "🍌 Fruit Bowl & Oats", lunch: "🍛 Vegetable Curry Mix", dinner: "🍳 Baked Frittata Slice" }
    };
    return JSON.stringify(mockPlans);
  }

  try {
    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",
        messages: [
          { role: "system", content: "You are a professional chef. You output a valid JSON block containing meal plans for Mon, Tue, Wed, Thu, Fri, Sat, Sun. Each day has: breakfast, lunch, dinner." },
          { role: "user", content: `Pantry stock: ${ingredients.join(", ")}. Return only a JSON object matching this schema: { "Mon": { "breakfast": "string", "lunch": "string", "dinner": "string" }, ... } without markdown formatting.` }
        ]
      },
      { headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" } }
    );
    return response.data.choices[0].message.content;
  } catch (error: any) {
    console.log("OPENROUTER ERROR:", error?.response?.data || error?.message);
    throw error;
  }
};

