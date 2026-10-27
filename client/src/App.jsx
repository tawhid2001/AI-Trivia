import { useState } from 'react';
import { postJSON } from './api.js';
import QuestionCard from './components/QuestionCard.jsx';
import PhotoRound from './components/PhotoRound.jsx';

export default function App() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [takingLong, setTakingLong] = useState(false);
  const [error, setError] = useState(null);

  // Shared loader: clears the old question, runs the request, shows errors.
async function loadQuestion(request) {
  if (loading) return;

  setLoading(true);
  setTakingLong(false);
  setError(null);
  setPicked(null);
  setQuestion(null);
  const slowRequestTimer = setTimeout(() => setTakingLong(true), 10000);

  try {
    const data = await request();
    setQuestion(data);
  } catch (err) {
    setError(err.message || 'Something went wrong. Please try again.');
  } finally {
    clearTimeout(slowRequestTimer);
    setTakingLong(false);
    setLoading(false);
  }
}

  function askTopic(event) {
    event.preventDefault();
    if (!topic.trim()) return;
    loadQuestion(() => postJSON('/api/question', { topic }));
  }

  function askPhoto(fileData) {
    loadQuestion(() =>
      postJSON('/api/photo', { image: fileData.base64, mimeType: fileData.mimeType }),
    );
  }

  function pick(option) {
    setPicked(option);
    const nextScore = option === question.answer ? score + 1 : 0;
    setScore(nextScore);
    setBestScore((best) => Math.max(best, nextScore));
  }

  return (
    <main className="app">
      <header>
        <h1>AI Trivia</h1>
        <div className="scores">
          <span className="score">Score: {score}</span>
          <span className="score">Best score: {bestScore}</span>
        </div>
      </header>

      <form onSubmit={askTopic} className="topic-form">
        <input
          value={topic}
          onChange={(event) => setTopic(event.target.value)}
          placeholder="Pick a topic — space, football, the 90s…"
        />
        <button disabled={loading}>{loading ? 'Thinking…' : 'New question'}</button>
      </form>

      <PhotoRound onSubmit={askPhoto} loading={loading} />

      {loading && takingLong && (
        <p className="loading-status">
          This is taking longer than usual. The AI service may be busy, please keep waiting.
        </p>
      )}
      {error && <p className="error">{error}</p>}
      {question && (
        <QuestionCard
          data={question}
          picked={picked}
          onPick={pick}
        />
      )}
    </main>
  );
}
