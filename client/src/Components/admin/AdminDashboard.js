import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Utils/Api';
import UsersManagement from '../admin/UsersManagement';
import FeedbackManagement from '../admin/FeedbackManagement';
import AdminProfiles from './AdminProfiles';
import '../css/Admin.css';

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
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
      fetchAdminStats();
      fetchUserStatistics();
      fetchFeedbackStatistics();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/Login');
    }
  }, [navigate]);

  const fetchAdminStats = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch feedback stats using the same endpoint as FeedbackManagement
      const [statsResponse, usersResponse] = await Promise.all([
        fetch(`${API_URL}/api/feedback/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/api/users/all-users`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      let statsData = {};
      let totalUsers = 0;

      if (statsResponse.ok) {
        statsData = await statsResponse.json();
      }

      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        totalUsers = usersData.length;
      }

      setStats({
        ...statsData,
        totalUsers
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch all users to calculate statistics
      const usersResponse = await fetch(`${API_URL}/api/users/all-users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (usersResponse.ok) {
        const usersData = await usersResponse.json();
        
        // Calculate statistics from user data
        const activeUsers = usersData.filter(user => user.status === 'active').length;
        const newUsersThisMonth = usersData.filter(user => {
          const userDate = new Date(user.createdAt);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
        }).length;

        // Calculate gender distribution if available
        const genderCounts = {};
        usersData.forEach(user => {
          const gender = user.gender || 'not_specified';
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });

        // Convert to percentages
        const usersByGender = {};
        Object.keys(genderCounts).forEach(gender => {
          usersByGender[gender] = Math.round((genderCounts[gender] / usersData.length) * 100);
        });

        const basicStats = {
          totalUsers: usersData.length,
          activeUsers,
          newUsersThisMonth,
          usersByGender,
          userGrowth: Math.round((newUsersThisMonth / (usersData.length - newUsersThisMonth)) * 100) || 0
        };
        
        setUserStats(basicStats);
      }
    } catch (error) {
      console.error('Error fetching user statistics:', error);
    }
  };

  const fetchFeedbackStatistics = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      
      // Fetch all feedback to calculate statistics
      const feedbackResponse = await fetch(`${API_URL}/api/feedback/all`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (feedbackResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        const feedbackList = feedbackData.feedback || feedbackData;
        
        // Calculate rating distribution
        const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
        const categoryCounts = {};
        
        feedbackList.forEach(feedback => {
          // Count ratings
          if (feedback.rating) {
            ratingCounts[feedback.rating] = (ratingCounts[feedback.rating] || 0) + 1;
          }
          
          // Count categories
          const category = feedback.category || 'general';
          categoryCounts[category] = (categoryCounts[category] || 0) + 1;
        });

        // Calculate average rating
        const totalRatings = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);
        const averageRating = totalRatings > 0 
          ? feedbackList.reduce((sum, item) => sum + (item.rating || 0), 0) / totalRatings
          : 0;

        // Calculate status counts
        const statusCounts = {};
        feedbackList.forEach(feedback => {
          const status = feedback.status || 'pending';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        // Calculate response rate (percentage with adminReply)
        const repliedCount = feedbackList.filter(item => item.adminReply).length;
        const responseRate = feedbackList.length > 0 
          ? Math.round((repliedCount / feedbackList.length) * 100)
          : 0;

        const basicStats = {
          totalFeedback: feedbackList.length,
          averageRating,
          ratingDistribution: ratingCounts,
          feedbackByCategory: categoryCounts,
          responseRate,
          resolvedIssues: statusCounts.resolved || 0,
          pendingIssues: statusCounts.pending || 0,
          statusStats: Object.entries(statusCounts).map(([status, count]) => ({
            _id: status,
            count
          }))
        };
        
        setFeedbackStats(basicStats);
      }
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
    }
  };

  // Helper functions for charts
  const getRatingColor = (rating) => {
    const colors = {
      5: '#10b981', // Green
      4: '#22c55e', // Light Green
      3: '#eab308', // Yellow
      2: '#f97316', // Orange
      1: '#ef4444'  // Red
    };
    return colors[rating] || '#6b7280';
  };

  const getCategoryColor = (category) => {
    const colors = {
      service: '#3b82f6',
      product: '#8b5cf6',
      support: '#06b6d4',
      suggestion: '#f59e0b',
      complaint: '#ef4444',
      general: '#6b7280'
    };
    return colors[category.toLowerCase()] || '#6b7280';
  };

  const getGenderColor = (gender) => {
    const colors = {
      male: '#3b82f6',
      female: '#ec4899',
      other: '#8b5cf6',
      not_specified: '#6b7280'
    };
    return colors[gender.toLowerCase()] || '#6b7280';
  };

  // Chart Components
  const RatingDistributionChart = () => {
    const distribution = feedbackStats?.ratingDistribution || {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
    const total = Object.values(distribution).reduce((sum, count) => sum + count, 0);
    
    return (
      <div className="chart-container">
        <h4 className="chart-title">Rating Distribution</h4>
        <div className="rating-bars">
          {[5, 4, 3, 2, 1].map(rating => (
            <div key={rating} className="rating-bar-item">
              <div className="rating-label">
                <span className="stars">{'★'.repeat(rating)}</span>
                <span className="rating-count">({distribution[rating] || 0})</span>
              </div>
              <div className="rating-bar-container">
                <div 
                  className="rating-bar"
                  style={{ 
                    width: `${total > 0 ? ((distribution[rating] || 0) / total) * 100 : 0}%`,
                    backgroundColor: getRatingColor(rating)
                  }}
                ></div>
              </div>
              <span className="rating-percentage">
                {total > 0 ? Math.round(((distribution[rating] || 0) / total) * 100) : 0}%
              </span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const FeedbackCategoryChart = () => {
    const categories = feedbackStats?.feedbackByCategory || {};
    const maxCount = Math.max(...Object.values(categories), 1);
    
    return (
      <div className="chart-container">
        <h4 className="chart-title">Feedback by Category</h4>
        <div className="category-chart">
          {Object.entries(categories).map(([category, count]) => (
            <div key={category} className="category-item">
              <div className="category-info">
                <span className="category-name">
                  {category.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <span className="category-count">{count}</span>
              </div>
              <div className="category-bar-container">
                <div 
                  className="category-bar"
                  style={{ 
                    width: `${(count / maxCount) * 90}%`,
                    backgroundColor: getCategoryColor(category)
                  }}
                ></div>
              </div>
            </div>
          ))}
          {Object.keys(categories).length === 0 && (
            <div className="no-data">No feedback data available</div>
          )}
        </div>
      </div>
    );
  };

  const UserActivityStats = () => {
    const userData = userStats || {};
    
    return (
      <div className="stats-mini-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-value">{userData.totalUsers || 0}</div>
          <div className="mini-stat-label">Total Users</div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-value">{userData.activeUsers || 0}</div>
          <div className="mini-stat-label">Active Users</div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-value">{userData.newUsersThisMonth || 0}</div>
          <div className="mini-stat-label">New This Month</div>
        </div>
      </div>
    );
  };

  const FeedbackOverviewStats = () => {
    const feedbackData = feedbackStats || {};
    
    return (
      <div className="stats-mini-grid">
        <div className="mini-stat-card">
          <div className="mini-stat-value">{feedbackData.totalFeedback || 0}</div>
          <div className="mini-stat-label">Total Feedback</div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-value">
            {feedbackData.averageRating ? feedbackData.averageRating.toFixed(1) : '0.0'}
          </div>
          <div className="mini-stat-label">Avg Rating</div>
        </div>
        <div className="mini-stat-card">
          <div className="mini-stat-value">
            {feedbackStats?.responseRate ? `${feedbackStats.responseRate}%` : '0%'}
          </div>
          <div className="mini-stat-label">Response Rate</div>
        </div>
      </div>
    );
  };

  // User Demographics Chart Component
  const UserDemographicsChart = () => {
    const demographics = userStats?.usersByGender || {};
    
    return (
      <div className="chart-container">
        <h4 className="chart-title">User Distribution</h4>
        <div className="demographics-chart">
          {Object.entries(demographics).map(([key, value]) => (
            <div key={key} className="demographic-item">
              <div className="demographic-label">
                <span className="category-name">
                  {key.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <span className="category-count">{value}%</span>
              </div>
              <div className="demographic-bar-container">
                <div 
                  className="demographic-bar"
                  style={{ 
                    width: `${value}%`,
                    backgroundColor: getGenderColor(key)
                  }}
                ></div>
              </div>
            </div>
          ))}
          {Object.keys(demographics).length === 0 && (
            <div className="no-data">No demographic data available</div>
          )}
        </div>
      </div>
    );
  };

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('adminData');
    navigate('/admin/login');
  };

  const handleProfileUpdate = async (profileForm) => {
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      throw new Error('Authentication token not found. Please log in again.');
    }

    if (profileForm.profile) {
      return await handleProfileUpdateWithFile(profileForm, token);
    } else {
      return await handleProfileUpdateWithoutFile(profileForm, token);
    }
  };

  const handleProfileUpdateWithoutFile = async (profileForm, token) => {
    const updateData = {};
    
    if (profileForm.email && profileForm.email !== admin.email) {
      updateData.email = profileForm.email;
    }
    
    if (profileForm.username && profileForm.username !== admin.username) {
      updateData.username = profileForm.username;
    }
    
    if (profileForm.gender !== admin.gender) {
      updateData.gender = profileForm.gender;
    }
    
    if (profileForm.bod !== admin.bod) {
      updateData.bod = profileForm.bod;
    }
    
    if (profileForm.address !== admin.address) {
      updateData.address = profileForm.address;
    }
    
    if (profileForm.password) {
      updateData.password = profileForm.password;
    }

    try {
      console.log('Sending JSON update:', updateData);
      
      const response = await fetch(`${API_URL}/api/users/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      const data = await response.json();

      if (response.ok) {
        if (data.user) {
          setAdmin(data.user);
          localStorage.setItem('adminData', JSON.stringify(data.user));
          return Promise.resolve();
        } else {
          throw new Error('No user data returned from server');
        }
      } else {
        throw new Error(data.message || `Failed to update profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const handleProfileUpdateWithFile = async (profileForm, token) => {
    const formData = new FormData();
    
    console.log('File to upload:', profileForm.profile);
    
    const possibleFieldNames = ['profile', 'avatar', 'image', 'photo', 'file'];
    
    let fileUploadSuccess = false;
    
    for (const fieldName of possibleFieldNames) {
      try {
        formData.delete('profile');
        formData.delete('avatar');
        formData.delete('image');
        formData.delete('photo');
        formData.delete('file');
        
        formData.append(fieldName, profileForm.profile);
        
        if (profileForm.email && profileForm.email !== admin.email) {
          formData.append('email', profileForm.email);
        }
        if (profileForm.username && profileForm.username !== admin.username) {
          formData.append('username', profileForm.username);
        }
        if (profileForm.gender !== admin.gender) {
          formData.append('gender', profileForm.gender);
        }
        if (profileForm.bod !== admin.bod) {
          formData.append('bod', profileForm.bod);
        }
        if (profileForm.address !== admin.address) {
          formData.append('address', profileForm.address);
        }
        if (profileForm.password) {
          formData.append('password', profileForm.password);
        }

        console.log(`Trying field name: ${fieldName}`);
        
        const response = await fetch(`${API_URL}/api/users/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });

        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setAdmin(data.user);
            localStorage.setItem('adminData', JSON.stringify(data.user));
            fileUploadSuccess = true;
            break;
          }
        } else if (response.status !== 500) {
          const data = await response.json();
          throw new Error(data.message || `Failed to update profile: ${response.status}`);
        }
      } catch (error) {
        console.log(`Field name ${fieldName} failed:`, error.message);
      }
    }

    if (!fileUploadSuccess) {
      console.log('File upload failed with all field names, trying without file...');
      return await handleProfileUpdateWithoutFile(profileForm, token);
    }

    return Promise.resolve();
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'profile':
        return <AdminProfiles admin={admin} onProfileUpdate={handleProfileUpdate} />;
      case 'dashboard':
      default:
        return (
          <>
            {/* Top Bar for Dashboard */}
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
                  Welcome back, {admin?.username || admin?.email?.split('@')[0]}
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

            {/* Statistics Section */}
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
                    <span className="stat-label">Total Users</span>
                    <div className="stat-badge">Registered</div>
                  </div>
                  <div className="stat-value">{stats?.totalUsers || 0}</div>
                  <div className="stat-footer">
                    <span className="stat-change positive">
                      <span className="change-arrow">↑</span>
                      +{userStats?.userGrowth || 0}%
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
                    <span className="stat-label">Total Feedback</span>
                    <div className="stat-badge">Received</div>
                  </div>
                  <div className="stat-value">{stats?.totalFeedback || 0}</div>
                  <div className="stat-footer">
                    <span className="stat-change positive">
                      <span className="change-arrow">↑</span>
                      +{Math.round((feedbackStats?.monthlyTrend?.[feedbackStats.monthlyTrend.length - 1] / (feedbackStats?.monthlyTrend?.[feedbackStats.monthlyTrend.length - 2] || 1) - 1) * 100) || 0}%
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
                    <span className="stat-label">Average Rating</span>
                    <div className="stat-badge">User Satisfaction</div>
                  </div>
                  <div className="stat-value">
                    {feedbackStats?.averageRating ? feedbackStats.averageRating.toFixed(1) : '0.0'}/5
                  </div>
                  <div className="stat-footer">
                    <span className="stat-change neutral">
                      <span className="change-arrow">→</span>
                      +0.3
                    </span>
                    <span className="stat-period">from last month</span>
                  </div>
                  <div className="stat-progress">
                    <div className="progress-bar" style={{width: `${(feedbackStats?.averageRating || 0) * 20}%`}}></div>
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

            {/* User Profiles & Feedback Analytics Section */}
            <section className="analytics-section">
              <div className="section-header">
                <div className="header-content">
                  <h2 className="section-title">User & Feedback Analytics</h2>
                  <div className="section-divider"></div>
                </div>
              </div>

              <div className="analytics-grid">
                {/* User Statistics */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">User Profiles Overview</h3>
                    <div className="analytics-card-badge">Live Data</div>
                  </div>
                  <UserActivityStats />
                  <div className="analytics-card-content">
                    <UserDemographicsChart />
                  </div>
                </div>

                {/* Feedback Statistics */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Feedback Analysis</h3>
                    <div className="analytics-card-badge">Real-time</div>
                  </div>
                  <FeedbackOverviewStats />
                  <div className="analytics-card-content">
                    <RatingDistributionChart />
                  </div>
                </div>

                {/* Feedback Categories */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Feedback Categories</h3>
                    <div className="analytics-card-badge">Distribution</div>
                  </div>
                  <div className="analytics-card-content">
                    <FeedbackCategoryChart />
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="analytics-card">
                  <div className="analytics-card-header">
                    <h3 className="analytics-card-title">Quick Stats</h3>
                    <div className="analytics-card-badge">Summary</div>
                  </div>
                  <div className="quick-stats-grid">
                    <div className="quick-stat">
                      <div className="quick-stat-value">{userStats?.activeUsers || 0}</div>
                      <div className="quick-stat-label">Active Users</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-value">
                        {feedbackStats?.resolvedIssues || 0}
                      </div>
                      <div className="quick-stat-label">Resolved Issues</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-value">
                        {feedbackStats?.pendingIssues || 0}
                      </div>
                      <div className="quick-stat-label">Pending Issues</div>
                    </div>
                    <div className="quick-stat">
                      <div className="quick-stat-value">
                        {userStats?.newUsersThisMonth || 0}
                      </div>
                      <div className="quick-stat-label">New Registrations</div>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        );
    }
  };

  if (!admin && loading) {
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
              <h2 className="logo-title">T.M.F.K. Waste Innovations</h2>
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
              <li 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                <span className="nav-indicator"></span>
                <span className="nav-label">Dashboard</span>
                <span className="nav-arrow">→</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">
              <span className="section-line"></span>
              Management
            </h3>
            <ul className="nav-list">
              <li 
                className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSection('users')}
              >
                <span className="nav-indicator"></span>
                <span className="nav-label">Users Management</span>
                <span className="nav-arrow">→</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveSection('feedback')}
              >
                <span className="nav-indicator"></span>
                <span className="nav-label">Feedback Management</span>
                <span className="nav-arrow">→</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <span className="nav-indicator"></span>
                <span className="nav-label">Admin Profile</span>
                <span className="nav-arrow">→</span>
              </li>
            </ul>
          </div>
        </nav>

        <div className="sidebar-footer">
          <div className="admin-quick-info">
            <div className="quick-avatar">
              {admin?.profile ? (
                <img src={admin.profile} alt="Admin" />
              ) : (
                <span className="avatar-letter">{admin?.email?.charAt(0).toUpperCase()}</span>
              )}
              <div className="avatar-status"></div>
            </div>
            <div className="quick-details">
              <p className="quick-name">{admin?.username || admin?.email?.split('@')[0]}</p>
              <p className="quick-role">{admin?.role}</p>
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
        {/* Render Active Section */}
        {renderActiveSection()}
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
    </div>
  );
};

export default AdminDashboard;