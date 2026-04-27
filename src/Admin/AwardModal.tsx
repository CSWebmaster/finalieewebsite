import React, { useState, useEffect } from "react";
import { serverTimestamp } from "firebase/firestore";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage } from "../firebase";
import MultiImageInput from "./MultiImageInput";
import { useAuth } from "../hooks/useAuth";
import { submitContentChange } from "../lib/cms-service";

interface AwardModalProps {
  isOpen: boolean;
  onClose: () => void;
  award?: any;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const AwardModal: React.FC<AwardModalProps> = ({ isOpen, onClose, award, setSuccess, setError }) => {
  const { userData } = useAuth();
  const [loading, setLoading] = useState<boolean>(false);
  const [awardType, setAwardType] = useState<string>("branch");
  const [newsletterType, setNewsletterType] = useState<string>("general");
  const [awardTitle, setAwardTitle] = useState<string>("");
  const [images, setImages] = useState<string[]>([""]);  // multi-image
  const [awardDescription, setAwardDescription] = useState<string>("");
  const [awardYear, setAwardYear] = useState<string>("");
  const [studentName, setStudentName] = useState<string>("");
  const [pdfUrl, setPdfUrl] = useState<string>("");
  const [uploadProgress, setUploadProgress] = useState<number | null>(null);

  const handlePdfUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return;
    const file = e.target.files[0];
    if (file.type !== "application/pdf") {
      setError("Please select a valid PDF file");
      return;
    }

    const storageRef = ref(storage, `newsletters/${Date.now()}_${file.name.replace(/\s+/g, "_")}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    setUploadProgress(0);

    uploadTask.on(
      "state_changed",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgress(Math.round(progress));
      },
      (error) => {
        console.error(error);
        setError("Error uploading PDF: " + error.message);
        setUploadProgress(null);
      },
      async () => {
        try {
          const downloadUrl = await getDownloadURL(uploadTask.snapshot.ref);
          setPdfUrl(downloadUrl);
          setUploadProgress(null);
          setSuccess("PDF uploaded successfully!");
        } catch (err) {
          setError("Failed to get download URL");
          setUploadProgress(null);
        }
      }
    );
  };

  // Initialize form with award data if editing
  useEffect(() => {
    if (award) {
      setAwardType(award.type || "branch");
      setNewsletterType(award.newsletterType || "general");
      setAwardTitle(award.title || "");
      if (award.images?.length > 0) {
        setImages(award.images);
      } else if (award.image) {
        setImages([award.image]);
      } else {
        setImages([""]);
      }
      setAwardDescription(award.description || "");
      setAwardYear(award.year || "");
      setStudentName(award.studentName || "");
      setPdfUrl(award.pdfUrl || "");
    } else {
      resetAwardForm();
    }
  }, [award]);

  // Reset form states
  const resetAwardForm = () => {
    setAwardType("branch");
    setNewsletterType("general");
    setAwardTitle("");
    setImages([""]);
    setAwardDescription("");
    setAwardYear("");
    setStudentName("");
    setPdfUrl("");
  };

  // Handle form submissions
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (!userData) throw new Error("Authentication required.");

      const cleanImages = images.map(i => i.trim()).filter(i => i !== "");
      const awardData: any = {
        type: awardType,
        title: awardTitle,
        image: cleanImages[0] || "",
        images: cleanImages,
        description: awardDescription,
        year: String(awardYear), // Ensure it's a string for consistency
        pdfUrl: pdfUrl,
        updatedAt: serverTimestamp(),
      };

      if (!award) {
        awardData.createdAt = serverTimestamp();
      }

      if (awardType === "student") {
        awardData.studentName = studentName;
        awardData.recipient = studentName; // Sync for list view
      } else {
        awardData.recipient = ""; // Default
      }
      
      if (awardType === "newsletter") {
        awardData.newsletterType = newsletterType;
      }

      // Capture the ID correctly from the award prop
      const docId = award?.id || null;

      console.log("[AwardModal] Submitting change. DocID:", docId, "Action:", docId ? "update" : "create");

      await submitContentChange(
        userData.uid,
        userData.name || userData.displayName || "Unknown",
        "awards",
        awardData,
        docId,
        userData.email,
        userData.role
      );

      setSuccess(award ? "Update request submitted successfully!" : "New achievement added for approval!");
      onClose();
    } catch (err: any) {
      console.error("[AwardModal] Submission error:", err);
      setError(`Error: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
      <div className="bg-white dark:bg-slate-900 rounded-[2rem] shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-slate-200 dark:border-slate-800 animate-in zoom-in-95 duration-300">
        <div className="p-8">
          <div className="flex justify-between items-start mb-8">
            <div>
              <div className="inline-block px-3 py-1 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest mb-2">
                {award ? 'Update Entry' : 'New Achievement'}
              </div>
              <h3 className="text-3xl font-black tracking-tighter text-slate-900 dark:text-white uppercase">
                {award ? 'Edit' : 'Add'} Achievement
              </h3>
            </div>
            <button
              className="p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors"
              onClick={onClose}
            >
              <svg className="w-6 h-6 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12"></path>
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Award Type</label>
                <select
                  className="w-full border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                  value={awardType}
                  onChange={(e) => setAwardType(e.target.value)}
                  required
                >
                  <option value="branch">Branch Achievement</option>
                  <option value="student">Student Achievement</option>
                  <option value="newsletter">Newsletter</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-widest text-slate-500">Year</label>
                <input
                  type="number"
                  min="1900"
                  max="2099"
                  className="w-full border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                  placeholder="2025"
                  value={awardYear}
                  onChange={(e) => setAwardYear(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black uppercase tracking-widest text-slate-500">Achievement Title</label>
              <input
                type="text"
                className="w-full border-slate-200 dark:border-slate-800 rounded-xl shadow-sm px-4 py-3 bg-slate-50 dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 transition-all font-bold text-sm"
                placeholder="IEEE Outstanding Section Award"
                value={awardTitle}
                onChange={(e) => setAwardTitle(e.target.value)}
                required
              />
            </div>

            {awardType === "student" && (
              <div className="mb-4">
                <label className="block text-gray-700 font-medium mb-2">Student Name</label>
                <input
                  type="text"
                  className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Jane Smith"
                  value={studentName}
                  onChange={(e) => setStudentName(e.target.value)}
                  required={awardType === "student"}
                />
              </div>
            )}
            {awardType === "newsletter" && (
              <>
                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Newsletter Type</label>
                  <select
                    className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 bg-white focus:ring-blue-500 focus:border-blue-500"
                    value={newsletterType}
                    onChange={(e) => setNewsletterType(e.target.value)}
                    required
                  >
                    <option value="divya_bhaskar">Divya Bhaskar</option>
                    <option value="general">General</option>
                  </select>
                </div>

                <div className="mb-4">
                  <label className="block text-gray-700 font-medium mb-2">Newsletter PDF</label>
                  
                  {/* File Upload Option */}
                  <div className="mb-3 p-4 border border-blue-200 bg-blue-50 rounded-lg flex flex-col gap-2">
                    <span className="text-sm font-semibold text-blue-800">1. Upload PDF directly (Recommended for large files)</span>
                    <input
                      type="file"
                      accept="application/pdf"
                      onChange={handlePdfUpload}
                      disabled={uploadProgress !== null}
                      className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-600 file:text-white hover:file:bg-blue-700 disabled:opacity-50"
                    />
                    {uploadProgress !== null && (
                      <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${uploadProgress}%` }}></div>
                        <p className="text-xs text-blue-700 mt-1">Uploading: {uploadProgress}%</p>
                      </div>
                    )}
                  </div>

                  {/* Manual URL Option */}
                  <div className="p-4 border border-gray-200 rounded-lg flex flex-col gap-2">
                    <span className="text-sm font-semibold text-gray-700">2. Or paste a Direct URL (e.g. Firebase, Drive)</span>
                    <input
                      type="text"
                      className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                      placeholder="https://firebasestorage.googleapis.com/..."
                      value={pdfUrl}
                      onChange={(e) => setPdfUrl(e.target.value)}
                    />
                    <p className="mt-1 text-xs text-gray-500">Note: Google Drive URLs will not preview inline if they are larger than 25MB.</p>
                  </div>
                </div>
              </>
            )}

            <MultiImageInput
              images={images}
              onChange={setImages}
              label="Award Images"
            />

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Description</label>
              <textarea
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500 h-32"
                placeholder="Award description..."
                value={awardDescription}
                onChange={(e) => setAwardDescription(e.target.value)}
                required
              ></textarea>
            </div>

            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Year</label>
              <input
                type="number"
                min="1900"
                max="2099"
                step="1"
                className="w-full border-gray-300 rounded-md shadow-sm px-4 py-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="2025"
                value={awardYear}
                onChange={(e) => setAwardYear(e.target.value)}
                required
              />
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 bg-white hover:bg-gray-50"
                onClick={onClose}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                disabled={loading}
              >
                {loading ? "Saving..." : (userData?.role === 'webmaster' ? (award ? "Update Award" : "Save Award") : (award ? "Propose Update" : "Submit for Approval"))}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default AwardModal;
