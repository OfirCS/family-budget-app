# WhatsApp Budget Bot Setup Guide

Your Family Budget App now includes a **WhatsApp bot** that lets you manage expenses just by chatting! Just text your bot like you'd text a friend.

## Features

✨ **Natural Language Processing** - Talk naturally, not with commands
- "spent $20 on groceries"
- "20 taxi"
- "utilities: 50"

📊 **Budget Summary** - Text "budget" to see your monthly overview

💰 **Expense Tracking** - All expenses tracked in real-time

🤖 **Always Available** - Access your budget 24/7 from WhatsApp

## Setup Instructions

### Step 1: Get Twilio Account (FREE!)

1. Go to [Twilio.com](https://www.twilio.com)
2. Sign up for a free account
3. Go to **Console** → **Account**
4. Copy your **Account SID** and **Auth Token**

### Step 2: Enable WhatsApp on Twilio

1. In Twilio Console, go to **Messaging** → **Try it out** → **Send a WhatsApp message**
2. Click **"Get a WhatsApp-enabled number"**
3. Twilio will give you a number like: `+1 (XXX) XXX-XXXX`
4. You'll get a sandbox number to test with

### Step 3: Create .env File

1. Copy `.env.example` to `.env` in the project root:
```bash
cp .env.example .env
```

2. Fill in your Twilio credentials:
```
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
```

### Step 4: Start the Bot Server

Option A: Bot only
```bash
npm run bot
```

Option B: Bot + Desktop App + React
```bash
npm run dev-with-bot
```

The bot runs on `http://localhost:3001`

### Step 5: Connect to Twilio Webhook

1. In Twilio Console → **Messaging** → **Settings** → **WhatsApp Sandbox Settings**
2. Find the **Webhook URL** field
3. Set it to: `http://yourdomain.com/whatsapp` (or use ngrok for local testing)
4. Click **Save**

### For Local Testing with ngrok

1. Install ngrok: `https://ngrok.com/download`
2. Start ngrok:
```bash
ngrok http 3001
```
3. Copy the `https://xxx.ngrok.io` URL
4. Add `/whatsapp` to the end: `https://xxx.ngrok.io/whatsapp`
5. Paste this in Twilio Webhook URL

### Step 6: Send a Test Message

1. From the Twilio sandbox, add your personal WhatsApp number
2. Send a WhatsApp message to your Twilio number
3. Try these commands:

```
💰 Add Expense:
   spent $50 on groceries
   20 taxi
   entertainment: 30

📊 View Budget:
   budget
   summary

👥 Users:
   users

📋 Help:
   help
```

## Example Conversations

### Adding Expenses (Natural Language!)

```
You: spent $50 on groceries
Bot: Got it! Added $50.00 for Groceries: "spent $50 on groceries"

You: 20 uber
Bot: Got it! Added $20.00 for Transportation: "20 uber"

You: utilities: 100
Bot: Got it! Added $100.00 for Utilities: "utilities: 100"
```

### Checking Budget

```
You: budget
Bot: 📊 Budget Summary for 2024-10
    🟢 Entertainment
       Spent: $15.00 / $150.00
       Progress: 10%

    🟡 Groceries
       Spent: $420.00 / $500.00
       Progress: 84%

    💰 TOTAL
    Spent: $600.00 / $1150.00
```

## Bot Commands

| Command | Description |
|---------|-------------|
| `spent $X on category` | Add expense |
| `$X category` | Quick expense entry |
| `budget` or `summary` | View budget overview |
| `users` | List family members |
| `set budget groceries 500` | Set category budget |
| `help` | Show help message |

## How It Works

1. **Message Processing**: Your WhatsApp message goes to Twilio
2. **NLP Engine**: Our bot parses natural language to extract amount & category
3. **Data Storage**: Expense is added to the app's database
4. **Sync**: Desktop app instantly sees the new expense
5. **Response**: Bot confirms what was added

## Supported Expense Formats

The bot understands many ways of saying the same thing:

```
✅ "spent $20 on groceries"
✅ "i spent 20 on food"
✅ "paid $20 for groceries"
✅ "20 groceries"
✅ "$20 food"
✅ "groceries: 20"
✅ "food 20"
```

## Error Handling

If the bot doesn't understand:

```
You: blahblah xyz
Bot: I didn't quite catch that. Try saying something like:
     - "spent $20 on groceries"
     - "20 taxi"
     - "utilities: 50"
```

## Category Recognition

The bot automatically recognizes:

- **Groceries**: food, supermarket, market, shopping
- **Transportation**: taxi, uber, car, gas, parking, bus
- **Entertainment**: movie, netflix, gaming, music
- **Utilities**: electricity, water, internet, phone
- **Healthcare**: medicine, doctor, hospital, pharmacy
- **Education**: school, course, book, learning
- **Clothing**: clothes, shirt, shoes, dress

## Data Storage

- All expenses are saved to `bot-data.json`
- Same database as desktop app
- Syncs between WhatsApp and Desktop app
- Data is saved locally (not in cloud)

## Troubleshooting

### Bot not responding?
- Check ngrok is still running
- Verify Twilio webhook URL is correct
- Check bot server is running: `npm run bot`
- Check logs in terminal

### Messages not being parsed?
- Check exact format: "spent $20 on food"
- Use proper punctuation
- Bot learns over time with more usage

### Twilio credentials not working?
- Regenerate tokens in Twilio Console
- Make sure to save new credentials in .env
- Restart bot server after changing .env

### Need to test without Twilio?
- Bot server runs in demo mode without credentials
- Check terminal for responses instead of WhatsApp

## Advanced Features

### Custom Categories
Edit `bot/nlp.js` and add keywords to `categoryMapping`:

```javascript
// Add new keywords for existing category
healthcare: ['gym', 'fitness', 'sport', ...],

// Or create new category
shopping: ['amazon', 'ebay', 'store'],
```

### Automatic Reports
You can extend the bot to send daily/weekly budget summaries automatically.

### Integration with Other Apps
The `/api/*` endpoints allow integration with:
- Slack bots
- Discord bots
- Telegram bots
- Your own custom apps

## API Endpoints

Bot also provides REST API:

```
GET  /health              - Health check
GET  /api/data            - Get all data
GET  /api/expenses        - Get expenses list
GET  /api/budgets         - Get budgets list
POST /api/expense         - Add new expense
POST /whatsapp            - WhatsApp webhook
```

## Support

Need help? Check these resources:
- [Twilio Documentation](https://www.twilio.com/docs)
- [WhatsApp Business API](https://www.twilio.com/whatsapp)
- [ngrok Documentation](https://ngrok.com/docs)

## Privacy & Security

✅ All data stored locally on your computer
✅ Not synced to cloud (except WhatsApp messages via Twilio)
✅ Twilio handles WhatsApp messages securely
✅ No third-party tracking

## Cost

- **Twilio**: Free for testing, ~$1-2/month for real usage
- **ngrok**: Free for local testing
- **This app**: 100% Free, Open Source

---

Enjoy managing your family budget right from WhatsApp! 🎉
