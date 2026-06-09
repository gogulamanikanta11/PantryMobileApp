import axios from "axios";

const API_KEY = "YOUR_OPENROUTER_API_KEY";
export const generateRecipe = async (
  ingredients: string[]
): Promise<string> => {

  try {

    const response = await axios.post(
      "https://openrouter.ai/api/v1/chat/completions",
      {
        model: "openai/gpt-3.5-turbo",

        messages: [
          {
            role: "system",
            content:
              "You are a professional chef. Create recipes from pantry ingredients."
          },
          {
            role: "user",
            content: `
Ingredients:
${ingredients.join(", ")}

Generate:
1. Recipe Name
2. Preparation Time
3. Ingredients Used
4. Step-by-step Instructions
`
          }
        ]
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    return response.data.choices[0].message.content;

  } catch (error: any) {

    console.log(
      "OPENROUTER ERROR:",
      error?.response?.data || error?.message
    );

    return JSON.stringify(
      error?.response?.data ||
      error?.message
    );
  }
};