import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import '../css/Feedback.css';


const FeedbackManagement = () => {
  const [feedback, setFeedback] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [message, setMessage] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [adminReply, setAdminReply] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    fetchFeedbackData();
  }, [currentPage]);

  const fetchFeedbackData = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem('adminToken');
      
      const [feedbackResponse, statsResponse] = await Promise.all([
        fetch(`${API_URL}/api/feedback/all?page=${currentPage}&limit=10`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }),
        fetch(`${API_URL}/api/feedback/stats`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        })
      ]);

      if (feedbackResponse.ok && statsResponse.ok) {
        const feedbackData = await feedbackResponse.json();
        const statsData = await statsResponse.json();
        
        setFeedback(feedbackData.feedback);
        setStats(statsData);
        setTotalPages(feedbackData.pages || 1);
      } else {
        throw new Error('Failed to fetch feedback data');
      }
    } catch (error) {
      setMessage('Error fetching feedback data: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (feedbackId, status) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(feedback.map(item =>
          item._id === feedbackId ? { ...item, status: data.feedback.status } : item
        ));
        setMessage('Feedback status updated successfully');
        
        // Clear message after 3 seconds
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to update feedback status');
      }
    } catch (error) {
      setMessage('Error updating feedback: ' + error.message);
    }
  };

  const handleReplySubmit = async (feedbackId) => {
    if (!adminReply.trim()) {
      setMessage('Please enter a reply message');
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/feedback/${feedbackId}/status`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: 'replied', 
          adminReply: adminReply.trim() 
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setFeedback(feedback.map(item =>
          item._id === feedbackId ? { 
            ...item, 
            status: 'replied', 
            adminReply: adminReply.trim(),
            updatedAt: new Date().toISOString()
          } : item
        ));
        setReplyingTo(null);
        setAdminReply('');
        setMessage('Reply sent successfully');
        
        setTimeout(() => setMessage(''), 3000);
      } else {
        throw new Error('Failed to send reply');
      }
    } catch (error) {
      setMessage('Error sending reply: ' + error.message);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      reviewed: '#3b82f6',
      replied: '#10b981',
      resolved: '#6b7280'
    };
    return colors[status] || '#6b7280';
  };

  const getRatingStars = (rating) => {
    return '★'.repeat(rating) + '☆'.repeat(5 - rating);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner">
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
          <div className="spinner-ring"></div>
        </div>
        <p>Loading feedback...</p>
      </div>
    );
  }

  return (
    <div className="management-section">
      <div className="section-header">
        <h2 className="section-title">Feedback Management</h2>
        <p className="section-subtitle">Review and respond to user feedback</p>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="stats-grid compact">
          <div className="stat-card mini">
            <h3>Total Feedback</h3>
            <p className="stat-value">{stats.totalFeedback}</p>
          </div>
          <div className="stat-card mini">
            <h3>Average Rating</h3>
            <p className="stat-value">{stats.averageRating?.toFixed(1) || '0.0'}/5</p>
          </div>
          <div className="stat-card mini">
            <h3>Pending</h3>
            <p className="stat-value">
              {stats.statusStats?.find(s => s._id === 'pending')?.count || 0}
            </p>
          </div>
          <div className="stat-card mini">
            <h3>Replied</h3>
            <p className="stat-value">
              {stats.statusStats?.find(s => s._id === 'replied')?.count || 0}
            </p>
          </div>
        </div>
      )}

      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-error' : 'alert-success'}`}>
          <span className="alert-icon">{message.includes('Error') ? '✕' : '✓'}</span>
          <span className="alert-message">{message}</span>
        </div>
      )}

      <div className="feedback-list">
        {feedback.map(item => (
          <div key={item._id} className="feedback-item">
            <div className="feedback-header">
              <div className="user-info">
                <div className="user-avatar small">
                  {item.user?.profile ? (
                    <img src={item.user.profile} alt={item.user.username} />
                  ) : (
                    <span>{item.user?.username?.charAt(0).toUpperCase() || 'U'}</span>
                  )}
                </div>
                <div className="user-details">
                  <strong className="user-name">{item.user?.username || 'Unknown User'}</strong>
                  <span className="user-email">{item.user?.email}</span>
                </div>
              </div>
              <div className="feedback-meta">
                <span className="rating" title={`Rating: ${item.rating}/5`}>
                  {getRatingStars(item.rating)}
                </span>
                <span 
                  className="status-badge"
                  style={{ backgroundColor: getStatusColor(item.status) }}
                >
                  {item.status}
                </span>
                <span className="date">
                  {new Date(item.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            <div className="feedback-content">
              <div className="category-tag">
                <span className="category-label">Category:</span>
                <span className="category-value">{item.category}</span>
              </div>
              <div className="message-content">
                <p>{item.message}</p>
              </div>
              
              {item.adminReply && (
                <div className="admin-reply">
                  <div className="admin-reply-header">
                    <strong>Admin Reply:</strong>
                    <span className="reply-date">
                      {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString() : ''}
                    </span>
                  </div>
                  <p>{item.adminReply}</p>
                </div>
              )}
            </div>

            <div className="feedback-actions">
              <select
                value={item.status}
                onChange={(e) => handleStatusUpdate(item._id, e.target.value)}
                className="status-select"
              >
                <option value="pending">Pending</option>
                <option value="reviewed">Reviewed</option>
                <option value="replied">Replied</option>
                <option value="resolved">Resolved</option>
              </select>

              {item.status !== 'replied' && (
                <button
                  className="reply-btn"
                  onClick={() => {
                    setReplyingTo(item._id);
                    setAdminReply(item.adminReply || '');
                  }}
                >
                  {item.adminReply ? 'Edit Reply' : 'Reply'}
                </button>
              )}
            </div>

            {replyingTo === item._id && (
              <div className="reply-section">
                <textarea
                  value={adminReply}
                  onChange={(e) => setAdminReply(e.target.value)}
                  placeholder="Type your reply here..."
                  rows="3"
                  className="reply-textarea"
                />
                <div className="reply-actions">
                  <button 
                    className="btn-primary"
                    onClick={() => handleReplySubmit(item._id)}
                  >
                    Send Reply
                  </button>
                  <button 
                    className="btn-secondary"
                    onClick={() => {
                      setReplyingTo(null);
                      setAdminReply('');
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="pagination">
          <button
            disabled={currentPage === 1}
            onClick={() => setCurrentPage(currentPage - 1)}
            className="pagination-btn"
          >
            Previous
          </button>
          <span className="pagination-info">
            Page {currentPage} of {totalPages}
          </span>
          <button
            disabled={currentPage === totalPages}
            onClick={() => setCurrentPage(currentPage + 1)}
            className="pagination-btn"
          >
            Next
          </button>
        </div>
      )}

      {feedback.length === 0 && (
        <div className="empty-state">
          <div className="empty-icon">💬</div>
          <h3>No feedback available</h3>
          <p>There are no feedback submissions to display</p>
        </div>
      )}
    </div>
  );
};

export default FeedbackManagement;