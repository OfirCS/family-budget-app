/**
 * Smart NLP for expense parsing with AI-powered categorization
 * Converts casual messages into expense data with intelligent category detection
 */

// Comprehensive category mapping with extensive keywords
const categoryMapping = {
  Groceries: [
    'grocery', 'groceries', 'food', 'supermarket', 'market', 'store',
    'fruits', 'vegetables', 'veggies', 'fruit', 'veggie', 'produce',
    'milk', 'bread', 'eggs', 'meat', 'chicken', 'fish', 'cheese',
    'yogurt', 'butter', 'coffee', 'tea', 'snacks', 'drinks', 'juice',
    'walmart', 'costco', 'whole foods', 'trader joes', 'safeway',
    'kroger', 'publix', 'aldi', 'target', 'fresh', 'organic',
    'breakfast', 'lunch', 'dinner', 'meal', 'cooking', 'baking',
    'restaurant', 'takeout', 'delivery', 'pizza', 'burger', 'sushi'
  ],

  Transportation: [
    'taxi', 'uber', 'lyft', 'cab', 'ride', 'rideshare',
    'car', 'gas', 'fuel', 'gasoline', 'petrol', 'station',
    'parking', 'toll', 'parking meter', 'garage',
    'bus', 'metro', 'subway', 'train', 'transit', 'public transport',
    'car wash', 'oil change', 'auto', 'vehicle', 'maintenance',
    'repair', 'mechanic', 'tire', 'tires', 'battery',
    'insurance', 'registration', 'dmv', 'license'
  ],

  Entertainment: [
    'movie', 'movies', 'cinema', 'theater', 'film',
    'netflix', 'hulu', 'disney', 'spotify', 'apple music', 'youtube',
    'gaming', 'game', 'games', 'playstation', 'xbox', 'nintendo',
    'fun', 'entertainment', 'leisure', 'hobby',
    'music', 'concert', 'show', 'festival', 'event',
    'party', 'celebration', 'birthday', 'gift', 'present',
    'vacation', 'travel', 'trip', 'hotel', 'airbnb',
    'museum', 'zoo', 'amusement park', 'theme park',
    'bar', 'club', 'nightlife', 'drinks', 'alcohol', 'beer', 'wine'
  ],

  Utilities: [
    'electricity', 'electric', 'power', 'hydro',
    'water', 'water bill', 'sewage', 'trash', 'garbage',
    'gas bill', 'heating', 'cooling', 'hvac',
    'internet', 'wifi', 'broadband', 'isp', 'comcast', 'verizon',
    'phone', 'cell phone', 'mobile', 'phone bill', 'at&t', 't-mobile',
    'utility', 'utilities', 'bill', 'bills', 'monthly bill',
    'subscription', 'membership', 'service', 'streaming'
  ],

  Healthcare: [
    'medicine', 'medication', 'prescription', 'pharmacy', 'drug store',
    'doctor', 'physician', 'medical', 'clinic', 'hospital',
    'health', 'healthcare', 'health insurance', 'insurance',
    'dental', 'dentist', 'teeth', 'orthodontist',
    'vision', 'eye', 'glasses', 'contacts', 'optometry',
    'therapy', 'counseling', 'mental health', 'psychiatrist',
    'vaccine', 'vaccination', 'checkup', 'appointment',
    'emergency', 'urgent care', 'copay', 'deductible'
  ],

  Education: [
    'school', 'college', 'university', 'tuition', 'fees',
    'course', 'class', 'lesson', 'workshop', 'seminar',
    'education', 'learning', 'training', 'certification',
    'book', 'books', 'textbook', 'study', 'supplies',
    'student', 'academic', 'diploma', 'degree',
    'tutoring', 'tutor', 'teaching', 'instructor'
  ],

  Clothing: [
    'clothes', 'clothing', 'apparel', 'fashion', 'outfit',
    'shirt', 'shirts', 't-shirt', 'blouse', 'top',
    'pants', 'jeans', 'trousers', 'shorts', 'skirt',
    'dress', 'dresses', 'gown', 'suit',
    'shoes', 'sneakers', 'boots', 'sandals', 'footwear',
    'jacket', 'coat', 'sweater', 'hoodie', 'cardigan',
    'underwear', 'socks', 'accessories', 'belt', 'hat',
    'shopping', 'mall', 'boutique', 'store', 'retail'
  ],

  Shopping: [
    'shopping', 'purchase', 'buy', 'bought', 'store',
    'amazon', 'ebay', 'online', 'shopping',
    'home', 'furniture', 'decor', 'ikea', 'bed bath',
    'electronics', 'tech', 'gadget', 'computer', 'phone',
    'appliance', 'kitchen', 'bathroom', 'household',
    'supplies', 'items', 'stuff', 'things'
  ],

  Personal: [
    'haircut', 'hair', 'salon', 'barber', 'beauty',
    'spa', 'massage', 'nail', 'manicure', 'pedicure',
    'makeup', 'cosmetics', 'skincare', 'toiletries',
    'gym', 'fitness', 'workout', 'exercise', 'yoga',
    'personal', 'grooming', 'hygiene', 'care'
  ],

  Pets: [
    'pet', 'pets', 'dog', 'cat', 'puppy', 'kitten',
    'vet', 'veterinary', 'animal', 'pet food', 'pet store',
    'grooming', 'pet supplies', 'pet care'
  ],

  Home: [
    'rent', 'mortgage', 'housing', 'lease',
    'home', 'house', 'apartment', 'condo',
    'repair', 'maintenance', 'fix', 'handyman',
    'cleaning', 'cleaner', 'maid', 'housekeeping',
    'lawn', 'garden', 'landscaping', 'yard'
  ]
};

