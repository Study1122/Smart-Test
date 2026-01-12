import api from "./axios";

export const getExams = () => api.get("/exam");