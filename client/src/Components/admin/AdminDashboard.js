// src/components/AdminDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Utils/Api';
import '../css/AdminDashboard.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: '',
    password: '',
    profile: null
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      navigate('/Login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      setProfileForm(prev => ({ ...prev, email: parsedAdmin.email }));
      fetchAdminProfile();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('Login');
    }
  }, [navigate]);

  const fetchAdminProfile = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/admins/profile`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setAdmin(data.admin);
      } else {
        throw new Error('Failed to fetch profile');
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setMessage('Error loading profile data');
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const token = localStorage.getItem('adminToken');
      const formData = new FormData();
      
      if (profileForm.email !== admin.email) {
        formData.append('email', profileForm.email);
      }
      
      if (profileForm.password) {
        formData.append('password', profileForm.password);
      }
      
      if (profileForm.profile) {
        formData.append('profile', profileForm.profile);
      }

      const response = await fetch(`${API_URL}/api/admins/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setAdmin(data.admin);
        localStorage.setItem('adminData', JSON.stringify(data.admin));
        setMessage('Profile updated successfully!');
        setShowEditProfile(false);
        setProfileForm(prev => ({ ...prev, password: '', profile: null }));
      } else {
        setMessage(data.message || 'Failed to update profile');
      }
    } catch (error) {
      setMessage('Network error. Please try again.');
      console.error('Profile update error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (e) => {
    setProfileForm({
      ...profileForm,
      profile: e.target.files[0]
    });
  };

  const handleInputChange = (e) => {
    setProfileForm({
      ...profileForm,
      [e.target.name]: e.target.value
    });
  };

  if (!admin) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p className="loading-text">Loading WasteWise System...</p>
        <div className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      {/* Decorative Background Elements */}
      <div className="background-decoration">
        <div className="decoration-grid"></div>
        <div className="decoration-line line-1"></div>
        <div className="decoration-line line-2"></div>
        <div className="decoration-line line-3"></div>
        <div className="decoration-glow glow-1"></div>
        <div className="decoration-glow glow-2"></div>
      </div>

      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="library-logo">
            <div className="logo-symbol">
              <div className="symbol-inner">WW</div>
              <div className="symbol-ring"></div>
            </div>
            <div className="logo-text">
              <h2 className="logo-title">WasteWise</h2>
              <p className="logo-subtitle">Management System</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">
              <span className="section-line"></span>
              Overview
            </h3>
            <ul className="nav-list">
              <li className="nav-item active">
                <span className="nav-indicator"></span>
                <span className="nav-label">Dashboard</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Analytics</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Reports</span>
                <span className="nav-arrow">→</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">
              <span className="section-line"></span>
              Waste Management
            </h3>
            <ul className="nav-list">
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Collection Points</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Waste Categories</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Schedules</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Recycling Data</span>
                <span className="nav-arrow">→</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">
              <span className="section-line"></span>
              System
            </h3>
            <ul className="nav-list">
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Users</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Settings</span>
                <span className="nav-arrow">→</span>
              </li>
              <li className="nav-item">
                <span className="nav-indicator"></span>
                <span className="nav-label">Activity Logs</span>
                <span className="nav-arrow">→</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-quick-info">
            <div className="quick-avatar">
              {admin.profile ? (
                <img src={admin.profile} alt="Admin" />
              ) : (
                <span className="avatar-letter">{admin.email.charAt(0).toUpperCase()}</span>
              )}
              <div className="avatar-status"></div>
            </div>
            <div className="quick-details">
              <p className="quick-name">{admin.email.split('@')[0]}</p>
              <p className="quick-role">{admin.role}</p>
            </div>
          </div>
          <button 
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
            title="Logout"
          >
            <span>Logout</span>
            <span className="logout-arrow">→</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {/* Top Bar */}
        <div className="content-topbar">
          <div className="topbar-left">
            <div className="page-breadcrumb">
              <span className="breadcrumb-item">Dashboard</span>
              <span className="breadcrumb-separator">→</span>
              <span className="breadcrumb-item active">Overview</span>
            </div>
            <h1 className="page-title">Waste Management Dashboard</h1>
            <p className="page-subtitle">
              <span className="subtitle-dot"></span>
              Welcome back, {admin.email.split('@')[0]}
            </p>
          </div>
          <div className="topbar-right">
            <button 
              className="topbar-btn edit-btn"
              onClick={() => setShowEditProfile(true)}
            >
              <span>Edit Profile</span>
              <span className="btn-icon">⚙</span>
            </button>
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

        {/* Statistics Cards */}
        <section className="statistics-section">
          <div className="section-header">
            <div className="header-content">
              <h2 className="section-title">Waste Management Statistics</h2>
              <div className="section-divider"></div>
            </div>
          </div>

          <div className="stats-grid">
            <article className="stat-card card-users">
              <div className="stat-card-bg"></div>
              <div className="stat-card-header">
                <span className="stat-label">Total Waste Collected</span>
                <div className="stat-badge">This Month</div>
              </div>
              <div className="stat-value">2,845 <span className="stat-unit">kg</span></div>
              <div className="stat-footer">
                <span className="stat-change positive">
                  <span className="change-arrow">↑</span>
                  +18.3%
                </span>
                <span className="stat-period">from last month</span>
              </div>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '75%'}}></div>
              </div>
            </article>

            <article className="stat-card card-sessions">
              <div className="stat-card-bg"></div>
              <div className="stat-card-header">
                <span className="stat-label">Recycled Materials</span>
                <div className="stat-badge">Processed</div>
              </div>
              <div className="stat-value">1,567 <span className="stat-unit">kg</span></div>
              <div className="stat-footer">
                <span className="stat-change positive">
                  <span className="change-arrow">↑</span>
                  +22.5%
                </span>
                <span className="stat-period">from last month</span>
              </div>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '85%'}}></div>
              </div>
            </article>

            <article className="stat-card card-requests">
              <div className="stat-card-bg"></div>
              <div className="stat-card-header">
                <span className="stat-label">Collection Requests</span>
                <div className="stat-badge">Pending</div>
              </div>
              <div className="stat-value">47</div>
              <div className="stat-footer">
                <span className="stat-change neutral">
                  <span className="change-arrow">↓</span>
                  -8.2%
                </span>
                <span className="stat-period">from yesterday</span>
              </div>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '45%'}}></div>
              </div>
            </article>

            <article className="stat-card card-status">
              <div className="stat-card-bg"></div>
              <div className="stat-card-header">
                <span className="stat-label">System Status</span>
                <div className="stat-indicator online">
                  <span className="indicator-pulse"></span>
                </div>
              </div>
              <div className="stat-value status">Operational</div>
              <div className="stat-footer">
                <span className="stat-uptime">
                  <span className="uptime-dot"></span>
                  99.9% uptime
                </span>
              </div>
              <div className="stat-progress">
                <div className="progress-bar" style={{width: '99%'}}></div>
              </div>
            </article>
          </div>
        </section>

        {/* Admin Profile Section */}
        <section className="profile-section">
          <div className="section-header">
            <div className="header-content">
              <h2 className="section-title">Administrator Profile</h2>
              <div className="section-divider"></div>
            </div>
          </div>

          <div className="profile-card">
            <div className="profile-card-decoration"></div>
            <div className="profile-card-left">
              <div className="profile-avatar-wrapper">
                <div className="profile-avatar">
                  {admin.profile ? (
                    <img src={admin.profile} alt="Admin Profile" />
                  ) : (
                    <div className="avatar-placeholder">
                      {admin.email.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="profile-status-indicator">
                  <span className="status-pulse"></span>
                </div>
              </div>
              <div className="profile-header-info">
                <h3 className="profile-name">{admin.email.split('@')[0]}</h3>
                <p className="profile-role-badge">
                  <span className="badge-dot"></span>
                  {admin.role}
                </p>
              </div>
            </div>

            <div className="profile-card-right">
              <div className="profile-details-grid">
                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">✉</span>
                    Email Address
                  </label>
                  <p className="detail-value">{admin.email}</p>
                  <div className="detail-underline"></div>
                </div>

                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">◆</span>
                    Role & Permissions
                  </label>
                  <p className="detail-value">{admin.role}</p>
                  <div className="detail-underline"></div>
                </div>

                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">⏰</span>
                    Last Authentication
                  </label>
                  <p className="detail-value">
                    {new Date(admin.lastLogin).toLocaleString('en-US', {
                      dateStyle: 'medium',
                      timeStyle: 'short'
                    })}
                  </p>
                  <div className="detail-underline"></div>
                </div>

                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">✓</span>
                    Account Status
                  </label>
                  <p className="detail-value status-active">
                    <span className="status-dot"></span>
                    Active & Verified
                  </p>
                  <div className="detail-underline"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Quick Actions */}
        <section className="quick-actions-section">
          <div className="section-header">
            <div className="header-content">
              <h2 className="section-title">Quick Actions</h2>
              <div className="section-divider"></div>
            </div>
          </div>

          <div className="actions-grid">
            <button className="action-card">
              <div className="action-icon">01</div>
              <div className="action-content">
                <h4 className="action-title">Manage Collections</h4>
                <p className="action-description">Schedule and track waste collections</p>
              </div>
              <span className="action-arrow">→</span>
            </button>
            <button className="action-card">
              <div className="action-icon">02</div>
              <div className="action-content">
                <h4 className="action-title">Waste Categories</h4>
                <p className="action-description">Configure material classifications</p>
              </div>
              <span className="action-arrow">→</span>
            </button>
            <button className="action-card">
              <div className="action-icon">03</div>
              <div className="action-content">
                <h4 className="action-title">View Reports</h4>
                <p className="action-description">Access recycling analytics</p>
              </div>
              <span className="action-arrow">→</span>
            </button>
            <button className="action-card">
              <div className="action-icon">04</div>
              <div className="action-content">
                <h4 className="action-title">User Management</h4>
                <p className="action-description">Manage collector and user accounts</p>
              </div>
              <span className="action-arrow">→</span>
            </button>
          </div>
        </section>
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <div className="modal-decoration"></div>
            <div className="modal-icon-wrapper">
              <div className="modal-icon logout-icon">
                <span className="icon-symbol">!</span>
                <div className="icon-ring"></div>
              </div>
            </div>
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-description">
              Are you certain you wish to end your current session? You will need to authenticate again to access the dashboard.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                <span>Cancel</span>
              </button>
              <button 
                className="modal-btn btn-danger"
                onClick={handleLogout}
              >
                <span>Yes, Logout</span>
                <span className="btn-arrow">→</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={() => setShowEditProfile(false)}>
          <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-decoration"></div>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3 className="modal-title">Edit Administrator Profile</h3>
                <p className="modal-subtitle">Update your account information</p>
              </div>
              <button 
                className="modal-close"
                onClick={() => {
                  setShowEditProfile(false);
                  setMessage('');
                  setProfileForm(prev => ({ ...prev, password: '', profile: null }));
                }}
              >
                <span className="close-icon">×</span>
              </button>
            </div>

            {message && (
              <div className={`alert ${message.includes('successfully') ? 'alert-success' : 'alert-error'}`}>
                <span className="alert-icon">{message.includes('successfully') ? '✓' : '✕'}</span>
                <span className="alert-message">{message}</span>
              </div>
            )}

            <form onSubmit={handleProfileUpdate} className="profile-form">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-text">Email Address</span>
                    <span className="label-required">*</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="email"
                      name="email"
                      className="field-input"
                      value={profileForm.email}
                      onChange={handleInputChange}
                      required
                    />
                    <div className="input-focus-border"></div>
                  </div>
                  <span className="field-hint">Your administrative email address</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-text">New Password</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="password"
                      name="password"
                      className="field-input"
                      value={profileForm.password}
                      onChange={handleInputChange}
                      placeholder="Leave blank to keep current password"
                    />
                    <div className="input-focus-border"></div>
                  </div>
                  <span className="field-hint">Minimum 8 characters recommended</span>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-text">Profile Picture</span>
                  </label>
                  <div className="file-input-wrapper">
                    <input
                      type="file"
                      id="profile-file"
                      className="file-input"
                      accept="image/*"
                      onChange={handleFileChange}
                    />
                    <label htmlFor="profile-file" className="file-input-label">
                      <span className="file-input-text">
                        {profileForm.profile ? profileForm.profile.name : 'Choose an image file'}
                      </span>
                      <span className="file-input-button">Browse</span>
                    </label>
                  </div>
                  <span className="field-hint">Accepted formats: JPG, PNG, GIF (Max 5MB)</span>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="button"
                  className="modal-btn btn-secondary"
                  onClick={() => {
                    setShowEditProfile(false);
                    setMessage('');
                    setProfileForm(prev => ({ ...prev, password: '', profile: null }));
                  }}
                >
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="modal-btn btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? 'Updating Profile...' : 'Save Changes'}</span>
                  {!loading && <span className="btn-arrow">→</span>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;