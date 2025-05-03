import React from "react";
import { formatDistanceToNow } from "date-fns";
import { API_URL } from "../../../config/index";
import "./FriendRequests.scss";

const FriendRequests = ({ requests, onAccept, onReject }) => {
  // Helper function to format date
  const formatDateTime = (dateString) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true });
    } catch (error) {
      return "recently";
    }
  };

  // Helper function to create avatar initials - gets first letter or first two for better display
  const getAvatarInitials = (user) => {
    if (!user) return "?";

    // If we have firstName and lastName, use both initials
    if (user.firstName && user.lastName) {
      return `${user.firstName.charAt(0)}${user.lastName.charAt(
        0
      )}`.toUpperCase();
    }

    // If only firstName is available, use its first letter
    if (user.firstName) {
      return user.firstName.charAt(0).toUpperCase();
    }

    // If username contains spaces (like "John Doe"), get first letter of first and last name
    if (user.username && user.username.includes(" ")) {
      const names = user.username.split(" ");
      return `${names[0].charAt(0)}${names[names.length - 1].charAt(
        0
      )}`.toUpperCase();
    }

    // Otherwise just return the first letter of username
    if (user.username) {
      return user.username.charAt(0).toUpperCase();
    }

    return "?";
  };

  const handleAccept = async (requestId) => {
    try {
      const token = localStorage.getItem("xlingoToken");
      const response = await fetch(
        `${API_URL}/community/friends/accept/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onAccept(requestId);
      } else {
        console.error("Failed to accept request:", data.message);
      }
    } catch (err) {
      console.error("Error accepting friend request:", err);
    }
  };

  const handleReject = async (requestId) => {
    try {
      const token = localStorage.getItem("xlingoToken");
      const response = await fetch(
        `${API_URL}/community/friends/reject/${requestId}`,
        {
          method: "PUT",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onReject(requestId);
      } else {
        console.error("Failed to reject request:", data.message);
      }
    } catch (err) {
      console.error("Error rejecting friend request:", err);
    }
  };

  const handleCancel = async (requestId) => {
    try {
      const token = localStorage.getItem("xlingoToken");
      const response = await fetch(
        `${API_URL}/community/friends/cancel/${requestId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await response.json();
      if (data.success) {
        onReject(requestId); // Use the same callback as reject since the UI update is the same
      } else {
        console.error("Failed to cancel request:", data.message);
      }
    } catch (err) {
      console.error("Error cancelling friend request:", err);
    }
  };

  return (
    <div className="friend-requests">
      {/* Received Requests Section */}
      <div className="requests-section">
        <h2 className="section-title">Friend Requests Received</h2>
        <div className="request-list">
          {requests.incoming && requests.incoming.length > 0 ? (
            requests.incoming.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-avatar">
                  {request.profileImage ? (
                    <img src={request.profileImage} alt={request.username} />
                  ) : (
                    <div className="avatar-initials">
                      {getAvatarInitials(request)}
                    </div>
                  )}
                </div>
                <div className="request-info">
                  <h3 className="request-name">
                    {request.firstName && request.lastName
                      ? `${request.firstName} ${request.lastName}`
                      : request.username}
                  </h3>
                  <p className="request-date">
                    Requested {formatDateTime(request.requestDate)}
                  </p>
                </div>
                <div className="request-actions">
                  <button
                    className="action-button accept"
                    onClick={() => handleAccept(request.id)}
                  >
                    <span className="action-icon">✓</span>
                    Accept
                  </button>
                  <button
                    className="action-button reject"
                    onClick={() => handleReject(request.id)}
                  >
                    <span className="action-icon">✕</span>
                    Reject
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-requests">
              No pending friend requests received
            </div>
          )}
        </div>
      </div>

      {/* Sent Requests Section */}
      <div className="requests-section">
        <h2 className="section-title">Friend Requests Sent</h2>
        <div className="request-list">
          {requests.outgoing && requests.outgoing.length > 0 ? (
            requests.outgoing.map((request) => (
              <div className="request-card" key={request.id}>
                <div className="request-avatar">
                  {request.profileImage ? (
                    <img src={request.profileImage} alt={request.username} />
                  ) : (
                    <div className="avatar-initials">
                      {getAvatarInitials(request)}
                    </div>
                  )}
                </div>
                <div className="request-info">
                  <h3 className="request-name">
                    {request.firstName && request.lastName
                      ? `${request.firstName} ${request.lastName}`
                      : request.username}
                  </h3>
                  <p className="request-date">
                    Sent {formatDateTime(request.requestDate)}
                  </p>
                </div>
                <div className="request-actions">
                  <button
                    className="action-button cancel"
                    onClick={() => handleCancel(request.id)}
                  >
                    <span className="action-icon">✕</span>
                    Cancel
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-requests">
              No pending friend requests sent
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
