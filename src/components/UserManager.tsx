import React, { useState } from 'react';
import { User } from '../types';
import { Plus, Trash2 } from 'lucide-react';
import './UserManager.css';

interface UserManagerProps {
  users: User[];
  onAddUser: (name: string, color: string) => void;
  onRemoveUser: (userId: string) => void;
}

const COLORS = [
  '#FF6B6B',
  '#4ECDC4',
  '#45B7D1',
  '#FFA502',
  '#9B59B6',
  '#E74C3C',
  '#3498DB',
  '#2ECC71',
];

const UserManager: React.FC<UserManagerProps> = ({ users, onAddUser, onRemoveUser }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState(COLORS[0]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    onAddUser(name, color);
    setName('');
    setColor(COLORS[0]);
  };

  return (
    <div className="user-manager">
      <div className="user-form-card">
        <h2>Add Family Member</h2>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Name:</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., John"
              required
            />
          </div>

          <div className="form-group">
            <label>Color:</label>
            <div className="color-picker">
              {COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  className={`color-option ${color === c ? 'selected' : ''}`}
                  style={{ backgroundColor: c }}
                  onClick={() => setColor(c)}
                />
              ))}
            </div>
          </div>

          <button type="submit" className="submit-btn">
            <Plus size={20} />
            Add Member
          </button>
        </form>
      </div>

      <div className="users-list-card">
        <h2>Family Members</h2>
        {users.length === 0 ? (
          <p className="empty-message">No family members yet. Add one above!</p>
        ) : (
          <div className="users-grid">
            {users.map((user) => (
              <div key={user.id} className="user-card">
                <div
                  className="user-color"
                  style={{ backgroundColor: user.color }}
                />
                <div className="user-info">
                  <h3>{user.name}</h3>
                  <p style={{ color: user.color }}>●</p>
                </div>
                <button
                  className="remove-btn"
                  onClick={() => onRemoveUser(user.id)}
                  title="Remove user"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserManager;
