// src/services/kyc.js
import api from './api.js';

// Accept optional axios config (e.g., timeout, onUploadProgress)
export async function createKycService(
  { imageFile, panPdfFile, aadhaarPdfFile, bank },
  config = {}
) {
  const fd = new FormData();
  fd.append('profilePhoto', imageFile);
  fd.append('panCard', panPdfFile);
  fd.append('aadharCard', aadhaarPdfFile);
  fd.append('bankDetails', JSON.stringify(bank));

  // Ensure cookies are sent (api is usually already set with withCredentials)
  const res = await api.post('/kyc', fd, {
    withCredentials: true,
    timeout: 120000, // default 120s; can be overridden by config
    ...(config || {}),
  });
  return res.data; // { success, message, data }
}

export async function updateKycService(kycId, { imageFile, panPdfFile, aadhaarPdfFile, bank }, config = {}) {
  const fd = new FormData();
  if (imageFile) fd.append('profilePhoto', imageFile);
  if (panPdfFile) fd.append('panCard', panPdfFile);
  if (aadhaarPdfFile) fd.append('aadharCard', aadhaarPdfFile);
  if (bank) fd.append('bankDetails', JSON.stringify(bank));

  const res = await api.put(`/kyc/${kycId}`, fd, {
    withCredentials: true,
    timeout: 120000,
    ...(config || {}),
  });
  return res.data; // { success, message, data }
}
