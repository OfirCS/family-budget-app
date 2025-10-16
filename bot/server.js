const express = require('express');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');
const { parseExpense, generateBudgetSummary } = require('./nlp');
const { generateDetailedReport, generateQuickStats, getAlerts, getTopCategories, getTopSpenders } = require('./analytics');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataFile = path.join(__dirname, '../bot-data.json');

// === CONFIGURATION ===
const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;
const claudeApiKey = process.env.ANTHROPIC_API_KEY;

// Whitelist - Only these phone numbers can use the bot
const ALLOWED_NUMBERS = (process.env.ALLOWED_PHONE_NUMBERS || '').split(',').map(n => n.trim()).filter(n => n);

let twilioClient = null;
if (accountSid && authToken && authToken !== 'your_auth_token') {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio WhatsApp bot connected!');
  console.log('🔒 Authenticated users:', ALLOWED_NUMBERS.length > 0 ? ALLOWED_NUMBERS.length : 'NONE (open access)');
}

// === DATA MANAGEMENT ===
function loadData() {
  if (fs.existsSync(dataFile)) {
    try {
      return JSON.parse(fs.readFileSync(dataFile, 'utf8'));
    } catch (e) {
      console.error('Error reading data file:', e);
    }
  }
  return {
    users: [
      { id: '1', name: 'You', color: '#FF6B6B' },
      { id: '2', name: 'Wife', color: '#4ECDC4' },
    ],
    expenses: [],
    budgets: [
      { id: '1', category: 'Groceries', limit: 500, month: new Date().toISOString().slice(0, 7) },
      { id: '2', category: 'Transportation', limit: 200, month: new Date().toISOString().slice(0, 7) },
      { id: '3', category: 'Entertainment', limit: 150, month: new Date().toISOString().slice(0, 7) },
      { id: '4', category: 'Utilities', limit: 300, month: new Date().toISOString().slice(0, 7) },
    ],
    subscriptions: [],
    savingsGoals: [],
    selectedUserId: '1',
    selectedMonth: new Date().toISOString().slice(0, 7),
    phoneNumberMapping: {}, // Maps phone numbers to user IDs
    settings: {
      categories: ['Groceries', 'Transportation', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Clothing', 'Shopping', 'Personal', 'Pets', 'Home'],
      currency: 'USD',
      onboardingCompleted: {}  // Maps phone numbers to onboarding status
    }
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

// === AUTHENTICATION ===
function isAuthorized(phoneNumber) {
  if (ALLOWED_NUMBERS.length === 0) {
    return true; // No restrictions if whitelist is empty
  }
  return ALLOWED_NUMBERS.includes(phoneNumber);
}

function getUserIdForPhoneNumber(data, phoneNumber) {
  // If mapping exists, return it
  if (data.phoneNumberMapping && data.phoneNumberMapping[phoneNumber]) {
    return data.phoneNumberMapping[phoneNumber];
  }

  // Otherwise, assign based on order
  if (!data.phoneNumberMapping) {
    data.phoneNumberMapping = {};
  }

  const existingMappings = Object.values(data.phoneNumberMapping);
  const availableUsers = data.users.filter(u => !existingMappings.includes(u.id));

  if (availableUsers.length > 0) {
    data.phoneNumberMapping[phoneNumber] = availableUsers[0].id;
    saveData(data);
    return availableUsers[0].id;
  }

  // Default to first user
  return data.users[0].id;
}

// === CLAUDE AI INTEGRATION ===
async function askClaude(message) {
  if (!claudeApiKey || claudeApiKey === 'your_api_key_here') {
    return null; // Claude not configured
  }

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': claudeApiKey,
        'anthropic-version': '2023-06-01'
      },
      body: JSON.stringify({
        model: 'claude-3-5-haiku-20241022', // Cheapest model - perfect for quick responses
        max_tokens: 150, // Reduced for cost efficiency
        messages: [{
          role: 'user',
          content: `You are a helpful family budget assistant. Keep responses VERY brief (1-2 sentences max). User asked: "${message}"\n\nProvide a friendly, concise response about budgeting or finances.`
        }]
      })
    });

    if (!response.ok) {
      throw new Error(`Claude API error: ${response.status}`);
    }

    const data = await response.json();
    return data.content[0].text;
  } catch (error) {
    console.error('Claude API error:', error);
    return null;
  }
}

