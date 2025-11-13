import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createKycService } from '../services/kyc.js';
import { getUser, isEmailVerified } from '../utils/storage';

/* ---------- Local helpers ---------- */
function getCurrentUid() {
  const u = getUser() || {};
  return (
    u._id ||
    u.id ||
    u.userId ||
    u.uid ||
    u.email ||
    u.phone ||
    u.username ||
    'me'
  );
}

function markKycSubmitted() {
  try {
    const uid = getCurrentUid();
    localStorage.setItem(`oyoplus:kyc:submitted:${uid}`, 'true');
  } catch {}
}

function isKycSubmitted() {
  try {
    const uid = getCurrentUid();
    return localStorage.getItem(`oyoplus:kyc:submitted:${uid}`) === 'true';
  } catch {
    return false;
  }
}
/* ----------------------------------- */

const BecameAmemberHost = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    bankName: '',
    accountHolderName: '',
    accountNumber: '',
    accountType: 'savings',
    ifscCode: '',
    branchName: '',
  });

  const [imageFile, setImageFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');

  const [panPdfFile, setPanPdfFile] = useState(null);
  const [aadhaarPdfFile, setAadhaarPdfFile] = useState(null);

  const [statusMsg, setStatusMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);

  // Guards: must verify email; if already submitted -> thank-you
  useEffect(() => {
    if (!isEmailVerified()) {
      window.location.replace('/became-a-member');
      return;
    }
    try { localStorage.removeItem('oyoplus:kyc:submitted'); } catch {}
    if (isKycSubmitted()) {
      window.location.replace('/kyc-submitted');
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setErrorMsg('Profile photo must be an image');
      return;
    }
    setImageFile(file);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setErrorMsg('');
  };

  const validateAndSetPdf = (file, setter) => {
    if (!file) return;
    if (file.type !== 'application/pdf') {
      setErrorMsg('Please upload PDF only');
      return;
    }
    setErrorMsg('');
    setter(file);
  };

  const handlePanPdfChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetPdf(file, setPanPdfFile);
  };

  const handleAadhaarPdfChange = (e) => {
    const file = e.target.files?.[0];
    validateAndSetPdf(file, setAadhaarPdfFile);
  };

  const validateBeforeSubmit = () => {
    if (
      !imageFile ||
      !panPdfFile ||
      !aadhaarPdfFile ||
      !formData.bankName ||
      !formData.accountHolderName ||
      !formData.accountNumber ||
      !formData.ifscCode ||
      !formData.branchName
    ) {
      return 'Please fill all required fields (*)';
    }
    if (!['savings', 'current', 'salary', 'other'].includes(formData.accountType)) {
      return 'Account type must be Savings or Current.';
    }
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatusMsg('');
    setErrorMsg('');
    setUploadPct(0);

    const err = validateBeforeSubmit();
    if (err) {
      setErrorMsg(err);
      return;
    }

    setSubmitting(true);
    try {
      const payload = {
        imageFile,
        panPdfFile,
        aadhaarPdfFile,
        bank: {
          bankName: formData.bankName,
          accountName: formData.accountHolderName,
          accountNumber: formData.accountNumber,
          ifscCode: formData.ifscCode,
          accountType: formData.accountType,
          branch: formData.branchName,
        },
      };

      const result = await createKycService(payload, {
        timeout: 120000, // extend upload timeout
        onUploadProgress: (pe) => {
          if (pe && pe.total) {
            const pct = Math.round((pe.loaded / pe.total) * 100);
            setUploadPct(pct);
          }
        },
      });

      if (result?.success) {
        markKycSubmitted();
        setStatusMsg(result.message || 'KYC submitted successfully');
        window.location.replace('/kyc-submitted');
      } else {
        setErrorMsg(result?.message || 'Something went wrong');
      }
    } catch (error) {
      // Frontend-only duplicate handling (no backend change):
      const msg = String(
        error?.response?.data?.message ||
        error?.message ||
        ''
      ).toLowerCase();

      const raw = JSON.stringify(error?.response?.data || {});
      const isDuplicate =
        /duplicate key|e11000|already.*submitted|kyc.*exist/i.test(msg) ||
        /duplicate key|E11000|already.*submitted|KYC.*EXIST/i.test(raw);

      if (isDuplicate) {
        // Treat as already submitted on this device
        markKycSubmitted();
        setStatusMsg('KYC already submitted. Redirecting…');
        window.location.replace('/kyc-submitted');
      } else if (error?.code === 'ECONNABORTED') {
        setErrorMsg('Upload timed out. Try again with smaller files or retry in a bit.');
      } else {
        setErrorMsg(error?.response?.data?.message || 'Server error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="min-h-screen flex items-start justify-center bg-gray-50 py-10 px-4">
      <div className="w-full max-w-3xl bg-white shadow-md rounded-xl p-6">
        <div className="mb-6 border-b pb-4">
          <h1 className="text-2xl font-semibold text-gray-800">
            Host KYC Verification
          </h1>
          <p className="text-sm text-gray-500">
            Please complete the information below so we can verify your account
            and enable payouts.
          </p>
        </div>

        {(errorMsg || statusMsg) && (
          <div className="mb-4">
            {errorMsg && (
              <div className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-md px-3 py-2">
                {errorMsg}
              </div>
            )}
            {statusMsg && (
              <div className="text-sm text-green-600 bg-green-50 border border-green-200 rounded-md px-3 py-2">
                {statusMsg}
              </div>
            )}
          </div>
        )}

        {submitting && (
          <div className="mb-4">
            <div className="w-full bg-gray-100 rounded h-2 overflow-hidden">
              <div
                className="bg-gray-800 h-2"
                style={{ width: `${uploadPct}%`, transition: 'width .2s' }}
              />
            </div>
            <div className="text-xs text-gray-600 mt-1">
              Uploading… {uploadPct}%
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Profile / ID Photo */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 flex items-center gap-2">
              Profile / ID Photo <span className="text-red-500">*</span>
            </h2>
            <p className="text-xs text-gray-500 mb-3">
              Upload a clear image (face + ID if possible). JPG/PNG only.
            </p>

            <div className="flex items-start gap-4 flex-col sm:flex-row">
              <div className="w-32 h-32 rounded-lg border border-gray-300 bg-gray-100 flex items-center justify-center overflow-hidden">
                {previewUrl ? (
                  <img
                    src={previewUrl}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-gray-400 text-xs text-center px-2">
                    No image
                    <br />
                    selected
                  </span>
                )}
              </div>

              <div className="flex-1">
                <label
                  htmlFor="profileImage"
                  className="inline-block cursor-pointer text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg px-4 py-2"
                >
                  Choose Image
                </label>
                <input
                  id="profileImage"
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleImageChange}
                />
                {imageFile && (
                  <p className="text-xs text-gray-600 mt-2 break-all">
                    {imageFile.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* PAN PDF */}
          <div>
            <p className="text-lg font-medium text-gray-800 flex items-center gap-2">
              PAN Document (PDF) <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Upload your PAN card as a clear, readable PDF.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <label
                  htmlFor="panPdf"
                  className="inline-block cursor-pointer text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg px-4 py-2"
                >
                  Upload PAN PDF
                </label>
                <input
                  id="panPdf"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handlePanPdfChange}
                />
                {panPdfFile && (
                  <p className="text-xs text-gray-600 mt-2 break-all">
                    {panPdfFile.name}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mt-1">
              Only .pdf is allowed.
            </p>
          </div>

          {/* Aadhaar PDF */}
          <div>
            <p className="text-base font-medium text-gray-800 flex items-center gap-2">
              Aadhaar Document (PDF) <span className="text-red-500">*</span>
            </p>
            <p className="text-xs text-gray-500 mb-3">
              Upload your Aadhaar card as a clear, readable PDF.
            </p>

            <div className="flex flex-col sm:flex-row sm:items-start gap-4">
              <div className="flex-1">
                <label
                  htmlFor="aadhaarPdf"
                  className="inline-block cursor-pointer text-sm font-medium text-white bg-gray-800 hover:bg-gray-900 rounded-lg px-4 py-2"
                >
                  Upload Aadhaar PDF
                </label>
                <input
                  id="aadhaarPdf"
                  type="file"
                  accept="application/pdf"
                  className="hidden"
                  onChange={handleAadhaarPdfChange}
                />
                {aadhaarPdfFile && (
                  <p className="text-xs text-gray-600 mt-2 break-all">
                    {aadhaarPdfFile.name}
                  </p>
                )}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mt-1">
              Only .pdf is allowed.
            </p>
          </div>

          {/* Bank Details */}
          <div>
            <h2 className="text-lg font-medium text-gray-800 mb-4">
              Bank / Payout Details
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex flex-col">
                <label htmlFor="bankName" className="text-sm font-medium text-gray-700">
                  Bank Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="bankName"
                  name="bankName"
                  type="text"
                  value={formData.bankName}
                  onChange={handleChange}
                  placeholder="State Bank of India"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="accountHolderName" className="text-sm font-medium text-gray-700">
                  Account Holder Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountHolderName"
                  name="accountHolderName"
                  type="text"
                  value={formData.accountHolderName}
                  onChange={handleChange}
                  placeholder="Full legal name"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="accountNumber" className="text-sm font-medium text-gray-700">
                  Account Number <span className="text-red-500">*</span>
                </label>
                <input
                  id="accountNumber"
                  name="accountNumber"
                  type="text"
                  value={formData.accountNumber}
                  onChange={handleChange}
                  placeholder="XXXXXXXXXXXX"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="accountType" className="text-sm font-medium text-gray-700">
                  Account Type <span className="text-red-500">*</span>
                </label>
                <select
                  id="accountType"
                  name="accountType"
                  value={formData.accountType}
                  onChange={handleChange}
                  className="border rounded-lg px-3 py-2 text-sm outline-none bg-white focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                >
                  <option value="savings">Savings</option>
                  <option value="current">Current</option>
                  <option value="salary">Salary</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label htmlFor="ifscCode" className="text-sm font-medium text-gray-700">
                  IFSC Code <span className="text-red-500">*</span>
                </label>
                <input
                  id="ifscCode"
                  name="ifscCode"
                  type="text"
                  value={formData.ifscCode}
                  onChange={handleChange}
                  placeholder="SBIN0001234"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>

              <div className="flex flex-col">
                <label htmlFor="branchName" className="text-sm font-medium text-gray-700">
                  Branch Name <span className="text-red-500">*</span>
                </label>
                <input
                  id="branchName"
                  name="branchName"
                  type="text"
                  value={formData.branchName}
                  onChange={handleChange}
                  placeholder="Kothakota Branch"
                  className="border rounded-lg px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-gray-800 focus:border-gray-800"
                />
              </div>
            </div>

            <p className="text-[11px] text-gray-500 mt-2">
              Payouts will be sent to this account. Make sure details are correct — this affects your payments.
            </p>
          </div>

          <div className="pt-4 border-t">
            <button
              type="submit"
              disabled={submitting}
              className="w-full sm:w-auto inline-flex justify-center items-center text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-lg px-5 py-2.5 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-600 disabled:opacity-60"
            >
              {submitting ? 'Submitting…' : 'Submit KYC'}
            </button>
          </div>
        </form>

        <p className="text-[11px] text-gray-400 text-center mt-6">
          After approval, your account will be activated for hosting and withdrawals.
        </p>
      </div>
    </section>
  );
};

export default BecameAmemberHost;
