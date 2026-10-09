import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Attach JWT token to requests if present in localStorage
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('mystery_web_token') || localStorage.getItem('mystery_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => {
  return Promise.reject(error);
});

export const authAPI = {
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    return res.data;
  },
  register: async (name, email, password) => {
    const res = await api.post('/auth/register', { name, email, password });
    return res.data;
  },
  getMe: async () => {
    const res = await api.get('/auth/me');
    return res.data;
  }
};

export const caseAPI = {
  getAllCases: async () => {
    const res = await api.get('/cases');
    return res.data;
  },
  getCaseDetails: async (caseId) => {
    const res = await api.get(`/cases/${caseId}`);
    return res.data;
  },
  saveProgress: async (caseId, progressData) => {
    const res = await api.put(`/cases/${caseId}/progress`, progressData);
    return res.data;
  }
};

export const interrogationAPI = {
  getQuestions: async (suspectId) => {
    const res = await api.get(`/interrogate/suspect/${suspectId}`);
    return res.data;
  },
  askQuestion: async (questionId, caseId) => {
    const res = await api.post('/interrogate/ask', { questionId, caseId });
    return res.data;
  }
};

export const evidenceAPI = {
  discoverHidden: async (caseId, evidenceCode) => {
    const res = await api.post('/evidence/discover-hidden', { caseId, evidenceCode });
    return res.data;
  },
  inspectLocation: async (caseId, locationId, isSecondInspection) => {
    const res = await api.post('/evidence/inspect-location', { caseId, locationId, isSecondInspection });
    return res.data;
  }
};

export const contradictionAPI = {
  getContradictions: async (caseId) => {
    const res = await api.get(`/contradictions/case/${caseId}`);
    return res.data;
  },
  checkContradiction: async (caseId, itemAId, itemBId, itemAType, itemBType) => {
    const res = await api.post('/contradictions/check', { caseId, itemAId, itemBId, itemAType, itemBType });
    return res.data;
  }
};

export const notebookAPI = {
  getNotes: async (caseId) => {
    const res = await api.get(`/notebook/case/${caseId}`);
    return res.data;
  },
  addNote: async (caseId, title, content, tag) => {
    const res = await api.post('/notebook', { caseId, title, content, tag });
    return res.data;
  },
  deleteNote: async (noteId) => {
    const res = await api.delete(`/notebook/${noteId}`);
    return res.data;
  }
};

export const accusationAPI = {
  submitAccusation: async (caseId, accusedSuspectId, deductionText, selectedEvidenceCodes, conclusionType = 'criminal', conclusionKey = null) => {
    const res = await api.post('/accuse', {
      caseId,
      accusedSuspectId,
      deductionText,
      selectedEvidenceCodes,
      conclusionType,
      conclusionKey
    });
    return res.data;
  },
  getHistory: async (caseId) => {
    const res = await api.get(`/accuse/history/${caseId}`);
    return res.data;
  }
};

export const assistantAPI = {
  askAssistant: async (caseId, prompt, currentProgress) => {
    const res = await api.post('/assistant/hint', { caseId, prompt, currentProgress });
    return res.data;
  }
};

export const adminAPI = {
  getOverview: async () => {
    const res = await api.get('/admin/overview');
    return res.data;
  },
  createCase: async (caseData) => {
    const res = await api.post('/admin/cases', caseData);
    return res.data;
  },
  addEvidence: async (evidenceData) => {
    const res = await api.post('/admin/evidence', evidenceData);
    return res.data;
  }
};

export default api;
