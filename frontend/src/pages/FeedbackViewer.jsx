import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../config/api';

const FeedbackViewer = () => {
  const navigate = useNavigate();
  const [feedbacks, setFeedbacks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchFeedback();
  }, []);

  const fetchFeedback = async () => {
    try {
      setLoading(true);
      const result = await api.getFeedback();
      setFeedbacks(result.feedbacks || []);
    } catch (err) {
      console.error('Error fetching feedback:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this feedback?')) {
      return;
    }

    try {
      await api.deleteFeedback(id);
      setFeedbacks(feedbacks.filter((feedback) => feedback.id !== id));
    } catch (err) {
      console.error('Error deleting feedback:', err);
      alert('Failed to delete feedback: ' + err.message);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="gallery-container">
        <div className="loading">
          <div className="spinner"></div>
          <p>Loading feedback...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="gallery-container">
        <div className="error-message">
          <p>Error loading feedback: {error}</p>
          <button onClick={fetchFeedback} className="btn-primary">
            Retry
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="gallery-container">
      <header className="gallery-header">
        <div>
          <h1>User Feedback</h1>
          <p className="subtitle">{feedbacks.length} feedback message{feedbacks.length !== 1 ? 's' : ''}</p>
        </div>
        <button onClick={() => navigate('/')} className="btn-secondary">
          Back to Gallery
        </button>
      </header>

      {feedbacks.length === 0 ? (
        <div className="empty-state">
          <h2>No feedback yet</h2>
          <p>When users submit feedback, it will appear here.</p>
        </div>
      ) : (
        <div className="feedback-list">
          {feedbacks.map((feedback) => (
            <div key={feedback.id} className="feedback-card">
              <div className="feedback-header">
                <div className="feedback-meta">
                  <span className="feedback-email">
                    {feedback.email || 'Anonymous'}
                  </span>
                  <span className="feedback-date">
                    {formatDate(feedback.created_at)}
                  </span>
                </div>
                <button
                  onClick={() => handleDelete(feedback.id)}
                  className="btn-danger btn-small"
                  title="Delete feedback"
                >
                  Delete
                </button>
              </div>
              <div className="feedback-message">
                {feedback.message}
              </div>
              {feedback.user_id && (
                <div className="feedback-footer">
                  <span className="feedback-user-id">User ID: {feedback.user_id}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackViewer;
