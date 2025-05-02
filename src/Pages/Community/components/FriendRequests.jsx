import React from 'react';
import { formatDistanceToNow } from 'date-fns';

const FriendRequests = ({ requests, onAccept, onReject }) => {
  // Helper function to format date
  const formatDateTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  const { received, sent } = requests;

  return (
    <div className="friend-requests">
      {/* Received Requests Section */}
      <div className="requests-section">
        <h2 className="section-title">Friend Requests Received</h2>
        <div className="request-list">
          {received && received.length > 0 ? (
            received.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-avatar">
                  {request.profileImage 
                    ? <img src={request.profileImage} alt={request.username} /> 
                    : request.username.charAt(0).toUpperCase()}
                </div>
                <div className="request-info">
                  <h3 className="request-name">
                    {request.firstName && request.lastName 
                      ? `${request.firstName} ${request.lastName}` 
                      : request.username}
                  </h3>
                  <p className="request-date">
                    Requested {formatDateTime(request.since)}
                  </p>
                </div>
                <div className="request-actions">
                  <button 
                    className="action-button accept"
                    onClick={() => onAccept(request.id)}
                  >
                    <span className="action-icon">✓</span>
                    Accept
                  </button>
                  <button 
                    className="action-button reject"
                    onClick={() => onReject(request.id)}
                  >
                    <span className="action-icon">✕</span>
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-requests">No pending friend requests received</div>
          )}
        </div>
      </div>

      {/* Sent Requests Section */}
      <div className="requests-section">
        <h2 className="section-title">Friend Requests Sent</h2>
        <div className="request-list">
          {sent && sent.length > 0 ? (
            sent.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-avatar">
                  {request.profileImage 
                    ? <img src={request.profileImage} alt={request.username} /> 
                    : request.username.charAt(0).toUpperCase()}
                </div>
                <div className="request-info">
                  <h3 className="request-name">
                    {request.firstName && request.lastName 
                      ? `${request.firstName} ${request.lastName}` 
                      : request.username}
                  </h3>
                  <p className="request-date">
                    Sent {formatDateTime(request.since)}
                  </p>
                </div>
                <div className="request-actions">
                  <button 
                    className="action-button cancel"
                    onClick={() => onReject(request.id)}
                  >
                    <span className="action-icon">✕</span>
                    Cancel
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-requests">No pending friend requests sent</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;