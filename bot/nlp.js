/**
 * Natural Language Processing for expense parsing
 * Converts casual messages into expense data
 */

// Regex patterns for parsing expenses
const patterns = {
  // "spent $20 on groceries" or "i spent 20 on food"
  spent: /(?:spent|paid|bought|spent money)\s*(?:on\s+)?(?:\$)?(\d+(?:\.\d{2})?)\s*(?:on|for)?\s+([a-z\s]+?)(?:\s+(?:today|yesterday|on))?$/i,

  // "$20 groceries" or "20 food"
  amount_category: /(?:\$)?(\d+(?:\.\d{2})?)\s+([a-z\s]+?)$/i,

  // "groceries: $20" or "groceries 20"
  category_amount: /([a-z\s]+?)\s*:\s*(?:\$)?(\d+(?:\.\d{2})?)$/i,
};

// Category mapping - what categories things belong to
const categoryMapping = {
  // Groceries
  groceries: ['grocery', 'groceries', 'food', 'supermarket', 'market', 'shopping', 'fruits', 'vegetables', 'milk', 'bread', 'eggs'],

  // Transportation
  transportation: ['taxi', 'uber', 'car', 'gas', 'fuel', 'parking', 'bus', 'metro', 'train', 'ride', 'delivery', 'transport'],

  // Entertainment
  entertainment: ['movie', 'cinema', 'netflix', 'gaming', 'game', 'fun', 'entertainment', 'music', 'concert', 'party'],

  // Utilities
  utilities: ['electricity', 'water', 'gas', 'internet', 'phone', 'utility', 'bill', 'subscription'],

  // Healthcare
  healthcare: ['medicine', 'doctor', 'hospital', 'health', 'pharmacy', 'medical', 'dental', 'health care'],

  // Education
  education: ['school', 'course', 'education', 'book', 'learning', 'class', 'tuition'],

  // Clothing
  clothing: ['clothes', 'shirt', 'pants', 'shoes', 'dress', 'clothing', 'apparel', 'fashion'],
};

// Find category from keywords
function findCategory(text) {
  const lowerText = text.toLowerCase().trim();

  for (const [category, keywords] of Object.entries(categoryMapping)) {
    for (const keyword of keywords) {
      if (lowerText.includes(keyword)) {
        return category.charAt(0).toUpperCase() + category.slice(1);
      }
    }
  }

  // Default category
  return 'Other';
}

// Parse a casual message into expense data
function parseExpense(message) {
  const msg = message.trim();

  // Try different patterns
  for (const [patternName, regex] of Object.entries(patterns)) {
    const match = msg.match(regex);

    if (match) {
      if (patternName === 'spent') {
        const amount = parseFloat(match[1]);
        const categoryText = match[2];
        const category = findCategory(categoryText);

        return {
          amount,
          category,
          description: categoryText.trim(),
          success: true,
          message: `Got it! Added $${amount.toFixed(2)} for ${category.toLowerCase()}: "${categoryText.trim()}"`
        };
      }

      if (patternName === 'amount_category' || patternName === 'category_amount') {
        const amount = parseFloat(patternName === 'amount_category' ? match[1] : match[2]);
        const categoryText = patternName === 'amount_category' ? match[2] : match[1];
        const category = findCategory(categoryText);

        return {
          amount,
          category,
          description: categoryText.trim(),
          success: true,
          message: `Got it! Added $${amount.toFixed(2)} for ${category.toLowerCase()}: "${categoryText.trim()}"`
        };
      }
    }
  }

  return {
    success: false,
    message: `I didn't quite catch that. Try saying something like:\n- "spent $20 on groceries"\n- "20 taxi"\n- "utilities: 50"`
  };
}

// Generate budget summary text
function generateBudgetSummary(state, month) {
  const monthExpenses = state.expenses.filter(e => e.date.startsWith(month));
  const monthBudgets = state.budgets.filter(b => b.month === month);

  let summary = `📊 Budget Summary for ${month}\n\n`;

  let totalSpent = 0;
  let totalBudget = 0;

  const categories = Array.from(new Set([
    ...monthBudgets.map(b => b.category),
    ...monthExpenses.map(e => e.category),
  ]));

  if (categories.length === 0) {
    return `No expenses yet for ${month}`;
  }

  for (const category of categories.sort()) {
    const budget = monthBudgets.find(b => b.category === category);
    const limit = budget?.limit || 0;
    const spent = monthExpenses
      .filter(e => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);

    totalSpent += spent;
    totalBudget += limit;

    const percentage = limit > 0 ? Math.round((spent / limit) * 100) : 0;
    const statusEmoji = spent > limit ? '🔴' : spent > limit * 0.8 ? '🟡' : '🟢';

    summary += `${statusEmoji} ${category}\n`;
    summary += `   Spent: $${spent.toFixed(2)} / $${limit.toFixed(2)}\n`;

    if (limit > 0) {
      summary += `   Progress: ${percentage}%\n`;
    }
    summary += `\n`;
  }

  summary += `\n💰 TOTAL\n`;
  summary += `Spent: $${totalSpent.toFixed(2)} / $${totalBudget.toFixed(2)}`;

  if (totalSpent > totalBudget) {
    summary += ` ⚠️ Over budget!`;
  }

  return summary;
}

module.exports = {
  parseExpense,
  generateBudgetSummary,
  findCategory
};
