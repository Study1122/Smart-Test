import api from "./axios";

export const getExams = () => {
  return api.get("/exam"); // ✅ RETURN
};

export const createExam = (data) => {
  return api.post("/exam", data);
};