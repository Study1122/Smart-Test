import api from "./axios";

export const getMyResult = (testId) =>
  api.get(`/result/${testId}/me`);

export const getLeaderboard = (testId) =>
  api.get(`/result/${testId}/leaderboard`);