// === MESSAGE FORMATTING ===
function formatMessage(type, data) {
  const emojis = {
    success: '✅',
    warning: '⚠️',
    error: '❌',
    money: '💰',
    chart: '📊',
    calendar: '📅',
    family: '👥',
    trophy: '🏆',
    fire: '🔥',
    check: '✔️',
  };

  switch (type) {
    case 'expense_added':
      return `${emojis.success} *Expense Added*\n\n${emojis.money} *$${data.amount.toFixed(2)}* in ${data.category}\n${data.description ? `📝 _${data.description}_\n` : ''}\n${emojis.calendar} ${new Date().toLocaleDateString()}`;

    case 'unauthorized':
      return `${emojis.error} *Access Denied*\n\nSorry, this bot is for authorized family members only.\n\nContact the bot owner if you believe this is an error.`;

    case 'welcome':
      return `${emojis.success} *Welcome to Family Budget Bot!*\n\n💬 Log expenses:\n_"spent $50 on groceries"_\n_"20 for gas"_\n_"utilities 100"_\n\n📊 Get info:\n• *budget* - Quick overview\n• *report* - Detailed analysis\n• *settings* - Manage budgets\n• *subscriptions* - View recurring bills\n• *alerts* - Budget warnings\n• *help* - All commands`;

    default:
      return data;
  }
}

// === ONBOARDING HELPERS ===
function isOnboardingComplete(data, phoneNumber) {
  if (!data.settings) data.settings = { onboardingCompleted: {} };
  if (!data.settings.onboardingCompleted) data.settings.onboardingCompleted = {};
  return data.settings.onboardingCompleted[phoneNumber] === true;
}

function startOnboarding(data, phoneNumber) {
  if (!data.settings) data.settings = { onboardingCompleted: {} };
  if (!data.settings.onboardingCompleted) data.settings.onboardingCompleted = {};
  data.settings.onboardingCompleted[phoneNumber] = 'name';
  saveData(data);

  return `👋 *Welcome to Family Budget Bot!*\n\nLet me help you set up your budget in just a few steps.\n\n*Step 1: What's your name?*\n\nReply with your name (e.g., "John" or "Sarah")`;
}

function processOnboarding(data, phoneNumber, message) {
  if (!data.settings) data.settings = { onboardingCompleted: {} };
  if (!data.settings.onboardingCompleted) data.settings.onboardingCompleted = {};

  const stage = data.settings.onboardingCompleted[phoneNumber];
  const userId = getUserIdForPhoneNumber(data, phoneNumber);
  const currentUser = data.users.find(u => u.id === userId);

  if (stage === 'name') {
    // Update user name
    if (currentUser) {
      currentUser.name = message.trim();
      data.settings.onboardingCompleted[phoneNumber] = true;
      saveData(data);
      return `✅ Great! Hi ${currentUser.name}!\n\n🎉 *Setup Complete!*\n\nYou're all set! Here's how to use the bot:\n\n💬 *Log expenses:*\n• "spent $50 on groceries"\n• "20 for gas"\n• "utilities 100"\n\n📊 *Get info:*\n• *budget* - Overview\n• *report* - Detailed analysis\n• *settings* - Manage budgets\n• *help* - All commands\n\n🚀 Try logging your first expense!`;
    }
  }

  return null;
}

