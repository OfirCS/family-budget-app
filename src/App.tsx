import React, { useState, useEffect } from 'react';
import { loadState, saveState } from './storage';
import { AppState, User, Expense, Budget } from './types';
import Dashboard from './components/Dashboard';
import UserManager from './components/UserManager';
import './App.css';

const App: React.FC = () => {
  const [state, setState] = useState<AppState>(loadState());
  const [activeView, setActiveView] = useState<'dashboard' | 'users'>('dashboard');

  useEffect(() => {
    saveState(state);
  }, [state]);

  const addUser = (name: string, color: string) => {
    const newUser: User = {
      id: Date.now().toString(),
      name,
      color,
    };
    setState({
      ...state,
      users: [...state.users, newUser],
    });
  };

  const removeUser = (userId: string) => {
    setState({
      ...state,
      users: state.users.filter(u => u.id !== userId),
      expenses: state.expenses.filter(e => e.userId !== userId),
    });
  };

  const addExpense = (userId: string, amount: number, category: string, description: string, date: string) => {
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
  };

  const removeExpense = (expenseId: string) => {
    setState({
      ...state,
      expenses: state.expenses.filter(e => e.id !== expenseId),
    });
  };

  const setBudget = (category: string, limit: number, month: string) => {
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

  return (
    <div className="app">
      <header className="header">
        <h1>💰 Family Budget</h1>
        <nav className="nav">
          <button
            className={`nav-btn ${activeView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveView('dashboard')}
          >
            Dashboard
          </button>
          <button
            className={`nav-btn ${activeView === 'users' ? 'active' : ''}`}
            onClick={() => setActiveView('users')}
          >
            Users
          </button>
        </nav>
      </header>

      <main className="main-content">
        {activeView === 'dashboard' ? (
          <Dashboard
            state={state}
            onAddExpense={addExpense}
            onRemoveExpense={removeExpense}
            onSetBudget={setBudget}
            onSetSelectedUser={setSelectedUser}
            onSetSelectedMonth={setSelectedMonth}
          />
        ) : (
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
