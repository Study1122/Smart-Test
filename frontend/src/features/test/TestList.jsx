import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useParams } from "react-router-dom";
import { getTestsByExam } from "../../api/test.api";
import { getAttemptStatus } from "../../api/attempt.api";

export default function TestList() {
  const navigate = useNavigate();
  const { examId } = useParams();
  const [tests, setTests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attemptStatus, setAttemptStatus] = useState({});
  
  
  useEffect(() => {
    fetchTests();
  }, [examId]);

  const fetchTests = async () => {
    try {
      setLoading(true);
      const res = await getTestsByExam(examId);
      const testsData = res.data;
      setTests(testsData);
  
      // 🔥 Fetch attempt status for each test
      const statusMap = {};
  
      await Promise.all(
        testsData.map(async (test) => {
          try {
            const statusRes = await getAttemptStatus(test._id);
            statusMap[test._id] = statusRes.data.status;
          } catch {
            statusMap[test._id] = "not_started";
          }
        })
      );
  
      setAttemptStatus(statusMap);
    } catch (err) {
      setError("Failed to load tests");
    } finally {
      setLoading(false);
    }
  };
  
  const handleTestClick = async (testId) => {
    const res = await getAttemptStatus(testId);
  
    if (res.data.status === "submitted") {
      navigate(`/result/${testId}`);   // ✅ FIX
      return;
    }
  
    if (res.data.status === "ongoing") {
      navigate(`/attempt/${testId}`);
      return;
    }
  
    // not_started
    navigate(`/attempt/${testId}`);
  };

  if (loading) return <p>Loading tests...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Available Tests</h2>

      {tests.length === 0 ? (
        <p>No tests available for this exam</p>
      ) : (
        <ul>
          {tests.map((test) => (
            <li
              key={test._id}
              style={{
                border: "1px solid #e5e7eb",
                padding: "1rem",
                marginBottom: "0.75rem",
                borderRadius: "8px",
              }}
            >
              <h3>{test.title}</h3>
              <p>Duration: {test.duration} minutes</p>
              <p>
                {test.isFree ? (
                  <span style={{ color: "green" }}>Free</span>
                ) : (
                  <span style={{ color: "red" }}>
                    Paid ₹{test.price}
                  </span>
                )}
              </p>
              
              <button 
                onClick={() => handleTestClick(test._id)}>
                {attemptStatus[test._id] === "submitted" ? "📊 View Result"
                  : attemptStatus[test._id] === "ongoing"
                  ? "🔁 Resume Test"
                  : "▶️ Start Test"}
              </button>

              {/*attemptStatus[test._id] === "ongoing" ? (
                <button onClick={() => navigate(`/attempt/${test._id}`)}>
                  Resume Test
                </button>
              ) : attemptStatus[test._id] === "submitted" ? (
                <button onClick={() => navigate(`/result/${test._id}`)}>
                  View Result
                </button>
              ) : (
                <button
                  onClick={() => navigate(`/attempt/${test._id}`)}
                  disabled={!test.isFree}
                >
                   Start Test
                </button>
              )*/}
              
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}