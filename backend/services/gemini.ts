import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = "YOUR_GEMINI_API_KEY";
const genAI = new GoogleGenerativeAI(API_KEY);

export const generateRecipe = async (ingredients: string[]): Promise<string> => {
  try {
    if (ingredients.length === 0) return "No ingredients found in pantry.";
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const prompt = `You are a professional chef. Create 3 recipes using these ingredients: ${ingredients.join(", ")}. For each recipe provide: Recipe Name, Ingredients Used, Instructions. Keep the answer short.`;
    const result = await model.generateContent(prompt);
    return result.response.text() || "No recipe generated.";
  } catch (error: any) {
    console.log("GEMINI ERROR:", error);
    return `Gemini Error: ${error?.message || JSON.stringify(error)}`;
  }
};