// === MAIN WEBHOOK ===
app.post('/whatsapp', async (req, res) => {
  const incomingMessage = req.body.Body || '';
  const senderNumber = req.body.From || '';

  console.log(`📱 Message from ${senderNumber}: ${incomingMessage}`);

  // Check authentication
  if (!isAuthorized(senderNumber)) {
    console.log(`🚫 Unauthorized access attempt from ${senderNumber}`);
    const responseMessage = formatMessage('unauthorized');

    if (twilioClient) {
      try {
        await twilioClient.messages.create({
          body: responseMessage,
          from: twilioNumber,
          to: senderNumber,
        });
      } catch (error) {
        console.error('Error sending message:', error.message);
      }
    }

    return res.status(200).send('OK');
  }

  const data = loadData();
  const userId = getUserIdForPhoneNumber(data, senderNumber);
  data.selectedUserId = userId;

  let responseMessage = '';
  const msg = incomingMessage.toLowerCase().trim();

  // === ONBOARDING CHECK ===
  if (!isOnboardingComplete(data, senderNumber)) {
    // Check if starting fresh
    if (msg === 'start' || msg === 'help' || msg === 'hi' || msg === 'hello') {
      responseMessage = startOnboarding(data, senderNumber);
    } else {
      const onboardingResponse = processOnboarding(data, senderNumber, incomingMessage);
      if (onboardingResponse) {
        responseMessage = onboardingResponse;
      } else {
        // Skip onboarding if user sends other commands
        data.settings.onboardingCompleted[senderNumber] = true;
        saveData(data);
        // Continue to normal command processing below
      }
    }

    // Send onboarding response and exit
    if (responseMessage) {
      if (twilioClient) {
        try {
          await twilioClient.messages.create({
            body: responseMessage,
            from: twilioNumber,
            to: senderNumber,
          });
        } catch (error) {
          console.error('Error:', error.message);
        }
      }
      return res.status(200).send('OK');
    }
  }

  // Command routing
  if (msg === 'help' || msg === 'start' || msg === 'hi' || msg === 'hello') {
    responseMessage = formatMessage('welcome');
  }
  else if (msg.includes('budget') || msg.includes('summary')) {
    responseMessage = generateBudgetSummary(data, data.selectedMonth);
  }
  else if (msg === 'report' || msg === 'detailed' || msg === 'full report') {
    responseMessage = generateDetailedReport(data, data.selectedMonth);
  }
  else if (msg === 'alerts' || msg === 'warnings' || msg === 'warning') {
    const alerts = getAlerts(data, data.selectedMonth);
    if (alerts.length === 0) {
      responseMessage = `✅ *All Good!*\n\nAll categories are within budget.\nKeep up the great work! 🎉`;
    } else {
      responseMessage = `⚠️ *BUDGET ALERTS*\n\n` + alerts.join('\n\n');
    }
  }
  else if (msg === 'top' || msg === 'top categories') {
    const top = getTopCategories(data, data.selectedMonth, 3);
    responseMessage = `🏆 *TOP SPENDING CATEGORIES*\n\n`;
    top.forEach(([cat, catData], idx) => {
      const emoji = idx === 0 ? '🥇' : idx === 1 ? '🥈' : '🥉';
      responseMessage += `${emoji} *${cat}*: $${catData.spent.toFixed(2)}\n`;
    });
  }
  else if (msg === 'who' || msg === 'who spent' || msg === 'family') {
    const spenders = getTopSpenders(data, data.selectedMonth);
    responseMessage = `👥 *FAMILY SPENDING*\n\n`;
    spenders.forEach(([name, userData]) => {
      responseMessage += `• *${name}*: $${userData.spent.toFixed(2)} (${userData.count} transactions)\n`;
    });
  }
  else if (msg === 'status' || msg === 'quick' || msg === 'quick status') {
    const stats = generateQuickStats(data, data.selectedMonth);
    responseMessage = `📊 *QUICK STATUS*\n\n`;
    responseMessage += `💰 *Spent*: $${stats.totalSpent}/$${stats.totalBudget}\n`;
    responseMessage += `📈 *Usage*: ${stats.percentUsed}%\n`;
    responseMessage += `💵 *Remaining*: $${stats.remaining}`;
  }
  else if (msg === 'users' || msg === 'family members') {
    responseMessage = `👥 *FAMILY MEMBERS*\n\n`;
    for (const user of data.users) {
      const isCurrent = user.id === userId;
      responseMessage += `${isCurrent ? '→ ' : '  '}*${user.name}*${isCurrent ? ' (you)' : ''}\n`;
    }
  }
  else if (msg === 'subscriptions' || msg === 'subs' || msg === 'recurring') {
    const subs = data.subscriptions || [];
    const activeSubs = subs.filter(s => s.isActive);

    if (activeSubs.length === 0) {
      responseMessage = `🔄 *NO SUBSCRIPTIONS*\n\nYou don't have any active subscriptions.\n\nUse the desktop app to add subscriptions like Netflix, Spotify, gym memberships, etc.`;
    } else {
      const totalMonthly = activeSubs.reduce((sum, sub) => {
        if (sub.frequency === 'monthly') return sum + sub.amount;
        if (sub.frequency === 'weekly') return sum + (sub.amount * 52 / 12);
        if (sub.frequency === 'yearly') return sum + (sub.amount / 12);
        return sum;
      }, 0);

      responseMessage = `🔄 *ACTIVE SUBSCRIPTIONS*\n\n`;
      responseMessage += `💰 *Total Monthly*: $${totalMonthly.toFixed(2)}\n`;
      responseMessage += `📊 *Count*: ${activeSubs.length}\n\n`;

      activeSubs.slice(0, 5).forEach(sub => {
        responseMessage += `• *${sub.name}*\n`;
        responseMessage += `  $${sub.amount.toFixed(2)} ${sub.frequency}\n`;
        responseMessage += `  ${sub.category}\n\n`;
      });

      if (activeSubs.length > 5) {
        responseMessage += `_...and ${activeSubs.length - 5} more. View all in the desktop app._`;
      }
    }
  }
  else if (msg.includes('subscription cost') || msg.includes('monthly cost') || msg.includes('recurring cost')) {
    const subs = data.subscriptions || [];
    const activeSubs = subs.filter(s => s.isActive);
    const totalMonthly = activeSubs.reduce((sum, sub) => {
      if (sub.frequency === 'monthly') return sum + sub.amount;
      if (sub.frequency === 'weekly') return sum + (sub.amount * 52 / 12);
      if (sub.frequency === 'yearly') return sum + (sub.amount / 12);
      return sum;
    }, 0);
    const totalYearly = totalMonthly * 12;

    responseMessage = `💰 *SUBSCRIPTION COSTS*\n\n`;
    responseMessage += `📅 *Monthly*: $${totalMonthly.toFixed(2)}\n`;
    responseMessage += `📆 *Yearly*: $${totalYearly.toFixed(2)}\n`;
    responseMessage += `📊 *Active Subs*: ${activeSubs.length}`;
  }
  else {
    // Try to parse as an expense
    const parsed = parseExpense(incomingMessage);
    if (parsed.success) {
      const newExpense = {
        id: Date.now().toString(),
        userId: userId,
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        date: new Date().toISOString().split('T')[0],
      };
      data.expenses.push(newExpense);
      saveData(data);
      responseMessage = formatMessage('expense_added', newExpense);
    } else {
      // If parsing failed, try Claude AI for general questions
      if (claudeApiKey && claudeApiKey !== 'your_api_key_here') {
        const claudeResponse = await askClaude(incomingMessage);
        if (claudeResponse) {
          responseMessage = `🤖 ${claudeResponse}\n\n💡 _Or try: "budget", "report", "help"_`;
        } else {
          responseMessage = parsed.message;
        }
      } else {
        responseMessage = parsed.message;
      }
    }
  }

  // Send response
  if (twilioClient) {
    try {
      await twilioClient.messages.create({
        body: responseMessage,
        from: twilioNumber,
        to: senderNumber,
      });
      console.log('✅ Sent response');
    } catch (error) {
      console.error('Error:', error.message);
    }
  } else {
    console.log('📤 Response:', responseMessage.substring(0, 100));
  }

  res.status(200).send('OK');
});

