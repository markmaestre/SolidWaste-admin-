import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import '../css/User.css';

const UsersManagement = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState({
    role: 'all',
    status: 'all',
    gender: 'all'
  });

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

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  const clearFilters = () => {
    setFilters({
      role: 'all',
      status: 'all',
      gender: 'all'
    });
  };

  // Apply both search and filters
  const filteredUsers = users.filter(user => {
    // Search filter
    const matchesSearch = 
      user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.role?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.gender?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.status?.toLowerCase().includes(searchTerm.toLowerCase());

    // Role filter
    const matchesRole = filters.role === 'all' || user.role === filters.role;
    
    // Status filter
    const matchesStatus = filters.status === 'all' || user.status === filters.status;
    
    // Gender filter
    const matchesGender = filters.gender === 'all' || user.gender === filters.gender;

    return matchesSearch && matchesRole && matchesStatus && matchesGender;
  });

  // Get unique values for filter options
  const uniqueRoles = [...new Set(users.map(user => user.role).filter(Boolean))];
  const uniqueStatuses = [...new Set(users.map(user => user.status).filter(Boolean))];
  const uniqueGenders = [...new Set(users.map(user => user.gender).filter(Boolean))];

  const activeFiltersCount = Object.values(filters).filter(value => value !== 'all').length;

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
    <div className="users-management-content">
      {/* Top Bar */}
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item active">Users Management</span>
          </div>
          <h1 className="page-title">Users Management</h1>
          <p className="page-subtitle">
            <span className="subtitle-dot"></span>
            Manage user accounts and permissions
          </p>
        </div>
        <div className="topbar-right">
          <div className="topbar-date">
            <div className="date-icon">📅</div>
            <span>
              {new Date().toLocaleDateString('en-US', { 
                weekday: 'long', 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="management-section">
        
        {/* Search Bar */}
        <div className="search-container">
          <div className="search-header">
            <div className="search-wrapper">
              <input
                type="text"
                placeholder="Search users by name, email, role, gender, or status..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
              <span className="search-icon">🔍</span>
            </div>
            <div className="users-count">
              {filteredUsers.length} user{filteredUsers.length !== 1 ? 's' : ''} found
              {searchTerm && ` for "${searchTerm}"`}
            </div>
          </div>
        </div>

        {/* Filter Section */}
        <div className="filters-container">
          <div className="filters-header">
            <h3 className="filters-title">Filters</h3>
            {activeFiltersCount > 0 && (
              <button className="clear-filters-btn" onClick={clearFilters}>
                Clear All ({activeFiltersCount})
              </button>
            )}
          </div>
          
          <div className="filters-grid">
            {/* Role Filter */}
            <div className="filter-group">
              <label className="filter-label">Role</label>
              <select
                value={filters.role}
                onChange={(e) => handleFilterChange('role', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Roles</option>
                {uniqueRoles.map(role => (
                  <option key={role} value={role}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Status Filter */}
            <div className="filter-group">
              <label className="filter-label">Status</label>
              <select
                value={filters.status}
                onChange={(e) => handleFilterChange('status', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Statuses</option>
                {uniqueStatuses.map(status => (
                  <option key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </option>
                ))}
              </select>
            </div>

            {/* Gender Filter */}
            <div className="filter-group">
              <label className="filter-label">Gender</label>
              <select
                value={filters.gender}
                onChange={(e) => handleFilterChange('gender', e.target.value)}
                className="filter-select"
              >
                <option value="all">All Genders</option>
                {uniqueGenders.map(gender => (
                  <option key={gender} value={gender}>
                    {gender.charAt(0).toUpperCase() + gender.slice(1)}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Active Filters Display */}
          {activeFiltersCount > 0 && (
            <div className="active-filters">
              <span className="active-filters-label">Active filters:</span>
              {filters.role !== 'all' && (
                <span className="active-filter-tag">
                  Role: {filters.role}
                  <button onClick={() => handleFilterChange('role', 'all')}>×</button>
                </span>
              )}
              {filters.status !== 'all' && (
                <span className="active-filter-tag">
                  Status: {filters.status}
                  <button onClick={() => handleFilterChange('status', 'all')}>×</button>
                </span>
              )}
              {filters.gender !== 'all' && (
                <span className="active-filter-tag">
                  Gender: {filters.gender}
                  <button onClick={() => handleFilterChange('gender', 'all')}>×</button>
                </span>
              )}
            </div>
          )}
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
                <th>Gender</th>
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
                    {user.gender ? (
                      <span className="gender-badge">
                        {user.gender}
                      </span>
                    ) : (
                      'Not specified'
                    )}
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
            <p>
              {searchTerm || activeFiltersCount > 0 
                ? 'Try adjusting your search terms or filters' 
                : 'No users registered in the system'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UsersManagement;