import { contextBridge, ipcRenderer } from 'electron';

contextBridge.exposeInMainWorld('api', {
  getDashboardStats: () => ipcRenderer.invoke('get-dashboard-stats'),
  getAnimals: () => ipcRenderer.invoke('get-animals'),
  submitEvaluation: (data: any) => ipcRenderer.invoke('submit-evaluation', data),
  createAnimal: (data: any) => ipcRenderer.invoke('create-animal', data),
  updateAnimalVaccines: (id: string, appliedVaccines: string[]) => ipcRenderer.invoke('update-animal-vaccines', { id, appliedVaccines }),
  getCandidates: () => ipcRenderer.invoke('get-candidates'),
  runMatchmaking: (candidateId: string) => ipcRenderer.invoke('run-matchmaking', candidateId),
  getAdoptionHistory: () => ipcRenderer.invoke('get-adoption-history'),
  getAbuseReports: () => ipcRenderer.invoke('get-abuse-reports'),
  resolveAbuseReport: (id: string) => ipcRenderer.invoke('resolve-abuse-report', id),
  getFollowUps: (candidateId: string) => ipcRenderer.invoke('get-follow-ups', candidateId),
  addFollowUp: (data: any) => ipcRenderer.invoke('add-follow-up', data),
  savePdf: (filename: string, base64Data: string) => ipcRenderer.invoke('save-pdf', filename, base64Data)
});
