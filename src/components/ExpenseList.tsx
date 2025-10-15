import React from 'react';
import { Expense, User } from '../types';
import { Trash2 } from 'lucide-react';
import './ExpenseList.css';

interface ExpenseListProps {
  expenses: Expense[];
  users: User[];
  selectedMonth: string;
  onRemoveExpense: (expenseId: string) => void;
}

const ExpenseList: React.FC<ExpenseListProps> = ({ expenses, users, selectedMonth, onRemoveExpense }) => {
  const filteredExpenses = expenses.filter((expense) =>
    expense.date.startsWith(selectedMonth)
  );

  const userMap = new Map(users.map((u) => [u.id, u]));

  const sortedExpenses = [...filteredExpenses].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  if (sortedExpenses.length === 0) {
    return <div className="empty-state">No expenses for this month</div>;
  }

  return (
    <div className="expense-list">
      <table className="expense-table">
        <thead>
          <tr>
            <th>Date</th>
            <th>User</th>
            <th>Category</th>
            <th>Description</th>
            <th>Amount</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {sortedExpenses.map((expense) => {
            const user = userMap.get(expense.userId);
            return (
              <tr key={expense.id}>
                <td>{new Date(expense.date).toLocaleDateString()}</td>
                <td>
                  {user && (
                    <span
                      className="user-badge"
                      style={{ backgroundColor: user.color }}
                    >
                      {user.name}
                    </span>
                  )}
                </td>
                <td>{expense.category}</td>
                <td>{expense.description}</td>
                <td className="amount">${expense.amount.toFixed(2)}</td>
                <td>
                  <button
                    className="delete-btn"
                    onClick={() => onRemoveExpense(expense.id)}
                    title="Delete expense"
                  >
                    <Trash2 size={16} />
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default ExpenseList;
