import { useEffect, useState } from "react";
import { getExams } from "../../api/exam.api";
import {
  createQuestion,
  getQuestionsByExam,
} from "../../api/question.api";

export default function QuestionAdmin() {
  const [exams, setExams] = useState([]);
  const [selectedExam, setSelectedExam] = useState("");
  const [questions, setQuestions] = useState([]);

  const [form, setForm] = useState({
    subject: "",
    question: "",
    options: ["", "", "", ""],
    correctAnswer: 0,
    difficulty: "easy",
    explanation: "",
  });

  /* ---------------- FETCH EXAMS ---------------- */

  useEffect(() => {
    fetchExams();
  }, []);

  const fetchExams = async () => {
    const res = await getExams();
    setExams(res.data);
  };

  /* ---------------- FETCH QUESTIONS ---------------- */

  const fetchQuestions = async (examId) => {
    const res = await getQuestionsByExam(examId);
    setQuestions(res.data);
  };

  /* ---------------- FORM HANDLERS ---------------- */

  const handleOptionChange = (index, value) => {
    const copy = [...form.options];
    copy[index] = value;
    setForm({ ...form, options: copy });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!selectedExam) {
      alert("Select exam first");
      return;
    }

    try {
      await createQuestion({
        examId: selectedExam,
        ...form,
        correctAnswer: Number(form.correctAnswer),
      });

      setForm({
        subject: "",
        question: "",
        options: ["", "", "", ""],
        correctAnswer: 0,
        difficulty: "easy",
        explanation: "",
      });

      fetchQuestions(selectedExam);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to add question");
    }
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin – Question Bank</h2>

      {/* SELECT EXAM */}
      <select
        value={selectedExam}
        onChange={(e) => {
          setSelectedExam(e.target.value);
          fetchQuestions(e.target.value);
        }}
      >
        <option value="">Select Exam</option>
        {exams.map((exam) => (
          <option key={exam._id} value={exam._id}>
            {exam.name}
          </option>
        ))}
      </select>

      {/* ADD QUESTION FORM */}
      {selectedExam && (
        <form onSubmit={handleSubmit} style={{ marginTop: "1rem" }}>
          <input
            placeholder="Subject"
            value={form.subject}
            onChange={(e) =>
              setForm({ ...form, subject: e.target.value })
            }
          />

          <textarea
            placeholder="Question"
            value={form.question}
            onChange={(e) =>
              setForm({ ...form, question: e.target.value })
            }
          />

          {form.options.map((opt, idx) => (
            <input
              key={idx}
              placeholder={`Option ${idx + 1}`}
              value={opt}
              onChange={(e) =>
                handleOptionChange(idx, e.target.value)
              }
            />
          ))}

          <select
            value={form.correctAnswer}
            onChange={(e) =>
              setForm({
                ...form,
                correctAnswer: e.target.value,
              })
            }
          >
            <option value={0}>Option 1</option>
            <option value={1}>Option 2</option>
            <option value={2}>Option 3</option>
            <option value={3}>Option 4</option>
          </select>

          <select
            value={form.difficulty}
            onChange={(e) =>
              setForm({
                ...form,
                difficulty: e.target.value,
              })
            }
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>

          <textarea
            placeholder="Explanation (optional)"
            value={form.explanation}
            onChange={(e) =>
              setForm({
                ...form,
                explanation: e.target.value,
              })
            }
          />

          <button type="submit">Add Question</button>
        </form>
      )}

      {/* QUESTION LIST */}
      <h3 style={{ marginTop: "1.5rem" }}>
        Questions ({questions.length})
      </h3>

      <ul>
        {questions.map((q) => (
          <li key={q._id}>
            <strong>{q.subject}</strong> — {q.question}
          </li>
        ))}
      </ul>
    </div>
  );
}