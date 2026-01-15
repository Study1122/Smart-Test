import api from "./axios";

/**
 * USER / ADMIN
 * Get tests for an exam
 */
export const getTestsByExam = (examId) => {
  return api.get(`/test/exam/${examId}`);
};

/**
 * ADMIN
 * Create test (supports sections)
 */
export const createTest = (data) => {
  return api.post("/test", data);
};