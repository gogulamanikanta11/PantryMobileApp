export const generateRecipe = async (
  ingredients: string[]
): Promise<string> => {

  const items = ingredients.map(
    item => item.toLowerCase()
  );

  if(
    items.includes("rice") &&
    items.includes("egg")
  ){

    return `
🍳 Egg Fried Rice

Ingredients:
• Rice
• Egg

Instructions:
1. Cook rice.
2. Fry egg.
3. Mix rice and egg.
4. Serve hot.
`;
  }

  if(
    items.includes("milk") &&
    items.includes("banana")
  ){

    return `
🥤 Banana Milkshake

Ingredients:
• Milk
• Banana

Instructions:
1. Add milk and banana to blender.
2. Blend for 1 minute.
3. Serve chilled.
`;
  }

  if(
    items.includes("bread") &&
    items.includes("egg")
  ){

    return `
🥪 Egg Sandwich

Ingredients:
• Bread
• Egg

Instructions:
1. Toast bread.
2. Cook egg.
3. Place egg between bread slices.
4. Serve hot.
`;
  }

  return `
👨‍🍳 Smart Pantry Recipe

Available Ingredients:
${ingredients.join(", ")}

Suggested Dish:
Mixed Vegetable Stir Fry

Instructions:
1. Chop all ingredients.
2. Heat oil in a pan.
3. Add vegetables.
4. Cook for 10 minutes.
5. Serve fresh.
`;
};