
import axios from 'axios';

const API = axios.create({
  baseURL: 'https://vote-pole.onrender.com/api/v1',
});

// Attach token
API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});



// ── Auth ──────────────────────────────────────────────────────
export const registerAPI       = (data)   => API.post('/auth/register', data);
export const loginAPI          = (data)   => API.post('/auth/login', data);
export const forgotPasswordAPI = (mobile) => API.post('/auth/forgot-password', { mobile });
export const resetPasswordAPI  = (data)   => API.post('/auth/reset-password', data);
export const getMeAPI          = ()       => API.get('/auth/me');
export const changePasswordAPI = (data)   => API.put('/auth/change-password', data);

// ── Elections ─────────────────────────────────────────────────
export const getElectionsAPI      = ()        => API.get('/elections');
export const getElectionAPI       = (id)      => API.get(`/elections/${id}`);
export const createElectionAPI    = (data)    => API.post('/elections', data);
export const updateElectionAPI    = (id, data)=> API.put(`/elections/${id}`, data);
export const deleteElectionAPI    = (id)      => API.delete(`/elections/${id}`);
export const toggleElectionAPI    = (id)      => API.patch(`/elections/${id}/toggle`);
export const getElectionStatsAPI  = (id)      => API.get(`/elections/${id}/stats`);

// ── Candidates ────────────────────────────────────────────────
//export const getCandidatesAPI   = (electionId) => API.get(`/candidates/${electionId}`);
// after solve error in candidate api
export const getCandidatesAPI = (electionId) => 
  API.get(`/candidates?electionId=${electionId}`);
export const addCandidateAPI    = (formData)   =>
  API.post('/candidates', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const updateCandidateAPI = (id, fd)     =>
  API.put(`/candidates/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
export const deleteCandidateAPI = (id)         => API.delete(`/candidates/${id}`);

// ── Votes ─────────────────────────────────────────────────────

API.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

//  FIXED (NO ROLE SENT)
export const castVoteAPI = (data) =>
  API.post('/votes', data);

// keep this
export const checkVotedAPI = (electionId, role) =>
  API.get(`/votes/check?electionId=${electionId}&role=${encodeURIComponent(role)}`);

export const getResultsAPI = (electionId) =>
  API.get(`/votes/results/${electionId}`);

export const getMyVotesAPI = (electionId) =>
  API.get(`/votes/my/${electionId}`);

export default API;
