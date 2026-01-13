import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import { useNavigate } from "react-router-dom";

import {
  startTest,
  saveAnswer,
  submitTest,
} from "../../api/attempt.api";

export default function TestAttempt() {
  const { testId } = useParams();
  const navigate = useNavigate();
  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);
  const [attemptId, setAttemptId] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [current, setCurrent] = useState(0);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const autoSubmittedRef = useRef(false);

  useEffect(() => {
    initTest();
  }, []);
  
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, []);
  
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

  const initTest = async () => {
    try {
      const res = await startTest(testId);
      
      const expiresAt = new Date(res.data.expiresAt).getTime();
      const now = Date.now();
      
      const secondsLeft = Math.max(
        Math.floor((expiresAt - now) / 1000),
        0
      );

      setRemainingTime(secondsLeft);
      startTimer();
  
      setAttemptId(res.data.attemptId);
  
      // 🔐 CRITICAL DEFENSIVE CHECK
      if (Array.isArray(res.data.questions)) {
        setQuestions(res.data.questions);
      } else {
        alert(res.data.message || "Test cannot be started");
        return;
      }
    } catch (err) {
      console.error("START TEST ERROR:", err.response || err);
      alert(
        err?.response?.data?.message ||
        "Failed to start test"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = async (optionIndex) => {
    if (remainingTime === 0) return; // 🔥 THIS LINE
  
    const currentQuestion = questions[current];
    if (!currentQuestion) return;
  
    const alreadySelected =
      currentQuestion.selectedOption === optionIndex;
  
    setQuestions(prev =>
      prev.map((q, i) =>
        i === current
          ? {
              ...q,
              selectedOption: alreadySelected ? -1 : optionIndex,
            }
          : q
      )
    );
  
    try {
      await saveAnswer({
        attemptId,
        questionId: currentQuestion._id,
        selectedOption: alreadySelected ? -1 : optionIndex,
      });
    } catch (err) {
      // ❌ ignore – attempt probably expired
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const res = await submitTest(attemptId);
      alert(
        `Test submitted!\nScore: ${res.data.result.score}`
      );
      navigate(`/result/${testId}`);
    } catch (err) { 
        const msg = err?.response?.data?.message || "Test already submitted or expired";
        alert(msg);
        navigate(`/result/${testId}`);
    }
  };
  
  const handleAutoSubmit = async () => {
    if (autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    
    try {
      await submitTest(attemptId);
      alert("Time over! Test auto-submitted.");
    } catch (err) {
      //
    }
    alert("Test auto-submitted (time expired)");
    navigate(`/result/${testId}`);
  };

  if (loading) return <p>Starting test...</p>;

  const question = questions.length > 0 ? questions[current] : null;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test Attempt</h2>
      <div
        style={{
          background: "#fee2e2",
          color: "#991b1b",
          padding: "0.5rem",
          borderRadius: "6px",
          marginBottom: "1rem",
          fontWeight: "bold",
          textAlign: "center",
        }}
      >
        ⏱ Time Left: {Math.floor(remainingTime / 60)}:
        {(remainingTime % 60).toString().padStart(2, "0")}
      </div>

      {!question ? (
        <p>Loading question...</p>
      ) : (
        <>
          <h3>{question.question}</h3>
      
          <ul>
            {question.options.map((opt, idx) => (
              <li
                key={idx}
                onClick={() => remainingTime > 0 && handleSelect(idx)}
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

      <div style={{ marginTop: "1rem" }}>
        <button
          disabled={current === 0}
          onClick={() => setCurrent((c) => c - 1)}
        >
          Prev
        </button>

        <button
          disabled={current === questions.length - 1}
          onClick={() => setCurrent((c) => c + 1)}
          style={{ marginLeft: "0.5rem" }}
        >
          Next
        </button>
      </div>

      <button
        disabled={
          submitting || 
          remainingTime === 0 || 
          autoSubmittedRef.current
        }
        
        onClick={handleSubmit}
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