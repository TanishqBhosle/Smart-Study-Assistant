import React from 'react';
import './StudyForm.css';

const StudyForm = ({ topic, setTopic, mathMode, setMathMode, onSubmit, loading }) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    if (topic.trim()) {
      onSubmit();
    }
  };

  return (
    <form className="study-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <input
          id="topic"
          type="text"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          placeholder="e.g., Quantum Physics, World War II, Photosynthesis..."
          disabled={loading}
          required
        />
      </div>
      
      <div className="form-options">
        <label className="toggle-switch">
          <input
            type="checkbox"
            checked={mathMode}
            onChange={(e) => setMathMode(e.target.checked)}
            disabled={loading}
          />
          <span className="toggle-slider"></span>
          <span className="toggle-label">Math Mode</span>
        </label>
      </div>

      <button type="submit" className="submit-btn" disabled={loading || !topic.trim()}>
        {loading ? 'Generating...' : 'Generate Study Materials'}
      </button>
    </form>
  );
};

export default StudyForm;
