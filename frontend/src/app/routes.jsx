import { Routes, Route } from "react-router-dom";

import Login from "../features/auth/Login";
import Register from "../features/auth/Register";
import ExamList from "../features/exam/ExamList";
import TestList from "../features/test/TestList";
import TestAttempt from "../features/test/TestAttempt";
import ResultPage from "../features/result/ResultPage";
import Leaderboard from "../features/result/Leaderboard";
import ResultAnalysis from "../features/result/ResultAnalysis";



export default function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/exams" element={<ExamList />} />
      <Route path="/tests/:examId" element={<TestList />} />
      <Route path="/attempt/:testId" element={<TestAttempt />} />
      <Route path="/result/:testId" element={<ResultPage />} />
      <Route path="/leaderboard/:testId" element={<Leaderboard />} />
      <Route path="/analysis/:testId" element={<ResultAnalysis />} />
    </Routes>
  );
}