// === API ENDPOINTS ===
app.get('/health', (req, res) => {
  res.json({
    status: 'OK',
    message: 'Family Budget Bot is running!',
    features: {
      twilio: !!twilioClient,
      claude: !!(claudeApiKey && claudeApiKey !== 'your_api_key_here'),
      auth: ALLOWED_NUMBERS.length > 0,
    }
  });
});

app.get('/api/data', (req, res) => {
  const data = loadData();
  res.json(data);
});

app.post('/api/expense', (req, res) => {
  const { userId, amount, category, description } = req.body;
  if (!userId || !amount || !category) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  const data = loadData();
  const newExpense = {
    id: Date.now().toString(),
    userId,
    amount: parseFloat(amount),
    category,
    description: description || '',
    date: new Date().toISOString().split('T')[0],
  };
  data.expenses.push(newExpense);
  saveData(data);
  res.json({ success: true, expense: newExpense });
});

app.get('/api/expenses', (req, res) => {
  const data = loadData();
  res.json(data.expenses);
});

app.get('/api/budgets', (req, res) => {
  const data = loadData();
  res.json(data.budgets);
});

app.post('/api/budget', (req, res) => {
  const { category, limit, month } = req.body;
  if (!category || !limit || !month) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = loadData();

  // Check if budget exists for this category and month
  const existingIndex = data.budgets.findIndex(
    b => b.category === category && b.month === month
  );

  if (existingIndex >= 0) {
    // Update existing budget
    data.budgets[existingIndex].limit = parseFloat(limit);
  } else {
    // Create new budget
    const newBudget = {
      id: Date.now().toString(),
      category,
      limit: parseFloat(limit),
      month
    };
    data.budgets.push(newBudget);
  }

  saveData(data);
  res.json({ success: true, budgets: data.budgets });
});

