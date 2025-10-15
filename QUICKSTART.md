# 🚀 Family Budget App - Quick Start Guide

Get your beautiful budget app running in **5 minutes**!

## Installation

### 1. Navigate to project folder
```bash
cd family-budget-app
```

### 2. Install dependencies (already done!)
```bash
npm install --legacy-peer-deps
```

## Running the App

### Option A: Desktop App Only
```bash
npm run dev
```
- Opens React dev server + Electron desktop app
- All your data stays local

### Option B: With WhatsApp Bot
```bash
npm run dev-with-bot
```
- Runs everything: React + Desktop App + WhatsApp Bot Server
- Bot server runs on `http://localhost:3001`
- Perfect for testing the bot functionality

### Option C: Bot Server Only
```bash
npm run bot
```
- Just the WhatsApp bot backend
- Useful for deployment to a server

## What You Get

### 🖥️ **Desktop App** (Electron)
- **Dashboard** - Add expenses, view budgets
- **Users Tab** - Manage family members
- **Real-time Sync** - Changes update instantly
- **Local Storage** - Your data never leaves your computer

### 💬 **WhatsApp Bot** (Optional)
- **Natural Language** - "spent $20 on groceries"
- **Budget Summaries** - Text "budget" anytime
- **Smart Categories** - Automatically recognizes what you spent on
- **Always On** - Available 24/7 from WhatsApp

## First Time Setup

### Desktop App

1. **Run the app** - `npm run dev`
2. **Electron window** opens automatically
3. You'll see pre-loaded data:
   - Family members: Mom, Dad, Child 1
   - Sample budgets for different categories
4. **Add an expense**:
   - Go to Dashboard tab
   - Enter amount, category, description
   - Click "Add Expense"
5. **View budget** - See real-time progress on the right
6. **Manage users** - Switch to Users tab to add/remove people

### WhatsApp Bot (Optional)

1. **Get Twilio account** - https://www.twilio.com (free!)
2. **Create .env file**:
   ```bash
   cp .env.example .env
   ```
3. **Add credentials** to `.env`:
   ```
   TWILIO_ACCOUNT_SID=your_sid
   TWILIO_AUTH_TOKEN=your_token
   TWILIO_WHATSAPP_NUMBER=whatsapp:+1234567890
   ```
4. **Start bot** - `npm run dev-with-bot`
5. **Set up webhook** in Twilio - Point to `http://yourdomain.com/whatsapp`
6. **Text your bot** - Try "spent $20 on groceries"

See **WHATSAPP_BOT_SETUP.md** for detailed setup.

## Usage Examples

### Adding Expenses

**Desktop App:**
1. Type amount: `50.00`
2. Select category: `Groceries`
3. Add description: `Weekly shopping`
4. Pick date
5. Click "Add Expense"

**WhatsApp Bot:**
- "spent $50 on groceries"
- "20 taxi"
- "utilities: 100"

### Checking Budget

**Desktop App:**
- View the Budget Overview panel
- See spending vs limits
- Click edit to change budget limits

**WhatsApp Bot:**
- Text "budget"
- Get detailed breakdown with progress bars
- See which categories are over budget

### Managing Family

**Desktop App:**
- Go to Users tab
- Enter name and pick a color
- Click "Add Member"
- Select users when adding expenses
- Delete by hovering over card

**WhatsApp Bot:**
- Text "users" to see family members

## Key Features

✅ **Multi-user** - Track spending per family member
✅ **Budget Limits** - Set and monitor monthly limits per category
✅ **Beautiful UI** - Modern glassmorphism design
✅ **Real-time** - Updates instantly across app
✅ **Local Data** - Everything stays on your computer
✅ **WhatsApp** - Manage budget via chat (optional)
✅ **Natural Language** - Talk naturally to the bot
✅ **Offline** - Works completely offline

## File Structure

```
family-budget-app/
├── src/                    # React app
│   ├── components/         # UI components
│   ├── App.tsx            # Main app
│   ├── storage.ts         # Local storage
│   └── types.ts           # TypeScript types
├── public/                # Electron setup
├── bot/                   # WhatsApp bot
│   ├── server.js          # Bot API server
│   └── nlp.js             # Language parser
├── .env.example           # Environment template
├── package.json           # Dependencies
└── README.md             # Full documentation
```

## Common Tasks

### Change Default Data
Edit `src/storage.ts` - `DEFAULT_STATE` object

### Add Custom Budget Categories
Edit `src/components/ExpenseForm.tsx` - `CATEGORIES` array

### Customize Colors
Edit `src/components/UserManager.tsx` - `COLORS` array

### Deploy App
```bash
npm run dist
```
Creates standalone `.exe` installer for Windows

### Deploy Bot Server
Use platform like:
- Heroku
- Railway
- Render
- AWS Lambda

## Keyboard Shortcuts

### Desktop App
- `Ctrl+Q` - Quit app
- `F12` - Developer tools
- `Ctrl+R` - Reload

## Troubleshooting

### App won't start?
```bash
npm run dev
```
Check the terminal for error messages

### Port 3000 already in use?
```bash
# Windows PowerShell
$env:PORT=3001; npm start

# Mac/Linux
PORT=3001 npm start
```

### Bot server won't start?
Check if port 3001 is free:
```bash
# Windows
netstat -ano | findstr :3001

# Mac/Linux
lsof -i :3001
```

### Data not syncing?
- All data is stored in localStorage (desktop) and bot-data.json (bot)
- Refresh the app if needed
- Check browser console for errors (F12)

## Next Steps

1. ✅ Get it running
2. 📊 Add some expenses
3. 👥 Add family members
4. 💬 (Optional) Set up WhatsApp bot
5. 📈 Monitor your budget!

## Support

- **Desktop App Issues** - Check terminal for errors
- **Bot Questions** - See `WHATSAPP_BOT_SETUP.md`
- **Data Issues** - Check `src/storage.ts`

## Tips & Tricks

💡 **Tip 1**: Use consistent category names for accurate tracking

💡 **Tip 2**: Set realistic budget limits based on family spending

💡 **Tip 3**: Check budget weekly to catch overspending early

💡 **Tip 4**: Bot understands many expense formats - be casual!

💡 **Tip 5**: Export data by copying bot-data.json as backup

## What's Next?

The app is ready! Here's what you could add:

- 📈 Charts and analytics
- 📧 Weekly email summaries
- 🔔 Budget alerts
- 🏦 Bank integration
- 📱 Mobile app companion
- 💳 Recurring expenses
- 🔐 Multi-device sync

---

**You're all set!** 🎉

Run `npm run dev` and start managing your family budget beautifully.

Questions? Check the full README.md or WHATSAPP_BOT_SETUP.md
