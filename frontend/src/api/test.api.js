import api from "./axios";

export const getTestsByExam = (examId) =>
  api.get(`/test/exam/${examId}`);