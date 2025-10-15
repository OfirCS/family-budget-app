import React from 'react';
import { AppState } from '../types';
import ExpenseForm from './ExpenseForm';
import ExpenseList from './ExpenseList';
import BudgetOverview from './BudgetOverview';
import UserSelector from './UserSelector';
import './Dashboard.css';

interface DashboardProps {
  state: AppState;
  onAddExpense: (userId: string, amount: number, category: string, description: string, date: string) => void;
  onRemoveExpense: (expenseId: string) => void;
  onSetBudget: (category: string, limit: number, month: string) => void;
  onSetSelectedUser: (userId: string) => void;
  onSetSelectedMonth: (month: string) => void;
}

const Dashboard: React.FC<DashboardProps> = ({
  state,
  onAddExpense,
  onRemoveExpense,
  onSetBudget,
  onSetSelectedUser,
  onSetSelectedMonth,
}) => {
  return (
    <div className="dashboard">
      <div className="dashboard-controls">
        <UserSelector
          users={state.users}
          selectedUserId={state.selectedUserId}
          onSelectUser={onSetSelectedUser}
        />
        <div className="month-selector">
          <label>Month:</label>
          <input
            type="month"
            value={state.selectedMonth}
            onChange={(e) => onSetSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="left-column">
          <ExpenseForm
            users={state.users}
            selectedUserId={state.selectedUserId}
            onAddExpense={onAddExpense}
          />
        </div>

        <div className="right-column">
          <BudgetOverview
            expenses={state.expenses}
            budgets={state.budgets}
            selectedMonth={state.selectedMonth}
            onSetBudget={onSetBudget}
          />
        </div>
      </div>

      <div className="expenses-section">
        <h2>Expense History</h2>
        <ExpenseList
          expenses={state.expenses}
          users={state.users}
          selectedMonth={state.selectedMonth}
          onRemoveExpense={onRemoveExpense}
        />
      </div>
    </div>
  );
};

export default Dashboard;
