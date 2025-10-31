

import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import '../css/User.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/users/all-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      } else {
        throw new Error('Failed to fetch users');
      }
    } catch (error) {
      setMessage('Error fetching users: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (userId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'banned' : 'active';
    
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/users/ban/${userId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(users.map(user => 
          user._id === userId ? { ...user, status: newStatus } : user
        ));
        setMessage(`User ${newStatus === 'banned' ? 'banned' : 'activated'} successfully`);
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update user status');
      }
    } catch (error) {
      setMessage('Error updating user status: ' + error.message);
    }
  };

  const filteredUsers = users.filter(user =>
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.role?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading users...</p>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Users Management</h2>
        <p className="section-subtitle">Manage user accounts and permissions</p>
      </div>

      {/* Search Bar */}
      <div className="search-container">
        <div className="search-wrapper">
          <input
            type="text"
            placeholder="Search users by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
          <span className="search-icon">🔍</span>
        </div>
        <div className="users-count">
          {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
        </div>
      </div>

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          <span className="alert-icon">{message.includes('Error') ? '✕' : '✓'}</span>
          <span className="alert-message">{message}</span>
        </div>
      )}

      <div className="table-container">
        <table className="data-table">
          <thead>
            <tr>
              <th>User</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Joined Date</th>
              <th>Last Login</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user._id}>
                <td>
                  <div className="user-cell">
                    <div className="user-avatar">
                      {user.profile ? (
                        <img src={user.profile} alt={user.username} />
                      ) : (
                        <span>{user.username?.charAt(0).toUpperCase() || user.email?.charAt(0).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.username || 'No username'}</span>
                      {user.gender && <span className="user-gender">{user.gender}</span>}
                    </div>
                  </div>
                </td>
                <td>{user.email}</td>
                <td>
                  <span className={`role-badge ${user.role}`}>
                    {user.role}
                  </span>
                </td>
                <td>
                  <span className={`status-badge ${user.status}`}>
                    <span className="status-dot"></span>
                    {user.status}
                  </span>
                </td>
                <td>
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </td>
                <td>
                  {user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}
                </td>
                <td>
                  <button
                    className={`action-btn ${user.status === 'active' ? 'ban-btn' : 'activate-btn'}`}
                    onClick={() => handleStatusUpdate(user._id, user.status)}
                  >
                    {user.status === 'active' ? 'Ban User' : 'Activate User'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredUsers.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">👥</div>
          <h3>No users found</h3>
          <p>{searchTerm ? 'Try adjusting your search terms' : 'No users registered in the system'}</p>
        </div>
      )}
    </div>
  );
};

export default UsersManagement;