// Regex patterns for parsing expenses
const patterns = {
  // "spent $20 on groceries" or "i spent 20 on food"
  spent: /(?:spent|paid|bought|got|purchased)\s*(?:\$)?(\d+(?:\.\d{2})?)\s*(?:on|for|at)?\s+(.+?)(?:\s+(?:today|yesterday))?$/i,

  // "$20 groceries" or "20 food"
  amount_category: /^\$?(\d+(?:\.\d{2})?)\s+(.+)$/i,

  // "groceries: $20" or "groceries 20"
  category_amount: /^(.+?)\s*:?\s*\$?(\d+(?:\.\d{2})?)$/i,
};

// Smart category detection with scoring
function findCategory(text) {
  const lowerText = text.toLowerCase().trim();

  // Remove common words that don't help with categorization
  const cleanText = lowerText.replace(/\b(the|a|an|and|or|at|on|for|to|in)\b/g, '').trim();

  let bestMatch = null;
  let bestScore = 0;

  for (const [category, keywords] of Object.entries(categoryMapping)) {
    let score = 0;

    for (const keyword of keywords) {
      // Exact match gets highest score
      if (cleanText === keyword) {
        score += 100;
      }
      // Word contains keyword
      else if (cleanText.includes(keyword)) {
        score += 50;
      }
      // Individual words match
      else if (cleanText.split(' ').some(word => word === keyword)) {
        score += 30;
      }
      // Partial match
      else if (keyword.includes(cleanText) && cleanText.length > 2) {
        score += 20;
      }
    }

    if (score > bestScore) {
      bestScore = score;
      bestMatch = category;
    }
  }

  // If we found a good match, return it
  if (bestScore > 15) {
    return bestMatch;
  }

  // Smart defaults based on common patterns
  if (lowerText.match(/\b(ate|eat|eating|meal|dish|cuisine)\b/)) return 'Groceries';
  if (lowerText.match(/\b(drove|drive|driving|commute)\b/)) return 'Transportation';
  if (lowerText.match(/\b(watched|watch|streamed|stream)\b/)) return 'Entertainment';
  if (lowerText.match(/\b(paid|bill|monthly)\b/)) return 'Utilities';

  // Last resort: use Shopping for purchases, Groceries for everything else
  if (lowerText.match(/\b(bought|purchase|ordered|shopping)\b/)) return 'Shopping';

  return 'Groceries'; // Better default than "Other"
}

// Parse a casual message into expense data
function parseExpense(message) {
  const msg = message.trim();

  // Try different patterns
  for (const [patternName, regex] of Object.entries(patterns)) {
    const match = msg.match(regex);

    if (match) {
      let amount, categoryText;

      if (patternName === 'spent') {
        amount = parseFloat(match[1]);
        categoryText = match[2];
      } else if (patternName === 'amount_category') {
        amount = parseFloat(match[1]);
        categoryText = match[2];
      } else if (patternName === 'category_amount') {
        categoryText = match[1];
        amount = parseFloat(match[2]);
      }

      // Validate amount
      if (isNaN(amount) || amount <= 0 || amount > 100000) {
        continue; // Try next pattern
      }

      const category = findCategory(categoryText);

      return {
        amount,
        category,
        description: categoryText.trim(),
        success: true,
        message: `✅ Added $${amount.toFixed(2)} to ${category}\n📝 ${categoryText.trim()}`
      };
    }
  }

  return {
    success: false,
    message: `🤔 I didn't quite understand that.\n\nTry:\n• "spent $20 on groceries"\n• "50 gas"\n• "coffee 5"\n• "uber: 15"`
  };
}

// Generate beautiful budget summary
function generateBudgetSummary(state, month) {
  const monthExpenses = state.expenses.filter(e => e.date.startsWith(month));
  const monthBudgets = state.budgets.filter(b => b.month === month);

  if (monthExpenses.length === 0) {
    return `📊 *Budget Summary*\n\nNo expenses yet for ${month}\n\n💡 Start tracking by texting:\n"spent $50 on groceries"`;
  }

  let summary = `📊 *BUDGET SUMMARY*\n_${month}_\n\n`;

  let totalSpent = 0;
  let totalBudget = 0;

  const categories = Array.from(new Set([
    ...monthBudgets.map(b => b.category),
    ...monthExpenses.map(e => e.category),
  ]));

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

    // Progress bar
    const barLength = 10;
    const filled = limit > 0 ? Math.min(Math.round((spent / limit) * barLength), barLength) : 0;
    const bar = '█'.repeat(filled) + '░'.repeat(barLength - filled);

    summary += `${statusEmoji} *${category}*\n`;
    summary += `   $${spent.toFixed(2)}`;
    if (limit > 0) {
      summary += ` / $${limit.toFixed(2)} (${percentage}%)`;
    }
    summary += `\n   ${bar}\n\n`;
  }

  const totalPercentage = totalBudget > 0 ? Math.round((totalSpent / totalBudget) * 100) : 0;

  summary += `💰 *TOTAL*\n`;
  summary += `   $${totalSpent.toFixed(2)}`;
  if (totalBudget > 0) {
    summary += ` / $${totalBudget.toFixed(2)} (${totalPercentage}%)`;
  }

  if (totalSpent > totalBudget) {
    summary += `\n\n⚠️ Over budget by $${(totalSpent - totalBudget).toFixed(2)}`;
  } else if (totalBudget > 0) {
    summary += `\n\n✅ $${(totalBudget - totalSpent).toFixed(2)} remaining`;
  }

  return summary;
}

module.exports = {
  parseExpense,
  generateBudgetSummary,
  findCategory,
  categoryMapping
};
