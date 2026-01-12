const Test = require("./test.model");

exports.createTest = async (req, res) => {
  try {
    const test = await Test.create(req.body);
    res.status(201).json(test);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

exports.getTestsByExam = async (req, res) => {
  const { examId } = req.params;
  const tests = await Test.find({ examId });
  res.json(tests);
};