app.delete('/api/budget/:id', (req, res) => {
  const data = loadData();
  data.budgets = data.budgets.filter(b => b.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

app.get('/api/users', (req, res) => {
  const data = loadData();
  res.json(data.users);
});

app.post('/api/user', (req, res) => {
  const { name, color } = req.body;
  if (!name) {
    return res.status(400).json({ error: 'Name is required' });
  }

  const data = loadData();
  const newUser = {
    id: Date.now().toString(),
    name,
    color: color || '#' + Math.floor(Math.random()*16777215).toString(16)
  };
  data.users.push(newUser);
  saveData(data);
  res.json({ success: true, user: newUser });
});

// === SUBSCRIPTION ENDPOINTS ===
app.get('/api/subscriptions', (req, res) => {
  const data = loadData();
  res.json(data.subscriptions || []);
});

app.post('/api/subscription', (req, res) => {
  const { name, amount, category, frequency, dayOfMonth, dayOfWeek, monthOfYear, startDate, endDate } = req.body;

  if (!name || !amount || !category || !frequency) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = loadData();
  if (!data.subscriptions) data.subscriptions = [];

  const newSubscription = {
    id: Date.now().toString(),
    name,
    amount: parseFloat(amount),
    category,
    frequency,
    isActive: true,
    startDate: startDate || new Date().toISOString().split('T')[0],
  };

  if (dayOfMonth !== undefined) newSubscription.dayOfMonth = parseInt(dayOfMonth);
  if (dayOfWeek !== undefined) newSubscription.dayOfWeek = parseInt(dayOfWeek);
  if (monthOfYear !== undefined) newSubscription.monthOfYear = parseInt(monthOfYear);
  if (endDate) newSubscription.endDate = endDate;

  data.subscriptions.push(newSubscription);
  saveData(data);
  res.json({ success: true, subscription: newSubscription });
});

app.put('/api/subscription/:id', (req, res) => {
  const data = loadData();
  if (!data.subscriptions) data.subscriptions = [];

  const index = data.subscriptions.findIndex(s => s.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Subscription not found' });
  }

  data.subscriptions[index] = {
    ...data.subscriptions[index],
    ...req.body
  };

  saveData(data);
  res.json({ success: true, subscription: data.subscriptions[index] });
});

app.delete('/api/subscription/:id', (req, res) => {
  const data = loadData();
  if (!data.subscriptions) data.subscriptions = [];

  data.subscriptions = data.subscriptions.filter(s => s.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// === SAVINGS GOALS ENDPOINTS ===
app.get('/api/savings-goals', (req, res) => {
  const data = loadData();
  res.json(data.savingsGoals || []);
});

app.post('/api/savings-goal', (req, res) => {
  const { name, targetAmount, currentAmount, targetDate, category } = req.body;

  if (!name || !targetAmount || !targetDate) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const data = loadData();
  if (!data.savingsGoals) data.savingsGoals = [];

  const newGoal = {
    id: Date.now().toString(),
    name,
    targetAmount: parseFloat(targetAmount),
    currentAmount: parseFloat(currentAmount) || 0,
    targetDate,
    category: category || undefined
  };

  data.savingsGoals.push(newGoal);
  saveData(data);
  res.json({ success: true, goal: newGoal });
});

app.put('/api/savings-goal/:id', (req, res) => {
  const data = loadData();
  if (!data.savingsGoals) data.savingsGoals = [];

  const index = data.savingsGoals.findIndex(g => g.id === req.params.id);
  if (index === -1) {
    return res.status(404).json({ error: 'Savings goal not found' });
  }

  data.savingsGoals[index] = {
    ...data.savingsGoals[index],
    ...req.body
  };

  saveData(data);
  res.json({ success: true, goal: data.savingsGoals[index] });
});

app.delete('/api/savings-goal/:id', (req, res) => {
  const data = loadData();
  if (!data.savingsGoals) data.savingsGoals = [];

  data.savingsGoals = data.savingsGoals.filter(g => g.id !== req.params.id);
  saveData(data);
  res.json({ success: true });
});

// === SUBSCRIPTION PROCESSOR ===
// Process subscriptions and generate expenses
function processSubscriptions() {
  const data = loadData();
  if (!data.subscriptions) return;

  const today = new Date();
  const todayStr = today.toISOString().split('T')[0];
  let newExpensesCount = 0;

  for (const sub of data.subscriptions) {
    if (!sub.isActive) continue;

    // Check if already processed today
    if (sub.lastProcessed === todayStr) continue;

    // Check if subscription should be processed
    let shouldProcess = false;

    if (sub.frequency === 'monthly' && sub.dayOfMonth) {
      shouldProcess = today.getDate() === sub.dayOfMonth;
    } else if (sub.frequency === 'weekly' && sub.dayOfWeek !== undefined) {
      shouldProcess = today.getDay() === sub.dayOfWeek;
    } else if (sub.frequency === 'yearly' && sub.monthOfYear && sub.dayOfMonth) {
      shouldProcess = today.getMonth() + 1 === sub.monthOfYear && today.getDate() === sub.dayOfMonth;
    }

    if (shouldProcess) {
      // Create expense
      const newExpense = {
        id: Date.now().toString() + '-' + Math.random().toString(36).substr(2, 9),
        userId: data.selectedUserId || data.users[0].id,
        amount: sub.amount,
        category: sub.category,
        description: `${sub.name} (Subscription)`,
        date: todayStr,
        isRecurring: true,
        subscriptionId: sub.id
      };

      data.expenses.push(newExpense);
      sub.lastProcessed = todayStr;
      newExpensesCount++;
    }
  }

  if (newExpensesCount > 0) {
    saveData(data);
    console.log(`✅ Processed ${newExpensesCount} subscription(s)`);
  }
}

// Run subscription processor every hour
setInterval(processSubscriptions, 60 * 60 * 1000);
// Also run on startup
setTimeout(processSubscriptions, 5000);

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0

app.listen(PORT, HOST, () => {
  console.log('\n🤖 Family Budget Bot running on port ' + PORT);
  console.log('📱 Ready to manage your family budget!');
  console.log('🔒 Security:', ALLOWED_NUMBERS.length > 0 ? 'Whitelist enabled' : 'Open access');
  console.log('🤖 Claude AI:', (claudeApiKey && claudeApiKey !== 'your_api_key_here') ? 'Enabled' : 'Disabled');
});
