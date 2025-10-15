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
    selectedUserId: '1',
    selectedMonth: new Date().toISOString().slice(0, 7),
    phoneNumberMapping: {}, // Maps phone numbers to user IDs
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
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 300,
        messages: [{
          role: 'user',
          content: `You are a helpful family budget assistant. Keep responses brief (2-3 sentences max). User asked: "${message}"\n\nProvide a friendly, concise response about budgeting or finances.`
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
      return `${emojis.success} *Welcome to Family Budget Bot!*\n\n💬 Just tell me what you spent:\n_"spent $50 on groceries"_\n_"20 for gas"_\n_"utilities 100"_\n\n📊 View reports:\n• *budget* - Quick overview\n• *report* - Detailed analysis\n• *alerts* - Budget warnings\n• *help* - All commands`;

    default:
      return data;
  }
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

const PORT = process.env.PORT || 3002;
const HOST = '0.0.0.0'; // Railway requires binding to 0.0.0.0

app.listen(PORT, HOST, () => {
  console.log('\n🤖 Family Budget Bot running on port ' + PORT);
  console.log('📱 Ready to manage your family budget!');
  console.log('🔒 Security:', ALLOWED_NUMBERS.length > 0 ? 'Whitelist enabled' : 'Open access');
  console.log('🤖 Claude AI:', (claudeApiKey && claudeApiKey !== 'your_api_key_here') ? 'Enabled' : 'Disabled');
});
