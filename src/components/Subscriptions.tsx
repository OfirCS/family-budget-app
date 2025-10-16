import React, { useState } from 'react';
import { Subscription } from '../types';
import { Plus, Trash2, PlayCircle, PauseCircle, Calendar } from 'lucide-react';
import './Subscriptions.css';

interface SubscriptionsProps {
  subscriptions: Subscription[];
  onAddSubscription: (subscription: Omit<Subscription, 'id'>) => void;
  onUpdateSubscription: (id: string, updates: Partial<Subscription>) => void;
  onRemoveSubscription: (id: string) => void;
}

const CATEGORIES = [
  'Entertainment', 'Utilities', 'Healthcare', 'Education',
  'Shopping', 'Transportation', 'Personal', 'Home'
];

const Subscriptions: React.FC<SubscriptionsProps> = ({
  subscriptions,
  onAddSubscription,
  onUpdateSubscription,
  onRemoveSubscription,
}) => {
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    amount: '',
    category: 'Entertainment',
    frequency: 'monthly' as 'monthly' | 'weekly' | 'yearly',
    dayOfMonth: '1',
    dayOfWeek: '1',
    monthOfYear: '1',
    startDate: new Date().toISOString().split('T')[0],
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(formData.amount);
    if (!formData.name || isNaN(amount) || amount <= 0) return;

    const newSubscription: Omit<Subscription, 'id'> = {
      name: formData.name,
      amount,
      category: formData.category,
      frequency: formData.frequency,
      isActive: true,
      startDate: formData.startDate,
    };

    if (formData.frequency === 'monthly') {
      newSubscription.dayOfMonth = parseInt(formData.dayOfMonth);
    } else if (formData.frequency === 'weekly') {
      newSubscription.dayOfWeek = parseInt(formData.dayOfWeek);
    } else if (formData.frequency === 'yearly') {
      newSubscription.monthOfYear = parseInt(formData.monthOfYear);
      newSubscription.dayOfMonth = parseInt(formData.dayOfMonth);
    }

    onAddSubscription(newSubscription);
    setFormData({
      name: '',
      amount: '',
      category: 'Entertainment',
      frequency: 'monthly',
      dayOfMonth: '1',
      dayOfWeek: '1',
      monthOfYear: '1',
      startDate: new Date().toISOString().split('T')[0],
    });
    setShowAddForm(false);
  };

  const toggleActive = (subscription: Subscription) => {
    onUpdateSubscription(subscription.id, { isActive: !subscription.isActive });
  };

  const getNextBillingDate = (sub: Subscription): string => {
    const today = new Date();
    let nextDate = new Date();

    if (sub.frequency === 'monthly' && sub.dayOfMonth) {
      nextDate.setDate(sub.dayOfMonth);
      if (nextDate < today) {
        nextDate.setMonth(nextDate.getMonth() + 1);
      }
    } else if (sub.frequency === 'weekly' && sub.dayOfWeek !== undefined) {
      const daysUntil = (sub.dayOfWeek - today.getDay() + 7) % 7;
      nextDate.setDate(today.getDate() + daysUntil);
      if (daysUntil === 0) nextDate.setDate(nextDate.getDate() + 7);
    } else if (sub.frequency === 'yearly' && sub.monthOfYear && sub.dayOfMonth) {
      nextDate.setMonth(sub.monthOfYear - 1);
      nextDate.setDate(sub.dayOfMonth);
      if (nextDate < today) {
        nextDate.setFullYear(nextDate.getFullYear() + 1);
      }
    }

    return nextDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };

  const activeSubscriptions = subscriptions.filter(s => s.isActive);
  const inactiveSubscriptions = subscriptions.filter(s => !s.isActive);
  const totalMonthly = activeSubscriptions.reduce((sum, sub) => {
    if (sub.frequency === 'monthly') return sum + sub.amount;
    if (sub.frequency === 'weekly') return sum + (sub.amount * 52 / 12);
    if (sub.frequency === 'yearly') return sum + (sub.amount / 12);
    return sum;
  }, 0);

  return (
    <div className="subscriptions">
      <div className="subscriptions-header">
        <div>
          <h2>🔄 Subscriptions & Recurring Expenses</h2>
          <p className="subtitle">Automatically track your recurring bills and subscriptions</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="add-subscription-btn"
        >
          <Plus size={20} />
          Add Subscription
        </button>
      </div>

      <div className="stats-cards">
        <div className="stat-card">
          <div className="stat-icon">💰</div>
          <div className="stat-content">
            <div className="stat-value">${totalMonthly.toFixed(2)}</div>
            <div className="stat-label">Monthly Cost</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📊</div>
          <div className="stat-content">
            <div className="stat-value">{activeSubscriptions.length}</div>
            <div className="stat-label">Active Subscriptions</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon">📅</div>
          <div className="stat-content">
            <div className="stat-value">${(totalMonthly * 12).toFixed(0)}</div>
            <div className="stat-label">Yearly Cost</div>
          </div>
        </div>
      </div>

      {showAddForm && (
        <div className="add-form-card">
          <h3>➕ New Subscription</h3>
          <form onSubmit={handleSubmit} className="subscription-form">
            <div className="form-grid">
              <div className="form-group">
                <label>Subscription Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., Netflix, Spotify, Gym Membership"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  placeholder="0.00"
                  step="0.01"
                  min="0"
                  className="form-input"
                  required
                />
              </div>

              <div className="form-group">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  className="form-select"
                >
                  {CATEGORIES.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label>Frequency</label>
                <select
                  value={formData.frequency}
                  onChange={(e) => setFormData({ ...formData, frequency: e.target.value as any })}
                  className="form-select"
                >
                  <option value="weekly">Weekly</option>
                  <option value="monthly">Monthly</option>
                  <option value="yearly">Yearly</option>
                </select>
              </div>

              {formData.frequency === 'monthly' && (
                <div className="form-group">
                  <label>Day of Month</label>
                  <input
                    type="number"
                    value={formData.dayOfMonth}
                    onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                    min="1"
                    max="31"
                    className="form-input"
                  />
                </div>
              )}

              {formData.frequency === 'weekly' && (
                <div className="form-group">
                  <label>Day of Week</label>
                  <select
                    value={formData.dayOfWeek}
                    onChange={(e) => setFormData({ ...formData, dayOfWeek: e.target.value })}
                    className="form-select"
                  >
                    <option value="0">Sunday</option>
                    <option value="1">Monday</option>
                    <option value="2">Tuesday</option>
                    <option value="3">Wednesday</option>
                    <option value="4">Thursday</option>
                    <option value="5">Friday</option>
                    <option value="6">Saturday</option>
                  </select>
                </div>
              )}

              {formData.frequency === 'yearly' && (
                <>
                  <div className="form-group">
                    <label>Month</label>
                    <select
                      value={formData.monthOfYear}
                      onChange={(e) => setFormData({ ...formData, monthOfYear: e.target.value })}
                      className="form-select"
                    >
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'].map((m, i) => (
                        <option key={m} value={i + 1}>{m}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Day</label>
                    <input
                      type="number"
                      value={formData.dayOfMonth}
                      onChange={(e) => setFormData({ ...formData, dayOfMonth: e.target.value })}
                      min="1"
                      max="31"
                      className="form-input"
                    />
                  </div>
                </>
              )}

              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-actions">
              <button type="submit" className="submit-btn">
                <Plus size={18} />
                Add Subscription
              </button>
              <button type="button" onClick={() => setShowAddForm(false)} className="cancel-btn">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {activeSubscriptions.length > 0 && (
        <div className="subscriptions-section">
          <h3>✅ Active Subscriptions</h3>
          <div className="subscriptions-grid">
            {activeSubscriptions.map(sub => (
              <div key={sub.id} className="subscription-card active">
                <div className="card-header">
                  <div className="card-title-section">
                    <h4>{sub.name}</h4>
                    <span className="category-badge">{sub.category}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => toggleActive(sub)}
                      className="icon-btn pause-btn"
                      title="Pause subscription"
                    >
                      <PauseCircle size={18} />
                    </button>
                    <button
                      onClick={() => onRemoveSubscription(sub.id)}
                      className="icon-btn delete-btn"
                      title="Delete subscription"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="amount-section">
                    <div className="amount">${sub.amount.toFixed(2)}</div>
                    <div className="frequency">{sub.frequency}</div>
                  </div>

                  <div className="next-billing">
                    <Calendar size={16} />
                    <span>Next billing: {getNextBillingDate(sub)}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {inactiveSubscriptions.length > 0 && (
        <div className="subscriptions-section">
          <h3>⏸️ Paused Subscriptions</h3>
          <div className="subscriptions-grid">
            {inactiveSubscriptions.map(sub => (
              <div key={sub.id} className="subscription-card inactive">
                <div className="card-header">
                  <div className="card-title-section">
                    <h4>{sub.name}</h4>
                    <span className="category-badge">{sub.category}</span>
                  </div>
                  <div className="card-actions">
                    <button
                      onClick={() => toggleActive(sub)}
                      className="icon-btn resume-btn"
                      title="Resume subscription"
                    >
                      <PlayCircle size={18} />
                    </button>
                    <button
                      onClick={() => onRemoveSubscription(sub.id)}
                      className="icon-btn delete-btn"
                      title="Delete subscription"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                </div>

                <div className="card-body">
                  <div className="amount-section">
                    <div className="amount">${sub.amount.toFixed(2)}</div>
                    <div className="frequency">{sub.frequency}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {subscriptions.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">📱</div>
          <h3>No subscriptions yet</h3>
          <p>Start tracking your recurring expenses like Netflix, Spotify, gym memberships, and more!</p>
          <button onClick={() => setShowAddForm(true)} className="empty-action-btn">
            <Plus size={20} />
            Add Your First Subscription
          </button>
        </div>
      )}
    </div>
  );
};

export default Subscriptions;
