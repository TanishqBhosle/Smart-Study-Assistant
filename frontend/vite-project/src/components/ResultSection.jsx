import React from 'react';
import './ResultSection.css';

const ResultSection = ({ data, topic }) => {
  if (!data) return null;

  return (
    <div className="result-section">
      <h2 className="result-title">Study Materials: {topic}</h2>
      
      {data.summary && data.summary.length > 0 && (
        <section className="result-card summary-card">
          <h3>📚 Summary</h3>
          <ul className="summary-list">
            {data.summary.map((point, index) => (
              <li key={index}>{point}</li>
            ))}
          </ul>
        </section>
      )}

      {data.quiz && data.quiz.length > 0 && (
        <section className="result-card quiz-card">
          <h3>❓ Quiz</h3>
          <div className="quiz-list">
            {data.quiz.map((item, index) => {
              const options = item.options || [];

              const getCorrectIndex = (q) => {
                const opts = q.options || [];
                // Prefer numeric index if valid (0-based)
                if (Number.isInteger(q.answerIndex)) {
                  const idx = q.answerIndex;
                  if (idx >= 0 && idx < opts.length) return idx;
                  // Some providers use 1-based index
                  if (idx >= 1 && idx <= opts.length) return idx - 1;
                }
                // Try string answer matching
                if (q.answer) {
                  const ans = String(q.answer).trim();
                  // Letter like A, B, C, D
                  const m = ans.match(/^[A-D]$/i);
                  if (m) return m[0].toUpperCase().charCodeAt(0) - 65;
                  // Match by option text (case-insensitive, trimmed)
                  const found = opts.findIndex(
                    (o) => String(o).trim().toLowerCase() === ans.toLowerCase()
                  );
                  if (found !== -1) return found;
                }
                return -1;
              };

              const correctIndex = getCorrectIndex(item);

              return (
                <div key={index} className="quiz-item">
                  <p className="quiz-question">{item.question}</p>
                  <div className="quiz-options">
                    {options.map((option, optIndex) => (
                      <div
                        key={optIndex}
                        className={`quiz-option ${optIndex === correctIndex ? 'correct' : ''}`}
                      >
                        {String.fromCharCode(65 + optIndex)}. {option}
                        {optIndex === correctIndex && (
                          <span className="answer-badge">✓ Correct</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {data.tip && (
        <section className="result-card tip-card">
          <h3>💡 Study Tip</h3>
          <p className="tip-text">{data.tip}</p>
        </section>
      )}

      {data.math && (
        <section className="result-card math-card">
          <h3>🔢 Math Problem</h3>
          <div className="math-content">
            <p className="math-question"><strong>Question:</strong> {data.math.question}</p>
            <p className="math-answer"><strong>Answer:</strong> {data.math.answer}</p>
            <p className="math-explanation"><strong>Explanation:</strong> {data.math.explanation}</p>
          </div>
        </section>
      )}
    </div>
  );
};

export default ResultSection;



