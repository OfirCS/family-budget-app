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
  isRecurring?: boolean; // If this expense is from a subscription
  subscriptionId?: string; // Link to subscription if applicable
}

export interface Budget {
  id: string;
  category: string;
  limit: number;
  month: string; // YYYY-MM format
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  category: string;
  frequency: 'monthly' | 'weekly' | 'yearly'; // How often it recurs
  dayOfMonth?: number; // For monthly (1-31)
  dayOfWeek?: number; // For weekly (0-6)
  monthOfYear?: number; // For yearly (1-12)
  isActive: boolean;
  lastProcessed?: string; // YYYY-MM-DD of last auto-expense
  startDate: string; // YYYY-MM-DD
  endDate?: string; // Optional end date
}

export interface SavingsGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string; // YYYY-MM-DD
  category?: string;
}

export interface AppState {
  users: User[];
  expenses: Expense[];
  budgets: Budget[];
  subscriptions: Subscription[];
  savingsGoals: SavingsGoal[];
  selectedUserId: string;
  selectedMonth: string;
  phoneNumberMapping?: { [phoneNumber: string]: string }; // Maps phone to userId
}
