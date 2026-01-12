const Question = require("./question.model");

exports.createQuestion = async (req, res) => {
  try {
    const question = await Question.create(req.body);
    res.status(201).json(question);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getQuestionsByExam = async (req, res) => {
  const { examId } = req.params;
  const questions = await Question.find({ examId });
  res.json(questions);
};