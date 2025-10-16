# Family Budget Bot 💰

A WhatsApp-based family budget management bot powered by Twilio and Claude AI. Track expenses, manage budgets, and collaborate with family members all through WhatsApp.

## Features

### 📱 WhatsApp Integration
- Send expense updates via WhatsApp messages
- Receive instant budget summaries and alerts
- Interactive settings menu
- Natural language expense parsing

### 💰 Expense Tracking
- Log expenses with descriptions
- Categorize spending automatically
- Track spending by family member
- Monthly expense history

### 📊 Budget Management
- Set and manage monthly budgets by category
- Real-time budget tracking
- Budget alerts when approaching limits
- Spending analytics and reports

### 👥 Family Collaboration
- Add multiple family members
- Track who spent what
- View family spending patterns
- Shared budget oversight

### 🔄 Subscription Management
- Add and track recurring subscriptions
- Monthly cost calculations
- Subscription alerts
- Manage Netflix, Spotify, gym memberships, etc.

### 🤖 AI Assistance
- Claude AI for financial advice
- Natural language expense interpretation
- Budget recommendations
- Smart categorization

## Setup

### Prerequisites
- Node.js v14+
- Twilio account with WhatsApp enabled
- Anthropic API key (for Claude AI)
- GitHub account (for deployment)

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/your-username/family-budget-app.git
cd family-budget-app
```

2. **Install dependencies**
```bash
npm install
```

3. **Configure environment variables**
```bash
cp .env.example .env
```

4. **Edit `.env` with your credentials**
```
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
ANTHROPIC_API_KEY=your_api_key
PORT=3001
```

### Running Locally

```bash
npm start
# or
npm run bot
```

The server will start on port 3001 (or your configured PORT).

## Usage

### Logging Expenses
Send messages like:
- "spent $50 on groceries"
- "20 for gas"
- "utilities 100"

### Available Commands
- **budget** - Quick budget overview
- **report** - Detailed spending analysis
- **alerts** - Budget warnings
- **top** - Top spending categories
- **who** - Family spending breakdown
- **subscriptions** - View active subscriptions
- **status** - Quick financial status
- **settings** - Open settings menu
- **help** - List all commands

### Settings Menu
Access with `/settings` command:
1. View/Edit Budgets
2. Manage Subscriptions
3. Family Members
4. Categories
5. Currency Settings
6. Reset All Data

## API Endpoints

### Health Check
```
GET /health
```

### Data Management
```
GET /api/data                    # Get all data
GET /api/expenses               # List expenses
GET /api/budgets                # List budgets
GET /api/users                  # List family members
GET /api/subscriptions          # List subscriptions
GET /api/savings-goals          # List savings goals
```

### Create/Update Resources
```
POST /api/expense               # Add expense
POST /api/budget                # Create budget
POST /api/user                  # Add family member
POST /api/subscription          # Add subscription
POST /api/savings-goal          # Add savings goal
```

### WebHook
```
POST /whatsapp                  # Twilio WhatsApp webhook
```

## Deployment

### Deploy to Railway

1. **Push to GitHub**
```bash
git add .
git commit -m "Add README and updates"
git push origin main
```

2. **Connect to Railway**
   - Go to railway.app
   - Create new project
   - Connect GitHub repository
   - Set environment variables
   - Deploy

### Environment Variables for Production
```
TWILIO_ACCOUNT_SID=your_production_sid
TWILIO_AUTH_TOKEN=your_production_token
TWILIO_WHATSAPP_NUMBER=whatsapp:+your_number
ANTHROPIC_API_KEY=your_api_key
PORT=3001
```

## Data Storage

The app uses a JSON file (`bot-data.json`) for data persistence:
- Users and family members
- Expenses and budgets
- Subscriptions and savings goals
- Settings and preferences

## Project Structure

```
family-budget-app/
├── bot/
│   ├── server.js           # Main Express server
│   ├── nlp.js              # NLP parsing & budget summary
│   └── analytics.js        # Analytics & reporting
├── bot-data.json           # Data storage
├── package.json            # Dependencies
├── .env                    # Environment variables
├── .env.example            # Example env file
├── Procfile                # Railway/Heroku configuration
└── README.md               # This file
```

## Technology Stack

- **Backend**: Node.js & Express
- **API**: Anthropic Claude AI
- **Messaging**: Twilio WhatsApp
- **Storage**: JSON file system
- **Deployment**: Railway/Heroku

## Features Coming Soon

- [ ] Web dashboard for analytics
- [ ] Database integration (MongoDB/PostgreSQL)
- [ ] Bill splitting calculator
- [ ] Savings goals tracking
- [ ] Export to CSV/PDF
- [ ] Multi-language support
- [ ] Mobile app
- [ ] Voice commands

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Support

For issues and questions:
- Create an issue on GitHub
- WhatsApp the bot for help with usage
- Check the FAQ section below

## FAQ

**Q: How do I reset all my data?**
A: Use settings menu and select "Reset All Data" (option 6)

**Q: Can I change the currency?**
A: Yes, go to settings > Currency Settings

**Q: How are expenses categorized?**
A: The bot uses natural language processing to auto-categorize, or you can specify the category directly.

**Q: Can I use this for a business?**
A: Yes! You can add multiple users and track spending by team member.

**Q: What if I don't have WhatsApp?**
A: You can use the REST API endpoints with any HTTP client.

## Changelog

### v1.0.0 (October 2025)
- Initial release
- WhatsApp integration
- Budget tracking
- Expense logging
- Family collaboration
- Claude AI integration
- Subscription management

---

Made with ❤️ for family finances
