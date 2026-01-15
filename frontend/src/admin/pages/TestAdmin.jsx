import { useEffect, useState } from "react";
import { getExams } from "../../api/exam.api";
import { getQuestionsByExam } from "../../api/question.api";
import { createTest } from "../../api/test.api";

export default function TestAdmin() {
  const [exams, setExams] = useState([]);
  const [questions, setQuestions] = useState([]);

  const [selectedExam, setSelectedExam] = useState("");

  const [testForm, setTestForm] = useState({
    title: "",
    duration: 60,
    marking: { correct: 1, negative: 0.25 },
  });

  const [sections, setSections] = useState([]);

  useEffect(() => {
    fetchExams();
  }, []);
  
  //2️⃣ LOAD QUESTIONS WHEN EXAM IS SELECTED
  
  const fetchExams = async () => {
    const res = await getExams();
    setExams(res.data);
  };
  
  const handleExamChange = async (examId) => {
    setSelectedExam(examId);

    const res = await getQuestionsByExam(examId);
    setQuestions(res.data);

    setSections([]); // reset sections
  };
  
  
  //3️⃣ ADD / REMOVE SECTIONS
  
  const addSection = () => {
    setSections([
      ...sections,
      { name: "", questionIds: [] },
    ]);
  };

  const updateSectionName = (index, name) => {
    const copy = [...sections];
    copy[index].name = name;
    setSections(copy);
  };
   
  //4️⃣ SELECT QUESTIONS PER SECTION
  
  const toggleQuestion = (sectionIndex, questionId) => {
    const copy = [...sections];
    const list = copy[sectionIndex].questionIds;

    if (list.includes(questionId)) {
      copy[sectionIndex].questionIds =
        list.filter(id => id !== questionId);
    } else {
      copy[sectionIndex].questionIds.push(questionId);
    }

    setSections(copy);
  };
  
  //5️⃣ CREATE TEST (IMPORTANT) 
  const handleCreateTest = async () => {
    if (!selectedExam || !testForm.title) {
      alert("Fill all required fields");
      return;
    }

    if (sections.length === 0) {
      alert("Add at least one section");
      return;
    }
    
    //Prevent same question in multiple sections
    const allSelected = sections.flatMap(s => s.questionIds);
    const unique = new Set(allSelected);
    
    if (allSelected.length !== unique.size) {
      alert("A question cannot be in multiple sections");
      return;
    }
    
    //Validate sections before submit
    for (const section of sections) {
      if (!section.name.trim()) {
        alert("Each section must have a name");
        return;
      }
    
      if (section.questionIds.length === 0) {
        alert(`Section "${section.name}" has no questions`);
        return;
      }
    }

    try {
      await createTest({
        examId: selectedExam,
        ...testForm,
        sections: sections.map(s => ({
          name: s.name,
          questions: [...new Set(s.questionIds)]
        })),
      });

      alert("Test created successfully");

      setTestForm({
        title: "",
        duration: 60,
        marking: { correct: 1, negative: 0.25 },
      });
      setSections([]);
    } catch (err) {
      alert(err.response?.data?.message || "Failed to create test");
    }
  };
  
  const removeSection = (index) => {
    setSections(prev =>
      prev.filter((_, i) => i !== index)
    );
  };
  
  //6️⃣ JSX UI (MINIMAL BUT WORKING)
  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin – Create Test</h2>

      <select
        value={selectedExam}
        onChange={(e) => handleExamChange(e.target.value)}
      >
        <option value="">Select Exam</option>
        {exams.map(exam => (
          <option key={exam._id} value={exam._id}>
            {exam.name}
          </option>
        ))}
      </select>

      {selectedExam && (
        <>
          <input
            placeholder="Test Title"
            value={testForm.title}
            onChange={(e) =>
              setTestForm({ ...testForm, title: e.target.value })
            }
          />

          <input
            type="number"
            placeholder="Duration (minutes)"
            value={testForm.duration}
            onChange={(e) =>
              setTestForm({ ...testForm, duration: e.target.value })
            }
          />

          <hr />

          <h3>Sections</h3>

          {sections.map((section, sIdx) => (
            <div key={sIdx} style={{ border: "1px solid #ddd", padding: "0.5rem", marginBottom: "1rem" }}>
              <input
                placeholder="Section Name"
                value={section.name}
                onChange={(e) =>
                  updateSectionName(sIdx, e.target.value)
                }
              />
              
              <button
                type="button"
                onClick={() => removeSection(sIdx)}
                style={{
                  marginLeft: "0.5rem",
                  background: "#ef4444",
                  color: "white",
                  border: "none",
                  padding: "0.3rem 0.6rem",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                ✕ Remove
              </button>

              <ul>
                {questions.map(q => (
                  <li key={q._id}>
                    <label>
                      <input
                        type="checkbox"
                        checked={section.questionIds.includes(q._id)}
                        onChange={() =>
                          toggleQuestion(sIdx, q._id)
                        }
                      />
                      {q.question}
                    </label>
                  </li>
                ))}
              </ul>
            </div>
          ))}

          <button onClick={addSection}>+ Add Section</button>

          <br /><br />

          <button onClick={handleCreateTest}>
            Create Test
          </button>
        </>
      )}
    </div>
  );
}