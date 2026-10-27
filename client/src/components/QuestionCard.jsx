import { useState } from "react";
import { postJSON } from "../api.js";

// Shows one question, its four options, and the result once an option is picked.
export default function QuestionCard({ data, picked, onPick }) {
  const { question, options, answer, funFact } = data;
  const [hint, setHint] = useState(null);
  const [hintLoading, setHintLoading] = useState(false);
  const [hintError, setHintError] = useState(null);

  async function getHint() {
    setHintLoading(true);
    setHintError(null);

    try {
      const result = await postJSON("/api/hint", { question });
      setHint(result.hint);
    } catch (error) {
      setHintError(error.message || "Unable to get a hint. Please try again.");
    } finally {
      setHintLoading(false);
    }
  }

  return (
    <div className="card">
      <h2 className="question">{question}</h2>

      <button
        className="hint-button"
        disabled={Boolean(picked) || hintLoading || Boolean(hint)}
        onClick={getHint}
      >
        {hintLoading ? "Getting hint…" : hint ? "Hint shown" : "Hint"}
      </button>

      <div className="options">
        {options.map((option) => {
          let className = "option";
          if (picked) {
            if (option === answer) className += " correct";
            else if (option === picked) className += " wrong";
          }

          return (
            <button
              key={option}
              className={className}
              disabled={Boolean(picked)}
              onClick={() => onPick(option)}
            >
              {option}
            </button>
          );
        })}
      </div>

      {picked && (
        <p className="result">
          {picked === answer ? "Correct!" : `Nope — the answer was ${answer}.`}
        </p>
      )}

      {picked && funFact && (
        <div className="fun-fact">
          <strong>Did you know?</strong>
          <div>{funFact}</div>
        </div>
      )}

      {hintError && <p className="error">{hintError}</p>}
      {hint && (
        <div className="fun-fact">
          <strong>Hint:</strong>
          <div>{hint}</div>
        </div>
      )}
    </div>
  );
}
