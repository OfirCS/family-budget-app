import React, { useState } from 'react';
import { Expense, Budget } from '../types';
import { Edit2 } from 'lucide-react';
import './BudgetOverview.css';

interface BudgetOverviewProps {
  expenses: Expense[];
  budgets: Budget[];
  selectedMonth: string;
  onSetBudget: (category: string, limit: number, month: string) => void;
}

const BudgetOverview: React.FC<BudgetOverviewProps> = ({
  expenses,
  budgets,
  selectedMonth,
  onSetBudget,
}) => {
  const [editingCategory, setEditingCategory] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const monthExpenses = expenses.filter((e) => e.date.startsWith(selectedMonth));

  const categories = Array.from(new Set([
    ...budgets.map((b) => b.category),
    ...monthExpenses.map((e) => e.category),
  ]));

  const getCategoryBudget = (category: string): number => {
    const budget = budgets.find(
      (b) => b.category === category && b.month === selectedMonth
    );
    return budget?.limit || 0;
  };

  const getCategorySpent = (category: string): number => {
    return monthExpenses
      .filter((e) => e.category === category)
      .reduce((sum, e) => sum + e.amount, 0);
  };

  const startEdit = (category: string) => {
    const current = getCategoryBudget(category);
    setEditingCategory(category);
    setEditValue(current.toString());
  };

  const saveEdit = (category: string) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value >= 0) {
      onSetBudget(category, value, selectedMonth);
    }
    setEditingCategory(null);
  };

  const totalBudget = categories.reduce((sum, cat) => sum + getCategoryBudget(cat), 0);
  const totalSpent = monthExpenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="budget-overview">
      <h2>Budget Overview</h2>
      <div className="budget-summary">
        <div className="summary-item">
          <span>Total Budget:</span>
          <span className="amount">${totalBudget.toFixed(2)}</span>
        </div>
        <div className="summary-item">
          <span>Total Spent:</span>
          <span className={`amount ${totalSpent > totalBudget ? 'over-budget' : ''}`}>
            ${totalSpent.toFixed(2)}
          </span>
        </div>
        <div className="summary-item">
          <span>Remaining:</span>
          <span className={`amount ${totalSpent > totalBudget ? 'over-budget' : 'under-budget'}`}>
            ${Math.max(0, totalBudget - totalSpent).toFixed(2)}
          </span>
        </div>
      </div>

      <div className="budget-categories">
        {categories.map((category) => {
          const budget = getCategoryBudget(category);
          const spent = getCategorySpent(category);
          const percentage = budget > 0 ? (spent / budget) * 100 : 0;
          const isOverBudget = spent > budget && budget > 0;

          return (
            <div key={category} className="budget-item">
              <div className="budget-header">
                <span className="category-name">{category}</span>
                {editingCategory === category ? (
                  <div className="budget-edit">
                    <input
                      type="number"
                      value={editValue}
                      onChange={(e) => setEditValue(e.target.value)}
                      min="0"
                      step="0.01"
                      autoFocus
                    />
                    <button
                      onClick={() => saveEdit(category)}
                      className="save-btn"
                    >
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => startEdit(category)}
                    className="edit-btn"
                  >
                    <Edit2 size={14} />
                  </button>
                )}
              </div>

              <div className="budget-bar">
                <div
                  className={`budget-progress ${isOverBudget ? 'over-budget' : ''}`}
                  style={{ width: `${Math.min(percentage, 100)}%` }}
                />
              </div>

              <div className="budget-details">
                <span>${spent.toFixed(2)}</span>
                <span>/</span>
                <span>${budget.toFixed(2)}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default BudgetOverview;
