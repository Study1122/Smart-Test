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
  const [sections, setSections] = useState([]);
  const [activeSection, setActiveSection] = useState("");
  const [current, setCurrent] = useState(0);

  const [remainingTime, setRemainingTime] = useState(0);
  const timerRef = useRef(null);
  const autoSubmittedRef = useRef(false);

  const [visited, setVisited] = useState(new Set());
  const [markedForReview, setMarkedForReview] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

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
      setRemainingTime(Math.max(Math.floor((expiresAt - now) / 1000), 0));

      startTimer();

      const qs = res.data.questions.map(q => ({
        ...q,
        selectedOption:
          typeof q.selectedOption === "number" ? q.selectedOption : -1,
        section: q.section || "General",
      }));

      setQuestions(qs);

      const uniqueSections = [...new Set(qs.map(q => q.section))];
      setSections(uniqueSections);
      setActiveSection(uniqueSections[0]);

    } catch (err) {
      const msg = err?.response?.data?.message;
      if (msg === "You have already attempted this test") {
        navigate(`/result/${testId}`);
      } else {
        alert(msg || "Failed to start test");
      }
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
    return () => timerRef.current && clearInterval(timerRef.current);
  }, []);

  /* ---------------- SECTION LOGIC ---------------- */

  const sectionQuestions = questions.filter(
    q => q.section === activeSection
  );

  const question = sectionQuestions[current];

  useEffect(() => {
    if (!question) return;
    setVisited(prev => {
      const copy = new Set(prev);
      copy.add(question._id);
      return copy;
    });
  }, [current, activeSection]);

  /* ---------------- ANSWER SELECT ---------------- */

  const handleSelect = async (optionIndex) => {
    if (!question || remainingTime === 0) return;

    const alreadySelected = question.selectedOption === optionIndex;

    setQuestions(prev =>
      prev.map(q =>
        q._id === question._id
          ? { ...q, selectedOption: alreadySelected ? -1 : optionIndex }
          : q
      )
    );

    try {
      await saveAnswer({
        attemptId,
        questionId: question._id,
        selectedOption: alreadySelected ? -1 : optionIndex,
      });
    } catch {}
  };

  /* ---------------- SUBMIT ---------------- */

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      await submitTest(attemptId);
    } finally {
      navigate(`/result/${testId}`);
    }
  };

  const handleAutoSubmit = async () => {
    if (submitLockRef.current) return;
    submitLockRef.current = true;
  
    try {
      const res = await submitTest(attemptId);
  
      // ✅ ALWAYS navigate after auto submit
      navigate(`/result/${testId}`);
    } catch (err) {
      const msg = err?.response?.data?.message;
  
      // 🔥 CRITICAL FIX
      if (msg === "Test already submitted") {
        navigate(`/result/${testId}`);
        return;
      }
  
      // Even if backend fails, try result page
      navigate(`/result/${testId}`);
    }
  };

  /* ---------------- RENDER ---------------- */

  if (loading) return <p>Starting test...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Test Attempt</h2>

      {/* SECTION TABS */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
        {sections.map(sec => (
          <button
            key={sec}
            onClick={() => {
              setActiveSection(sec);
              setCurrent(0);
            }}
            style={{
              padding: "0.4rem 0.75rem",
              borderRadius: "6px",
              background: sec === activeSection ? "#2563eb" : "#e5e7eb",
              color: sec === activeSection ? "white" : "black",
              border: "none",
            }}
          >
            {sec}
          </button>
        ))}
      </div>

      {/* TIMER */}
      <div style={{
        background: "#fee2e2",
        padding: "0.5rem",
        textAlign: "center",
        marginBottom: "1rem",
        fontWeight: "bold",
      }}>
        ⏱ {Math.floor(remainingTime / 60)}:
        {(remainingTime % 60).toString().padStart(2, "0")}
      </div>

      <div style={{ display: "flex", gap: "1rem" }}>
        {/* QUESTION */}
        <div style={{ flex: 1, border: "1px solid #ddd", padding: "1rem" }}>
          {question && (
            <>
              <h3>{question.question}</h3>
              <ul>
                {question.options.map((opt, idx) => (
                  <li
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    style={{
                      padding: "0.5rem",
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

        {/* PALETTE */}
        <div style={{ width: "220px", border: "1px solid #ddd", padding: "0.75rem" }}>
          <h4>Questions</h4>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: "0.5rem" }}>
            {sectionQuestions.map((q, idx) => {
              let bg = "#f3f4f6";
              if (visited.has(q._id) && q.selectedOption === -1) bg = "#fecaca";
              if (q.selectedOption !== -1) bg = "#bbf7d0";
              if (markedForReview.has(q._id)) bg = "#e9d5ff";
              if (idx === current) bg = "#bfdbfe";

              return (
                <div
                  key={q._id}
                  onClick={() => setCurrent(idx)}
                  style={{
                    padding: "0.5rem",
                    textAlign: "center",
                    background: bg,
                    cursor: "pointer",
                    borderRadius: "6px",
                  }}
                >
                  {idx + 1}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* CONTROLS */}
      <div style={{ marginTop: "1rem" }}>
        <button disabled={current === 0} onClick={() => setCurrent(c => c - 1)}>
          Prev
        </button>

        <button
          disabled={current === sectionQuestions.length - 1}
          onClick={() => setCurrent(c => c + 1)}
          style={{ marginLeft: "0.5rem" }}
        >
          Next
        </button>

        <button
          onClick={() =>
            setMarkedForReview(prev => {
              const copy = new Set(prev);
              copy.has(question._id)
                ? copy.delete(question._id)
                : copy.add(question._id);
              return copy;
            })
          }
          style={{
            marginLeft: "0.75rem",
            background: markedForReview.has(question._id)
              ? "#7c3aed"   // 🟣 purple when marked
              : "#e5e7eb",  // ⚪ normal
            color: markedForReview.has(question._id)
              ? "white"
              : "black",
            border: "none",
            padding: "0.4rem 0.75rem",
            borderRadius: "6px",
            cursor: "pointer",
            fontWeight: 500,
          }}
        >
          {markedForReview.has(question._id)
            ? "Unmark Review"
            : "Mark for Review"}
        </button>
      </div>

      <button
        onClick={handleSubmit}
        disabled={submitting || remainingTime === 0}
        style={{ marginTop: "1rem" }}
      >
        Submit Test
      </button>
    </div>
  );
}