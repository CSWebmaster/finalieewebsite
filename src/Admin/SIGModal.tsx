import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { collection, addDoc, updateDoc, doc } from 'firebase/firestore';
import MultiImageInput from './MultiImageInput';
import ImageUrlInput from './ImageUrlInput';

interface SIGModalProps {
  sig?: any;
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: any) => void;
}

export default function SIGModal({ sig, isOpen, onClose, onSave }: SIGModalProps) {
  const [title, setTitle] = useState(sig?.title || '');
  const [details, setDetails] = useState(sig?.details || '');
  const [images, setImages] = useState<string[]>(() => {
    if (sig?.images?.length > 0) return sig.images;
    if (sig?.imageUrl) return [sig.imageUrl];
    return [''];
  });
  const [order, setOrder] = useState(sig?.order || 0);

  // New Fields
  const [mission, setMission] = useState(sig?.mission || '');
  const [activities, setActivities] = useState(() => (Array.isArray(sig?.activities) ? sig.activities.join('\n') : ''));
  const [benefits, setBenefits] = useState(() => (Array.isArray(sig?.benefits) ? sig.benefits.join('\n') : ''));
  const [quote, setQuote] = useState(sig?.quote || '');
  const [focusArea, setFocusArea] = useState(sig?.focusArea || '');
  const [meetingFrequency, setMeetingFrequency] = useState(sig?.meetingFrequency || '');
  const [openTo, setOpenTo] = useState(sig?.openTo || '');
  const [themeColor, setThemeColor] = useState(sig?.themeColor || "#3b82f6");
  const [logoUrl, setLogoUrl] = useState(sig?.logoUrl || '');

  // Sync state with props when modal opens or sig changes
  useEffect(() => {
    if (isOpen) {
      setTitle(sig?.title || '');
      setDetails(sig?.details || '');
      if (sig?.images?.length > 0) {
        setImages([...sig.images]);
      } else if (sig?.imageUrl) {
        setImages([sig.imageUrl]);
      } else {
        setImages(['']);
      }
      setOrder(sig?.order || 0);
      setMission(sig?.mission || '');
      setActivities(Array.isArray(sig?.activities) ? sig.activities.join('\n') : '');
      setBenefits(Array.isArray(sig?.benefits) ? sig.benefits.join('\n') : '');
      setQuote(sig?.quote || '');
      setFocusArea(sig?.focusArea || '');
      setMeetingFrequency(sig?.meetingFrequency || '');
      setOpenTo(sig?.openTo || '');
      setThemeColor(sig?.themeColor || "#3b82f6");
      setLogoUrl(sig?.logoUrl || '');
    } else {
      setTitle('');
      setDetails('');
      setImages(['']);
      setOrder(0);
      setMission('');
      setActivities('');
      setBenefits('');
      setQuote('');
      setFocusArea('');
      setMeetingFrequency('');
      setOpenTo('');
      setThemeColor("#3b82f6");
      setLogoUrl('');
    }
  }, [sig, isOpen]);

  const handleSubmit = async () => {
    const cleanImages = images.map(i => i.trim()).filter(i => i !== '');
    const sigData = {
      title,
      details,
      imageUrl: cleanImages[0] || '',
      images: cleanImages,
      order: parseInt(order.toString()),
      mission,
      activities: activities.split('\n').map(a => a.trim()).filter(a => a !== ''),
      benefits: benefits.split('\n').map(b => b.trim()).filter(b => b !== ''),
      quote,
      focusArea,
      meetingFrequency,
      openTo,
      themeColor,
      logoUrl: logoUrl.trim()
    };

    try {
      if (sig?.id) {
        // Update existing
        await updateDoc(doc(db, 'sigs', sig.id), sigData);
      } else {
        // Create new
        await addDoc(collection(db, 'sigs'), sigData);
      }
      onSave(sigData);
      onClose();
    } catch (error) {
      console.error('Error saving SIG:', error);
    }
  };

  return isOpen ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg p-6 w-full max-w-md max-h-[90vh] overflow-y-auto">
        <h2 className="text-xl font-bold mb-4">
          {sig ? 'Edit SIG' : 'Add SIG'}
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
            placeholder="Details (Short Description)"
            value={details}
            onChange={(e) => setDetails(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />

          <textarea
            placeholder="Mission Statement"
            value={mission}
            onChange={(e) => setMission(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={2}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Activities (One per line)</label>
              <textarea
                placeholder="Workshops...\nSeminars..."
                value={activities}
                onChange={(e) => setActivities(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Benefits (One per line)</label>
              <textarea
                placeholder="Networking...\nSkills..."
                value={benefits}
                onChange={(e) => setBenefits(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
                rows={3}
              />
            </div>
          </div>

          <input
            type="text"
            placeholder="Inspirational Quote"
            value={quote}
            onChange={(e) => setQuote(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md italic"
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
            <input
              type="text"
              placeholder="Focus Area (e.g. Growth)"
              value={focusArea}
              onChange={(e) => setFocusArea(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
            />
            <input
              type="text"
              placeholder="Frequency (e.g. Weekly)"
              value={meetingFrequency}
              onChange={(e) => setMeetingFrequency(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
            <input
              type="text"
              placeholder="Open To (e.g. All Students)"
              value={openTo}
              onChange={(e) => setOpenTo(e.target.value)}
              className="w-full border border-gray-300 rounded-md shadow-sm px-4 py-2 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Theme Color */}
          <div className="flex gap-2 items-center border border-gray-100 rounded-lg p-3 bg-gray-50">
            <label className="text-sm font-medium text-gray-700 w-24">Theme Color</label>
            <input
              type="color"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="h-8 w-12 cursor-pointer border-0 p-0"
            />
            <input
              type="text"
              placeholder="#3b82f6"
              value={themeColor}
              onChange={(e) => setThemeColor(e.target.value)}
              className="flex-1 border border-gray-300 rounded-md shadow-sm px-3 py-1.5 text-sm focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          <ImageUrlInput
            value={logoUrl}
            onChange={setLogoUrl}
            label="SIG Logo URL (Optional)"
            placeholder="e.g., https://example.com/logo.png"
          />

          <MultiImageInput
            images={images}
            onChange={setImages}
            label="SIG Images"
          />

          <div>
            <label className="block text-xs text-gray-500 mb-1">Display Order</label>
            <input
              type="number"
              placeholder="Order"
              value={order}
              onChange={(e) => setOrder(parseInt(e.target.value))}
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
            />
          </div>
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