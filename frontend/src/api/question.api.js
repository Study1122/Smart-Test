import axios from "./axios";

export const getQuestionsByExam = (examId) => {
  return axios.get(`/question/exam/${examId}`);
};

export const createQuestion = (data) => {
  return axios.post("/question", data);
};