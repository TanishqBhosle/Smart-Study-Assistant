import React, { useState, useEffect, Suspense, lazy } from 'react';
import StudyForm from './components/StudyForm';
import ThemeToggle from './components/ThemeToggle';
import LoadingFallback from './components/LoadingFallback';
import './App.css';

// Lazy load components that aren't needed immediately
const ResultSection = lazy(() => import('./components/ResultSection'));
const HistorySection = lazy(() => import('./components/HistorySection'));

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

function App() {
  const [topic, setTopic] = useState('');
  const [mathMode, setMathMode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  
  const [isDark, setIsDark] = useState(() => {
    try {
      const saved = localStorage.getItem('darkMode');
      if (saved !== null) {
        return JSON.parse(saved) === true;
      }
    } catch (_) {
      // ignore parse errors and fall back to system preference
    }
    return (typeof window !== 'undefined' && window.matchMedia) ? window.matchMedia('(prefers-color-scheme: dark)').matches : false;
  });

  // Load history from localStorage on mount
  useEffect(() => {
    const savedHistory = localStorage.getItem('studyHistory');
    if (savedHistory) {
      try {
        setHistory(JSON.parse(savedHistory));
      } catch (e) {
        console.error('Failed to load history:', e);
      }
    }
  }, []);

  // Apply and save dark mode preference
  useEffect(() => {
    localStorage.setItem('darkMode', JSON.stringify(isDark));
    if (isDark) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [isDark]);

  // Save history to localStorage
  useEffect(() => {
    if (history.length > 0) {
      localStorage.setItem('studyHistory', JSON.stringify(history));
    }
  }, [history]);

  const handleSubmit = async () => {
    if (!topic.trim()) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const url = `${API_BASE_URL}/study?topic=${encodeURIComponent(topic.trim())}${mathMode ? '&mode=math' : ''}`;
      const response = await fetch(url);

      if (!response.ok) {
        throw new Error(`Failed to fetch: ${response.statusText}`);
      }

      const data = await response.json();

      if (data.status === 'error') {
        throw new Error(data.error || 'Unknown error occurred');
      }

      setResult(data.data);
      
      // Add to history
      const historyItem = {
        topic: topic.trim(),
        timestamp: Date.now(),
      };
      setHistory((prev) => {
        const filtered = prev.filter((item) => item.topic !== historyItem.topic);
        return [historyItem, ...filtered].slice(0, 10); // Keep last 10
      });
    } catch (err) {
      setError(err.message || 'An error occurred while fetching study materials');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTopic = (selectedTopic) => {
    setTopic(selectedTopic);
    // Optionally auto-submit
    // handleSubmit();
  };

  const handleClearHistory = () => {
    setHistory([]);
    localStorage.removeItem('studyHistory');
  };

  const toggleTheme = () => {
    setIsDark((prev) => !prev);
  };

  return (
    <div className="app">
      <ThemeToggle isDark={isDark} toggleTheme={toggleTheme} />
      
      <header className="app-header">
        <h1>🧠 Smart Study Assistant</h1>
        <p className="subtitle">Generate comprehensive study materials from any topic</p>
      </header>

      <main className="app-main">
        <Suspense fallback={<LoadingFallback message="Loading history..." />}>
          <HistorySection
            history={history}
            onSelectTopic={handleSelectTopic}
            onClearHistory={handleClearHistory}
          />
        </Suspense>

        <StudyForm
          topic={topic}
          setTopic={setTopic}
          mathMode={mathMode}
          setMathMode={setMathMode}
          onSubmit={handleSubmit}
          loading={loading}
        />

        {error && (
          <div className="error-message">
            <strong>❌ Error:</strong> {error}
          </div>
        )}

        {loading && (
          <div className="loading-message">
            <div className="spinner"></div>
            <p>Generating study materials...</p>
          </div>
        )}

        {result && !loading && (
          <Suspense fallback={<LoadingFallback message="Loading results..." />}>
            <ResultSection data={result} topic={topic} />
          </Suspense>
        )}
      </main>
    </div>
  );
}

export default App;
