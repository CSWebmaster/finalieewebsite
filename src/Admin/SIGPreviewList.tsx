import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, deleteDoc, doc, onSnapshot, orderBy, query } from 'firebase/firestore';
import SIGModal from './SIGModal';

interface SIGItem {
  id: string;
  title: string;
  details: string;
  imageUrl?: string;
  order?: number;
  createdAt?: Date;
  updatedAt?: Date;
}

export default function SIGPreviewList() {
  const [sigItems, setSigItems] = useState<SIGItem[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedSIG, setSelectedSIG] = useState<SIGItem | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    try {
      const sigQuery = query(
        collection(db, 'sigs'),
        orderBy('order', 'asc')
      );

      // Set up real-time listener
      const unsubscribe = onSnapshot(
        sigQuery,
        (querySnapshot) => {
          const sigList = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          })) as SIGItem[];
          setSigItems(sigList);
          setLoading(false);
          console.log("Fetched SIG items:", sigList.length);
        },
        (err) => {
          console.error('Error fetching SIG items:', err);
          setLoading(false);
        }
      );

      // Clean up the listener when component unmounts
      return () => unsubscribe();
    } catch (err: any) {
      console.error('Error setting up SIG listener:', err);
      setLoading(false);
    }
  }, []);

  const handleDelete = async (id: string) => {
    try {
      await deleteDoc(doc(db, 'sigs', id));
      setConfirmDelete(null);
      // No need to fetch again - onSnapshot listener will update automatically
    } catch (error) {
      console.error('Error deleting SIG item:', error);
    }
  };

  const handleSave = () => {
    // No need to manually fetch - real-time listener handles updates
  };

  const handleEdit = (sig: SIGItem) => {
    setSelectedSIG(sig);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setSelectedSIG(null);
    setIsModalOpen(true);
  };

  return (
    <div className="sig-section">
      <div className="section-header flex justify-between items-center mb-4">
        <h2 className="text-2xl font-bold">SIGs Management</h2>
        <button 
          onClick={handleAdd}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Add SIG
        </button>
      </div>

      {/* Loading Spinner */}
      {loading && (
        <div className="flex justify-center items-center p-8">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
        </div>
      )}

      {/* No SIG Items Found */}
      {!loading && sigItems.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          No SIGs found. Add a new SIG to get started.
        </div>
      )}

      {/* SIG Cards */}
      {!loading && sigItems.length > 0 && (
        <div className="sig-list grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {sigItems.map((item) => (
            <div key={item.id} className="sig-card border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
              {item.imageUrl && (
                <img loading="lazy" 
                  src={item.imageUrl} 
                  alt={item.title} 
                  className="w-full h-40 object-cover rounded-md mb-3"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.onerror = null;
                    target.src = "https://via.placeholder.com/400x300?text=No+Image";
                  }}
                />
              )}
              <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
              <p className="text-gray-600 text-sm mb-3 line-clamp-3">{item.details}</p>
              <div className="flex justify-between items-center">
                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                  Order: {item.order || 0}
                </span>
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleEdit(item)}
                    className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-full transition-colors"
                    title="Edit"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setConfirmDelete(item.id)}
                    className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-full transition-colors"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Delete Confirmation Dialog */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex justify-center items-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this SIG?</p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setConfirmDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDelete(confirmDelete)}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      <SIGModal
        sig={selectedSIG}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
      />
    </div>
  );
}