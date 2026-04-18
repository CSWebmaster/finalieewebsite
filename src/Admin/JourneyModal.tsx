import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import MultiImageInput from './MultiImageInput';

interface JourneyModalProps {
  journey?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function JourneyModal({ journey, isOpen, onClose, onSave }: JourneyModalProps) {
  const [title, setTitle] = useState(journey?.title || '');
  const [description, setDescription] = useState(journey?.description || '');
  const [images, setImages] = useState<string[]>(() => {
    if (journey?.images?.length > 0) return journey.images;
    if (journey?.imageUrl) return [journey.imageUrl];
    return [''];
  });
  const [order, setOrder] = useState(journey?.order || 0);

  // Sync state with props when modal opens or journey changes
  useEffect(() => {
    if (isOpen) {
      setTitle(journey?.title || '');
      setDescription(journey?.description || '');
      
      if (journey?.images?.length > 0) {
        setImages([...journey.images]);
      } else if (journey?.imageUrl) {
        setImages([journey.imageUrl]);
      } else {
        setImages(['']);
      }
      
      setOrder(journey?.order || 0);
    }
  }, [journey, isOpen]);

  const handleSubmit = async () => {
    const cleanImages = images.map(i => i.trim()).filter(i => i !== '');
    const journeyData = {
      title,
      description,
      imageUrl: cleanImages[0] || '',
      images: cleanImages,
      order: parseInt(order.toString())
    };

    try {
      if (journey?.id) {
        // Update existing
        await updateDoc(doc(db, 'journey', journey.id), journeyData);
      } else {
        // Create new
        await addDoc(collection(db, 'journey'), journeyData);
      }
      onSave(journeyData);
      onClose();
    } catch (error) {
      console.error('Error saving journey:', error);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {journey ? 'Edit Journey Item' : 'Add Journey Item'}
        </h2>
        
        <div className="space-y-4">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />

          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />

          <MultiImageInput
            images={images}
            onChange={setImages}
            label="Journey Images"
          />

          <input
            type="number"
            placeholder="Order"
            value={order}
            onChange={(e) => setOrder(parseInt(e.target.value))}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
          />
        </div>

        <div className="flex justify-end space-x-2 mt-4">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  ) : null;
}