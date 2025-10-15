import { AppState } from './types';

const STORAGE_KEY = 'family-budget-data';

const DEFAULT_STATE: AppState = {
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

export const loadState = (): AppState => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (error) {
    console.error('Failed to load state:', error);
  }
  return DEFAULT_STATE;
};

export const saveState = (state: AppState): void => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch (error) {
    console.error('Failed to save state:', error);
  }
};

export const resetData = (): AppState => {
  localStorage.removeItem(STORAGE_KEY);
  return DEFAULT_STATE;
};
