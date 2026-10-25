import { useState } from 'react';
import { postJSON } from './api.js';
import QuestionCard from './components/QuestionCard.jsx';
import PhotoRound from './components/PhotoRound.jsx';

export default function App() {
  const [topic, setTopic] = useState('');
  const [question, setQuestion] = useState(null);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Shared loader: clears the old question, runs the request, shows errors.
async function loadQuestion(request) {
  if (loading) return;

  setLoading(true);
  setError(null);
  setPicked(null);
  setQuestion(null);

  try {
    const data = await request();
    setQuestion(data);
  } catch (err) {
    const message = err.message || '';

    if (
      message.includes('429') ||
      message.includes('too_many_requests') ||
      message.toLowerCase().includes('rate limit')
    ) {
      setError(
        'AI is receiving too many requests. Please try again in about 30 seconds.'
      );
    } else {
      setError(message || 'Something went wrong. Please try again.');
    }
  } finally {
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
    if (option === question.answer) setScore((s) => s + 1);
  }

  return (
    <main className="app">
      <header>
        <h1>AI Trivia</h1>
        <span className="score">Score: {score}</span>
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

      {error && <p className="error">{error}</p>}
      {question && <QuestionCard data={question} picked={picked} onPick={pick} />}
    </main>
  );
}
