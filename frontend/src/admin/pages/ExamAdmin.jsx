import { useEffect, useState } from "react";
import { getExams, createExam } from "../../api/exam.api";

export default function ExamAdmin() {
  const [exams, setExams] = useState([]);
  const [form, setForm] = useState({
    name: "",
    category: "",
    year: "",
  });
  const [loading, setLoading] = useState(false);

  const fetchExams = async () => {
    try {
      const res = await getExams();
      console.log("EXAMS API RESPONSE:", res);
  
      if (!res || !res.data) {
        throw new Error("Invalid exam response");
      }
  
      setExams(res.data);
    } catch (err) {
      console.error(err);
      alert("Failed to load exams");
    }
  };

  useEffect(() => {
    fetchExams();
  }, []);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.name || !form.category || !form.year) {
      alert("All fields required");
      return;
    }

    try {
      setLoading(true);
      await createExam({
        ...form,
        year: Number(form.year),
      });
      setForm({ name: "", category: "", year: "" });
      fetchExams();
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create exam");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Create Exam</h2>

      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
        <input
          name="name"
          placeholder="Exam Name (SSC CGL)"
          value={form.name}
          onChange={handleChange}
        />
        <br />

        <input
          name="category"
          placeholder="Category (SSC / Bank / UPSC)"
          value={form.category}
          onChange={handleChange}
        />
        <br />

        <input
          name="year"
          type="number"
          placeholder="Year"
          value={form.year}
          onChange={handleChange}
        />
        <br />

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Exam"}
        </button>
      </form>

      {/* LIST */}
      <h3>Existing Exams</h3>
      <ul>
        {exams.map((exam) => (
          <li key={exam._id}>
            {exam.name} — {exam.category} ({exam.year})
          </li>
        ))}
      </ul>
    </div>
  );
}