import axios from "axios";

const API_KEY = process.env.EXPO_PUBLIC_OPENROUTER_API_KEY || "YOUR_OPENROUTER_API_KEY";

export const generateRecipe = async (ingredients: string[]): Promise<string> => {
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
