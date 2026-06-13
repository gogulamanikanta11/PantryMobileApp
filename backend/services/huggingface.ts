export const generateRecipe = async (ingredients: string[]): Promise<string> => {
  const items = ingredients.map(item => item.toLowerCase());
  if(items.includes("rice") && items.includes("egg")){
    return `🍳 Egg Fried Rice\n\nIngredients:\n• Rice\n• Egg\n\nInstructions:\n1. Cook rice.\n2. Fry egg.\n3. Mix rice and egg.\n4. Serve hot.`;
  }
  if(items.includes("milk") && items.includes("banana")){
    return `🥤 Banana Milkshake\n\nIngredients:\n• Milk\n• Banana\n\nInstructions:\n1. Add milk and banana to blender.\n2. Blend for 1 minute.\n3. Serve chilled.`;
  }
  if(items.includes("bread") && items.includes("egg")){
    return `🥪 Egg Sandwich\n\nIngredients:\n• Bread\n• Egg\n\nInstructions:\n1. Toast bread.\n2. Cook egg.\n3. Place egg between bread slices.\n4. Serve hot.`;
  }
  return `👨‍🍳 Smart Pantry Recipe\n\nAvailable Ingredients:\n${ingredients.join(", ")}\n\nSuggested Dish:\nMixed Vegetable Stir Fry\n\nInstructions:\n1. Chop all ingredients.\n2. Heat oil in a pan.\n3. Add vegetables.\n4. Cook for 10 minutes.\n5. Serve fresh.`;
};
