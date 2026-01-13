import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { getMyResult } from "../../api/result.api";

export default function ResultPage() {
  const { testId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchResult();
  }, []);

  const fetchResult = async () => {
    try {
      const res = await getMyResult(testId);
      setResult(res.data);
    } catch (err) {
      setError("Failed to load result");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading result...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!result) return <p>No result found</p>;

  return (
    <div style={{ padding: "1rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Test Result</h2>

      <div
        style={{
          border: "1px solid #e5e7eb",
          borderRadius: "8px",
          padding: "1rem",
          marginTop: "1rem",
        }}
      >
        <p><strong>Score: </strong> {result.score}</p>
        <p><strong>✅Correct: </strong> {result.correct}</p>
        <p><strong>❌ Wrong: </strong> {result.wrong}</p>
        <p><strong>⏭️ Not Answered: </strong> {result.notAnswered}</p>
        <p><strong>🎯 Accuracy: </strong> {result.accuracy}%</p>
        <p><strong>Rank: </strong> {result.rank}</p>
        <p><strong>Percentile: </strong> {result.percentile}</p>
      </div>
      
      <button 
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
        }}
        onClick={() => navigate(`/analysis/${testId}`)}>
        📘 View Analysis
      </button>

      <button
        onClick={() => navigate(`/leaderboard/${testId}`)}
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
        }}
      >
        View Leaderboard
      </button>

      <button
        onClick={() => navigate("/exams")}
        style={{
          marginTop: "0.5rem",
          marginLeft: "0.5rem",
          padding: "0.5rem 1rem",
        }}
      >
        Back to Exams
      </button>
    </div>
  );
}