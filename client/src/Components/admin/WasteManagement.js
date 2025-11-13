import React, { useState, useEffect } from 'react';
import API_URL from '../Utils/Api';
import '../css/report.css';

const WasteManagement = () => {
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedReport, setSelectedReport] = useState(null);
  const [showReportModal, setShowReportModal] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    processed: 0,
    recycled: 0,
    disposed: 0,
    rejected: 0,
    todaysReports: 0,
    thisWeeksReports: 0
  });
  const [comprehensiveStats, setComprehensiveStats] = useState(null);
  const [showStatsModal, setShowStatsModal] = useState(false);
  const [error, setError] = useState(null);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    fetchReports();
    fetchOverviewStats();
  }, [statusFilter]);

  const fetchWithAuth = async (url, options = {}) => {
    let token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    if (!token) {
      throw new Error('No authentication token found. Please log in again.');
    }

    const config = {
      method: options.method || 'GET',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    if (options.body) {
      config.body = JSON.stringify(options.body);
    }

    try {
      const response = await fetch(`${API_URL}${url}`, config);
      
      if (response.status === 401) {
        localStorage.removeItem('adminToken');
        localStorage.removeItem('token');
        throw new Error('Session expired. Please log in again.');
      }

      if (response.status === 403) {
        throw new Error('Access denied. Admin privileges required.');
      }

      if (response.status === 404) {
        throw new Error('API endpoint not found. Please check the server routes.');
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const textResponse = await response.text();
        if (textResponse.includes('<!DOCTYPE html>') || textResponse.includes('<html>')) {
          throw new Error('Server returned HTML page. This usually means the backend route does not exist.');
        }
        throw new Error(`Server returned unexpected response: ${contentType}`);
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || errorData.message || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data;

    } catch (error) {
      throw error;
    }
  };

  const fetchReports = async () => {
    try {
      setLoading(true);
      setError(null);
      
      let url = '/api/waste-reports';
      const params = new URLSearchParams();
      
      if (statusFilter !== 'all') {
        params.append('status', statusFilter);
      }
      params.append('limit', '50');
      params.append('page', '1');
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }

      const data = await fetchWithAuth(url);
      
      if (data.success) {
        const reportsData = data.reports || [];
        setReports(reportsData);
      } else {
        throw new Error(data.error || 'Unknown API error');
      }

    } catch (error) {
      let userFriendlyError = error.message;
      
      if (error.message.includes('Failed to fetch')) {
        userFriendlyError = 'Cannot connect to the server. Please check if the backend is running and accessible.';
      } else if (error.message.includes('HTML')) {
        userFriendlyError = 'Server returned an HTML page instead of data. This usually means the API route does not exist.';
      } else if (error.message.includes('Unexpected token')) {
        userFriendlyError = 'Server returned invalid JSON response. Please check the backend API.';
      }

      setError({ 
        type: 'error', 
        message: userFriendlyError 
      });
      
      setReports([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchOverviewStats = async () => {
    try {
      const data = await fetchWithAuth('/api/waste-reports/stats/overview');
      if (data.success) {
        setStats(data.stats);
      }
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchComprehensiveStats = async () => {
    try {
      setLoading(true);
      const data = await fetchWithAuth('/api/waste-reports/stats/comprehensive');
      if (data.success) {
        setComprehensiveStats(data.stats);
        setShowStatsModal(true);
      }
    } catch (error) {
      console.error('Error fetching comprehensive stats:', error);
      setError({ type: 'error', message: 'Failed to load comprehensive statistics' });
    } finally {
      setLoading(false);
    }
  };

  const viewReportDetails = (report) => {
    setSelectedReport(report);
    setAdminNotes(report.adminNotes || '');
    setShowReportModal(true);
  };

  const updateReportStatus = async (reportId, newStatus) => {
    try {
      setError(null);
      
      const response = await fetchWithAuth(`/api/waste-reports/${reportId}/status`, {
        method: 'PUT',
        body: {
          status: newStatus,
          adminNotes: adminNotes
        },
      });

      if (response.success) {
        await fetchReports();
        await fetchOverviewStats();
        setShowReportModal(false);
        setAdminNotes('');
        setError({ type: 'success', message: 'Report status updated successfully!' });
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.error || 'Failed to update report status');
      }
    } catch (error) {
      setError({ type: 'error', message: error.message });
    }
  };

  const deleteReport = async (reportId) => {
    if (!window.confirm('Are you sure you want to delete this report? This action cannot be undone.')) return;

    try {
      setError(null);
      const response = await fetchWithAuth(`/api/waste-reports/${reportId}`, {
        method: 'DELETE',
      });

      if (response.success) {
        await fetchReports();
        await fetchOverviewStats();
        setError({ type: 'success', message: 'Report deleted successfully!' });
        setTimeout(() => setError(null), 3000);
      } else {
        throw new Error(response.error || 'Failed to delete report');
      }
    } catch (error) {
      setError({ type: 'error', message: error.message });
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: '#f59e0b',
      processed: '#3b82f6',
      recycled: '#10b981',
      disposed: '#6b7280',
      rejected: '#ef4444'
    };
    return colors[status] || '#6b7280';
  };

  const getClassificationColor = (classification) => {
    const colors = {
      Recycling: '#10b981',
      organic: '#8b5cf6',
      general_waste: '#6b7280',
      hazardous: '#ef4444',
      unknown: '#9ca3af'
    };
    return colors[classification] || '#9ca3af';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatConfidence = (confidence) => {
    return Math.round(confidence * 100);
  };

  const ErrorAlert = () => {
    if (!error) return null;
    
    const isSuccess = error.type === 'success';
    
    return (
      <div className={`alert ${isSuccess ? 'alert-success' : 'alert-error'}`}>
        <div className="alert-content">
          <span className="alert-message">{error.message}</span>
          <button 
            className="alert-close"
            onClick={() => setError(null)}
          >
            ×
          </button>
        </div>
      </div>
    );
  };

  const StatisticsModal = () => {
    if (!showStatsModal || !comprehensiveStats) return null;

    return (
      <div className="modal-overlay" onClick={() => setShowStatsModal(false)}>
        <div className="modal modal-extra-large" onClick={(e) => e.stopPropagation()}>
          <div className="modal-header">
            <h3>Comprehensive Waste Statistics</h3>
            <button 
              className="modal-close"
              onClick={() => setShowStatsModal(false)}
            >
              ×
            </button>
          </div>

          <div className="modal-content">
            <div className="stats-summary-section">
              <h4>Quick Summary</h4>
              <div className="summary-grid">
                <div className="summary-item">
                  <span className="summary-label">Most Common Classification:</span>
                  <span className="summary-value">
                    {comprehensiveStats.summary.mostCommonClassification}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Top Material:</span>
                  <span className="summary-value">
                    {comprehensiveStats.summary.topMaterial}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Most Active User:</span>
                  <span className="summary-value">
                    {comprehensiveStats.summary.mostActiveUser}
                  </span>
                </div>
                <div className="summary-item">
                  <span className="summary-label">Average Reports Per User:</span>
                  <span className="summary-value">
                    {comprehensiveStats.summary.avgReportsPerUser.toFixed(1)}
                  </span>
                </div>
              </div>
            </div>

            <div className="stats-section">
              <h4>Classification Breakdown</h4>
              <div className="classification-stats">
                {comprehensiveStats.classificationBreakdown.map((item, index) => (
                  <div key={index} className="classification-item">
                    <div className="classification-header">
                      <span className="classification-name">{item.classification}</span>
                      <span className="classification-count">{item.count} reports</span>
                    </div>
                    <div className="classification-bar">
                      <div 
                        className="classification-fill"
                        style={{ 
                          width: `${item.percentage}%`,
                          backgroundColor: getClassificationColor(item.classification)
                        }}
                      ></div>
                    </div>
                    <div className="classification-details">
                      <span>{item.percentage.toFixed(1)}% of total</span>
                      <span>Avg Confidence: {(item.avgConfidence * 100).toFixed(1)}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {comprehensiveStats.materialBreakdown.length > 0 && (
              <div className="stats-section">
                <h4>Material Breakdown</h4>
                <div className="materials-grid">
                  {comprehensiveStats.materialBreakdown.slice(0, 8).map((material, index) => (
                    <div key={index} className="material-card">
                      <div className="material-name">{material.material}</div>
                      <div className="material-count">{material.count} detections</div>
                      <div className="material-percentage">{material.percentage.toFixed(1)}%</div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="stats-section">
              <h4>Top Users by Activity</h4>
              <div className="users-table">
                <table>
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Reports</th>
                      <th>First Report</th>
                      <th>Last Report</th>
                    </tr>
                  </thead>
                  <tbody>
                    {comprehensiveStats.userActivity.map((user, index) => (
                      <tr key={index}>
                        <td>
                          <div className="user-display">
                            <span className="user-name">{user.userName || 'Unknown'}</span>
                            <span className="user-email">{user.userEmail}</span>
                          </div>
                        </td>
                        <td>{user.reportCount}</td>
                        <td>{formatDate(user.firstReport)}</td>
                        <td>{formatDate(user.lastReport)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="stats-section">
              <h4>Monthly Trends (Last 12 Months)</h4>
              <div className="monthly-trends">
                {comprehensiveStats.monthlyTrends.map((month, index) => (
                  <div key={index} className="month-trend">
                    <div className="trend-period">{month.period}</div>
                    <div className="trend-count">{month.count} reports</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  if (loading && !showStatsModal) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading waste reports...</p>
        <button onClick={fetchReports} className="refresh-btn">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="waste-management-container">
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">/</span>
            <span className="breadcrumb-item active">Waste Management</span>
          </div>
          <h1 className="page-title">Waste Reports Management</h1>
          <p className="page-subtitle">
            Monitor and manage waste detection reports
          </p>
        </div>
      </div>

      <ErrorAlert />

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon total">
            <i className="icon-chart"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.total}</div>
            <div className="stat-label">Total Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon pending">
            <i className="icon-clock"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.pending}</div>
            <div className="stat-label">Pending</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon processed">
            <i className="icon-check"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.processed}</div>
            <div className="stat-label">Processed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon recycled">
            <i className="icon-recycle"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.recycled}</div>
            <div className="stat-label">Recycled</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon today">
            <i className="icon-calendar"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.todaysReports}</div>
            <div className="stat-label">Today's Reports</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon week">
            <i className="icon-trending"></i>
          </div>
          <div className="stat-info">
            <div className="stat-value">{stats.thisWeeksReports}</div>
            <div className="stat-label">This Week</div>
          </div>
        </div>
      </div>

      <div className="action-buttons-section">
        <button 
          className="btn-stats-comprehensive"
          onClick={fetchComprehensiveStats}
          disabled={loading}
        >
          View Comprehensive Statistics
        </button>
      </div>

      <div className="filters-section">
        <div className="filter-group">
          <label>Filter by Status:</label>
          <select 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            className="status-filter"
          >
            <option value="all">All Reports</option>
            <option value="pending">Pending</option>
            <option value="processed">Processed</option>
            <option value="recycled">Recycled</option>
            <option value="disposed">Disposed</option>
            <option value="rejected">Rejected</option>
          </select>
        </div>
        <button 
          className="refresh-btn"
          onClick={fetchReports}
          disabled={loading}
        >
          Refresh Data
        </button>
      </div>

      <div className="reports-table-container">
        <div className="table-header">
          <h3>Waste Reports ({reports.length})</h3>
          <div className="table-info">
            <span>Showing {reports.length} reports</span>
          </div>
        </div>
        
        {reports.length > 0 ? (
          <table className="reports-table">
            <thead>
              <tr>
                <th>User</th>
                <th>Image</th>
                <th>Classification</th>
                <th>Confidence</th>
                <th>Status</th>
                <th>Date</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {reports.map(report => (
                <tr key={report._id}>
                  <td>
                    <div className="user-info">
                      <div className="user-avatar">
                        {report.user?.profile ? (
                          <img src={report.user.profile} alt={report.user.name} />
                        ) : (
                          <span>{report.user?.name?.charAt(0) || report.userEmail?.charAt(0) || 'U'}</span>
                        )}
                      </div>
                      <div>
                        <div className="user-name">{report.user?.name || 'Unknown User'}</div>
                        <div className="user-email">{report.userEmail}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    {report.image ? (
                      <div 
                        className="report-image-thumbnail"
                        onClick={() => viewReportDetails(report)}
                        title="Click to view full image"
                      >
                        <img src={report.image} alt="Waste report" />
                        <div className="image-overlay">View</div>
                      </div>
                    ) : (
                      <span className="no-image">No Image</span>
                    )}
                  </td>
                  <td>
                    <span 
                      className="classification-badge"
                      style={{ backgroundColor: getClassificationColor(report.classification) }}
                    >
                      {report.classification}
                    </span>
                  </td>
                  <td>
                    <div className="confidence-container">
                      <div className="confidence-bar">
                        <div 
                          className="confidence-fill"
                          style={{ width: `${formatConfidence(report.classificationConfidence)}%` }}
                        ></div>
                      </div>
                      <span className="confidence-text">
                        {formatConfidence(report.classificationConfidence)}%
                      </span>
                    </div>
                  </td>
                  <td>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(report.status) }}
                    >
                      {report.status}
                    </span>
                  </td>
                  <td>{formatDate(report.scanDate)}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        className="btn-view"
                        onClick={() => viewReportDetails(report)}
                        title="View Details"
                      >
                        View
                      </button>
                      <button 
                        className="btn-delete"
                        onClick={() => deleteReport(report._id)}
                        title="Delete Report"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : (
          <div className="empty-state">
            <div className="empty-icon"></div>
            <h3>No reports found</h3>
            <p>
              {error ? 
                error.message : 
                `There are no waste reports ${statusFilter !== 'all' ? `with status "${statusFilter}"` : 'in the system'}.`
              }
            </p>
            <div className="empty-actions">
              <button onClick={fetchReports} className="refresh-btn">
                Try Again
              </button>
            </div>
          </div>
        )}
      </div>

      {showReportModal && selectedReport && (
        <div className="modal-overlay" onClick={() => setShowReportModal(false)}>
          <div className="modal modal-large" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Waste Report Details</h3>
              <button 
                className="modal-close"
                onClick={() => setShowReportModal(false)}
              >
                ×
              </button>
            </div>

            <div className="modal-content">
              <div className="report-details-grid">
                {selectedReport.image && (
                  <div className="detail-section full-width">
                    <h4>Waste Image</h4>
                    <div className="image-container-large">
                      <img src={selectedReport.image} alt="Waste detection" />
                    </div>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Report Information</h4>
                  <div className="detail-row">
                    <label>Report ID:</label>
                    <span className="report-id">{selectedReport._id}</span>
                  </div>
                  <div className="detail-row">
                    <label>User:</label>
                    <span>{selectedReport.user?.name || 'Unknown'} ({selectedReport.userEmail})</span>
                  </div>
                  <div className="detail-row">
                    <label>Classification:</label>
                    <span 
                      className="classification-value"
                      style={{ color: getClassificationColor(selectedReport.classification) }}
                    >
                      {selectedReport.classification}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Confidence:</label>
                    <span>{formatConfidence(selectedReport.classificationConfidence)}%</span>
                  </div>
                  <div className="detail-row">
                    <label>Status:</label>
                    <span 
                      className="status-badge"
                      style={{ backgroundColor: getStatusColor(selectedReport.status) }}
                    >
                      {selectedReport.status}
                    </span>
                  </div>
                  <div className="detail-row">
                    <label>Scan Date:</label>
                    <span>{formatDate(selectedReport.scanDate)}</span>
                  </div>
                </div>

                <div className="detail-section">
                  <h4>Detected Objects</h4>
                  {selectedReport.detectedObjects && selectedReport.detectedObjects.length > 0 ? (
                    <div className="objects-list">
                      {selectedReport.detectedObjects.map((obj, index) => (
                        <div key={index} className="object-item">
                          <span className="object-label">{obj.label}</span>
                          <span className="object-confidence">
                            {formatConfidence(obj.confidence)}%
                          </span>
                          {obj.material && (
                            <span className="object-material">({obj.material})</span>
                          )}
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="no-data">No objects detected</p>
                  )}
                </div>

                {selectedReport.recyclingTips && selectedReport.recyclingTips.length > 0 && (
                  <div className="detail-section">
                    <h4>Recycling Tips</h4>
                    <ul className="tips-list">
                      {selectedReport.recyclingTips.map((tip, index) => (
                        <li key={index}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="detail-section">
                  <h4>Admin Notes</h4>
                  <textarea
                    className="admin-notes-input"
                    value={adminNotes}
                    onChange={(e) => setAdminNotes(e.target.value)}
                    placeholder="Add admin notes here..."
                    rows="3"
                  />
                </div>
              </div>

              <div className="status-update-section">
                <h4>Update Status</h4>
                <div className="status-buttons">
                  <button 
                    className={`btn-status ${selectedReport.status === 'pending' ? 'active' : ''}`}
                    onClick={() => updateReportStatus(selectedReport._id, 'pending')}
                  >
                    Pending
                  </button>
                  <button 
                    className={`btn-status ${selectedReport.status === 'processed' ? 'active' : ''}`}
                    onClick={() => updateReportStatus(selectedReport._id, 'processed')}
                  >
                    Processed
                  </button>
                  <button 
                    className={`btn-status ${selectedReport.status === 'recycled' ? 'active' : ''}`}
                    onClick={() => updateReportStatus(selectedReport._id, 'recycled')}
                  >
                    Recycled
                  </button>
                  <button 
                    className={`btn-status ${selectedReport.status === 'disposed' ? 'active' : ''}`}
                    onClick={() => updateReportStatus(selectedReport._id, 'disposed')}
                  >
                    Disposed
                  </button>
                  <button 
                    className={`btn-status ${selectedReport.status === 'rejected' ? 'active' : ''}`}
                    onClick={() => updateReportStatus(selectedReport._id, 'rejected')}
                  >
                    Rejected
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      <StatisticsModal />
    </div>
  );
};

export default WasteManagement;