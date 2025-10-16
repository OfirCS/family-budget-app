# WhatsApp-Only Family Budget Bot

This is a WhatsApp-based family budget app that runs entirely through WhatsApp messages. No desktop app needed!

## Features

- **WhatsApp Interface**: Manage your entire budget through WhatsApp messages
- **Onboarding Flow**: Automatic setup for new users
- **Settings Commands**: Configure budgets directly via WhatsApp
- **Expense Tracking**: Log expenses with natural language
- **Budget Monitoring**: Real-time budget alerts and reports
- **Multi-user Support**: Track spending by family member
- **AI Assistant**: Claude 3.5 Haiku for smart responses (cost-effective!)

## Cost-Effective AI

The bot uses **Claude 3.5 Haiku** - the most affordable Claude model:
- Input: $0.80 per 1M tokens
- Output: $4.00 per 1M tokens
- Max 150 tokens per response
- Estimated cost: ~$0.00016 per AI response

## Quick Start

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file with your credentials:

```
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
ANTHROPIC_API_KEY=your_claude_api_key
PORT=3002
ALLOWED_PHONE_NUMBERS=whatsapp:+1234567890,whatsapp:+0987654321
```

### 3. Start the Bot

```bash
npm run bot
```

## WhatsApp Commands

### Getting Started
- **start** or **hi** - Begin onboarding (first-time users)
- **help** - Show all commands

### Logging Expenses
Send natural language messages:
- "spent $50 on groceries"
- "20 for gas"
- "utilities 100"

### Budget Commands
- **budget** or **summary** - Monthly budget overview
- **settings** - View all budget limits
- **set groceries 600** - Update budget for a category
- **report** or **detailed** - Full spending analysis
- **alerts** - Budget warnings
- **status** or **quick** - Quick stats

### Family & Spending
- **who** or **family** - Family spending breakdown
- **users** - List all family members
- **top** - Top 3 spending categories

### Subscriptions
- **subscriptions** or **subs** - View recurring bills
- **subscription cost** - Monthly/yearly subscription totals

## Settings via WhatsApp

### View Current Budgets
Send: `settings`

Response shows all category budgets for the current month.

### Update a Budget
Send: `set <category> <amount>`

Examples:
- `set groceries 600` - Update Groceries budget to $600
- `set transportation 250` - Update Transportation to $250

### Available Categories
- Groceries
- Transportation
- Entertainment
- Utilities
- Healthcare
- Education
- Clothing
- Shopping
- Personal
- Pets
- Home

## Onboarding Flow

New users automatically go through setup:

1. **Name Setup**: "What's your name?"
   - Reply with your name (e.g., "John")

2. **Ready to Use**: Bot confirms setup complete

3. **Start Tracking**: Log your first expense!

## Data Storage

All data is stored in `bot-data.json`:
- Users and family members
- Expenses with categories
- Budget limits (editable)
- Subscriptions
- Settings and onboarding status
- Phone number mappings

Everything is JSON - easily editable and portable!

## Running in Production

### Option 1: Railway

1. Connect your GitHub repo to Railway
2. Add environment variables in Railway dashboard
3. Deploy - Railway will use the `Procfile`

### Option 2: Other Platforms

The bot runs on any Node.js host:

```bash
node bot/server.js
```

Ensure your host:
- Supports webhooks (public URL)
- Can bind to 0.0.0.0
- Has Node.js 16+

## Removed Features

This version has **removed Electron** completely:
- No desktop app
- No React UI
- WhatsApp is the only interface
- Simpler, cheaper, more accessible!

## Architecture

```
WhatsApp → Twilio → Bot Server → bot-data.json
                 ↓
            Claude AI (optional)
```

## Security

- Phone number whitelist via `ALLOWED_PHONE_NUMBERS`
- Environment variables for credentials
- No exposed API keys in code

## Development

Run bot only (no React):

```bash
npm run bot
```

## Troubleshooting

### Bot not responding
- Check Twilio webhook URL is correct
- Verify `TWILIO_WHATSAPP_NUMBER` format
- Check phone number is in `ALLOWED_PHONE_NUMBERS`

### Claude AI not working
- Verify `ANTHROPIC_API_KEY` is set
- Check API key is valid
- Bot will fall back to simple responses if Claude fails

### Data not saving
- Check bot has write permissions for `bot-data.json`
- Verify JSON is not corrupted
- Check console for errors

## Cost Breakdown

**Monthly Costs** (assuming 100 messages/day):

- Twilio WhatsApp: ~$0.005 per message = $15/month
- Claude 3.5 Haiku: ~$0.00016 per response = $0.48/month
- Hosting (Railway free tier): $0/month

**Total**: ~$15-20/month

## Support

For issues:
1. Check console logs
2. Verify `.env` configuration
3. Test with `curl http://localhost:3002/health`
4. Review Twilio webhook logs

## License

MIT
