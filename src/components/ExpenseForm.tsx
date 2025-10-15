import React, { useState } from 'react';
import { User } from '../types';
import { Plus } from 'lucide-react';
import './ExpenseForm.css';

interface ExpenseFormProps {
  users: User[];
  selectedUserId: string;
  onAddExpense: (userId: string, amount: number, category: string, description: string, date: string) => void;
}

const CATEGORIES = [
  'Groceries',
  'Transportation',
  'Entertainment',
  'Utilities',
  'Healthcare',
  'Education',
  'Clothing',
  'Other',
];

const ExpenseForm: React.FC<ExpenseFormProps> = ({ users, selectedUserId, onAddExpense }) => {
  const [amount, setAmount] = useState('');
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [userId, setUserId] = useState(selectedUserId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!amount || !category || !description) return;

    onAddExpense(userId, parseFloat(amount), category, description, date);
    setAmount('');
    setDescription('');
    setDate(new Date().toISOString().split('T')[0]);
  };

  return (
    <div className="expense-form-card">
      <h2>Add Expense</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>User:</label>
          <select value={userId} onChange={(e) => setUserId(e.target.value)}>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Amount ($):</label>
          <input
            type="number"
            step="0.01"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            required
          />
        </div>

        <div className="form-group">
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((cat) => (
              <option key={cat} value={cat}>
                {cat}
              </option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Description:</label>
          <input
            type="text"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="e.g., Weekly groceries"
            required
          />
        </div>

        <div className="form-group">
          <label>Date:</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            required
          />
        </div>

        <button type="submit" className="submit-btn">
          <Plus size={20} />
          Add Expense
        </button>
      </form>
    </div>
  );
};

export default ExpenseForm;
