import React, { useState, useEffect } from 'react';
import { loadState, saveState } from './storage';
import { AppState, User, Expense, Budget, Subscription, SavingsGoal } from './types';
import Dashboard from './components/Dashboard';
import UserManager from './components/UserManager';
import Settings from './components/Settings';
import Subscriptions from './components/Subscriptions';
import './App.css';

const API_URL = 'http://localhost:3002';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeView, setActiveView] = useState<'dashboard' | 'users' | 'settings' | 'subscriptions'>('dashboard');
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSync, setLastSync] = useState<Date | null>(null);

  // Real-time sync from bot API
  useEffect(() => {
    const syncFromBot = async () => {
      try {
        const response = await fetch(`${API_URL}/api/data`);
        if (response.ok) {
          const botData = await response.json();
          setState(botData);
          setLastSync(new Date());
        }
      } catch (error) {
        console.log('Bot not running or unreachable - using local storage');
      }
    };

    // Initial sync
    syncFromBot();

    // Poll for updates every 5 seconds
    const interval = setInterval(syncFromBot, 5000);

    return () => clearInterval(interval);
  }, []);

  // Save to local storage and bot
  useEffect(() => {
    saveState(state);

    // Sync to bot if available
    const syncToBot = async () => {
      try {
        setIsSyncing(true);
        // Bot saves automatically through its endpoints
        setIsSyncing(false);
      } catch (error) {
        console.log('Could not sync to bot');
        setIsSyncing(false);
      }
    };

    syncToBot();
  }, [state]);

  const addUser = async (name: string, color: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      color,
    };

    setState({
      ...state,
      users: [...state.users, newUser],
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/user`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, color })
      });
    } catch (error) {
      console.log('Could not sync user to bot');
    }
  };

  const removeUser = (userId: string) => {
    setState({
      ...state,
      users: state.users.filter(u => u.id !== userId),
      expenses: state.expenses.filter(e => e.userId !== userId),
    });
  };

  const addExpense = async (userId: string, amount: number, category: string, description: string, date: string) => {
    const newExpense: Expense = {
      id: Date.now().toString(),
      userId,
      amount,
      category,
      description,
      date,
    };

    setState({
      ...state,
      expenses: [...state.expenses, newExpense],
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/expense`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, amount, category, description })
      });
    } catch (error) {
      console.log('Could not sync expense to bot');
    }
  };

  const removeExpense = (expenseId: string) => {
    setState({
      ...state,
      expenses: state.expenses.filter(e => e.id !== expenseId),
    });
  };

  const setBudget = async (category: string, limit: number, month: string) => {
    const existingBudget = state.budgets.find(b => b.category === category && b.month === month);

    if (existingBudget) {
      setState({
        ...state,
        budgets: state.budgets.map(b =>
          b.id === existingBudget.id ? { ...b, limit } : b
        ),
      });
    } else {
      const newBudget: Budget = {
        id: Date.now().toString(),
        category,
        limit,
        month,
      };
      setState({
        ...state,
        budgets: [...state.budgets, newBudget],
      });
    }

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/budget`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ category, limit, month })
      });
    } catch (error) {
      console.log('Could not sync budget to bot');
    }
  };

  const removeBudget = async (budgetId: string) => {
    setState({
      ...state,
      budgets: state.budgets.filter(b => b.id !== budgetId),
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/budget/${budgetId}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.log('Could not delete budget from bot');
    }
  };

  const setSelectedUser = (userId: string) => {
    setState({
      ...state,
      selectedUserId: userId,
    });
  };

  const setSelectedMonth = (month: string) => {
    setState({
      ...state,
      selectedMonth: month,
    });
  };

  // Subscription handlers
  const addSubscription = async (subscription: Omit<Subscription, 'id'>) => {
    const newSubscription: Subscription = {
      ...subscription,
      id: Date.now().toString(),
    };

    setState({
      ...state,
      subscriptions: [...(state.subscriptions || []), newSubscription],
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/subscription`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.log('Could not sync subscription to bot');
    }
  };

  const updateSubscription = async (id: string, updates: Partial<Subscription>) => {
    setState({
      ...state,
      subscriptions: (state.subscriptions || []).map(sub =>
        sub.id === id ? { ...sub, ...updates } : sub
      ),
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/subscription/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.log('Could not update subscription on bot');
    }
  };

  const removeSubscription = async (id: string) => {
    setState({
      ...state,
      subscriptions: (state.subscriptions || []).filter(sub => sub.id !== id),
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/subscription/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.log('Could not delete subscription from bot');
    }
  };

  // Savings goal handlers
  const addSavingsGoal = async (goal: Omit<SavingsGoal, 'id'>) => {
    const newGoal: SavingsGoal = {
      ...goal,
      id: Date.now().toString(),
    };

    setState({
      ...state,
      savingsGoals: [...(state.savingsGoals || []), newGoal],
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/savings-goal`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(goal)
      });
    } catch (error) {
      console.log('Could not sync savings goal to bot');
    }
  };

  const updateSavingsGoal = async (id: string, updates: Partial<SavingsGoal>) => {
    setState({
      ...state,
      savingsGoals: (state.savingsGoals || []).map(goal =>
        goal.id === id ? { ...goal, ...updates } : goal
      ),
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/savings-goal/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates)
      });
    } catch (error) {
      console.log('Could not update savings goal on bot');
    }
  };

  const removeSavingsGoal = async (id: string) => {
    setState({
      ...state,
      savingsGoals: (state.savingsGoals || []).filter(goal => goal.id !== id),
    });

    // Sync to bot
    try {
      await fetch(`${API_URL}/api/savings-goal/${id}`, {
        method: 'DELETE'
      });
    } catch (error) {
      console.log('Could not delete savings goal from bot');
    }
  };

  return (
    <div className="app">
      <header className="header">
        <div className="header-left">
          <h1>💰 Family Budget</h1>
          {lastSync && (
            <span className="sync-status">
              {isSyncing ? '🔄 Syncing...' : `✅ Synced ${lastSync.toLocaleTimeString()}`}
            </span>
          )}
        </div>
        <nav className="nav">
          <button
            className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            📊 Dashboard
          </button>
          <button
            className={`nav-btn ${activeView === 'subscriptions' ? 'active' : ''}`}
            onClick={() => setActiveView('subscriptions')}
          >
            🔄 Subscriptions
          </button>
          <button
            className={`nav-btn ${activeView === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveView('settings')}
          >
            ⚙️ Settings
          </button>
          <button
            className={`nav-btn ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => setActiveView('users')}
          >
            👥 Users
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeView === 'dashboard' && (
          <Dashboard
            state={state}
            onAddExpense={addExpense}
            onRemoveExpense={removeExpense}
            onSetBudget={setBudget}
            onSetSelectedUser={setSelectedUser}
            onSetSelectedMonth={setSelectedMonth}
          />
        )}
        {activeView === 'subscriptions' && (
          <Subscriptions
            subscriptions={state.subscriptions || []}
            onAddSubscription={addSubscription}
            onUpdateSubscription={updateSubscription}
            onRemoveSubscription={removeSubscription}
          />
        )}
        {activeView === 'settings' && (
          <Settings
            budgets={state.budgets}
            selectedMonth={state.selectedMonth}
            onSetBudget={setBudget}
            onRemoveBudget={removeBudget}
            onSetSelectedMonth={setSelectedMonth}
          />
        )}
        {activeView === 'users' && (
          <UserManager
            users={state.users}
            onAddUser={addUser}
            onRemoveUser={removeUser}
          />
        )}
      </main>
    </div>
  );
};

export default App;
