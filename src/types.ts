export interface User {
  id: string;
  name: string;
  color: string;
}

export interface Expense {
  id: string;
  userId: string;
  amount: number;
  category: string;
  description: string;
  date: string;
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM format
}

export interface AppState {
  users: User[];
  expenses: Expense[];
  budgets: Budget[];
  selectedUserId: string;
  selectedMonth: string;
}
