import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { getLeaderboard } from "../../api/result.api";

export default function Leaderboard() {
  const { testId } = useParams();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchLeaderboard();
  }, []);

  const fetchLeaderboard = async () => {
    try {
      const res = await getLeaderboard(testId);
      setData(res.data);
    } catch (err) {
      setError("Failed to load leaderboard");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading leaderboard...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>🏆 Leaderboard</h2>

      <table
        style={{
          width: "100%",
          borderCollapse: "collapse",
          marginTop: "1rem",
        }}
      >
        <thead>
          <tr>
            <th>Rank</th>
            <th>Name</th>
            <th>Score</th>
            <th>Accuracy</th>
            <th>Percentile</th>
          </tr>
        </thead>

        <tbody>
          {data.map((row) => (
            <tr
              key={row._id}
              style={{
                background:
                  row.rank === 1 ? "#dcfce7" : "transparent",
              }}
            >
              <td>{row.rank}</td>
              <td>{row.userId.name}</td>
              <td>{row.score}</td>
              <td>{row.accuracy}%</td>
              <td>{row.percentile}%</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}