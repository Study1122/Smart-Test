import { useEffect, useState } from "react";
import { getExams } from "../../api/exam.api";
import { useNavigate } from "react-router-dom";

export default function ExamList() {
  const [exams, setExams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    try {
      setLoading(true);
      const res = await getExams();
      setExams(res.data);
    } catch (err) {
      setError("Failed to load exams");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <p>Loading exams...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Available Exams</h2>

      {exams.length === 0 ? (
        <p>No exams available</p>
      ) : (
        <ul>
          {exams.map((exam) => (
            <li
              key={exam._id}
              onClick={() => navigate(`/tests/${exam._id}`)}
              style={{
                border: "1px solid #e5e7eb",
                padding: "1rem",
                marginBottom: "0.75rem",
                borderRadius: "8px",
                cursor: "pointer",
              }}
            >
              <h3>{exam.name}</h3>
              <p>Category: {exam.category}</p>
              <p>Year: {exam.year}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}