import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import API_URL from '../Utils/Api';
import '../css/message.css';

const Message = () => {
  const [conversations, setConversations] = useState([]);
  const [messages, setMessages] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [newMessage, setNewMessage] = useState('');
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef(null);
  const currentUserId = localStorage.getItem('userId');

  useEffect(() => {
    if (currentUserId) {
      fetchConversations();
      fetchUsers();
    }
  }, [currentUserId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchConversations = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/conversations/${currentUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setConversations(data);
      }
    } catch (error) {
      console.error('Error fetching conversations:', error);
    }
  };

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/users`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  const fetchMessages = async (otherUserId) => {
    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/conversation/${currentUserId}/${otherUserId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setMessages(data);
        
        // Mark messages as read
        await markAsRead(otherUserId);
      }
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  };

  const markAsRead = async (senderId) => {
    try {
      const token = localStorage.getItem('adminToken');
      await fetch(`${API_URL}/api/messages/read/${senderId}/${currentUserId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
    } catch (error) {
      console.error('Error marking messages as read:', error);
    }
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!newMessage.trim() || !selectedUser) return;

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/send`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          senderId: currentUserId,
          receiverId: selectedUser._id,
          text: newMessage
        }),
      });

      if (response.ok) {
        const data = await response.json();
        setMessages(prev => [...prev, data.message]);
        setNewMessage('');
        fetchConversations(); // Refresh conversations list
      }
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const searchUsers = async (query) => {
    if (!query.trim()) {
      setSearchResults([]);
      return;
    }

    try {
      const token = localStorage.getItem('adminToken');
      const response = await fetch(`${API_URL}/api/messages/search?q=${encodeURIComponent(query)}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data);
      }
    } catch (error) {
      console.error('Error searching users:', error);
    }
  };

  const selectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery('');
    setSearchResults([]);
    fetchMessages(user._id);
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div className="messaging-container">
      {/* Header */}
      <div className="content-topbar">
        <div className="topbar-left">
          <div className="page-breadcrumb">
            <span className="breadcrumb-item">Dashboard</span>
            <span className="breadcrumb-separator">→</span>
            <span className="breadcrumb-item active">Messages</span>
          </div>
          <h1 className="page-title">Messages</h1>
          <p className="page-subtitle">
            <span className="subtitle-dot"></span>
            Communicate with users and team members
          </p>
        </div>
      </div>

      <div className="messaging-layout">
        {/* Sidebar - Conversations List */}
        <div className="conversations-sidebar">
          <div className="sidebar-header">
            <h3>Conversations</h3>
            <div className="search-container">
              <input
                type="text"
                placeholder="Search users..."
                value={searchQuery}
                onChange={(e) => {
                  setSearchQuery(e.target.value);
                  searchUsers(e.target.value);
                }}
                className="search-input"
              />
            </div>
          </div>

          {/* Search Results */}
          {searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map(user => (
                <div
                  key={user._id}
                  className="conversation-item"
                  onClick={() => selectUser(user)}
                >
                  <div className="user-avatar">
                    {user.profile ? (
                      <img src={user.profile} alt={user.username} />
                    ) : (
                      <span>{user.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div className="conversation-info">
                    <div className="user-name">{user.username}</div>
                    <div className="user-email">{user.email}</div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Conversations List */}
          <div className="conversations-list">
            {conversations.map(conversation => (
              <div
                key={conversation.user._id}
                className={`conversation-item ${selectedUser?._id === conversation.user._id ? 'active' : ''}`}
                onClick={() => selectUser(conversation.user)}
              >
                <div className="user-avatar">
                  {conversation.user.profile ? (
                    <img src={conversation.user.profile} alt={conversation.user.username} />
                  ) : (
                    <span>{conversation.user.username?.charAt(0).toUpperCase()}</span>
                  )}
                  {conversation.unread && <div className="unread-indicator"></div>}
                </div>
                <div className="conversation-info">
                  <div className="user-name">{conversation.user.username}</div>
                  <div className="last-message">{conversation.lastMessage.text}</div>
                  <div className="message-time">
                    {formatTime(conversation.lastMessage.timestamp)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Chat Area */}
        <div className="chat-area">
          {selectedUser ? (
            <>
              <div className="chat-header">
                <div className="chat-user-info">
                  <div className="user-avatar">
                    {selectedUser.profile ? (
                      <img src={selectedUser.profile} alt={selectedUser.username} />
                    ) : (
                      <span>{selectedUser.username?.charAt(0).toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="user-name">{selectedUser.username}</div>
                    <div className="user-status">Online</div>
                  </div>
                </div>
              </div>

              <div className="messages-container">
                {messages.map(message => (
                  <div
                    key={message._id}
                    className={`message ${message.senderId === currentUserId ? 'sent' : 'received'}`}
                  >
                    <div className="message-content">
                      <div className="message-text">{message.text}</div>
                      <div className="message-time">
                        {formatTime(message.timestamp)}
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <form onSubmit={sendMessage} className="message-input-form">
                <div className="input-container">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="message-input"
                  />
                  <button type="submit" className="send-button">
                    Send
                  </button>
                </div>
              </form>
            </>
          ) : (
            <div className="no-chat-selected">
              <div className="empty-state">
                <div className="empty-icon">💬</div>
                <h3>Select a conversation</h3>
                <p>Choose a user from the list to start messaging</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Message;