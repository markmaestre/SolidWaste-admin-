import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import API_URL from '../Utils/Api';
import UsersManagement from '../admin/UsersManagement';
import FeedbackManagement from '../admin/FeedbackManagement';
import AdminProfiles from './AdminProfiles';
import Message from './Message';
import WasteManagement from './WasteManagement';
import '../css/Admin.css';

// Professional Icons as React Components
const DashboardIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
  </svg>
);

const UsersIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const FeedbackIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const WasteIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const MessagesIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
  </svg>
);

const ProfileIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const LogoutIcon = () => (
  <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
  </svg>
);

const StatUsersIcon = () => (
  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
  </svg>
);

const StatFeedbackIcon = () => (
  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const StatWasteIcon = () => (
  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const StatSystemIcon = () => (
  <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const ActionWasteIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
  </svg>
);

const ActionMessagesIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
  </svg>
);

const ActionFeedbackIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const ActionUsersIcon = () => (
  <svg className="action-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
  </svg>
);

const AdminDashboard = () => {
  const [admin, setAdmin] = useState(null);
  const [activeSection, setActiveSection] = useState('dashboard');
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [userStats, setUserStats] = useState(null);
  const [feedbackStats, setFeedbackStats] = useState(null);
  const [wasteStats, setWasteStats] = useState(null);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('adminToken');
    const adminData = localStorage.getItem('adminData');

    if (!token || !adminData) {
      navigate('/admin/login');
      return;
    }

    try {
      const parsedAdmin = JSON.parse(adminData);
      setAdmin(parsedAdmin);
      fetchAdminStats();
      fetchUserStatistics();
      fetchFeedbackStatistics();
      fetchWasteStatistics();
    } catch (error) {
      console.error('Error parsing admin data:', error);
      navigate('/admin/login');
    }
  }, [navigate]);

  const fetchWithAuth = async (url, options = {}) => {
    const token = localStorage.getItem('adminToken');
    
    const config = {
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    };

    try {
      const response = await fetch(`${API_URL}${url}`, config);
      
      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('HTML response received:', text.substring(0, 200));
        throw new Error('Server returned HTML instead of JSON. Check API endpoint.');
      }

      if (!response.ok) {
        let errorMessage = `HTTP error! status: ${response.status}`;
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (e) {
          errorMessage = response.statusText || errorMessage;
        }
        throw new Error(errorMessage);
      }

      return await response.json();
    } catch (error) {
      console.error('Fetch error:', error);
      throw error;
    }
  };

  const fetchAdminStats = async () => {
    try {
      setError(null);
      
      const [statsResponse, usersResponse] = await Promise.allSettled([
        fetchWithAuth('/api/feedback/stats'),
        fetchWithAuth('/api/users/all-users')
      ]);

      let statsData = {};
      let totalUsers = 0;

      if (statsResponse.status === 'fulfilled') {
        statsData = statsResponse.value;
      } else {
        console.warn('Failed to fetch feedback stats:', statsResponse.reason);
      }

      if (usersResponse.status === 'fulfilled') {
        const usersData = usersResponse.value;
        totalUsers = Array.isArray(usersData) ? usersData.length : 0;
      } else {
        console.warn('Failed to fetch users:', usersResponse.reason);
      }

      setStats({
        ...statsData,
        totalUsers
      });

    } catch (error) {
      console.error('Error fetching stats:', error);
      setError(`Failed to load statistics: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const fetchUserStatistics = async () => {
    try {
      const usersData = await fetchWithAuth('/api/users/all-users');
      
      if (Array.isArray(usersData)) {
        const activeUsers = usersData.filter(user => user.status === 'active').length;
        const newUsersThisMonth = usersData.filter(user => {
          const userDate = new Date(user.createdAt);
          const now = new Date();
          return userDate.getMonth() === now.getMonth() && userDate.getFullYear() === now.getFullYear();
        }).length;

        const genderCounts = {};
        usersData.forEach(user => {
          const gender = user.gender || 'not_specified';
          genderCounts[gender] = (genderCounts[gender] || 0) + 1;
        });

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
      const feedbackData = await fetchWithAuth('/api/feedback/all');
      const feedbackList = feedbackData.feedback || feedbackData || [];
      
      const ratingCounts = {5: 0, 4: 0, 3: 0, 2: 0, 1: 0};
      const categoryCounts = {};
      
      feedbackList.forEach(feedback => {
        if (feedback.rating) {
          ratingCounts[feedback.rating] = (ratingCounts[feedback.rating] || 0) + 1;
        }
        
        const category = feedback.category || 'general';
        categoryCounts[category] = (categoryCounts[category] || 0) + 1;
      });

      const totalRatings = Object.values(ratingCounts).reduce((sum, count) => sum + count, 0);
      const averageRating = totalRatings > 0 
        ? feedbackList.reduce((sum, item) => sum + (item.rating || 0), 0) / totalRatings
        : 0;

      const statusCounts = {};
      feedbackList.forEach(feedback => {
        const status = feedback.status || 'pending';
        statusCounts[status] = (statusCounts[status] || 0) + 1;
      });

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
    } catch (error) {
      console.error('Error fetching feedback statistics:', error);
    }
  };

  const fetchWasteStatistics = async () => {
    try {
      const wasteData = await fetchWithAuth('/api/waste-reports');
      const reports = wasteData.reports || [];
      
      const wasteStats = {
        totalReports: reports.length,
        pending: reports.filter(r => r.status === 'pending').length,
        processed: reports.filter(r => r.status === 'processed').length,
        recycled: reports.filter(r => r.status === 'recycled').length,
        disposed: reports.filter(r => r.status === 'disposed').length,
        classificationBreakdown: {}
      };

      reports.forEach(report => {
        const classification = report.classification;
        wasteStats.classificationBreakdown[classification] = 
          (wasteStats.classificationBreakdown[classification] || 0) + 1;
      });

      setWasteStats(wasteStats);
    } catch (error) {
      console.error('Error fetching waste statistics:', error);
    }
  };

  // Helper functions for charts
  const getRatingColor = (rating) => {
    const colors = {
      5: '#10b981',
      4: '#22c55e',
      3: '#eab308',
      2: '#f97316',
      1: '#ef4444'
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
                <span className="stars">{rating} Stars</span>
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

  const WasteStatsChart = () => {
    const wasteData = wasteStats || {};
    const total = wasteData.totalReports || 1;
    
    return (
      <div className="chart-container">
        <h4 className="chart-title">Waste Reports Overview</h4>
        <div className="waste-stats-grid">
          <div className="waste-stat-item">
            <div className="waste-stat-value">{wasteData.totalReports || 0}</div>
            <div className="waste-stat-label">Total Reports</div>
          </div>
          <div className="waste-stat-item">
            <div className="waste-stat-value">{wasteData.pending || 0}</div>
            <div className="waste-stat-label">Pending Review</div>
          </div>
          <div className="waste-stat-item">
            <div className="waste-stat-value">{wasteData.recycled || 0}</div>
            <div className="waste-stat-label">Recycled</div>
          </div>
          <div className="waste-stat-item">
            <div className="waste-stat-value">
              {Math.round((wasteData.recycled / total) * 100) || 0}%
            </div>
            <div className="waste-stat-label">Recycling Rate</div>
          </div>
        </div>
        
        {/* Waste Classification Breakdown */}
        <div className="waste-classification">
          <h5 className="classification-title">Waste Classification</h5>
          <div className="classification-list">
            {Object.entries(wasteData.classificationBreakdown || {}).map(([type, count]) => (
              <div key={type} className="classification-item">
                <span className="classification-name">
                  {type.split('_').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ')}
                </span>
                <span className="classification-count">{count}</span>
                <div className="classification-bar-container">
                  <div 
                    className="classification-bar"
                    style={{ 
                      width: `${(count / total) * 100}%`,
                      backgroundColor: '#10b981'
                    }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
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

    try {
      let response;
      let data;
      
      if (profileForm.profile) {
        const formData = new FormData();
        formData.append('profile', profileForm.profile);
        
        if (profileForm.email && profileForm.email !== admin.email) {
          formData.append('email', profileForm.email);
        }
        
        if (profileForm.password) {
          formData.append('password', profileForm.password);
        }

        response = await fetch(`${API_URL}/api/admin/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
          },
          body: formData,
        });
      } else {
        const updateData = {};
        
        if (profileForm.email && profileForm.email !== admin.email) {
          updateData.email = profileForm.email;
        }
        
        if (profileForm.password) {
          updateData.password = profileForm.password;
        }

        response = await fetch(`${API_URL}/api/admin/profile`, {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(updateData),
        });
      }

      const contentType = response.headers.get('content-type');
      if (contentType && contentType.includes('text/html')) {
        const text = await response.text();
        console.error('HTML response received:', text.substring(0, 200));
        throw new Error('Server error: Received HTML instead of JSON response');
      }

      data = await response.json();

      if (response.ok) {
        if (data.admin) {
          setAdmin(data.admin);
          localStorage.setItem('adminData', JSON.stringify(data.admin));
          return Promise.resolve();
        } else {
          throw new Error('No admin data returned from server');
        }
      } else {
        throw new Error(data.message || `Failed to update profile: ${response.status}`);
      }
    } catch (error) {
      console.error('Profile update error:', error);
      throw error;
    }
  };

  const handleDeleteProfilePicture = async () => {
    try {
      await fetchWithAuth('/api/admin/profile/picture', {
        method: 'DELETE'
      });

      const adminData = await fetchWithAuth('/api/admin/profile');
      if (adminData.admin) {
        setAdmin(adminData.admin);
        localStorage.setItem('adminData', JSON.stringify(adminData.admin));
      }
      
      return Promise.resolve();
    } catch (error) {
      console.error('Delete profile picture error:', error);
      throw error;
    }
  };

  const ErrorAlert = () => {
    if (!error) return null;
    
    return (
      <div className="error-alert">
        <div className="error-content">
          <span className="error-icon">⚠️</span>
          <span className="error-message">{error}</span>
          <button 
            className="error-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const renderActiveSection = () => {
    switch (activeSection) {
      case 'users':
        return <UsersManagement />;
      case 'feedback':
        return <FeedbackManagement />;
      case 'waste':
        return <WasteManagement />;
      case 'messages':
        return <Message />;
      case 'profile':
        return (
          <AdminProfiles 
            admin={admin} 
            onProfileUpdate={handleProfileUpdate}
            onDeleteProfilePicture={handleDeleteProfilePicture}
          />
        );
      case 'dashboard':
      default:
        return (
          <>
            {/* Top Bar for Dashboard */}
            <div className="content-topbar">
              <div className="topbar-left">
                <h1 className="page-title">Waste Management Dashboard</h1>
                <p className="page-subtitle">
                  Welcome back, {admin?.email?.split('@')[0] || 'Admin'}
                </p>
              </div>
              <div className="topbar-right">
                <div className="topbar-date">
                  {new Date().toLocaleDateString('en-US', { 
                    weekday: 'long', 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </div>
              </div>
            </div>

            {/* Statistics Section */}
            <section className="statistics-section">
              <h2 className="section-title">System Overview</h2>
              <div className="stats-grid">
                <article className="stat-card">
                  <div className="stat-card-header">
                    <StatUsersIcon />
                    <span className="stat-label">Total Users</span>
                  </div>
                  <div className="stat-value">{stats?.totalUsers || 0}</div>
                  <div className="stat-footer">
                    <span className="stat-change positive">
                      +{userStats?.userGrowth || 0}% from last month
                    </span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <StatFeedbackIcon />
                    <span className="stat-label">Total Feedback</span>
                  </div>
                  <div className="stat-value">{stats?.totalFeedback || 0}</div>
                  <div className="stat-footer">
                    <span className="stat-change positive">
                      +{Math.round((feedbackStats?.monthlyTrend?.[feedbackStats.monthlyTrend.length - 1] / (feedbackStats?.monthlyTrend?.[feedbackStats.monthlyTrend.length - 2] || 1) - 1) * 100) || 0}% from last month
                    </span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <StatWasteIcon />
                    <span className="stat-label">Waste Reports</span>
                  </div>
                  <div className="stat-value">{wasteStats?.totalReports || 0}</div>
                  <div className="stat-footer">
                    <span className="stat-change positive">
                      {Math.round((wasteStats?.recycled / (wasteStats?.totalReports || 1)) * 100) || 0}% recycling rate
                    </span>
                  </div>
                </article>

                <article className="stat-card">
                  <div className="stat-card-header">
                    <StatSystemIcon />
                    <span className="stat-label">System Status</span>
                  </div>
                  <div className="stat-value status">Operational</div>
                  <div className="stat-footer">
                    <span className="stat-uptime">
                      99.9% uptime
                    </span>
                  </div>
                </article>
              </div>
            </section>

            {/* Quick Actions Section */}
            <section className="quick-actions-section">
              <h2 className="section-title">Quick Actions</h2>
              <div className="actions-grid">
                <div 
                  className="action-card"
                  onClick={() => setActiveSection('waste')}
                >
                  <ActionWasteIcon />
                  <h3>Waste Reports</h3>
                  <p>Manage waste detection reports and classifications</p>
                  <div className="action-badge">{wasteStats?.pending || 0} pending</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveSection('messages')}
                >
                  <ActionMessagesIcon />
                  <h3>Messages</h3>
                  <p>Communicate with users and team members</p>
                  <div className="action-badge">New messages</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveSection('feedback')}
                >
                  <ActionFeedbackIcon />
                  <h3>Feedback</h3>
                  <p>Review and respond to user feedback</p>
                  <div className="action-badge">{feedbackStats?.pendingIssues || 0} pending</div>
                </div>
                <div 
                  className="action-card"
                  onClick={() => setActiveSection('users')}
                >
                  <ActionUsersIcon />
                  <h3>Users</h3>
                  <p>Manage user accounts and permissions</p>
                  <div className="action-badge">{userStats?.totalUsers || 0} users</div>
                </div>
              </div>
            </section>

            {/* Analytics Section */}
            <section className="analytics-section">
              <h2 className="section-title">System Analytics</h2>
              <div className="analytics-grid">
                <div className="analytics-card">
                  <h3 className="analytics-card-title">User Profiles Overview</h3>
                  <UserActivityStats />
                  <div className="analytics-card-content">
                    <UserDemographicsChart />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3 className="analytics-card-title">Feedback Analysis</h3>
                  <FeedbackOverviewStats />
                  <div className="analytics-card-content">
                    <RatingDistributionChart />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3 className="analytics-card-title">Waste Management</h3>
                  <div className="analytics-card-content">
                    <WasteStatsChart />
                  </div>
                </div>

                <div className="analytics-card">
                  <h3 className="analytics-card-title">Feedback Categories</h3>
                  <div className="analytics-card-content">
                    <FeedbackCategoryChart />
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
        <div className="loading-spinner"></div>
        <p className="loading-text">Loading WasteWise System...</p>
      </div>
    );
  }

  return (
    <div className="admin-dashboard">
      <ErrorAlert />
      
      {/* Sidebar Navigation */}
      <aside className="dashboard-sidebar">
        <div className="sidebar-header">
          <div className="library-logo">
            <div className="logo-symbol">
              <WasteIcon />
            </div>
            <div className="logo-text">
              <h2>WasteWise</h2>
              <p>Management System</p>
            </div>
          </div>
        </div>

        <nav className="sidebar-nav">
          <div className="nav-section">
            <h3 className="nav-section-title">Overview</h3>
            <ul className="nav-list">
              <li 
                className={`nav-item ${activeSection === 'dashboard' ? 'active' : ''}`}
                onClick={() => setActiveSection('dashboard')}
              >
                <DashboardIcon />
                <span className="nav-label">Dashboard</span>
              </li>
            </ul>
          </div>

          <div className="nav-section">
            <h3 className="nav-section-title">Management</h3>
            <ul className="nav-list">
              <li 
                className={`nav-item ${activeSection === 'users' ? 'active' : ''}`}
                onClick={() => setActiveSection('users')}
              >
                <UsersIcon />
                <span className="nav-label">Users Management</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'feedback' ? 'active' : ''}`}
                onClick={() => setActiveSection('feedback')}
              >
                <FeedbackIcon />
                <span className="nav-label">Feedback Management</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'waste' ? 'active' : ''}`}
                onClick={() => setActiveSection('waste')}
              >
                <WasteIcon />
                <span className="nav-label">Waste Reports</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'messages' ? 'active' : ''}`}
                onClick={() => setActiveSection('messages')}
              >
                <MessagesIcon />
                <span className="nav-label">Messages</span>
              </li>
              <li 
                className={`nav-item ${activeSection === 'profile' ? 'active' : ''}`}
                onClick={() => setActiveSection('profile')}
              >
                <ProfileIcon />
                <span className="nav-label">Admin Profile</span>
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
            </div>
            <div className="quick-details">
              <p className="quick-name">{admin?.email?.split('@')[0] || 'Admin'}</p>
              <p className="quick-role">Administrator</p>
            </div>
          </div>
          <button 
            className="sidebar-logout-btn"
            onClick={() => setShowLogoutConfirm(true)}
          >
            <LogoutIcon />
            <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="dashboard-content">
        {renderActiveSection()}
      </main>

      {/* Logout Confirmation Modal */}
      {showLogoutConfirm && (
        <div className="modal-overlay" onClick={() => setShowLogoutConfirm(false)}>
          <div className="modal modal-confirm" onClick={(e) => e.stopPropagation()}>
            <h3 className="modal-title">Confirm Logout</h3>
            <p className="modal-description">
              Are you sure you want to logout? You will need to sign in again to access the dashboard.
            </p>
            <div className="modal-actions">
              <button 
                className="modal-btn btn-secondary"
                onClick={() => setShowLogoutConfirm(false)}
              >
                Cancel
              </button>
              <button 
                className="modal-btn btn-primary"
                onClick={handleLogout}
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;