const express = require('express');
const cors = require('cors');
require('dotenv').config();
const twilio = require('twilio');
const { parseExpense, generateBudgetSummary } = require('./nlp');
const fs = require('fs');
const path = require('path');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const dataFile = path.join(__dirname, '../bot-data.json');

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
      { id: '1', name: 'Mom', color: '#FF6B6B' },
      { id: '2', name: 'Dad', color: '#4ECDC4' },
      { id: '3', name: 'Child 1', color: '#45B7D1' },
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
  };
}

function saveData(data) {
  try {
    fs.writeFileSync(dataFile, JSON.stringify(data, null, 2));
  } catch (e) {
    console.error('Error saving data:', e);
  }
}

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioNumber = process.env.TWILIO_WHATSAPP_NUMBER;

let twilioClient = null;
if (accountSid && authToken && authToken !== 'your_auth_token') {
  twilioClient = twilio(accountSid, authToken);
  console.log('✅ Twilio WhatsApp bot connected!');
}

app.post('/whatsapp', (req, res) => {
  const incomingMessage = req.body.Body || '';
  const senderNumber = req.body.From || '';

  console.log('📱 Message from ' + senderNumber + ': ' + incomingMessage);

  const data = loadData();
  let responseMessage = '';

  if (incomingMessage.toLowerCase().includes('budget') || incomingMessage.toLowerCase().includes('summary')) {
    responseMessage = generateBudgetSummary(data, data.selectedMonth);
  } else if (incomingMessage.toLowerCase().includes('help')) {
    responseMessage = '👋 Budget Bot Commands:\n\n💰 Add Expense:\n  "spent $20 on groceries"\n  "20 taxi"\n\n📊 View Budget:\n  "budget"';
  } else {
    const parsed = parseExpense(incomingMessage);
    if (parsed.success) {
      const newExpense = {
        id: Date.now().toString(),
        userId: data.selectedUserId,
        amount: parsed.amount,
        category: parsed.category,
        description: parsed.description,
        date: new Date().toISOString().split('T')[0],
      };
      data.expenses.push(newExpense);
      saveData(data);
      responseMessage = parsed.message;
    } else {
      responseMessage = parsed.message;
    }
  }

  if (twilioClient) {
    try {
      twilioClient.messages.create({
        body: responseMessage,
        from: twilioNumber,
        to: senderNumber,
      });
      console.log('✅ Sent response via WhatsApp');
    } catch (error) {
      console.error('Error sending message:', error.message);
    }
  } else {
    console.log('📤 Demo mode - Response: ' + responseMessage.substring(0, 50));
  }

  res.status(200).send('OK');
});

app.get('/health', (req, res) => {
  res.json({ status: 'OK', message: 'Budget Bot is running!' });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log('\n🤖 WhatsApp Budget Bot running on port ' + PORT);
  console.log('📱 Ready to receive WhatsApp messages');
  if (!twilioClient) {
    console.log('⚠️  Twilio credentials not configured - running in demo mode');
  }
});
