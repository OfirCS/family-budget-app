import React, { useState } from 'react';
import { Budget } from '../types';
import { Plus, Trash2, DollarSign } from 'lucide-react';
import './Settings.css';

interface SettingsProps {
  budgets: Budget[];
  selectedMonth: string;
  onSetBudget: (category: string, limit: number, month: string) => void;
  onRemoveBudget: (budgetId: string) => void;
  onSetSelectedMonth: (month: string) => void;
}

// All available budget categories
const AVAILABLE_CATEGORIES = [
  'Groceries',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Clothing',
  'Shopping',
  'Personal',
  'Pets',
  'Home'
];

const Settings: React.FC<SettingsProps> = ({
  budgets,
  selectedMonth,
  onSetBudget,
  onRemoveBudget,
  onSetSelectedMonth,
}) => {
  const [newCategory, setNewCategory] = useState('');
  const [newLimit, setNewLimit] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');

  const monthBudgets = budgets.filter(b => b.month === selectedMonth);

  const handleAddBudget = () => {
    if (newCategory && newLimit) {
      const limit = parseFloat(newLimit);
      if (!isNaN(limit) && limit > 0) {
        onSetBudget(newCategory, limit, selectedMonth);
        setNewCategory('');
        setNewLimit('');
      }
    }
  };

  const handleQuickAdd = (category: string) => {
    setNewCategory(category);
  };

  const startEdit = (budget: Budget) => {
    setEditingId(budget.id);
    setEditValue(budget.limit.toString());
  };

  const saveEdit = (budget: Budget) => {
    const value = parseFloat(editValue);
    if (!isNaN(value) && value > 0) {
      onSetBudget(budget.category, value, selectedMonth);
    }
    setEditingId(null);
  };

  const totalBudget = monthBudgets.reduce((sum, b) => sum + b.limit, 0);

  // Categories not yet budgeted
  const availableToAdd = AVAILABLE_CATEGORIES.filter(
    cat => !monthBudgets.some(b => b.category === cat)
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <h2>⚙️ Budget Settings</h2>
        <div className="month-selector">
          <label>Month:</label>
          <input
            type="month"
            value={selectedMonth}
            onChange={(e) => onSetSelectedMonth(e.target.value)}
          />
        </div>
      </div>

      <div className="settings-content">
        {/* Current Budgets */}
        <section className="budget-section">
          <div className="section-header">
            <h3>📊 Current Budgets for {selectedMonth}</h3>
            <div className="total-badge">
              <DollarSign size={16} />
              <span>{totalBudget.toFixed(2)} total</span>
            </div>
          </div>

          {monthBudgets.length === 0 ? (
            <div className="empty-state">
              <p>No budgets set for this month</p>
              <p>Add your first budget below!</p>
            </div>
          ) : (
            <div className="budget-grid">
              {monthBudgets.map((budget) => (
                <div key={budget.id} className="budget-card">
                  <div className="budget-card-header">
                    <h4>{budget.category}</h4>
                    <button
                      onClick={() => onRemoveBudget(budget.id)}
                      className="remove-btn"
                      title="Remove budget"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div className="budget-card-body">
                    {editingId === budget.id ? (
                      <div className="edit-mode">
                        <input
                          type="number"
                          value={editValue}
                          onChange={(e) => setEditValue(e.target.value)}
                          min="0"
                          step="0.01"
                          autoFocus
                          className="edit-input"
                        />
                        <div className="edit-actions">
                          <button onClick={() => saveEdit(budget)} className="save-btn">
                            Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="cancel-btn">
                            Cancel
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="view-mode">
                        <span className="budget-amount">${budget.limit.toFixed(2)}</span>
                        <button
                          onClick={() => startEdit(budget)}
                          className="edit-link"
                        >
                          Edit
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        {/* Add New Budget */}
        <section className="add-budget-section">
          <h3>➕ Add New Budget</h3>

          {availableToAdd.length > 0 && (
            <div className="quick-add">
              <p className="label">Quick add category:</p>
              <div className="category-chips">
                {availableToAdd.map(category => (
                  <button
                    key={category}
                    onClick={() => handleQuickAdd(category)}
                    className={`category-chip ${newCategory === category ? 'selected' : ''}`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="add-budget-form">
            <div className="form-row">
              <div className="form-group">
                <label>Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value)}
                  className="select-input"
                >
                  <option value="">Select category</option>
                  {AVAILABLE_CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Budget Limit</label>
                <input
                  type="number"
                  value={newLimit}
                  onChange={(e) => setNewLimit(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="number-input"
                />
              </div>

              <button
                onClick={handleAddBudget}
                disabled={!newCategory || !newLimit}
                className="add-btn"
              >
                <Plus size={18} />
                Add Budget
              </button>
            </div>
          </div>
        </section>

        {/* Info Section */}
        <section className="info-section">
          <h3>💡 How It Works</h3>
          <div className="info-grid">
            <div className="info-card">
              <h4>🤖 WhatsApp Bot</h4>
              <p>When you or your wife text expenses to the bot, they automatically categorize based on keywords and count against these budgets.</p>
            </div>
            <div className="info-card">
              <h4>🔄 Real-Time Sync</h4>
              <p>Changes here sync with the WhatsApp bot in real-time. Expenses added via WhatsApp appear here within seconds.</p>
            </div>
            <div className="info-card">
              <h4>📊 Smart Categories</h4>
              <p>The bot uses 200+ keywords to intelligently categorize expenses. You can also add expenses manually in the Dashboard.</p>
            </div>
            <div className="info-card">
              <h4>👥 Multi-User</h4>
              <p>Each phone number is automatically assigned to a family member. Track who's spending what!</p>
            </div>
          </div>
        </section>

        {/* Category Guide */}
        <section className="category-guide">
          <h3>📋 Category Examples</h3>
          <div className="guide-grid">
            <div className="guide-item">
              <strong>Groceries:</strong> food, restaurants, supermarkets, pizza, coffee
            </div>
            <div className="guide-item">
              <strong>Transportation:</strong> uber, gas, parking, car maintenance
            </div>
            <div className="guide-item">
              <strong>Entertainment:</strong> movies, netflix, games, vacation, concerts
            </div>
            <div className="guide-item">
              <strong>Utilities:</strong> electricity, internet, phone, water bills
            </div>
            <div className="guide-item">
              <strong>Healthcare:</strong> doctor, pharmacy, medicine, insurance
            </div>
            <div className="guide-item">
              <strong>Shopping:</strong> amazon, electronics, furniture, household items
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default Settings;
