import React, { useState } from 'react';

const AdminProfiles = ({ admin, onProfileUpdate }) => {
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [profileForm, setProfileForm] = useState({
    email: admin?.email || '',
    password: '',
    profile: null,
    username: admin?.username || '',
    gender: admin?.gender || '',
    bod: admin?.bod || '',
    address: admin?.address || ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleEditProfile = () => {
    setProfileForm({
      email: admin?.email || '',
      password: '',
      profile: null,
      username: admin?.username || '',
      gender: admin?.gender || '',
      bod: admin?.bod || '',
      address: admin?.address || ''
    });
    setMessage('');
    setShowEditProfile(true);
  };

  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await onProfileUpdate(profileForm);
      setMessage('Profile updated successfully!');
      setTimeout(() => {
        setShowEditProfile(false);
        setProfileForm(prev => ({ ...prev, password: '', profile: null }));
      }, 1500);
    } catch (error) {
      setMessage(error.message || 'Failed to update profile');
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

  const handleCloseModal = () => {
    setShowEditProfile(false);
    setMessage('');
    setProfileForm(prev => ({ ...prev, password: '', profile: null }));
  };

  return (
    <div className="admin-profiles-content">
      {/* Profile Header */}
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item active">Administrator Profile</span>
          </div>
          <h1 className="page-title">Administrator Profile</h1>
          <p className="page-subtitle">
            <span className="subtitle-dot"></span>
            Manage your account information and settings
          </p>
        </div>
        <div className="topbar-right">
          <button 
            className="topbar-btn edit-btn"
            onClick={handleEditProfile}
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

      {/* Profile Content */}
      <section className="profile-section">
        <div className="profile-card">
          <div className="profile-card-decoration"></div>
          <div className="profile-card-left">
            <div className="profile-avatar-wrapper">
              <div className="profile-avatar">
                {admin?.profile ? (
                  <img src={admin.profile} alt="Admin Profile" />
                ) : (
                  <div className="avatar-placeholder">
                    {admin?.email?.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>
              <div className="profile-status-indicator">
                <span className="status-pulse"></span>
              </div>
            </div>
            <div className="profile-header-info">
              <h3 className="profile-name">{admin?.username || admin?.email?.split('@')[0]}</h3>
              <p className="profile-role-badge">
                <span className="badge-dot"></span>
                {admin?.role}
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
                <p className="detail-value">{admin?.email}</p>
                <div className="detail-underline"></div>
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <span className="label-icon">👤</span>
                  Username
                </label>
                <p className="detail-value">{admin?.username || 'Not set'}</p>
                <div className="detail-underline"></div>
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <span className="label-icon">◆</span>
                  Role & Permissions
                </label>
                <p className="detail-value">{admin?.role}</p>
                <div className="detail-underline"></div>
              </div>

              <div className="detail-group">
                <label className="detail-label">
                  <span className="label-icon">⏰</span>
                  Last Authentication
                </label>
                <p className="detail-value">
                  {admin?.lastLogin ? new Date(admin.lastLogin).toLocaleString('en-US', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                  }) : 'Never'}
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

              {admin?.gender && (
                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">⚧</span>
                    Gender
                  </label>
                  <p className="detail-value">{admin.gender}</p>
                  <div className="detail-underline"></div>
                </div>
              )}

              {admin?.bod && (
                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">🎂</span>
                    Date of Birth
                  </label>
                  <p className="detail-value">{new Date(admin.bod).toLocaleDateString()}</p>
                  <div className="detail-underline"></div>
                </div>
              )}

              {admin?.address && (
                <div className="detail-group">
                  <label className="detail-label">
                    <span className="label-icon">🏠</span>
                    Address
                  </label>
                  <p className="detail-value">{admin.address}</p>
                  <div className="detail-underline"></div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="modal-overlay" onClick={handleCloseModal}>
          <div className="modal modal-form" onClick={(e) => e.stopPropagation()}>
            <div className="modal-decoration"></div>
            <div className="modal-header">
              <div className="modal-header-content">
                <h3 className="modal-title">Edit Administrator Profile</h3>
                <p className="modal-subtitle">Update your account information</p>
              </div>
              <button 
                className="modal-close"
                onClick={handleCloseModal}
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
                    <span className="label-text">Username</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      name="username"
                      className="field-input"
                      value={profileForm.username}
                      onChange={handleInputChange}
                      placeholder="Enter username"
                    />
                    <div className="input-focus-border"></div>
                  </div>
                </div>
              </div>

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
                    <span className="label-text">Gender</span>
                  </label>
                  <div className="input-wrapper">
                    <select
                      name="gender"
                      className="field-input"
                      value={profileForm.gender}
                      onChange={handleInputChange}
                    >
                      <option value="">Select Gender</option>
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                      <option value="other">Other</option>
                    </select>
                    <div className="input-focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-text">Date of Birth</span>
                  </label>
                  <div className="input-wrapper">
                    <input
                      type="date"
                      name="bod"
                      className="field-input"
                      value={profileForm.bod}
                      onChange={handleInputChange}
                    />
                    <div className="input-focus-border"></div>
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">
                    <span className="label-text">Address</span>
                  </label>
                  <div className="input-wrapper">
                    <textarea
                      name="address"
                      className="field-input"
                      value={profileForm.address}
                      onChange={handleInputChange}
                      placeholder="Enter your address"
                      rows="3"
                    />
                    <div className="input-focus-border"></div>
                  </div>
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
                  onClick={handleCloseModal}
                  disabled={loading}
                >
                  <span>Cancel</span>
                </button>
                <button 
                  type="submit" 
                  className="modal-btn btn-primary"
                  disabled={loading}
                >
                  <span>{loading ? 'Updating...' : 'Update Profile'}</span>
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

export default AdminProfiles;