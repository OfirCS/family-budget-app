# Family Budget App

A beautiful, modern desktop application for managing your family's finances. Track expenses, set budgets, and stay in control of spending across all family members.

## Features

✨ **Multi-User Support**
- Add family members with custom names and colors
- Track expenses per person
- Manage budgets for the whole family

💰 **Expense Tracking**
- Add expenses by category
- Attach descriptions to expenses
- View complete expense history
- Filter by month

📊 **Budget Management**
- Set monthly budget limits per category
- Visual budget progress bars
- Real-time spending tracking
- Get alerts when over budget

💾 **Local Storage**
- All data stored locally on your device
- No cloud sync needed
- Complete privacy - your finances stay private
- Data persists between sessions

🎨 **Beautiful UI**
- Modern, clean interface
- Responsive design
- Intuitive navigation
- Color-coded users

## Installation

### Prerequisites
- Node.js 14+ and npm
- Git (optional, for cloning)

### Setup

1. **Clone or download** the project:
```bash
git clone <repository-url>
cd family-budget-app
```

2. **Install dependencies**:
```bash
npm install --legacy-peer-deps
```

3. **Start the development version**:
```bash
npm run dev
```

This will start both the React development server and Electron application.

## Usage

### Running the App

**Development mode** (with hot reload):
```bash
npm run dev
```

**Build and package for distribution**:
```bash
npm run build        # Build React app
npm run dist         # Package with Electron Builder
```

**Running Electron only** (after building):
```bash
npm run electron
```

### Using the App

1. **Add Family Members**
   - Go to the "Users" tab
   - Enter a name and select a color
   - Click "Add Member"

2. **Add Expenses**
   - Select the user from the user selector
   - Enter amount and choose category
   - Add a description and date
   - Click "Add Expense"

3. **Manage Budgets**
   - View budget overview on the right side
   - Click the edit icon to set budget limits
   - See real-time spending progress
   - Visual indicators show when over budget

4. **View History**
   - Select a month to filter expenses
   - See all expenses in a detailed table
   - Delete expenses by clicking the trash icon

## Project Structure

```
family-budget-app/
├── public/
│   ├── index.html           # HTML template
│   └── electron.js          # Electron main process
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.tsx
│   │   ├── ExpenseForm.tsx
│   │   ├── ExpenseList.tsx
│   │   ├── BudgetOverview.tsx
│   │   ├── UserSelector.tsx
│   │   └── UserManager.tsx
│   ├── App.tsx              # Main app component
│   ├── index.tsx            # Entry point
│   ├── types.ts             # TypeScript types
│   └── storage.ts           # Local storage utilities
├── package.json
├── tsconfig.json
└── README.md
```

## Tech Stack

- **React 18** - UI framework
- **TypeScript** - Type safety
- **Electron** - Desktop framework
- **Lucide React** - Icons
- **CSS** - Styling with gradients and animations

## Features by Component

### Dashboard
- Main view for tracking and managing expenses
- Month/user selection
- Visual budget overview

### ExpenseForm
- Clean form for adding new expenses
- Pre-filled with current date
- Category selection

### ExpenseList
- Sortable expense history
- Color-coded user badges
- Easy deletion

### BudgetOverview
- Visual budget progress
- Inline budget editing
- Summary statistics
- Over-budget indicators

### UserManager
- Add/remove family members
- Color customization
- User cards with visual display

## Data Storage

Data is stored in browser's localStorage with the key `family-budget-data`.

**Default Data Structure**:
- **Users**: Mom, Dad, Child 1 with default budgets
- **Budgets**: Groceries ($500), Transportation ($200), Entertainment ($150), Utilities ($300)

To reset all data, clear browser localStorage or click the reset button (if implemented).

## Customization

### Adding Categories
Edit `src/components/ExpenseForm.tsx`:
```typescript
const CATEGORIES = [
  'Groceries',
  'Transportation',
  // Add more categories here
];
```

### Changing Colors
Edit `src/components/UserManager.tsx`:
```typescript
const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  // Add more colors here
];
```

### Styling
- All CSS files are in `src/components/` directory
- Main gradient colors are defined in `src/App.css`
- Modify CSS files for custom themes

## Troubleshooting

### Port 3000 already in use
If port 3000 is busy during development:
```bash
# On Windows PowerShell
$env:PORT=3001; npm start

# On Mac/Linux
PORT=3001 npm start
```

### Dependency resolution errors
Use the `--legacy-peer-deps` flag:
```bash
npm install --legacy-peer-deps
```

### Electron won't start
Make sure the React development server is running before starting Electron:
```bash
# Terminal 1
npm start

# Terminal 2 (in another terminal)
npm run electron
```

## Building for Distribution

### Windows
```bash
npm run dist
# Creates installer in dist/ folder
```

### macOS
```bash
npm run dist
# Creates DMG in dist/ folder
```

### Linux
```bash
npm run dist
# Creates AppImage in dist/ folder
```

## Future Enhancements

- 📈 Charts and analytics
- 📧 Export reports to PDF
- 🔄 Multi-device sync
- 📱 Mobile companion app
- 🎯 Recurring expenses
- 💳 Bill reminders
- 📊 Year-over-year comparisons

## License

MIT - Feel free to use for personal or family use.

## Support

For issues or questions, check the troubleshooting section above or review the code comments.

---

**Happy budgeting!** 💰

Made with ❤️ for families
