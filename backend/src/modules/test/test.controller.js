const Test = require("./test.model");

exports.createTest = async (req, res) => {
  try {
    const {
      examId,
      title,
      duration,
      sections,
      questions,
      marking,
      isFree,
      price,
    } = req.body;

    let finalQuestions = [];

    // ✅ CASE 1: Section-based test
    if (Array.isArray(sections) && sections.length > 0) {
      finalQuestions = sections.flatMap(section =>
        section.questions
      );
    }

    // ✅ CASE 2: Old-style test
    else if (Array.isArray(questions)) {
      finalQuestions = questions;
    }

    const test = await Test.create({
      examId,
      title,
      duration,
      sections: sections || [],
      questions: finalQuestions,
      marking,
      isFree,
      price,
    });

    res.status(201).json(test);
  } catch (err) {
    console.error("CREATE TEST ERROR:", err);
    res.status(400).json({ message: err.message });
  }
};

exports.getTestsByExam = async (req, res) => {
  const { examId } = req.params;
  const tests = await Test.find({ examId });
  res.json(tests);
};
