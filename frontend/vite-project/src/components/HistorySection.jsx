import React from 'react';
import './HistorySection.css';

const HistorySection = ({ history, onSelectTopic, onClearHistory }) => {
  if (!history || history.length === 0) return null;

  return (
   <section className='history-section'>
      <div className="history-header">
        <h3>📖 Recent Topics</h3>
        <button onClick={onClearHistory} className="clear-btn">
          Clear
        </button>
      </div>
      <div className="history-list">
        {history.map((item, index) => (
          <button
            key={index}
            className="history-item"
            onClick={() => onSelectTopic(item.topic)}
            title={`Click to study: ${item.topic}`}
          >
            <span className="history-topic">{item.topic}</span>
            <span className="history-date">
              {new Date(item.timestamp).toLocaleDateString()}
            </span>
          </button>
        ))}
      </div>
      </section>
  );
};

export default HistorySection;

