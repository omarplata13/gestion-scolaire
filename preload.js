// Preload script for Electron (exposes safe APIs to renderer)
// You can add more APIs here if needed
const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  getAppVersion: () => ipcRenderer.invoke('get-app-version'),
  getStudents: () => ipcRenderer.invoke('get-students'),
  getTeachers: () => ipcRenderer.invoke('get-teachers'),
  getPayments: () => ipcRenderer.invoke('get-payments'),
  getExpenses: () => ipcRenderer.invoke('get-expenses'),
  getAttendance: () => ipcRenderer.invoke('get-attendance'),
  getUsers: () => ipcRenderer.invoke('get-users')
});
