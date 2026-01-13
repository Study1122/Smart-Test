import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../api/axios";

export default function ResultAnalysis() {
  const { testId } = useParams();
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openExplanations, setOpenExplanations] = useState({});

  useEffect(() => {
    fetchAnalysis();
  }, []);
  
  const toggleExplanation = (id) => {
    setOpenExplanations(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const fetchAnalysis = async () => {
    const res = await api.get(`/result/analysis/${testId}`);
    setQuestions(res.data.analysis);
    setLoading(false);
  };

  if (loading) return <p>Loading analysis...</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>📘 Result Analysis</h2>

      {questions.map((q, idx) => (
        <div
          key={q._id}
          style={{
            border: "1px solid #e5e7eb",
            padding: "1rem",
            marginBottom: "1rem",
            borderRadius: "8px",
          }}
        >
          <h4>
            Q{idx + 1}. {q.question}
          </h4>

          <ul>
            {q.options.map((opt, i) => {
              const isCorrect = i === q.correctAnswer;
              const isSelected = i === q.selectedOption;

              return (
                <li
                  key={i}
                  style={{
                    padding: "0.4rem",
                    marginBottom: "0.25rem",
                    background: isCorrect
                      ? "#dcfce7"
                      : isSelected
                      ? "#fee2e2"
                      : "transparent",
                  }}
                >
                  {opt}
                  {isCorrect && " ✅"}
                  {isSelected && !isCorrect && " ❌"}
                </li>
              );
            })}
          </ul>

          {q.explanation && (
            <div style={{ marginTop: "0.75rem" }}>
              <button
                onClick={() => toggleExplanation(q._id)}
                style={{
                  background: "#e5e7eb",
                  border: "none",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "6px",
                  cursor: "pointer",
                  fontSize: "0.85rem",
                }}
              >
                {openExplanations[q._id]
                  ? "Hide Explanation"
                  : "Show Explanation"}
              </button>
          
              {openExplanations[q._id] && (
                <p
                  style={{
                    marginTop: "0.5rem",
                    background: "#f8fafc",
                    padding: "0.5rem",
                    borderRadius: "6px",
                    borderLeft: "4px solid #3b82f6",
                  }}
                >
                  <b>Explanation:</b> {q.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}