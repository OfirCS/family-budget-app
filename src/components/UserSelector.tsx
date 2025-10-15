import React from 'react';
import { User } from '../types';
import './UserSelector.css';

interface UserSelectorProps {
  users: User[];
  selectedUserId: string;
  onSelectUser: (userId: string) => void;
}

const UserSelector: React.FC<UserSelectorProps> = ({ users, selectedUserId, onSelectUser }) => {
  return (
    <div className="user-selector">
      <label>User:</label>
      <div className="user-buttons">
        {users.map((user) => (
          <button
            key={user.id}
            className={`user-btn ${selectedUserId === user.id ? 'active' : ''}`}
            onClick={() => onSelectUser(user.id)}
            style={{
              borderColor: user.color,
              backgroundColor: selectedUserId === user.id ? user.color : 'white',
              color: selectedUserId === user.id ? 'white' : user.color,
            }}
          >
            {user.name}
          </button>
        ))}
      </div>
    </div>
  );
};

export default UserSelector;
