import api from "./axios";

export const startTest = (testId) =>
  api.post("/attempt/start", { testId });

export const saveAnswer = (data) =>
  api.post("/attempt/save", data);

export const submitTest = (attemptId) =>
  api.post("/attempt/submit", { attemptId });
  
export const getAttemptStatus = (testId) =>
  api.get(`/attempt/status/${testId}`);