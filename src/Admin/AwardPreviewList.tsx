import React, { useEffect, useState } from "react";
import { db } from "../firebase";
import {
  collection,
  deleteDoc,
  doc,
  orderBy,
  query,
  onSnapshot,
  where
} from "firebase/firestore";
import { Button } from "@/components/ui/button";

interface AwardsPreviewListProps {
  onEdit: (award: any) => void;
  setSuccess: (message: string) => void;
  setError: (message: string) => void;
}

const AwardPreviewList: React.FC<AwardsPreviewListProps> = ({
  onEdit,
  setSuccess,
  setError
}) => {
  const [awards, setAwards] = useState<any[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [awardsPerPage] = useState<number>(8);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [newsletterSubType, setNewsletterSubType] = useState<string>('all');
  const [selectedAward, setSelectedAward] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  // Map of tab value â†’ display label (matching the `type` field saved by AwardModal)
  const CATEGORY_TABS = [
    { value: 'all',        label: 'All Achievements' },
    { value: 'branch',     label: 'Branch Achievement' },
    { value: 'student',    label: 'Student Achievement' },
    { value: 'newsletter', label: 'ðŸ“° Newsletter' },
  ];

  const NEWSLETTER_SUB_TABS = [
    { value: 'all',           label: 'All Newsletters' },
    { value: 'divya_bhaskar', label: 'Divya Bhaskar' },
    { value: 'general',       label: 'General' },
  ];

  // Use Firestore real-time updates
  useEffect(() => {
    setLoading(true);
    try {
      // ── Reverted to legacy collection: awards ──
      const awardsQuery = query(collection(db, "awards"));

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        awardsQuery,
        (querySnapshot) => {
          const awardsList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
          
          // Sort client-side: prioritize year, then createdAt
          awardsList.sort((a: any, b: any) => {
            const yearA = parseInt(a.year) || 0;
            const yearB = parseInt(b.year) || 0;
            if (yearB !== yearA) return yearB - yearA;
            
            const timeA = a.createdAt?.toMillis?.() || 0;
            const timeB = b.createdAt?.toMillis?.() || 0;
            return timeB - timeA;
          });

          setAwards(awardsList);
          setLoading(false);
        },
        (err) => {
          setError(`CMS Access denied: ${err.message}`);
          console.error("[AwardsFetch] error:", err);
          setLoading(false);
        }
      );

      return () => unsubscribe();
    } catch (err: any) {
      setError(`System error: ${err.message}`);
      setLoading(false);
    }
  }, [setError]);


  const handleEdit = (award: any) => {
    onEdit(award);
  };

  // Filter on award.type (the field saved by AwardModal), not award.category
  const filteredAwards = awards.filter((award) => {
    const matchesSearch =
      award.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.recipient?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      award.description?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesCategory =
      selectedCategory === 'all' || award.type === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  // Pagination
  const indexOfLastAward = currentPage * awardsPerPage;
  const indexOfFirstAward = indexOfLastAward - awardsPerPage;
  const currentAwards = filteredAwards.slice(indexOfFirstAward, indexOfLastAward);
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">

      {/* Category Tabs */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex flex-wrap gap-2">
          {CATEGORY_TABS.map((tab) => (
            <button
              key={tab.value}
              onClick={() => setSelectedCategory(tab.value)}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                selectedCategory === tab.value
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="p-4">
        <input
          type="text"
          placeholder="Search Achievements"
          className="w-full px-4 py-2 rounded-lg border border-gray-300"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No Awards Found */}
      {!loading && filteredAwards.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No awards found. Add a new award to get started.
        </div>
      )}

      {/* Award Cards */}
      {!loading && currentAwards.length > 0 && (
        <div className="p-6 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {currentAwards.map((award) => (
            <div
              key={award.id}
              onClick={() => handleEdit(award)}
              className="group bg-white border rounded-xl overflow-hidden shadow-sm hover:shadow-blue-500/10 hover:shadow-xl transition-all duration-300 hover:-translate-y-1 cursor-pointer flex flex-col h-full"
            >
              <div className="aspect-w-1 aspect-h-1 bg-slate-50 dark:bg-slate-900/50 relative overflow-hidden flex items-center justify-center p-4 h-64">
                {award.image ? (
                  <img loading="lazy"
                    src={award.image}
                    alt={award.title}
                    className="max-w-full max-h-full object-contain transition-transform duration-500 group-hover:scale-105 z-10"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.onerror = null;
                      target.src = "https://via.placeholder.com/400x300?text=No+Image";
                    }}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-100">
                    <svg
                      className="w-16 h-16 text-gray-300"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path d="M19 5h-2V3H7v2H5c-1.1 0-2 .9-2 2v1c0 2.55 1.92 4.63 4.39 4.94.63 1.5 1.98 2.63 3.61 2.96V19H7v2h10v-2h-4v-3.1c1.63-.33 2.98-1.46 3.61-2.96C19.08 12.63 21 10.55 21 8V7c0-1.1-.9-2-2-2zM5 8V7h2v3.82C5.84 10.4 5 9.3 5 8zm14 0c0 1.3-.84 2.4-2 2.82V7h2v1z" />
                    </svg>
                  </div>
                )}
                {/* Backdrop glow */}
                <div className="absolute inset-0 blur-xl opacity-10 scale-125">
                   <img src={award.image} alt="" className="w-full h-full object-cover" />
                </div>
              </div>

              <div className="p-4 flex flex-col flex-1">
                <h3 className="font-bold text-base text-gray-800 line-clamp-2 group-hover:text-blue-600 transition-colors mb-2">
                  {award.title || "Unnamed Award"}
                </h3>
                <div className="space-y-1 mt-auto">
                  {award.year && (
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 bg-blue-500 rounded-full"></span>
                      Year: {award.year}
                    </p>
                  )}
                  {award.recipient && (
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-1">
                      <span className="w-1 h-1 bg-purple-500 rounded-full"></span>
                      Recipient: {award.recipient}
                    </p>
                  )}
                </div>
                
                <div className="mt-4 pt-3 border-t border-gray-50 flex items-center justify-between">
                  <div className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded uppercase tracking-tighter opacity-0 group-hover:opacity-100 transition-opacity">
                    Click to Edit
                  </div>
                  <button
                    onClick={(e) => { e.stopPropagation(); handleEdit(award); }}
                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2.5"
                        d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                      />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Award Details Modal */}
      {isModalOpen && selectedAward && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-start gap-4 mb-4">
                <div className="flex-1">
                  <h2 className="text-2xl font-bold text-gray-900 mb-2">
                    {selectedAward.title || "Unnamed Award"}
                  </h2>
                  {selectedAward.type && (
                    <span className="inline-block bg-blue-100 text-blue-700 px-2 py-1 text-sm font-medium rounded-md mb-2">
                      {selectedAward.type === 'branch' ? 'Branch Achievement' : 
                       selectedAward.type === 'student' ? 'Student Achievement' : 
                       selectedAward.type === 'newsletter' ? 'ðŸ“° Newsletter' : 'Achievement'}
                    </span>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
                    {selectedAward.year && (
                      <div>
                        <span className="font-medium">Year:</span> {selectedAward.year}
                      </div>
                    )}
                    {selectedAward.recipient && (
                      <div>
                        <span className="font-medium">Recipient:</span> {selectedAward.recipient}
                      </div>
                    )}
                  </div>
                </div>
              </div>
              
              {selectedAward.image && (
                <div className="mb-4">
                  <img loading="lazy"
                    src={selectedAward.image}
                    alt={selectedAward.title}
                    className="w-full h-48 object-cover rounded-lg"
                  />
                </div>
              )}
              
              {selectedAward.description && (
                <div className="mb-4">
                  <h3 className="font-semibold text-gray-800 mb-2">Description</h3>
                  <p className="text-gray-600">{selectedAward.description}</p>
                </div>
              )}
              
              <div className="flex justify-end gap-3">
                <Button
                  variant="outline"
                  onClick={() => setIsModalOpen(false)}
                >
                  Close
                </Button>
                <Button
                  onClick={() => {
                    onEdit(selectedAward);
                    setIsModalOpen(false);
                  }}
                >
                  Edit Award
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Pagination */}
      {!loading && filteredAwards.length > awardsPerPage && (
        <div className="flex justify-center space-x-4 py-4">
          <button
            onClick={() => paginate(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
          >
            Previous
          </button>
          <button
            onClick={() => paginate(currentPage + 1)}
            disabled={currentPage * awardsPerPage >= filteredAwards.length}
            className="px-4 py-2 bg-gray-200 text-gray-600 rounded-lg disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </div>
  );
};

export default AwardPreviewList;
