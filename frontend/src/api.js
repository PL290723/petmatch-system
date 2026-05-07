// Cliente HTTP para reemplazar el puente IPC de Electron
// Esta interfaz expone exactamente los mismos métodos que Electron preload.ts

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

async function fetchAPI(endpoint, options = {}) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
    },
    ...options,
  });
  
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.error || `Error HTTP: ${response.status}`);
  }
  
  return response.json();
}

window.api = {
  getDashboardStats: () => fetchAPI('/stats'),
  getAnimals: () => fetchAPI('/animals'),
  createAnimal: (data) => fetchAPI('/animals', { method: 'POST', body: JSON.stringify(data) }),
  updateAnimalVaccines: (data) => fetchAPI(`/animals/${data.id}/vaccines`, { method: 'PUT', body: JSON.stringify({ appliedVaccines: data.appliedVaccines }) }),
  
  getCandidates: () => fetchAPI('/candidates'),
  submitEvaluation: (data) => fetchAPI('/evaluations', { method: 'POST', body: JSON.stringify(data) }),
  runMatchmaking: (candidateId) => fetchAPI(`/matchmaking/${candidateId}`, { method: 'POST' }),
  getAdoptionHistory: () => fetchAPI('/adoptions/history'),
  
  getAbuseReports: () => fetchAPI('/abuse-reports'),
  resolveAbuseReport: (id) => fetchAPI(`/abuse-reports/${id}/resolve`, { method: 'PUT' }),
  
  getFollowUps: (candidateId) => fetchAPI(`/follow-ups/${candidateId}`),
  addFollowUp: (data) => fetchAPI('/follow-ups', { method: 'POST', body: JSON.stringify(data) }),
  
  // savePdf se maneja nativamente en el navegador ahora con doc.save(), 
  // pero dejamos un mock por si algún componente viejo lo llama sin fallback
  savePdf: async () => ({ success: false, error: 'Web environment handles this natively' })
};
