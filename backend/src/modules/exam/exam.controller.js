const Exam = require("./exam.model");

exports.createExam = async (req, res) => {
  try {
    const exam = await Exam.create(req.body);
    res.status(201).json(exam);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getAllExams = async (req, res) => {
  const exams = await Exam.find();
  res.json(exams);
};