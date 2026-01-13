import { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  startTest,
  saveAnswer,
  submitTest,
} from "../../api/attempt.api";

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  const [visited, setVisited] = useState(new Set([0]));
  const [markedForReview, setMarkedForReview] = useState(new Set());

  /* ---------------- INIT TEST ---------------- */

  useEffect(() => {
    initTest();
  }, []);

  const initTest = async () => {
    try {
      const res = await startTest(testId);

      setAttemptId(res.data.attemptId);

      const expiresAt = new Date(res.data.expiresAt).getTime();
      const now = Date.now();
      const secondsLeft = Math.max(
        Math.floor((expiresAt - now) / 1000),
        0
      );

      setRemainingTime(secondsLeft);
      startTimer();

      if (!Array.isArray(res.data.questions)) {
        alert("Invalid test data");
        return;
      }

      // ✅ NORMALIZE selectedOption
      setQuestions(
        res.data.questions.map(q => ({
          ...q,
          selectedOption:
            typeof q.selectedOption === "number"
              ? q.selectedOption
              : -1,
        }))
      );
    } catch (err) {
      const msg = err?.response?.data?.message;

      if (msg === "You have already attempted this test") {
        navigate(`/result/${testId}`); // ✅ redirect correctly
        return;
      }
      
      alert(msg || "Failed to start test"
      );
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- TIMER ---------------- */

  const startTimer = () => {
    if (timerRef.current) return;

    timerRef.current = setInterval(() => {
      setRemainingTime(prev => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleAutoSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);

  /* ---------------- VISITED TRACKING ---------------- */

  useEffect(() => {
    setVisited(prev => {
      const copy = new Set(prev);
      copy.add(current);
      return copy;
    });
  }, [current]);

  /* ---------------- ANSWER SELECT ---------------- */

  const handleSelect = async (optionIndex) => {
    if (remainingTime === 0) return;

    const q = questions[current];
    if (!q) return;

    const alreadySelected =
      q.selectedOption === optionIndex;

    setQuestions(prev =>
      prev.map((item, idx) =>
        idx === current
          ? {
              ...item,
              selectedOption: alreadySelected
                ? -1
                : optionIndex,
            }
          : item
      )
    );

    try {
      await saveAnswer({
        attemptId,
        questionId: q._id,
        selectedOption: alreadySelected
          ? -1
          : optionIndex,
      });
    } catch {}
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTest(attemptId);
      navigate(`/result/${testId}`);
    } catch {
      navigate(`/result/${testId}`);
    }
  };

  const handleAutoSubmit = async () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;

    try {
      await submitTest(attemptId);
    } catch {}
    navigate(`/result/${testId}`);
  };

  /* ---------------- RENDER ---------------- */

  if (loading) return <p>Starting test...</p>;

  const question = questions[current];

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test Attempt</h2>

      <div
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "0.5rem",
          borderRadius: "6px",
          textAlign: "center",
          marginBottom: "1rem",
          fontWeight: "bold",
        }}
      >
        ⏱ Time Left: {Math.floor(remainingTime / 60)}:
        {(remainingTime % 60)
          .toString()
          .padStart(2, "0")}
      </div>

      <div
        style={{
          display: "flex",
          gap: "1rem",
          alignItems: "flex-start",
        }}
      >
        {/* LEFT: QUESTION */}
        <div
          style={{
            flex: 1,
            border: "1px solid #e5e7eb",
            padding: "1rem",
            borderRadius: "8px",
          }}
        >
          {question && (
            <>
              <h3>{question.question}</h3>
              <ul>
                {question.options.map((opt, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    style={{
                      border: "1px solid #e5e7eb",
                      padding: "0.5rem",
                      marginBottom: "0.5rem",
                      cursor: "pointer",
                      background:
                        question.selectedOption === idx
                          ? "#dbeafe"
                          : "white",
                    }}
                  >
                    {opt}
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>

        {/* RIGHT: PALETTE */}
        <div
          style={{
            width: "220px",
            border: "1px solid #e5e7eb",
            padding: "0.75rem",
            borderRadius: "8px",
          }}
        >
          <h4>Questions</h4>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4, 1fr)",
              gap: "0.5rem",
            }}
          >
            {questions.map((q, idx) => {
              const isAnswered =
                q.selectedOption !== -1;
              const isVisited = visited.has(idx);
              const isReview =
                markedForReview.has(idx);
              const isCurrent = idx === current;

              let bg = "#f3f4f6";
              if (isVisited && !isAnswered)
                bg = "#fecaca";
              if (isAnswered) bg = "#bbf7d0";
              if (isReview) bg = "#e9d5ff";
              if (isCurrent) bg = "#bfdbfe";

              return (
                <div
                  key={`${q._id}-${idx}`}   // ✅ FIX
                  onClick={() => setCurrent(idx)}
                  style={{
                    padding: "0.5rem",
                    textAlign: "center",
                    borderRadius: "6px",
                    cursor: "pointer",
                    background: bg,
                    fontWeight: 500,
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* NAVIGATION */}
      <div style={{ marginTop: "1rem" }}>
        <button
          disabled={current === 0}
          onClick={() => setCurrent(c => c - 1)}
        >
          Prev
        </button>

        <button
          disabled={current === questions.length - 1}
          onClick={() => setCurrent(c => c + 1)}
          style={{ marginLeft: "0.5rem" }}
        >
          Next
        </button>

        <button
          onClick={() =>
            setMarkedForReview(prev => {
              const copy = new Set(prev);
              copy.has(current)
                ? copy.delete(current)
                : copy.add(current);
              return copy;
            })
          }
          style={{
            marginLeft: "0.75rem",
            background: markedForReview.has(current)
              ? "#a855f7"
              : "#e5e7eb",
            color: markedForReview.has(current)
              ? "white"
              : "black",
            border: "none",
            padding: "0.4rem 0.6rem",
            borderRadius: "6px",
          }}
        >
          {markedForReview.has(current)
            ? "Unmark Review"
            : "Mark for Review"}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || remainingTime === 0}
        style={{
          marginTop: "1rem",
          background: "#16a34a",
          color: "white",
          padding: "0.5rem 1rem",
        }}
      >
        Submit Test
      </button>
    </div>
  );
}